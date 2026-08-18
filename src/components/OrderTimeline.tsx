import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";
import { colors } from "@src/theme/colors";
import { space } from "@src/theme/typography";
import { OrderTrackingEvent } from "@src/types";
import { formatDateTime } from "@src/utils/format";

export function OrderTimeline({ events }: { events: OrderTrackingEvent[] }) {
  return (
    <View>
      {events
        .slice()
        .reverse()
        .map((event, idx) => {
          const isLast = idx === events.length - 1;
          const isLatest = idx === 0;
          return (
            <View key={event.id} style={styles.row}>
              <View style={styles.railColumn}>
                <View
                  style={[
                    styles.dot,
                    isLatest ? styles.dotActive : styles.dotDone,
                  ]}
                >
                  {isLatest && <Ionicons name="checkmark" size={11} color={colors.textOnAccent} />}
                </View>
                {!isLast && <View style={styles.line} />}
              </View>
              <View style={styles.content}>
                <ThemedText variant="bodyMedium" color={isLatest ? colors.textPrimary : colors.textSecondary}>
                  {event.label}
                </ThemedText>
                <ThemedText variant="caption" color={colors.textFaint} style={{ marginTop: 2 }}>
                  {event.description}
                </ThemedText>
                <ThemedText variant="micro" color={colors.textFaint} style={{ marginTop: 4 }}>
                  {formatDateTime(event.timestamp)}
                  {event.location ? ` · ${event.location}` : ""}
                </ThemedText>
              </View>
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row" },
  railColumn: { alignItems: "center", width: 24 },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: { backgroundColor: colors.accent },
  dotDone: { backgroundColor: colors.borderStrong },
  line: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: 2, minHeight: 28 },
  content: { flex: 1, paddingBottom: space.md, marginLeft: space.xs },
});
