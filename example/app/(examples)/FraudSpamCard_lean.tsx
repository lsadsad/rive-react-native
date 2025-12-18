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

export default function FraudSpamCard_lean() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  
  // Timing configuration
  const CALLS_VALUE_DELAY = 350; // Delay for setting calls values (ms)
  
  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for FraudSpamCard_VM model
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [scalePercent, setScalePercent] = useRiveNumber(riveRef, 'scalePercent'); // Accessible mode scale (100-200, default 100)
  const [callsBlockedValue, setCallsBlockedValue] = useRiveNumber(riveRef, 'callsBlockedValue');
  const [callsAnalyzedValue, setCallsAnalyzedValue] = useRiveNumber(riveRef, 'callsAnalyzedValue');
  const [callsDayValue, setCallsDayValue] = useRiveNumber(riveRef, 'callsDayValue');

  // Set initial configuration once Rive is ready
  useEffect(() => {
    if (riveRef) {
      console.log('Initial setup - Setting Rive inputs');

      // Control Boolean inputs
      setIsDarkModeRive(isDarkMode);
      setScalePercent(100); // Default scale percent (100-200 for accessible mode)

      // Set view model inputs with a delay
      setTimeout(() => {
        setCallsBlockedValue(18);
        setCallsAnalyzedValue(215);
        setCallsDayValue(7);
      }, CALLS_VALUE_DELAY);

      // Set text runs directly on the reference
      riveRef.setTextRunValue('LabelTitle', 'Fraud & spam');
      riveRef.setTextRunValue('LabelDateRange', 'Last 30 days');
      riveRef.setTextRunValue('LabelBlocked', 'calls blocked');
      riveRef.setTextRunValue('LabelAnalyzed', 'calls analyzed');
    }
  }, [
    riveRef,
    setIsDarkModeRive,
    isDarkMode,
    setScalePercent,
    setCallsBlockedValue,
    setCallsAnalyzedValue,
    setCallsDayValue,
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
          url="https://att.com/scmsassets/mobile_apps/motion/security_fraudspam.riv"
          fit={Fit.Contain}
          layoutScaleFactor={-1.0} // Auto-scale based on device pixel ratio
          style={styles.animation}
          ref={setRiveRef}
          artboardName="FraudSpamCard_lean"
          stateMachineName="FraudSpamCard_lean_SM"
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
    width: '100%',
    maxWidth: 344,
    alignSelf: 'center',
    // Drop shadow properties
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
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
