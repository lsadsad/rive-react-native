import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import Rive, {
  Fit,
  Alignment,
  AutoBind,
  useRive,
  useRiveTrigger,
} from 'rive-react-native';
import {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

// --- VM property name constants (root VM) ---
const VM_ACTIVE_TAB = 'activeTab';
const VM_IS_DARK_MODE = 'isDarkMode';
const VM_LEGEND_COUNT = 'legendCount';
const VM_MONTH_COUNT = 'monthCount';
const VM_Y_AXIS_MAX = 'yAxisMax';
const VM_BAR_TAPPED = 'barTapped'; // trigger fired by Rive on bar tap

// Nested VM path helpers
const month = (i: number, prop: string) =>
  `month${String(i).padStart(2, '0')}/${prop}`;
const legend = (prop: string) => `legend/${prop}`;

/**
 * The chart bar height domain in Rive artboard units.
 * Host computes segNNHeight = segNN / yAxisMax * CHART_HEIGHT.
 * Must match the bar area height in the Rive artboard design.
 */
const CHART_HEIGHT = 200;

// Bar entrance animation: bars stagger left→right, each grows 0→target over BAR_DURATION_MS.
const BAR_STAGGER_MS = 60;
const BAR_DURATION_MS = 500;

// --- Sample data types ---
type SegData = { value: number; hidden: boolean };

type MonthData = {
  label: string;
  monthFormattedTotal: string;
  segs: [SegData, SegData, SegData, SegData, SegData, SegData];
  seg06Striped: boolean;
};

// Segments map to legend: Streaming, Data, Talk, Intl, Fees, Est.
// Listed most-recent-first so monthCount=6 shows Oct–Mar, matching the design.
const SAMPLE_MONTHS: MonthData[] = [
  {
    label: 'Oct', monthFormattedTotal: '$150*', seg06Striped: true,
    segs: [
      { value: 62, hidden: false }, // Streaming
      { value: 38, hidden: false }, // Data
      { value: 25, hidden: false }, // Talk
      { value: 10, hidden: false }, // Intl
      { value:  5, hidden: false }, // Fees
      { value: 10, hidden: false }, // Est. (striped — current open month)
    ],
  },
  {
    label: 'Nov', monthFormattedTotal: '$82', seg06Striped: false,
    segs: [
      { value: 38, hidden: false },
      { value: 24, hidden: false },
      { value: 15, hidden: false },
      { value:  0, hidden: true  }, // no Intl
      { value:  5, hidden: false },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Dec', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Jan', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Feb', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Mar', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Apr', monthFormattedTotal: '$45', seg06Striped: false,
    segs: [
      { value: 22, hidden: false },
      { value: 14, hidden: false },
      { value:  9, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'May', monthFormattedTotal: '$42', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 14, hidden: false },
      { value:  8, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Jun', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Jul', monthFormattedTotal: '$55', seg06Striped: false,
    segs: [
      { value: 25, hidden: false },
      { value: 18, hidden: false },
      { value:  9, hidden: false },
      { value:  0, hidden: true  },
      { value:  3, hidden: false },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Aug', monthFormattedTotal: '$65', seg06Striped: false,
    segs: [
      { value: 28, hidden: false },
      { value: 20, hidden: false },
      { value: 10, hidden: false },
      { value:  0, hidden: true  },
      { value:  7, hidden: false },
      { value:  0, hidden: true  },
    ],
  },
  {
    label: 'Sep', monthFormattedTotal: '$38', seg06Striped: false,
    segs: [
      { value: 20, hidden: false },
      { value: 12, hidden: false },
      { value:  6, hidden: false },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
      { value:  0, hidden: true  },
    ],
  },
];

const LEGEND_LABELS = ['Streaming', 'Data', 'Talk', 'Intl', 'Fees', 'Est.'];

export default function MonthlySummary() {
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  const [activeTab, setActiveTab] = useState(0);
  const [monthCount, setMonthCount] = useState(6);
  const [legendCount, setLegendCount] = useState(3);
  const [lastBarTapped, setLastBarTapped] = useState<string | null>(null);

  // Auto-scale y-axis ceiling to the tallest active month, rounded up to the nearest $50.
  // In production this derives from real billing data; no manual override needed.
  const yAxisMax = useMemo(() => {
    const totals = SAMPLE_MONTHS.slice(0, monthCount).map((m) =>
      m.segs.reduce((sum, s) => sum + (s.hidden ? 0 : s.value), 0)
    );
    const max = Math.max(...totals, 0);
    return Math.ceil(max / 50) * 50;
  }, [monthCount]);

  const [setRiveRef, riveRef] = useRive();

  // Listen for bar taps from Rive
  useRiveTrigger(riveRef, VM_BAR_TAPPED, () => {
    setLastBarTapped(new Date().toLocaleTimeString());
  });

  // --- Reanimated: one 0→1 progress value per month (hooks cannot be called in a loop) ---
  const p00 = useSharedValue(0); const p01 = useSharedValue(0);
  const p02 = useSharedValue(0); const p03 = useSharedValue(0);
  const p04 = useSharedValue(0); const p05 = useSharedValue(0);
  const p06 = useSharedValue(0); const p07 = useSharedValue(0);
  const p08 = useSharedValue(0); const p09 = useSharedValue(0);
  const p10 = useSharedValue(0); const p11 = useSharedValue(0);
  const progressValues = [p00, p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11];

  // pushHeights runs on the JS thread (via runOnJS) on each animation frame.
  // Uses a ref so the worklet always calls the latest version without being recreated.
  const pushHeights = useCallback(
    (monthIndex: number, progress: number) => {
      if (!riveRef || monthIndex >= monthCount) return;
      const m = SAMPLE_MONTHS[monthIndex]!;
      m.segs.forEach((seg, si) => {
        if (seg.hidden) return;
        const n = si + 1;
        const targetH = (seg.value / yAxisMax) * CHART_HEIGHT;
        riveRef.setNumber(month(monthIndex, `seg0${n}Height`), targetH * progress);
      });
    },
    [riveRef, monthCount, yAxisMax]
  );
  const pushHeightsRef = useRef(pushHeights);
  useEffect(() => { pushHeightsRef.current = pushHeights; }, [pushHeights]);
  const pushHeightsStable = useCallback(
    (i: number, p: number) => pushHeightsRef.current(i, p),
    []
  );

  // One reaction per month — fires every frame while that month's progress is animating
  useAnimatedReaction(() => p00.value, (p) => runOnJS(pushHeightsStable)(0, p));
  useAnimatedReaction(() => p01.value, (p) => runOnJS(pushHeightsStable)(1, p));
  useAnimatedReaction(() => p02.value, (p) => runOnJS(pushHeightsStable)(2, p));
  useAnimatedReaction(() => p03.value, (p) => runOnJS(pushHeightsStable)(3, p));
  useAnimatedReaction(() => p04.value, (p) => runOnJS(pushHeightsStable)(4, p));
  useAnimatedReaction(() => p05.value, (p) => runOnJS(pushHeightsStable)(5, p));
  useAnimatedReaction(() => p06.value, (p) => runOnJS(pushHeightsStable)(6, p));
  useAnimatedReaction(() => p07.value, (p) => runOnJS(pushHeightsStable)(7, p));
  useAnimatedReaction(() => p08.value, (p) => runOnJS(pushHeightsStable)(8, p));
  useAnimatedReaction(() => p09.value, (p) => runOnJS(pushHeightsStable)(9, p));
  useAnimatedReaction(() => p10.value, (p) => runOnJS(pushHeightsStable)(10, p));
  useAnimatedReaction(() => p11.value, (p) => runOnJS(pushHeightsStable)(11, p));

  // Trigger bar entrance animation once when Rive is ready.
  // Bars stagger left→right; inactive months are skipped.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!riveRef) return;
    progressValues.forEach((sv, i) => {
      sv.value = 0;
      if (i < monthCount) {
        sv.value = withDelay(
          i * BAR_STAGGER_MS,
          withTiming(1, { duration: BAR_DURATION_MS, easing: Easing.out(Easing.cubic) })
        );
      }
    });
  }, [riveRef]);

  // Set all non-animated VM properties. Heights start at 0; animation drives them up.
  useEffect(() => {
    if (!riveRef) return;
    try {
      // --- Root VM ---
      riveRef.setNumber(VM_ACTIVE_TAB, activeTab);
      riveRef.setBoolean(VM_IS_DARK_MODE, isDarkMode);
      riveRef.setNumber(VM_LEGEND_COUNT, legendCount);
      riveRef.setNumber(VM_MONTH_COUNT, monthCount);
      riveRef.setNumber(VM_Y_AXIS_MAX, yAxisMax);

      // --- month00–11 nested VM ---
      for (let i = 0; i < 12; i++) {
        if (i >= monthCount) {
          // Inactive month — wipe everything so Rive renders nothing
          riveRef.setString(month(i, 'label'), '');
          riveRef.setString(month(i, 'monthFormattedTotal'), '');
          riveRef.setBoolean(month(i, 'seg06Striped'), false);
          for (let n = 1; n <= 6; n++) {
            riveRef.setNumber(month(i, `seg0${n}Height`), 0);
            riveRef.setBoolean(month(i, `hideSeg0${n}`), true);
          }
          continue;
        }

        // Active month — set labels/visibility; animation handles heights
        const m = SAMPLE_MONTHS[i]!;
        riveRef.setString(month(i, 'label'), m.label);
        riveRef.setString(month(i, 'monthFormattedTotal'), m.monthFormattedTotal);
        riveRef.setBoolean(month(i, 'seg06Striped'), m.seg06Striped);
        m.segs.forEach((seg, si) => {
          const n = si + 1;
          riveRef.setBoolean(month(i, `hideSeg0${n}`), seg.hidden);
          riveRef.setNumber(month(i, `seg0${n}Height`), 0); // animation starts from 0
        });
      }

      // --- legend nested VM ---
      for (let i = 1; i <= 6; i++) {
        riveRef.setString(legend(`label_0${i}`), LEGEND_LABELS[i - 1] ?? '');
        riveRef.setBoolean(legend(`hide_0${i}`), i > legendCount);
      }
      riveRef.setBoolean(legend('stripe_06'), true);
    } catch (e: any) {
      console.error('[MonthlySummary] Rive binding error:', e);
    }
  }, [riveRef, activeTab, isDarkMode, monthCount, legendCount, yAxisMax]);

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          resourceName={Platform.select({ android: 'cost_summary_v1', default: 'cost_summary-v1' })}
          artboardName="MonthlySummary"
          stateMachineName="MonthlySummary_SM"
          fit={Fit.Contain}
          alignment={Alignment.Center}
          layoutScaleFactor={-1.0}
          style={styles.animation}
          ref={setRiveRef}
          autoplay={true}
          dataBinding={AutoBind(true)}
          onError={(e) => console.error('[MonthlySummary] Rive error:', e)}
        />

        <View style={[styles.controls, isDarkMode && styles.controlsDark]}>
          {/* Tab */}
          <Label dark={isDarkMode}>Active Tab</Label>
          <Row>
            {(['Tab 0', 'Tab 1', 'Tab 2'] as const).map((label, i) => (
              <Chip
                key={i}
                active={activeTab === i}
                dark={isDarkMode}
                onPress={() => setActiveTab(i)}
              >
                {label}
              </Chip>
            ))}
          </Row>

          {/* Month count */}
          <Label dark={isDarkMode}>Months shown: {monthCount}</Label>
          <Row>
            {([1, 3, 6, 9, 12] as const).map((n) => (
              <Chip
                key={n}
                active={monthCount === n}
                dark={isDarkMode}
                onPress={() => setMonthCount(n)}
              >
                {String(n)}
              </Chip>
            ))}
          </Row>

          {/* Legend count */}
          <Label dark={isDarkMode}>Legend segments: {legendCount}</Label>
          <Row>
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <Chip
                key={n}
                active={legendCount === n}
                dark={isDarkMode}
                onPress={() => setLegendCount(n)}
              >
                {String(n)}
              </Chip>
            ))}
          </Row>

          {/* Bar tap feedback */}
          <Label dark={isDarkMode}>Bar Tapped</Label>
          <Text style={[styles.tapStatus, isDarkMode && styles.tapStatusDark]}>
            {lastBarTapped ?? '—'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Small UI helpers to reduce repetition ---
function Label({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <Text style={[styles.label, dark && styles.labelDark]}>{children}</Text>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

function Chip({
  children,
  active,
  dark,
  onPress,
}: {
  children: string;
  active: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive, dark && active && styles.chipActiveDark]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F5F5' },
  safeAreaDark: { backgroundColor: '#1A1A1A' },
  container: { flexGrow: 1, paddingBottom: 40 },
  animation: { width: '100%', minHeight: 420 },
  controls: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  controlsDark: { backgroundColor: '#2C2C2C' },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 16,
  },
  labelDark: { color: '#AAAAAA' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: '#0066CC',
  },
  chipActiveDark: {
    backgroundColor: '#1A6FC4',
  },
  chipText: { fontSize: 13, fontWeight: '500', color: '#555' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  tapStatus: { fontSize: 14, color: '#333', marginTop: 4 },
  tapStatusDark: { color: '#CCC' },
});
