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
 * FraudSpamCard_lean Component (New Runtime Optimized - Version 2)
 * 
 * This is a simplified version of FraudSpamCard without the chart animation.
 * Optimizations include:
 * - Memoized callbacks to prevent unnecessary re-renders
 * - Proper error handling with RNRiveError
 * - Optimized useEffect dependencies
 * - Cleaner code structure with fewer hooks
 * - Better performance with reduced complexity
 * 
 * Compatible with:
 * - iOS Runtime: 6.12.1+ (RiveRuntime)
 * - Android Runtime: 10.5.1+ (rive-android)
 */
export default function FraudSpamCard_lean_v2() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  
  // Timing configuration - memoized to prevent re-creation
  const CALLS_VALUE_DELAY = useMemo(() => 350, []); // Delay for setting calls values (ms)
  
  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for FraudSpamCard_lean_VM model
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [scalePercent, setScalePercent] = useRiveNumber(riveRef, 'scalePercent');
  const [callsBlockedValue, setCallsBlockedValue] = useRiveNumber(riveRef, 'callsBlockedValue');
  const [callsAnalyzedValue, setCallsAnalyzedValue] = useRiveNumber(riveRef, 'callsAnalyzedValue');
  const [callsDayValue, setCallsDayValue] = useRiveNumber(riveRef, 'callsDayValue');

  // Memoized callback for setting text runs
  const setTextRuns = useCallback(() => {
    if (!riveRef) return;
    
    const textRuns = {
      'LabelTitle': 'Fraud & spam',
      'LabelDateRange': 'Last 30 days',
      'LabelBlocked': 'calls blocked',
      'LabelAnalyzed': 'calls analyzed',
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

    console.log('Initial setup - Setting Rive inputs (lean v2)');

    // Set control inputs
    setIsDarkModeRive?.(isDarkMode);
    setScalePercent?.(100); // Default scale percent (100-200 for accessible mode)

    // Set call statistics with delay for animation effect
    const callsTimeout = setTimeout(() => {
      setCallsBlockedValue?.(18);
      setCallsAnalyzedValue?.(215);
      setCallsDayValue?.(7);
    }, CALLS_VALUE_DELAY);

    // Set text runs
    setTextRuns();

    // Cleanup timeout on unmount
    return () => {
      clearTimeout(callsTimeout);
    };
  }, [
    riveRef,
    isDarkMode,
    setIsDarkModeRive,
    setScalePercent,
    setCallsBlockedValue,
    setCallsAnalyzedValue,
    setCallsDayValue,
    setTextRuns,
    CALLS_VALUE_DELAY,
  ]);

  // Memoized reset handler
  const handleReset = useCallback(() => {
    if (riveRef) {
      console.log('Resetting animation (lean v2)');
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
          artboardName="FraudSpamCard_lean"
          stateMachineName="FraudSpamCard_lean_SM"
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
