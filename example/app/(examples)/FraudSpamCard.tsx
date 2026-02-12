import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
  Text,
} from 'react-native';
import Rive, {
  Fit,
  AutoBind,
  useRiveNumber,
  useRive,
  useRiveBoolean,
} from 'rive-react-native';

export default function FraudSpamCard() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  
  // Timing configuration
  const CALLS_VALUE_DELAY = 350; // Delay for setting calls values (ms)
  const CHART_CASCADE_DELAY = 20; // Delay between each chart value (ms)
  
  /**
   * 🔀 EASY TOGGLE: Remote URL vs Local File
   * 
   * Change `USE_REMOTE` to switch between sources:
   * - true  = Load from URL (with cache busting)
   * - false = Load local bundled file
   */
  const USE_REMOTE = true;
  
  // Configuration for each source
  const remoteUrl = 'https://att.com/scmsassets/mobile_apps/motion/security_fraudspam.riv';
  const localResourceName = 'security_fraudspam'; // Your local .riv filename (without extension)
  
  // Cache busting for remote URLs (only used when USE_REMOTE is true)
  const [cacheKey, setCacheKey] = useState(Date.now());
  
  useEffect(() => {
    if (USE_REMOTE) {
      setCacheKey(Date.now());
    }
  }, [remoteUrl]);
  
  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for FraudSpamCard_VM model
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [scalePercent, setScalePercent] = useRiveNumber(riveRef, 'scalePercent'); // Accessible mode scale (100-200, default 100)
  const [callsBlockedValue, setCallsBlockedValue] = useRiveNumber(riveRef, 'callsBlockedValue');
  const [callsAnalyzedValue, setCallsAnalyzedValue] = useRiveNumber(riveRef, 'callsAnalyzedValue');
  const [callsDayValue, setCallsDayValue] = useRiveNumber(riveRef, 'callsDayValue');
  const [averageBlocked, setAverageBlocked] = useRiveNumber(riveRef, 'averageBlocked');

  // Day values (day_00 through day_29)
  const [day00, setDay00] = useRiveNumber(riveRef, 'day_00');
  const [day01, setDay01] = useRiveNumber(riveRef, 'day_01');
  const [day02, setDay02] = useRiveNumber(riveRef, 'day_02');
  const [day03, setDay03] = useRiveNumber(riveRef, 'day_03');
  const [day04, setDay04] = useRiveNumber(riveRef, 'day_04');
  const [day05, setDay05] = useRiveNumber(riveRef, 'day_05');
  const [day06, setDay06] = useRiveNumber(riveRef, 'day_06');
  const [day07, setDay07] = useRiveNumber(riveRef, 'day_07');
  const [day08, setDay08] = useRiveNumber(riveRef, 'day_08');
  const [day09, setDay09] = useRiveNumber(riveRef, 'day_09');
  const [day10, setDay10] = useRiveNumber(riveRef, 'day_10');
  const [day11, setDay11] = useRiveNumber(riveRef, 'day_11');
  const [day12, setDay12] = useRiveNumber(riveRef, 'day_12');
  const [day13, setDay13] = useRiveNumber(riveRef, 'day_13');
  const [day14, setDay14] = useRiveNumber(riveRef, 'day_14');
  const [day15, setDay15] = useRiveNumber(riveRef, 'day_15');
  const [day16, setDay16] = useRiveNumber(riveRef, 'day_16');
  const [day17, setDay17] = useRiveNumber(riveRef, 'day_17');
  const [day18, setDay18] = useRiveNumber(riveRef, 'day_18');
  const [day19, setDay19] = useRiveNumber(riveRef, 'day_19');
  const [day20, setDay20] = useRiveNumber(riveRef, 'day_20');
  const [day21, setDay21] = useRiveNumber(riveRef, 'day_21');
  const [day22, setDay22] = useRiveNumber(riveRef, 'day_22');
  const [day23, setDay23] = useRiveNumber(riveRef, 'day_23');
  const [day24, setDay24] = useRiveNumber(riveRef, 'day_24');
  const [day25, setDay25] = useRiveNumber(riveRef, 'day_25');
  const [day26, setDay26] = useRiveNumber(riveRef, 'day_26');
  const [day27, setDay27] = useRiveNumber(riveRef, 'day_27');
  const [day28, setDay28] = useRiveNumber(riveRef, 'day_28');
  const [day29, setDay29] = useRiveNumber(riveRef, 'day_29');

  // Set initial configuration once Rive is ready
  useEffect(() => {
    if (riveRef) {
      console.log('Initial setup - Setting Rive inputs');

      // Control Boolean inputs
      setIsDarkModeRive(isDarkMode);
      setScalePercent(100); // Accessible mode scale (100-200)

      // Set chart data (random values for demonstration)
      const chartData = [
        1, 1, 1, 2, 1, 1, 1, 0, 0, 0,
        0, 1, 0, 0, 1, 0, 0, 0, 1, 0,
        2, 0, 2, 0, 0, 1, 0, 0, 2, 0,
      ];

      // Normalize the 30-day bars so the highest day becomes 100%.
      // Include `averageBlocked` in the same scale so the average indicator aligns with the bars.
      const rawAverageBlocked =
        chartData.reduce((sum, v) => sum + v, 0) / chartData.length;
      const normalizationMax = Math.max(...chartData, rawAverageBlocked, 0);
      const normalizedChartData =
        normalizationMax > 0
          ? chartData.map((v) => (v / normalizationMax) * 100)
          : chartData.map(() => 0);
      const normalizedAverageBlocked =
        normalizationMax > 0 ? (rawAverageBlocked / normalizationMax) * 100 : 0;

      // Set view model inputs with a delay
      setTimeout(() => {
        setCallsBlockedValue(18);
        setCallsAnalyzedValue(215);
        setCallsDayValue(0.6);
        setAverageBlocked(normalizedAverageBlocked);
      }, CALLS_VALUE_DELAY);

      // Animate chart data with a cascade (10ms per value)
      const daySetters = [
        setDay00, setDay01, setDay02, setDay03, setDay04, setDay05, setDay06, setDay07, setDay08, setDay09,
        setDay10, setDay11, setDay12, setDay13, setDay14, setDay15, setDay16, setDay17, setDay18, setDay19,
        setDay20, setDay21, setDay22, setDay23, setDay24, setDay25, setDay26, setDay27, setDay28, setDay29,
      ];

      daySetters.forEach((setter, index) => {
        setTimeout(() => {
          setter(normalizedChartData[index]);
        }, index * CHART_CASCADE_DELAY);
      });

      // Set text runs directly on the reference
      riveRef.setTextRunValue('LabelTitle', 'Fraud & spam');
      riveRef.setTextRunValue('LabelDateRange', 'Last 30 days');
      riveRef.setTextRunValue('LabelBlocked', 'calls blocked');
      riveRef.setTextRunValue('LabelAnalyzed', 'calls analyzed');
      riveRef.setTextRunValue('LabelAverageBlocked', 'Average blocked');
      riveRef.setTextRunValue('LabelCallsDay', 'calls / day');
      riveRef.setTextRunValue('LabelStartDate', 'Jul 23');
      riveRef.setTextRunValue('LabelEndDate', 'Aug 22');
    }
  }, [
    riveRef,
    setIsDarkModeRive,
    isDarkMode,
    setScalePercent,
    setCallsBlockedValue,
    setCallsAnalyzedValue,
    setCallsDayValue,
    setAverageBlocked,
    setDay00, setDay01, setDay02, setDay03, setDay04, setDay05, setDay06, setDay07, setDay08, setDay09,
    setDay10, setDay11, setDay12, setDay13, setDay14, setDay15, setDay16, setDay17, setDay18, setDay19,
    setDay20, setDay21, setDay22, setDay23, setDay24, setDay25, setDay26, setDay27, setDay28, setDay29,
  ]);

  const handleReset = () => {
    if (riveRef) {
      console.log('Resetting animation');
      riveRef.reset();
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          {...(USE_REMOTE 
            ? { url: `${remoteUrl}?t=${cacheKey}` }
            : { resourceName: localResourceName }
          )}
          fit={Fit.Contain}
          style={styles.animation}
          ref={setRiveRef}
          artboardName="FraudSpamCard"
          stateMachineName="FraudSpamCard_SM"
          autoplay={true}
          dataBinding={AutoBind(true)}
          onError={(riveError) => {
            console.log(riveError);
          }}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            disabled={!riveRef}
          >
            <Text style={styles.buttonText}>Reset Animation</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    // Make the animation responsive: fill available width up to 344px, and center it within the parent.
    alignSelf: 'center',
    width: '100%', 
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#9b59b6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
