import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";
import { Audio, type AVPlaybackStatus } from "expo-av";
import {
  AccessibilityInfo,
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { DAILY_APPRECIATIONS, MOCK_TRACKS } from "../common/data/mockData";
import { notifyError } from "../common/utils/notify";
import {
  saveUserProfile,
  submitStressAssessment,
  type StressAssessmentPayload,
} from "../features/wellness/wellness.api";
import { useAnalytics } from "../hooks/useAnalytics";
import { AnalyticsTab } from "./dashboard-tabs/AnalyticsTab";
import { DiscoverTab } from "./dashboard-tabs/DiscoverTab";
import { JournalTab } from "./dashboard-tabs/JournalTab";
import { SettingsTab, type UserProfileForm } from "./dashboard-tabs/SettingsTab";
import { StressPredictionScreen } from "./StressPredictionScreen";
import { InferenceHistoryScreen } from "./InferenceHistoryScreen";
import { ReportScreen } from "./ReportScreen";
import type { AnalysisRange, RangeData, SavedNote } from "./dashboard-tabs/types";
import { styles } from "./dashboard.styles";
import { useAuthStore } from "../features/auth/auth.store";
import { colors } from "../theme/colors";

type LikertScore = 1 | 2 | 3 | 4 | 5;
type SupportAvailability = "yes" | "no" | "sometimes";
type PeakStressTime = "morning" | "afternoon" | "evening" | "night" | "constant";
type StressDuration = "lt1week" | "1to4weeks" | "1plusmonths" | "chronic";
type StressTriggerKey =
  | "workStudies"
  | "financial"
  | "relationshipsFamily"
  | "health"
  | "sleep"
  | "exerciseOutdoors"
  | "digitalOverload"
  | "other";
type CopingKey =
  | "exercise"
  | "meditation"
  | "talking"
  | "hobbies"
  | "avoidance"
  | "substanceUse"
  | "other";

type QuestionnaireAnswers = {
  section1Scores: Array<LikertScore | null>;
  stressTriggers: Record<StressTriggerKey, LikertScore | 0>;
  otherTriggerText: string;
  averageDailyStress: string;
  daysStressed: string;
  peakStressTime: PeakStressTime | null;
  duration: StressDuration | null;
  physicalSymptoms: string[];
  copingEffectiveness: Record<CopingKey, LikertScore | 0>;
  otherCopingText: string;
  supportAvailability: SupportAvailability | null;
  openReflection: string;
};

const SECTION_ONE_ITEMS = [
  "How often did you feel unable to control important things in your life?",
  "How often did you feel confident about handling personal problems?",
  "How often did you feel things were going your way?",
  "How often did you feel difficulties piling up so high you couldn't overcome them?",
  "How often did you feel unable to cope with all responsibilities?",
  "How often were you angered by things outside your control?",
  "How often did you feel you could handle irritations?",
  "How often did you feel everything was fine?",
] as const;

const STRESS_TRIGGER_ITEMS: Array<{ key: StressTriggerKey; label: string }> = [
  { key: "workStudies", label: "Work or studies overload" },
  { key: "financial", label: "Financial worries" },
  { key: "relationshipsFamily", label: "Relationships or family conflicts" },
  { key: "health", label: "Health concerns" },
  { key: "sleep", label: "Sleep issues" },
  { key: "exerciseOutdoors", label: "Lack of exercise or time outdoors" },
  { key: "digitalOverload", label: "Social media or digital overload" },
  { key: "other", label: "Other" },
];

const PHYSICAL_SYMPTOMS = [
  "Headache",
  "Fatigue",
  "Muscle tension",
  "Sleep changes",
  "Appetite changes",
  "Rapid heartbeat",
  "Other",
] as const;

const COPING_ITEMS: Array<{ key: CopingKey; label: string }> = [
  { key: "exercise", label: "Exercise" },
  { key: "meditation", label: "Meditation" },
  { key: "talking", label: "Talking to someone" },
  { key: "hobbies", label: "Hobbies" },
  { key: "avoidance", label: "Avoidance" },
  { key: "substanceUse", label: "Substance use" },
  { key: "other", label: "Other" },
];

const QUESTIONNAIRE_INITIAL_STATE: QuestionnaireAnswers = {
  section1Scores: [null, null, null, null, null, null, null, null],
  stressTriggers: {
    workStudies: 0,
    financial: 0,
    relationshipsFamily: 0,
    health: 0,
    sleep: 0,
    exerciseOutdoors: 0,
    digitalOverload: 0,
    other: 0,
  },
  otherTriggerText: "",
  averageDailyStress: "",
  daysStressed: "",
  peakStressTime: null,
  duration: null,
  physicalSymptoms: [],
  copingEffectiveness: {
    exercise: 0,
    meditation: 0,
    talking: 0,
    hobbies: 0,
    avoidance: 0,
    substanceUse: 0,
    other: 0,
  },
  otherCopingText: "",
  supportAvailability: null,
  openReflection: "",
};

// Demo mode uses 1 day to make reminders easy to verify.
// In normal behavior, keep this at 14 days.
const QUESTIONNAIRE_INTERVAL_DAYS = 1;
const LAST_QUESTIONNAIRE_KEY = "questionnaire-last-completed-at";
// Demo-only toggle: when true, show the small questionnaire prompt on every login.
// Set to false to use interval-based checks (every 14 days in normal use).
const SHOW_QUESTIONNAIRE_PROMPT_ON_EVERY_LOGIN = true;

type BottomTab = "discover" | "journal" | "analytics" | "prediction" | "history" | "reports" | "settings";

const getRangeTitle = (range: AnalysisRange): string => {
  switch (range) {
    case "today":
      return "Today";
    case "week":
      return "Last 7 Days";
    case "month":
      return "This Month";
  }
};

const generateInsightMessage = (
  range: AnalysisRange,
  totalPredictions: number,
  stressCount: number,
  nonStressCount: number
): string => {
  if (totalPredictions === 0) {
    return "No data available for this period. Make some predictions to see insights.";
  }

  const stressPercentage = (stressCount / totalPredictions) * 100;

  if (range === "today") {
    if (stressPercentage < 30) {
      return "Great day so far! Your stress levels are well controlled.";
    } else if (stressPercentage < 60) {
      return "Moderate stress today. Consider taking a break.";
    } else {
      return "High stress detected today. Try some relaxation techniques.";
    }
  }

  if (range === "week") {
    if (stressPercentage < 30) {
      return "Excellent week! Your stress management is improving.";
    } else if (stressPercentage < 60) {
      return "A mixed week. Keep tracking your patterns.";
    } else {
      return "This week had challenges. Focus on recovery next week.";
    }
  }

  if (stressPercentage < 30) {
    return "Strong month! Your baseline stress is trending healthier.";
  } else if (stressPercentage < 60) {
    return "Decent month. Look for patterns to improve.";
  } else {
    return "Difficult month. Consider seeking support.";
  }
};

export const DashboardScreen = () => {
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<BottomTab>("discover");
  const [selectedRange, setSelectedRange] = useState<AnalysisRange>("today");
  const [journalEntry, setJournalEntry] = useState("");
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [loadedTrackId, setLoadedTrackId] = useState<string | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string>(MOCK_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuestionnairePromptModal, setShowQuestionnairePromptModal] = useState(false);
  const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profile, setProfile] = useState<UserProfileForm>({
    name: "Alex Rivera",
    heightValue: "170",
    heightUnit: "cm",
    weightValue: "68",
    weightUnit: "kg",
    dateOfBirth: "1998-04-12",
  });
  const [answers, setAnswers] = useState<QuestionnaireAnswers>(QUESTIONNAIRE_INITIAL_STATE);
  const logout = useAuthStore((state) => state.logout);
  
  const { data: analyticsData, isLoading: isAnalyticsLoading, error: analyticsError } = useAnalytics(selectedRange);
  
  const current: RangeData = useMemo(() => {
    if (!analyticsData) {
      return {
        title: getRangeTitle(selectedRange),
        labels: [],
        values: [],
        message: "Loading...",
      };
    }

    const { chart, summary } = analyticsData;
    const stressValues = chart.stress_values || [];
    const nonStressValues = chart.non_stress_values || [];
    
    const combinedValues = stressValues.map((stress, i) => {
      const nonStress = nonStressValues[i] || 0;
      return stress + nonStress;
    });

    return {
      title: getRangeTitle(selectedRange),
      labels: chart.labels || [],
      values: combinedValues,
      message: generateInsightMessage(
        selectedRange,
        summary.total_predictions,
        summary.stress_count,
        summary.non_stress_count
      ),
    };
  }, [analyticsData, selectedRange]);

  const likertScale: LikertScore[] = [1, 2, 3, 4, 5];

  const graphWidth = Math.max(220, width - 96);
  const graphHeight = 120;
  const graphPadding = 14;

  const chartPoints = useMemo(() => {
    const max = Math.max(...current.values);
    const min = Math.min(...current.values);
    const denominator = Math.max(max - min, 1);
    const stepX =
      current.values.length > 1
        ? (graphWidth - graphPadding * 2) / (current.values.length - 1)
        : 0;

    return current.values
      .map((value, index) => {
        const x = graphPadding + stepX * index;
        const normalized = (value - min) / denominator;
        const y = graphHeight - graphPadding - normalized * (graphHeight - graphPadding * 2);
        return { x, y };
      })
      .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  }, [current.values, graphWidth]);

  const pointsText = chartPoints.map((point) => `${point.x},${point.y}`).join(" ");

  const appreciation = useMemo(() => {
    const dayIndex = new Date().getDay();
    return DAILY_APPRECIATIONS[dayIndex];
  }, []);

  const activeTrack = useMemo(
    () => MOCK_TRACKS.find((track) => track.id === selectedTrackId) ?? MOCK_TRACKS[0],
    [selectedTrackId]
  );

  useEffect(() => {
    const checkQuestionnaireDue = async () => {
      const lastCompleted = await AsyncStorage.getItem(LAST_QUESTIONNAIRE_KEY);

      // Demo path: always prompt on login.
      // Production path (below): only prompt when the check-in is due by interval.
      if (SHOW_QUESTIONNAIRE_PROMPT_ON_EVERY_LOGIN) {
        setShowQuestionnairePromptModal(true);
        return;
      }

      if (!lastCompleted) {
        setShowQuestionnairePromptModal(true);
        return;
      }

      const lastCompletedMs = Number(lastCompleted);
      if (Number.isNaN(lastCompletedMs)) {
        setShowQuestionnairePromptModal(true);
        return;
      }

      const elapsedDays =
        (Date.now() - lastCompletedMs) / (1000 * 60 * 60 * 24);

      if (elapsedDays >= QUESTIONNAIRE_INTERVAL_DAYS) {
        setShowQuestionnairePromptModal(true);
      }
    };

    void checkQuestionnaireDue();
  }, []);

  useEffect(() => {
    const tabText =
      activeTab === "discover"
        ? "Discover tab selected"
        : activeTab === "journal"
          ? "Journal tab selected"
          : activeTab === "analytics"
            ? "Analytics tab selected"
            : activeTab === "prediction"
              ? "Prediction tab selected"
              : activeTab === "history"
                ? "History tab selected"
                : activeTab === "reports"
                  ? "Reports tab selected"
                  : "Settings tab selected";
    void AccessibilityInfo.announceForAccessibility(tabText);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        void soundRef.current.unloadAsync();
      }
      soundRef.current = null;
      loadedTrackIdRef.current = null;
      setLoadedTrackId(null);
    };
  }, []);

  const section1Total = useMemo(
    () => answers.section1Scores.reduce((sum, score) => sum + (score ?? 0), 0),
    [answers.section1Scores]
  );

  const stressBand = useMemo(() => {
    if (section1Total < 20) return "Low stress";
    if (section1Total <= 30) return "Moderate stress";
    return "High stress";
  }, [section1Total]);

  const completeQuestionnaire = async () => {
    const unansweredCount = answers.section1Scores.filter((score) => score === null).length;
    if (unansweredCount > 0) {
      notifyError("Please answer all 8 stress intensity questions before submitting.");
      return;
    }

    const apiPayload: StressAssessmentPayload = {
      section1Scores: answers.section1Scores.map((score) => score ?? 0),
      section1Total,
      stressBand,
      stressTriggers: answers.stressTriggers,
      otherTriggerText: answers.otherTriggerText.trim(),
      averageDailyStress: answers.averageDailyStress ? Number(answers.averageDailyStress) : null,
      daysStressed: answers.daysStressed ? Number(answers.daysStressed) : null,
      peakStressTime: answers.peakStressTime,
      duration: answers.duration,
      physicalSymptoms: answers.physicalSymptoms,
      copingEffectiveness: answers.copingEffectiveness,
      otherCopingText: answers.otherCopingText.trim(),
      supportAvailability: answers.supportAvailability,
      openReflection: answers.openReflection.trim(),
    };

    try {
      await submitStressAssessment(apiPayload);
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Failed to submit stress assessment.");
      return;
    }

    await AsyncStorage.setItem(LAST_QUESTIONNAIRE_KEY, String(Date.now()));
    await AsyncStorage.setItem(
      "questionnaire-last-summary",
      JSON.stringify({ section1Total, stressBand, completedAt: Date.now() })
    );
    setShowQuestionnaireModal(false);
    setAnswers(QUESTIONNAIRE_INITIAL_STATE);
    void AccessibilityInfo.announceForAccessibility(
      `Questionnaire completed. Stress level is ${stressBand}`
    );
  };

  const selectSection1Score = (index: number, value: LikertScore) => {
    setAnswers((prev) => {
      const nextScores = [...prev.section1Scores];
      nextScores[index] = value;
      return { ...prev, section1Scores: nextScores };
    });
  };

  const selectTriggerIntensity = (key: StressTriggerKey, value: LikertScore | 0) => {
    setAnswers((prev) => ({
      ...prev,
      stressTriggers: { ...prev.stressTriggers, [key]: value },
    }));
  };

  const selectCopingEffectiveness = (key: CopingKey, value: LikertScore | 0) => {
    setAnswers((prev) => ({
      ...prev,
      copingEffectiveness: { ...prev.copingEffectiveness, [key]: value },
    }));
  };

  const togglePhysicalSymptom = (symptom: string) => {
    setAnswers((prev) => {
      const alreadySelected = prev.physicalSymptoms.includes(symptom);
      return {
        ...prev,
        physicalSymptoms: alreadySelected
          ? prev.physicalSymptoms.filter((item) => item !== symptom)
          : [...prev.physicalSymptoms, symptom],
      };
    });
  };

  const updateQuestionnaireField = <T extends keyof QuestionnaireAnswers>(
    field: T,
    value: QuestionnaireAnswers[T]
  ) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const saveJournal = () => {
    const trimmed = journalEntry.trim();
    if (!trimmed) return;

    if (editingNoteId) {
      setSavedNotes((prev) =>
        prev.map((note) =>
          note.id === editingNoteId ? { ...note, text: trimmed, createdAt: Date.now() } : note
        )
      );
      setEditingNoteId(null);
      setJournalEntry("");
      return;
    }

    const note: SavedNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      text: trimmed,
      createdAt: Date.now(),
    };
    setSavedNotes((prev) => [note, ...prev]);
    setJournalEntry("");
  };

  const editNote = (note: SavedNote) => {
    setEditingNoteId(note.id);
    setJournalEntry(note.text);
    setActiveTab("journal");
  };

  const deleteNote = (id: string) => {
    setSavedNotes((prev) => prev.filter((note) => note.id !== id));
    if (editingNoteId === id) {
      setEditingNoteId(null);
      setJournalEntry("");
    }
  };

  const prettyDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const updateProfileField = (field: keyof UserProfileForm, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const saveProfile = async () => {
    try {
      await saveUserProfile({
        name: profile.name.trim(),
        heightValue: profile.heightValue.trim(),
        heightUnit: profile.heightUnit,
        weightValue: profile.weightValue.trim(),
        weightUnit: profile.weightUnit,
        dateOfBirth: profile.dateOfBirth.trim(),
      });
      setIsEditingProfile(false);
      void AccessibilityInfo.announceForAccessibility("Profile updated");
    } catch (error) {
      notifyError(error instanceof Error ? error.message : "Failed to save profile.");
    }
  };

  const startEditingProfile = () => {
    setIsEditingProfile(true);
    void AccessibilityInfo.announceForAccessibility("Profile editing enabled");
  };

  const cancelEditingProfile = () => {
    setIsEditingProfile(false);
    void AccessibilityInfo.announceForAccessibility("Profile editing canceled");
  };

  const openQuestionnaireFromSettings = () => {
    setShowQuestionnairePromptModal(false);
    setShowQuestionnaireModal(true);
    void AccessibilityInfo.announceForAccessibility("Stress questionnaire opened");
  };

  const openQuestionnaireFromPrompt = () => {
    setShowQuestionnairePromptModal(false);
    setShowQuestionnaireModal(true);
    void AccessibilityInfo.announceForAccessibility("Stress questionnaire opened");
  };

  const handleTrackPress = async (trackId: string) => {
    const targetTrack = MOCK_TRACKS.find((track) => track.id === trackId);
    if (!targetTrack) return;

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      setSelectedTrackId(trackId);

      if (soundRef.current && loadedTrackIdRef.current === trackId) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await soundRef.current.pauseAsync();
          setIsPlaying(false);
        } else if (status.isLoaded) {
          await soundRef.current.playAsync();
          setIsPlaying(true);
        }
        return;
      }

      if (soundRef.current) {
        soundRef.current.setOnPlaybackStatusUpdate(null);
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setSound(null);
        loadedTrackIdRef.current = null;
        setLoadedTrackId(null);
      }

      const { sound: nextSound } = await Audio.Sound.createAsync(
        { uri: targetTrack.previewUrl },
        { shouldPlay: true, isLooping: false, progressUpdateIntervalMillis: 500 }
      );

      nextSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) {
            setIsPlaying(false);
            void nextSound.stopAsync();
          }
        }
      });

      soundRef.current = nextSound;
      setSound(nextSound);
      setIsPlaying(true);
      loadedTrackIdRef.current = trackId;
      setLoadedTrackId(trackId);
    } catch {
      notifyError("Unable to play preview right now. Try another track.");
      setIsPlaying(false);
      loadedTrackIdRef.current = null;
      setLoadedTrackId(null);
    }
  };

  return (
    <LinearGradient colors={["#DEEEFF", "#EAF6FF", "#F7FBFF"]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.cloudOne}>
            <View style={styles.cloudBase} />
            <View style={styles.cloudBumpLarge} />
            <View style={styles.cloudBumpMid} />
            <View style={styles.cloudBumpSmall} />
          </View>
          <View style={styles.cloudTwo}>
            <View style={styles.cloudBaseSmall} />
            <View style={styles.cloudBumpMidSmall} />
            <View style={styles.cloudBumpTiny} />
          </View>

          <View style={styles.navbar}>
            <View accessible={true}>
              <Text style={styles.navTitle} accessibilityRole="header" allowFontScaling={true}>
                MindTune
              </Text>
              <Text style={styles.navSubtitle} accessibilityRole="text" allowFontScaling={true}>
                Find your calm rhythm
              </Text>
            </View>
            <View style={styles.navActionsRow}>
              <Pressable
                style={styles.navIconButton}
                onPress={() => setActiveTab("settings")}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Profile settings"
                accessibilityHint="Opens your profile settings tab"
              >
                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={colors.textPrimary}
                  accessible={false}
                  importantForAccessibility="no"
                />
              </Pressable>
              <Pressable
                style={styles.navIconButton}
                onPress={logout}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Logout"
                accessibilityHint="Logs out of your account"
                accessibilityState={{ disabled: false }}
              >
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={colors.textPrimary}
                  accessible={false}
                  importantForAccessibility="no"
                />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {activeTab === "discover" && (
              <DiscoverTab
                appreciation={appreciation}
                activeTrack={activeTrack}
                selectedTrackId={selectedTrackId}
                isPlaying={isPlaying}
                onTrackPress={handleTrackPress}
              />
            )}

            {activeTab === "journal" && (
              <JournalTab
                editingNoteId={editingNoteId}
                journalEntry={journalEntry}
                onJournalChange={setJournalEntry}
                onCancelEdit={() => {
                  setEditingNoteId(null);
                  setJournalEntry("");
                }}
                onSave={saveJournal}
                savedNotes={savedNotes}
                onEditNote={editNote}
                onDeleteNote={deleteNote}
                prettyDate={prettyDate}
              />
            )}

            {activeTab === "analytics" && (
              <AnalyticsTab
                selectedRange={selectedRange}
                onSelectRange={setSelectedRange}
                current={current}
                graphWidth={graphWidth}
                graphHeight={graphHeight}
                pointsText={pointsText}
                chartPoints={chartPoints}
                isLoading={isAnalyticsLoading}
                error={analyticsError}
              />
            )}

            {activeTab === "prediction" && (
              <StressPredictionScreen />
            )}

            {activeTab === "history" && (
              <InferenceHistoryScreen />
            )}

            {activeTab === "reports" && (
              <ReportScreen />
            )}

            {activeTab === "settings" && (
              <SettingsTab
                profile={profile}
                isEditing={isEditingProfile}
                onChangeField={updateProfileField}
                onStartEditing={startEditingProfile}
                onCancelEditing={cancelEditingProfile}
                onSaveProfile={saveProfile}
                onOpenQuestionnaire={openQuestionnaireFromSettings}
              />
            )}
          </ScrollView>

          <View style={styles.bottomBar}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bottomBarContent}
            >
            <Pressable
              style={[styles.bottomItem, activeTab === "discover" && styles.bottomItemActive]}
              onPress={() => setActiveTab("discover")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Discover tab"
              accessibilityState={{ selected: activeTab === "discover" }}
            >
              <Ionicons
                name="headset"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Discover
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "journal" && styles.bottomItemActive]}
              onPress={() => setActiveTab("journal")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Journal tab"
              accessibilityState={{ selected: activeTab === "journal" }}
            >
              <Feather
                name="book-open"
                size={15}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Journal
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "analytics" && styles.bottomItemActive]}
              onPress={() => setActiveTab("analytics")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Analytics tab"
              accessibilityState={{ selected: activeTab === "analytics" }}
            >
              <Ionicons
                name="stats-chart"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Analytics
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "prediction" && styles.bottomItemActive]}
              onPress={() => setActiveTab("prediction")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Prediction tab"
              accessibilityState={{ selected: activeTab === "prediction" }}
            >
              <Ionicons
                name="pulse"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Predict
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "history" && styles.bottomItemActive]}
              onPress={() => setActiveTab("history")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="History tab"
              accessibilityState={{ selected: activeTab === "history" }}
            >
              <Ionicons
                name="time"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                History
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "reports" && styles.bottomItemActive]}
              onPress={() => setActiveTab("reports")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Reports tab"
              accessibilityState={{ selected: activeTab === "reports" }}
            >
              <Ionicons
                name="document-text"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Reports
              </Text>
            </Pressable>
            <Pressable
              style={[styles.bottomItem, activeTab === "settings" && styles.bottomItemActive]}
              onPress={() => setActiveTab("settings")}
              accessible={true}
              accessibilityRole="tab"
              accessibilityLabel="Settings tab"
              accessibilityState={{ selected: activeTab === "settings" }}
            >
              <Ionicons
                name="settings-outline"
                size={16}
                color={colors.accent}
                accessible={false}
                importantForAccessibility="no"
              />
              <Text style={styles.bottomLabel} allowFontScaling={true}>
                Settings
              </Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>

      <Modal
        animationType="fade"
        transparent
        visible={showQuestionnairePromptModal}
        onRequestClose={() => setShowQuestionnairePromptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.promptModalCard}>
            <Text style={styles.modalTitle}>Stress Check-In</Text>
            <Text style={styles.modalSubtitle}>
              Please complete your stress assessment for today.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryAction}
                onPress={() => setShowQuestionnairePromptModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Later"
                accessibilityHint="Close this reminder for now"
              >
                <Text style={styles.secondaryActionText} allowFontScaling={true}>
                  Later
                </Text>
              </Pressable>
              <Pressable
                style={styles.primaryAction}
                onPress={openQuestionnaireFromPrompt}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Open questionnaire"
                accessibilityHint="Opens stress assessment questionnaire"
              >
                <Text style={styles.primaryActionText} allowFontScaling={true}>
                  Open Now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showQuestionnaireModal}
        onRequestClose={() => setShowQuestionnaireModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Stress Assessment and Tracking</Text>
            <Text style={styles.modalSubtitle}>
              Answer based on the past 7 days. This appears every 14 days and takes around 5 minutes.
            </Text>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.questionnaireSectionCard}>
                <Text style={styles.questionnaireSectionTitle} allowFontScaling={true}>
                  Section 1: Stress Intensity
                </Text>
                <Text style={styles.questionnaireHelperText} allowFontScaling={true}>
                  1 = Never, 2 = Almost never, 3 = Sometimes, 4 = Fairly often, 5 = Very often
                </Text>
                {SECTION_ONE_ITEMS.map((item, index) => (
                  <View key={`s1-${index}`} style={styles.questionBlock}>
                    <Text style={styles.questionText} allowFontScaling={true}>
                      {index + 1}. {item}
                    </Text>
                    <View style={styles.optionRow}>
                      {likertScale.map((score) => (
                        <Pressable
                          key={`s1-${index}-${score}`}
                          style={[
                            styles.optionChip,
                            answers.section1Scores[index] === score && styles.optionChipActive,
                          ]}
                          onPress={() => selectSection1Score(index, score)}
                          accessible={true}
                          accessibilityRole="radio"
                          accessibilityLabel={`Question ${index + 1} score ${score}`}
                          accessibilityState={{ selected: answers.section1Scores[index] === score }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              answers.section1Scores[index] === score && styles.optionTextActive,
                            ]}
                            allowFontScaling={true}
                          >
                            {score}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}

                <View style={styles.questionnaireSummaryCard}>
                  <Text style={styles.questionnaireSummaryText} allowFontScaling={true}>
                    Total Section 1 Score: {section1Total} / 40
                  </Text>
                  <Text style={styles.questionnaireSummaryHint} allowFontScaling={true}>
                    Stress level: {stressBand}
                  </Text>
                </View>
              </View>

              <View style={styles.questionnaireSectionCard}>
                <Text style={styles.questionnaireSectionTitle} allowFontScaling={true}>
                  Section 2: Stress Causes and Triggers
                </Text>
                <Text style={styles.questionnaireHelperText} allowFontScaling={true}>
                  Select trigger intensity: 1 = Low impact, 5 = High impact.
                </Text>

                {STRESS_TRIGGER_ITEMS.map((item) => (
                  <View key={item.key} style={styles.questionBlock}>
                    <Text style={styles.questionText} allowFontScaling={true}>
                      {item.label}
                    </Text>
                    <View style={styles.optionRow}>
                      <Pressable
                        style={[
                          styles.optionChip,
                          answers.stressTriggers[item.key] === 0 && styles.optionChipActive,
                        ]}
                        onPress={() => selectTriggerIntensity(item.key, 0)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.label} not selected`}
                        accessibilityState={{ selected: answers.stressTriggers[item.key] === 0 }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            answers.stressTriggers[item.key] === 0 && styles.optionTextActive,
                          ]}
                          allowFontScaling={true}
                        >
                          Skip
                        </Text>
                      </Pressable>
                      {likertScale.map((score) => (
                        <Pressable
                          key={`${item.key}-${score}`}
                          style={[
                            styles.optionChip,
                            answers.stressTriggers[item.key] === score && styles.optionChipActive,
                          ]}
                          onPress={() => selectTriggerIntensity(item.key, score)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`${item.label} intensity ${score}`}
                          accessibilityState={{ selected: answers.stressTriggers[item.key] === score }}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              answers.stressTriggers[item.key] === score && styles.optionTextActive,
                            ]}
                            allowFontScaling={true}
                          >
                            {score}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {item.key === "other" ? (
                      <TextInput
                        value={answers.otherTriggerText}
                        onChangeText={(value) => updateQuestionnaireField("otherTriggerText", value)}
                        placeholder="Describe other trigger"
                        placeholderTextColor={colors.textSecondary}
                        style={styles.questionnaireInput}
                        accessibilityLabel="Other stress trigger"
                      />
                    ) : null}
                  </View>
                ))}
              </View>

              <View style={styles.questionnaireSectionCard}>
                <Text style={styles.questionnaireSectionTitle} allowFontScaling={true}>
                  Section 3: Stress Patterns and Duration
                </Text>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Average daily stress (1-10)
                  </Text>
                  <TextInput
                    value={answers.averageDailyStress}
                    onChangeText={(value) => updateQuestionnaireField("averageDailyStress", value)}
                    placeholder="1 to 10"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.questionnaireInput}
                    keyboardType="number-pad"
                    accessibilityLabel="Average daily stress"
                  />
                </View>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Days stressed this week (0-7)
                  </Text>
                  <TextInput
                    value={answers.daysStressed}
                    onChangeText={(value) => updateQuestionnaireField("daysStressed", value)}
                    placeholder="0 to 7"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.questionnaireInput}
                    keyboardType="number-pad"
                    accessibilityLabel="Days stressed this week"
                  />
                </View>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Peak stress time
                  </Text>
                  <View style={styles.optionRow}>
                    {([
                      "morning",
                      "afternoon",
                      "evening",
                      "night",
                      "constant",
                    ] as const).map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionChip,
                          answers.peakStressTime === option && styles.optionChipActive,
                        ]}
                        onPress={() => updateQuestionnaireField("peakStressTime", option)}
                        accessibilityRole="button"
                        accessibilityLabel={`Peak stress time ${option}`}
                        accessibilityState={{ selected: answers.peakStressTime === option }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            answers.peakStressTime === option && styles.optionTextActive,
                          ]}
                          allowFontScaling={true}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Duration
                  </Text>
                  <View style={styles.optionRow}>
                    <Pressable
                      style={[styles.optionChip, answers.duration === "lt1week" && styles.optionChipActive]}
                      onPress={() => updateQuestionnaireField("duration", "lt1week")}
                    >
                      <Text
                        style={[styles.optionText, answers.duration === "lt1week" && styles.optionTextActive]}
                        allowFontScaling={true}
                      >
                        {'<1 week'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.optionChip,
                        answers.duration === "1to4weeks" && styles.optionChipActive,
                      ]}
                      onPress={() => updateQuestionnaireField("duration", "1to4weeks")}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          answers.duration === "1to4weeks" && styles.optionTextActive,
                        ]}
                        allowFontScaling={true}
                      >
                        1-4 weeks
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.optionChip,
                        answers.duration === "1plusmonths" && styles.optionChipActive,
                      ]}
                      onPress={() => updateQuestionnaireField("duration", "1plusmonths")}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          answers.duration === "1plusmonths" && styles.optionTextActive,
                        ]}
                        allowFontScaling={true}
                      >
                        1+ months
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[styles.optionChip, answers.duration === "chronic" && styles.optionChipActive]}
                      onPress={() => updateQuestionnaireField("duration", "chronic")}
                    >
                      <Text
                        style={[styles.optionText, answers.duration === "chronic" && styles.optionTextActive]}
                        allowFontScaling={true}
                      >
                        Chronic
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>

              <View style={styles.questionnaireSectionCard}>
                <Text style={styles.questionnaireSectionTitle} allowFontScaling={true}>
                  Section 4: Related Factors and Coping
                </Text>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Physical symptoms
                  </Text>
                  <View style={styles.optionRow}>
                    {PHYSICAL_SYMPTOMS.map((symptom) => (
                      <Pressable
                        key={symptom}
                        style={[
                          styles.optionChip,
                          answers.physicalSymptoms.includes(symptom) && styles.optionChipActive,
                        ]}
                        onPress={() => togglePhysicalSymptom(symptom)}
                        accessibilityRole="checkbox"
                        accessibilityLabel={symptom}
                        accessibilityState={{ checked: answers.physicalSymptoms.includes(symptom) }}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            answers.physicalSymptoms.includes(symptom) && styles.optionTextActive,
                          ]}
                          allowFontScaling={true}
                        >
                          {symptom}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {COPING_ITEMS.map((item) => (
                  <View key={`coping-${item.key}`} style={styles.questionBlock}>
                    <Text style={styles.questionText} allowFontScaling={true}>
                      {item.label} effectiveness
                    </Text>
                    <View style={styles.optionRow}>
                      <Pressable
                        style={[
                          styles.optionChip,
                          answers.copingEffectiveness[item.key] === 0 && styles.optionChipActive,
                        ]}
                        onPress={() => selectCopingEffectiveness(item.key, 0)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            answers.copingEffectiveness[item.key] === 0 && styles.optionTextActive,
                          ]}
                          allowFontScaling={true}
                        >
                          N/A
                        </Text>
                      </Pressable>
                      {likertScale.map((score) => (
                        <Pressable
                          key={`${item.key}-score-${score}`}
                          style={[
                            styles.optionChip,
                            answers.copingEffectiveness[item.key] === score && styles.optionChipActive,
                          ]}
                          onPress={() => selectCopingEffectiveness(item.key, score)}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              answers.copingEffectiveness[item.key] === score && styles.optionTextActive,
                            ]}
                            allowFontScaling={true}
                          >
                            {score}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    {item.key === "other" ? (
                      <TextInput
                        value={answers.otherCopingText}
                        onChangeText={(value) => updateQuestionnaireField("otherCopingText", value)}
                        placeholder="Other coping strategy"
                        placeholderTextColor={colors.textSecondary}
                        style={styles.questionnaireInput}
                        accessibilityLabel="Other coping strategy"
                      />
                    ) : null}
                  </View>
                ))}

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    Support availability
                  </Text>
                  <View style={styles.optionRow}>
                    {(["yes", "no", "sometimes"] as const).map((option) => (
                      <Pressable
                        key={option}
                        style={[
                          styles.optionChip,
                          answers.supportAvailability === option && styles.optionChipActive,
                        ]}
                        onPress={() => updateQuestionnaireField("supportAvailability", option)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            answers.supportAvailability === option && styles.optionTextActive,
                          ]}
                          allowFontScaling={true}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.questionBlock}>
                  <Text style={styles.questionText} allowFontScaling={true}>
                    What helped reduce stress this week, or made it worse?
                  </Text>
                  <TextInput
                    value={answers.openReflection}
                    onChangeText={(value) => updateQuestionnaireField("openReflection", value)}
                    placeholder="Write your reflection"
                    placeholderTextColor={colors.textSecondary}
                    style={styles.questionnaireTextArea}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    accessibilityLabel="Stress reflection"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                style={styles.secondaryAction}
                onPress={() => setShowQuestionnaireModal(false)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Later"
                accessibilityHint="Close questionnaire and complete later"
              >
                <Text style={styles.secondaryActionText} allowFontScaling={true}>
                  Later
                </Text>
              </Pressable>
              <Pressable
                style={styles.primaryAction}
                onPress={completeQuestionnaire}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Complete"
                accessibilityHint="Submit questionnaire answers"
              >
                <Text style={styles.primaryActionText} allowFontScaling={true}>
                  Complete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};
