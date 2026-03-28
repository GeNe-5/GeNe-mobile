import { Pressable, ScrollView, Text, View } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  MOCK_GROUNDING_ANCHORS,
  MOCK_PLAYLISTS,
  MOCK_TRACKS,
  type MockTrack,
} from "../../common/data/mockData";
import { colors } from "../../theme/colors";
import { styles } from "../dashboard.styles";

type DiscoverTabProps = {
  appreciation: string;
  activeTrack: MockTrack;
  selectedTrackId: string;
  isPlaying: boolean;
  onTrackPress: (trackId: string) => void;
};

export const DiscoverTab = ({
  appreciation,
  activeTrack,
  selectedTrackId,
  isPlaying,
  onTrackPress,
}: DiscoverTabProps) => (
  <>
    <View
      style={styles.messageCard}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`Well Done. ${appreciation}`}
      accessibilityElementsHidden={false}
      importantForAccessibility="yes"
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageIconWrap} accessible={false} importantForAccessibility="no">
          <Ionicons
            name="sparkles"
            size={14}
            color={colors.accent}
            accessible={false}
            importantForAccessibility="no"
          />
        </View>
        <Text style={styles.messageTitle} allowFontScaling={true}>
          Well Done
        </Text>
      </View>
      <Text style={styles.messageText} allowFontScaling={true}>
        {appreciation}
      </Text>
    </View>

    <View style={styles.statusRow}>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillLabel}>Stress Level</Text>
        <Text style={styles.statusPillValue}>Moderate</Text>
      </View>
      <View style={styles.statusPill}>
        <Text style={styles.statusPillLabel}>Recovery</Text>
        <Text style={styles.statusPillValue}>Improving</Text>
      </View>
    </View>

    <View style={styles.recommendCard}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Ionicons name="headset-outline" size={13} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Now Playing Queue
        </Text>
      </View>
      <View style={styles.nowPlayingHero}>
        <View style={styles.nowPlayingSquare} accessible={false} importantForAccessibility="no">
          <Ionicons
            name="headset"
            size={28}
            color={colors.accent}
            accessible={false}
            importantForAccessibility="no"
          />
        </View>
        <View style={styles.nowPlayingMeta}>
          <Text style={styles.nowPlayingLabel} allowFontScaling={true}>
            Now Playing
          </Text>
          <Text style={styles.trackName} allowFontScaling={true}>
            {activeTrack.title}
          </Text>
          <Text style={styles.trackSub} allowFontScaling={true}>
            {activeTrack.artist} • {activeTrack.duration}
          </Text>
          <Text style={styles.trackMetaMini} allowFontScaling={true}>
            {activeTrack.mood} • {activeTrack.bpm} BPM • {activeTrack.intensity}
          </Text>
          <Pressable
            style={styles.playChip}
            onPress={() => onTrackPress(activeTrack.id)}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${isPlaying ? "Pause" : "Play"} ${activeTrack.title}`}
            accessibilityHint="Tap to toggle current track playback"
            accessibilityState={{ disabled: false }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={10}
              color={colors.textPrimary}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.playChipText} allowFontScaling={true}>
              {isPlaying ? "Pause" : "Play"}
            </Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.albumCarouselTitle} allowFontScaling={true}>
        Up Next
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.albumCarousel}
      >
        {MOCK_TRACKS.slice(1).map((track, index) => {
          const isCardActive = selectedTrackId === track.id;
          const isCardPlaying = isCardActive && isPlaying;

          return (
            <View key={track.id} style={[styles.albumCard, isCardActive && styles.albumCardActive]}>
              <Pressable
                style={styles.albumInfoTap}
                onPress={() => onTrackPress(track.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`Play ${track.title}`}
                accessibilityHint={`Track by ${track.artist}`}
              >
                <View
                  style={[
                    styles.albumCover,
                    { backgroundColor: track.coverColor },
                    index % 2 === 1 && styles.albumCoverAlt,
                  ]}
                >
                  <Ionicons name="musical-notes" size={20} color={colors.accent} />
                </View>
                <Text style={styles.albumTitle} numberOfLines={1} allowFontScaling={true}>
                  {track.title}
                </Text>
                <Text style={styles.albumSub} numberOfLines={1} allowFontScaling={true}>
                  {track.artist}
                </Text>
                <Text style={styles.albumSub} numberOfLines={1} allowFontScaling={true}>
                  {track.duration} • {track.bpm} BPM
                </Text>
              </Pressable>
              <Pressable
                style={styles.albumAction}
                onPress={() => onTrackPress(track.id)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`${isCardPlaying ? "Pause" : "Play"} ${track.title}`}
                accessibilityState={{ disabled: false }}
              >
                <Ionicons
                  name={isCardPlaying ? "pause" : "play"}
                  size={11}
                  color={colors.textPrimary}
                  accessible={false}
                  importantForAccessibility="no"
                />
                <Text style={styles.albumActionText} allowFontScaling={true}>
                  {isCardPlaying ? "Pause" : "Play"}
                </Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>

    <View style={styles.card}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <Feather name="disc" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Playlists
        </Text>
      </View>
      <View style={styles.anchorRow}>
        {MOCK_PLAYLISTS.map((playlist) => (
          <View key={playlist} style={styles.anchorChip} accessible={true}>
            <Feather
              name="disc"
              size={12}
              color={colors.textPrimary}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.anchorChipText} allowFontScaling={true}>
              {playlist}
            </Text>
          </View>
        ))}
      </View>
    </View>

    <View style={styles.card}>
      <View style={styles.sectionTitleRow}>
        <View style={styles.sectionTitleIcon}>
          <MaterialCommunityIcons name="meditation" size={12} color={colors.accent} />
        </View>
        <Text style={styles.sectionTitle} allowFontScaling={true}>
          Grounding Anchors
        </Text>
      </View>
      <View style={styles.anchorRow}>
        {MOCK_GROUNDING_ANCHORS.map((anchor) => (
          <View key={anchor} style={styles.anchorChip} accessible={true}>
            <MaterialCommunityIcons
              name="meditation"
              size={13}
              color={colors.textPrimary}
              accessible={false}
              importantForAccessibility="no"
            />
            <Text style={styles.anchorChipText} allowFontScaling={true}>
              {anchor}
            </Text>
          </View>
        ))}
      </View>
    </View>
  </>
);
