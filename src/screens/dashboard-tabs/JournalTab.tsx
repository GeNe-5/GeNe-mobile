import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, TextInput, View } from "react-native";
import { colors } from "../../theme/colors";
import {styles} from "../dashboard.styles";
import type { SavedNote } from "./types";

type JournalTabProps = {
  editingNoteId: string | null;
  journalEntry: string;
  onJournalChange: (value: string) => void;
  onCancelEdit: () => void;
  onSave: () => void;
  savedNotes: SavedNote[];
  onEditNote: (note: SavedNote) => void;
  onDeleteNote: (id: string) => void;
  prettyDate: (timestamp: number) => string;
};

export const JournalTab = ({
  editingNoteId,
  journalEntry,
  onJournalChange,
  onCancelEdit,
  onSave,
  savedNotes,
  onEditNote,
  onDeleteNote,
  prettyDate,
}: JournalTabProps) => (
  <>
    <View style={styles.card}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Ionicons name="create-outline" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
          Calming Diary
        </Text>
      </View>
      <View style={styles.reframeCard}>
        <Text style={styles.reframeTitle} allowFontScaling={true}>
          Cognitive Reframe 
        </Text>
        <View style={styles.reframeSteps}>
          <Text style={styles.reframeHint} allowFontScaling={true}>
            1. Affect labeling: start with "I feel...".
          </Text>
          <Text style={styles.reframeHint} allowFontScaling={true}>
            2. Slow exhale breathing: 4 seconds in, 6 seconds out x 3.
          </Text>
          <Text style={styles.reframeHint} allowFontScaling={true}>
            3. Reappraisal: write one balanced thought you can act on now.
          </Text>
        </View>
      </View>
      <TextInput
        multiline
        numberOfLines={5}
        value={journalEntry}
        onChangeText={onJournalChange}
        placeholder="Today I felt..."
        placeholderTextColor={colors.textSecondary}
        style={styles.journalInput}
        allowFontScaling={true}
        accessible={true}
        accessibilityLabel="Journal input"
        accessibilityHint="Enter your note"
        accessibilityLiveRegion="polite"
        importantForAccessibility="yes"
      />
      <View style={styles.journalActionsRow}>
        {editingNoteId ? (
          <Pressable
            style={styles.cancelEditButton}
            onPress={onCancelEdit}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel edit"
            accessibilityHint="Discard note editing"
          >
            <Text style={styles.cancelEditText} allowFontScaling={true}>
              Cancel
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          style={styles.saveButton}
          onPress={onSave}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={editingNoteId ? "Update note" : "Save note"}
          accessibilityHint="Saves your journal entry"
          accessibilityState={{ disabled: false }}
        >
          <Text style={styles.saveButtonText} allowFontScaling={true}>
            {editingNoteId ? "Update Note" : "Save Note"}
          </Text>
        </Pressable>
      </View>
    </View>

    <View style={styles.card}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Ionicons name="albums-outline" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} accessibilityRole="header" allowFontScaling={true}>
          Saved Notes
        </Text>
      </View>
      {savedNotes.length > 0 ? (
        <View style={styles.savedNotesGrid}>
          {savedNotes.map((note) => (
            <View key={note.id} style={styles.savedNoteCard}>
              <View style={styles.savedNoteHeader}>
                <View style={styles.savedNoteBadge}>
                  <Text style={styles.savedNoteBadgeText}>Note</Text>
                </View>
                <Text style={styles.savedNoteDate}>{prettyDate(note.createdAt)}</Text>
              </View>
              <Text style={styles.savedNoteText} numberOfLines={5}>
                {note.text}
              </Text>
              <View style={styles.noteActionRow}>
                <Pressable
                  style={styles.noteIconAction}
                  onPress={() => onEditNote(note)}
                  accessibilityLabel="Edit note"
                  accessibilityRole="button"
                  accessibilityHint="Load note into editor"
                >
                  <Ionicons name="create-outline" size={16} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  style={[styles.noteIconAction, styles.noteDeleteIconAction]}
                  onPress={() => onDeleteNote(note.id)}
                  accessibilityLabel="Delete note"
                  accessibilityRole="button"
                  accessibilityHint="Removes this note"
                >
                  <Ionicons name="trash-outline" size={16} color="#B74343" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.emptySavedNotesText} allowFontScaling={true}>
          No notes yet. Add your first calming note above.
        </Text>
      )}
    </View>
  </>
);
