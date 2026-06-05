import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@mobile/lib/theme";

type Props = {
  step: number;
  total: number;
  onBack: () => void;
};

const RING = 30;
const STROKE = 3;

export default function StepHeader({ step, total, onBack }: Props) {
  const { theme } = useTheme();
  const radius = (RING - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(step / total, 0), 1);

  return (
    <View style={styles.row}>
      <Ionicons
        name="chevron-back"
        size={26}
        color={theme.text}
        onPress={onBack}
        suppressHighlighting
        accessibilityRole="button"
        accessibilityLabel="Go back"
      />

      <View style={styles.ring}>
        <Svg width={RING} height={RING}>
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={radius}
            stroke={theme.border}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={RING / 2}
            cy={RING / 2}
            r={radius}
            stroke={theme.accent}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            transform={`rotate(-90 ${RING / 2} ${RING / 2})`}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    height: 52,
  },
  ring: {
    width: RING,
    height: RING,
    alignItems: "center",
    justifyContent: "center",
  },
});
