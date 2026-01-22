import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
  RNRiveError,
  RNRiveErrorType,
} from 'rive-react-native';

/**
 * FraudSpamCard Component (New Runtime Optimized - Version 2)
 * 
 * This component demonstrates the Rive React Native data binding API with the latest runtime.
 * Optimizations include:
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Memoized chart data calculation
 * - Proper error handling with RNRiveError
 * - Optimized useEffect dependencies
 * - Better performance with cascade animations
 * 
 * Compatible with:
 * - iOS Runtime: 6.12.1+ (RiveRuntime)
 * - Android Runtime: 10.5.1+ (rive-android)
 */
export default function FraudSpamCard_v2() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  
  // Timing configuration - memoized to prevent re-creation
  const TIMING_CONFIG = useMemo(() => ({
    CALLS_VALUE_DELAY: 350, // Delay for setting calls values (ms)
    CHART_CASCADE_DELAY: 20, // Delay between each chart value (ms)
  }), []);
  
  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for FraudSpamCard_VM model
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [scalePercent, setScalePercent] = useRiveNumber(riveRef, 'scalePercent');
  const [callsBlockedValue, setCallsBlockedValue] = useRiveNumber(riveRef, 'callsBlockedValue');
  const [callsAnalyzedValue, setCallsAnalyzedValue] = useRiveNumber(riveRef, 'callsAnalyzedValue');
  const [callsDayValue, setCallsDayValue] = useRiveNumber(riveRef, 'callsDayValue');
  const [averageBlocked, setAverageBlocked] = useRiveNumber(riveRef, 'averageBlocked');

  // Day values (day_00 through day_29) - using array for cleaner code
  const dayHooks = [
    useRiveNumber(riveRef, 'day_00'),
    useRiveNumber(riveRef, 'day_01'),
    useRiveNumber(riveRef, 'day_02'),
    useRiveNumber(riveRef, 'day_03'),
    useRiveNumber(riveRef, 'day_04'),
    useRiveNumber(riveRef, 'day_05'),
    useRiveNumber(riveRef, 'day_06'),
    useRiveNumber(riveRef, 'day_07'),
    useRiveNumber(riveRef, 'day_08'),
    useRiveNumber(riveRef, 'day_09'),
    useRiveNumber(riveRef, 'day_10'),
    useRiveNumber(riveRef, 'day_11'),
    useRiveNumber(riveRef, 'day_12'),
    useRiveNumber(riveRef, 'day_13'),
    useRiveNumber(riveRef, 'day_14'),
    useRiveNumber(riveRef, 'day_15'),
    useRiveNumber(riveRef, 'day_16'),
    useRiveNumber(riveRef, 'day_17'),
    useRiveNumber(riveRef, 'day_18'),
    useRiveNumber(riveRef, 'day_19'),
    useRiveNumber(riveRef, 'day_20'),
    useRiveNumber(riveRef, 'day_21'),
    useRiveNumber(riveRef, 'day_22'),
    useRiveNumber(riveRef, 'day_23'),
    useRiveNumber(riveRef, 'day_24'),
    useRiveNumber(riveRef, 'day_25'),
    useRiveNumber(riveRef, 'day_26'),
    useRiveNumber(riveRef, 'day_27'),
    useRiveNumber(riveRef, 'day_28'),
    useRiveNumber(riveRef, 'day_29'),
  ];

  // Memoized chart data calculation
  const chartDataConfig = useMemo(() => {
    const rawData = [
      1, 1, 1, 2, 1, 1, 1, 0, 0, 0,
      0, 1, 0, 0, 1, 0, 0, 0, 1, 0,
      2, 0, 2, 0, 0, 1, 0, 0, 2, 0,
    ];

    // Normalize the 30-day bars so the highest day becomes 100%
    const rawAverageBlocked = rawData.reduce((sum, v) => sum + v, 0) / rawData.length;
    const normalizationMax = Math.max(...rawData, rawAverageBlocked, 0);
    
    const normalizedChartData = normalizationMax > 0
      ? rawData.map((v) => (v / normalizationMax) * 100)
      : rawData.map(() => 0);
    
    const normalizedAverageBlocked = normalizationMax > 0 
      ? (rawAverageBlocked / normalizationMax) * 100 
      : 0;

    return {
      normalizedChartData,
      normalizedAverageBlocked,
    };
  }, []);

  // Memoized callback for setting text runs
  const setTextRuns = useCallback(() => {
    if (!riveRef) return;
    
    const textRuns = {
      'LabelTitle': 'Fraud & spam',
      'LabelDateRange': 'Last 30 days',
      'LabelBlocked': 'calls blocked',
      'LabelAnalyzed': 'calls analyzed',
      'LabelAverageBlocked': 'Average blocked',
      'LabelCallsDay': 'calls / day',
      'LabelStartDate': 'Jul 23',
      'LabelEndDate': 'Aug 22',
    };

    Object.entries(textRuns).forEach(([key, value]) => {
      try {
        riveRef.setTextRunValue(key, value);
      } catch (error) {
        console.warn(`Failed to set text run "${key}":`, error);
      }
    });
  }, [riveRef]);

  // Set initial configuration once Rive is ready
  useEffect(() => {
    if (!riveRef) return;

    console.log('Initial setup - Setting Rive inputs (v2)');

    // Set control inputs
    setIsDarkModeRive?.(isDarkMode);
    setScalePercent?.(100); // Default scale percent (100-200 for accessible mode)

    // Set call statistics with delay for animation effect
    const callsTimeout = setTimeout(() => {
      setCallsBlockedValue?.(18);
      setCallsAnalyzedValue?.(215);
      setCallsDayValue?.(0.6);
      setAverageBlocked?.(chartDataConfig.normalizedAverageBlocked);
    }, TIMING_CONFIG.CALLS_VALUE_DELAY);

    // Animate chart data with cascade effect
    const chartTimeouts: NodeJS.Timeout[] = [];
    dayHooks.forEach(([_, setter], index) => {
      const timeout = setTimeout(() => {
        setter?.(chartDataConfig.normalizedChartData[index]);
      }, index * TIMING_CONFIG.CHART_CASCADE_DELAY);
      chartTimeouts.push(timeout);
    });

    // Set text runs
    setTextRuns();

    // Cleanup timeouts on unmount
    return () => {
      clearTimeout(callsTimeout);
      chartTimeouts.forEach(clearTimeout);
    };
  }, [
    riveRef,
    isDarkMode,
    setIsDarkModeRive,
    setScalePercent,
    setCallsBlockedValue,
    setCallsAnalyzedValue,
    setCallsDayValue,
    setAverageBlocked,
    chartDataConfig,
    setTextRuns,
    TIMING_CONFIG,
    dayHooks,
  ]);

  // Memoized reset handler
  const handleReset = useCallback(() => {
    if (riveRef) {
      console.log('Resetting animation (v2)');
      riveRef.reset();
    }
  }, [riveRef]);

  // Memoized error handler
  const handleError = useCallback((riveError: RNRiveError) => {
    switch (riveError.type) {
      case RNRiveErrorType.DataBindingError:
        console.error(`Data Binding Error: ${riveError.message}`);
        break;
      case RNRiveErrorType.TextRunNotFoundError:
        console.error(`Text Run Not Found: ${riveError.message}`);
        break;
      case RNRiveErrorType.FileLoadError:
        console.error(`File Load Error: ${riveError.message}`);
        break;
      default:
        console.error(`Rive Error: ${riveError.message}`);
    }
  }, []);

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          url="https://att.com/scmsassets/mobile_apps/motion/rive_featuretest.riv"
          fit={Fit.Contain}
          style={styles.animation}
          ref={setRiveRef}
          artboardName="FraudSpamCard"
          stateMachineName="FraudSpamCard_SM"
          autoplay={true}
          dataBinding={AutoBind(true)}
          onError={handleError}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.resetButton, !riveRef && styles.resetButtonDisabled]}
            onPress={handleReset}
            disabled={!riveRef}
            activeOpacity={0.7}
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
    paddingVertical: 20,
  },
  animation: {
    alignSelf: 'center',
    width: '100%',
    height: 'auto',
    paddingHorizontal: 24,
    paddingVertical: 24,
    // Drop shadow properties (iOS)
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    // Android shadow
    elevation: 4,
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
  resetButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
