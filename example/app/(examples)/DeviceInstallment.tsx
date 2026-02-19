import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import Rive, {
  Fit,
  Alignment,
  AutoBind,
  useRive,
  useRiveTrigger,
} from 'rive-react-native';

const TOTAL_MONTHS = 36;
const DOT_COUNT = 5;

const BRAND_BLUE = { r: 0, g: 102, b: 204, a: 255 };
const DOT_GRAY = { r: 208, g: 208, b: 208, a: 255 };

type ScenarioType = 1 | 2 | 3;

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  1: 'Standard',
  2: 'Next Up',
  3: 'Next Up Anytime',
};

function getMilestone2Month(scenarioType: ScenarioType): number {
  if (scenarioType === 2) return 18;
  if (scenarioType === 3) return 12;
  return 0;
}

function isDotFilled(
  dotIndex: number,
  startMonth: number,
  endMonth: number,
  currentMonth: number
): boolean {
  const span = endMonth - startMonth;
  const threshold = startMonth + (span / DOT_COUNT) * dotIndex;
  return currentMonth >= Math.round(threshold);
}

export default function DeviceInstallment() {
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  /**
   * 🔀 EASY TOGGLE: Remote URL vs Local File
   *
   * Change `USE_REMOTE` to switch between sources:
   * - true  = Load from URL (with cache busting)
   * - false = Load local bundled file
   */
  const USE_REMOTE = false;

  const remoteUrl =
    'https://att.com/scmsassets/mobile_apps/motion/rive_featureTest.riv';
  const localResourceName = 'services_installments';

  const [cacheKey] = useState(Date.now());
  const [scenarioType, setScenarioType] = useState<ScenarioType>(2);
  const [currentMonth, setCurrentMonth] = useState(10);

  const milestone2Month = getMilestone2Month(scenarioType);
  const milestone2Visible = scenarioType !== 1;

  const m1Active = true;
  const m2Active = milestone2Visible && currentMonth >= milestone2Month;
  const m3Active = currentMonth >= TOTAL_MONTHS;

  const [setRiveRef, riveRef] = useRive();

  useEffect(() => {
    if (!riveRef) return;

    try {
      // Scenario & progress
      riveRef.setNumber('scenarioType', scenarioType);
      riveRef.setNumber('currentMonth', currentMonth);
      riveRef.setNumber('totalMonths', TOTAL_MONTHS);
      riveRef.setNumber('milestone2Month', milestone2Month);
      riveRef.setBoolean('milestone2Visible', !milestone2Visible);

      // Layout & theme
      riveRef.setNumber('scalePercent', 100);
      riveRef.setBoolean('isDarkMode', isDarkMode);

      // Milestone active states
      riveRef.setBoolean('milestone1Active', m1Active);
      riveRef.setBoolean('milestone2Active', m2Active);
      riveRef.setBoolean('milestone3Active', m3Active);

      // Milestone 1 content
      const m1HideLink = scenarioType !== 3;
      riveRef.setString('milestone1Subtitle', '1 Month');
      riveRef.setString(
        'milestone1Description',
        'First installment on Sep 24, 2025'
      );
      riveRef.setBoolean('milestone1HideLink', m1HideLink);
      riveRef.setString(
        'milestone1LinkLabel',
        m1HideLink ? '' : 'Pay ($800.16) to own'
      );

      // Milestone 2 content — only relevant for Next Up / Next Up Anytime
      if (milestone2Visible) {
        const m2Subtitle = scenarioType === 2 ? '18 Months' : '12 Months';
        const m2Description =
          scenarioType === 2
            ? 'Early upgrade & deals unlocked'
            : 'Anytime upgrade unlocked';
        riveRef.setString('milestone2Subtitle', m2Subtitle);
        riveRef.setString('milestone2Description', m2Description);
        riveRef.setString('milestone2LinkLabel', 'Pay ($400.08) to upgrade');
        riveRef.setBoolean('milestone2HideLink', false);
      }

      // Milestone 3 content
      riveRef.setString('milestone3Subtitle', '36 Months');
      riveRef.setString('milestone3Description', "Your phone's all yours!");
      riveRef.setString('milestone3LinkLabel', 'Pay ($800.16) to own');
      riveRef.setBoolean('milestone3HideLink', false);

      // Connector 1 dots — spans M1 → M2 (or M3 for Standard)
      const c1End = milestone2Visible ? milestone2Month : TOTAL_MONTHS;
      for (let i = 1; i <= DOT_COUNT; i++) {
        const filled = isDotFilled(i, 1, c1End, currentMonth);
        riveRef.setBoolean(`connector1Dot${i}/hideDot`, false);
        riveRef.setBoolean(`connector1Dot${i}/isFilled`, filled);
        riveRef.setColor(`connector1Dot${i}/fillColor`, filled ? BRAND_BLUE : DOT_GRAY);
      }

      // Connector 2 dots — spans M2 → M3 (hidden for Standard)
      for (let i = 1; i <= DOT_COUNT; i++) {
        if (milestone2Visible) {
          const filled = isDotFilled(i, milestone2Month, TOTAL_MONTHS, currentMonth);
          riveRef.setBoolean(`connector2Dot${i}/hideDot`, false);
          riveRef.setBoolean(`connector2Dot${i}/isFilled`, filled);
          riveRef.setColor(`connector2Dot${i}/fillColor`, filled ? BRAND_BLUE : DOT_GRAY);
        } else {
          riveRef.setBoolean(`connector2Dot${i}/hideDot`, true);
          riveRef.setBoolean(`connector2Dot${i}/isFilled`, false);
          riveRef.setColor(`connector2Dot${i}/fillColor`, DOT_GRAY);
        }
      }
    } catch (e: any) {
      console.error('[DeviceInstallment] Error applying Rive bindings:', e);
    }
  }, [
    riveRef,
    scenarioType,
    currentMonth,
    isDarkMode,
    milestone2Month,
    milestone2Visible,
    m1Active,
    m2Active,
    m3Active,
  ]);

  // VM Trigger listeners — fired by Rive Listeners on link tap areas
  useRiveTrigger(riveRef, 'milestone1LinkTapped', () => {
    Alert.alert('Milestone Link Tapped', 'Navigate to: /installments/milestone-1');
  });
  useRiveTrigger(riveRef, 'milestone2LinkTapped', () => {
    Alert.alert('Milestone Link Tapped', 'Navigate to: /installments/milestone-2');
  });
  useRiveTrigger(riveRef, 'milestone3LinkTapped', () => {
    Alert.alert('Milestone Link Tapped', 'Navigate to: /installments/milestone-3');
  });

  const handleScenarioChange = (type: ScenarioType) => {
    setScenarioType(type);
    setCurrentMonth(0);
  };

  const handleMonthStep = (delta: number) => {
    setCurrentMonth((m) => Math.max(0, Math.min(TOTAL_MONTHS, m + delta)));
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, isDarkMode && styles.safeAreaDark]}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          {...(USE_REMOTE
            ? { url: `${remoteUrl}?t=${cacheKey}` }
            : { resourceName: localResourceName })}
          fit={Fit.Layout}
          alignment={Alignment.Center}
          style={styles.animation}
          ref={setRiveRef}
          artboardName="DeviceInstallments"
          stateMachineName="MilestoneStates"
          autoplay={true}
          dataBinding={AutoBind(true)}
          onError={(e) => console.error('Rive error:', e)}
        />

        <View style={[styles.controls, isDarkMode && styles.controlsDark]}>
          {/* Scenario Picker */}
          <Text
            style={[styles.controlLabel, isDarkMode && styles.controlLabelDark]}
          >
            Scenario
          </Text>
          <View
            style={[
              styles.segmentRow,
              isDarkMode && styles.segmentRowDark,
            ]}
          >
            {([1, 2, 3] as ScenarioType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.segmentButton,
                  scenarioType === type && styles.segmentButtonActive,
                  isDarkMode &&
                    scenarioType === type &&
                    styles.segmentButtonActiveDark,
                ]}
                onPress={() => handleScenarioChange(type)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    scenarioType === type && styles.segmentTextActive,
                  ]}
                >
                  {SCENARIO_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Month Progress */}
          <Text
            style={[styles.controlLabel, isDarkMode && styles.controlLabelDark]}
          >
            Month: {currentMonth} / {TOTAL_MONTHS}
          </Text>
          <View
            style={[
              styles.progressTrack,
              isDarkMode && styles.progressTrackDark,
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${(currentMonth / TOTAL_MONTHS) * 100}%` },
              ]}
            />
          </View>

          {/* Month stepper buttons */}
          <View style={styles.stepperRow}>
            {(
              [
                { label: '−1', delta: -1 },
                { label: '+1', delta: 1 },
                { label: '−6', delta: -6 },
                { label: '+6', delta: 6 },
              ] as { label: string; delta: number }[]
            ).map(({ label, delta }) => (
              <TouchableOpacity
                key={label}
                style={styles.stepperBtn}
                onPress={() => handleMonthStep(delta)}
              >
                <Text style={styles.stepperBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.stepperBtn, styles.stepperBtnReset]}
              onPress={() => setCurrentMonth(0)}
            >
              <Text style={styles.stepperBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Milestone status indicators */}
          <Text
            style={[
              styles.controlLabel,
              isDarkMode && styles.controlLabelDark,
            ]}
          >
            Milestone Status
          </Text>
          <View style={styles.milestoneStatusRow}>
            {[
              { label: 'M1: Start', active: m1Active, visible: true },
              {
                label: `M2: Mo. ${milestone2Month}`,
                active: m2Active,
                visible: milestone2Visible,
              },
              { label: 'M3: Mo. 36', active: m3Active, visible: true },
            ]
              .filter((m) => m.visible)
              .map(({ label, active }) => (
                <View key={label} style={styles.milestoneStatusItem}>
                  <View
                    style={[
                      styles.milestoneStatusDot,
                      active && styles.milestoneStatusDotActive,
                    ]}
                  />
                  <Text
                    style={[
                      styles.milestoneStatusLabel,
                      isDarkMode && styles.controlLabelDark,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeAreaDark: {
    backgroundColor: '#1A1A1A',
  },
  container: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  animation: {
    width: '100%',
    minHeight: 480,
  },
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
  controlsDark: {
    backgroundColor: '#2C2C2C',
  },
  controlLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 16,
  },
  controlLabelDark: {
    color: '#AAAAAA',
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  segmentRowDark: {
    backgroundColor: '#3A3A3A',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentButtonActiveDark: {
    backgroundColor: '#4A4A4A',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  segmentTextActive: {
    color: '#0066CC',
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressTrackDark: {
    backgroundColor: '#444',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066CC',
    borderRadius: 3,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  stepperBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#0066CC',
    borderRadius: 8,
    minWidth: 52,
    alignItems: 'center',
  },
  stepperBtnReset: {
    backgroundColor: '#9E9E9E',
  },
  stepperBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  milestoneStatusRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  milestoneStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  milestoneStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D0D0D0',
  },
  milestoneStatusDotActive: {
    backgroundColor: '#0066CC',
  },
  milestoneStatusLabel: {
    fontSize: 13,
    color: '#555',
  },
});
