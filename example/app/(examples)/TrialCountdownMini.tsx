import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import Rive, {
  Fit,
  AutoBind,
  useRiveNumber,
  useRive,
  useRiveBoolean,
} from 'rive-react-native';

export default function TrialCountdownMini() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');
  
  /**
   * 🔀 EASY TOGGLE: Remote URL vs Local File
   * 
   * Change `USE_REMOTE` to switch between sources:
   * - true  = Load from URL (with cache busting)
   * - false = Load local bundled file
   */
  const USE_REMOTE = true;
  
  // Configuration for each source
  const remoteUrl = 'https://att.com/scmsassets/mobile_apps/motion/tryatt_trialcountdown-mini5.riv';
  const localResourceName = 'tryatt_trialcountdown_mini'; // Your local .riv filename (without extension)
  
  // Cache busting for remote URLs (only used when USE_REMOTE is true)
  const [cacheKey, setCacheKey] = useState(Date.now());
  
  useEffect(() => {
    if (USE_REMOTE) {
      setCacheKey(Date.now());
    }
  }, [remoteUrl]);
  
  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for CountdownDisplay model
  const [daysRemaining, setDaysRemaining] = useRiveNumber(riveRef, 'daysRemaining');
  const [daysTotal, setDaysTotal] = useRiveNumber(riveRef, 'daysTotal');
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [skipIntro, setSkipIntro] = useRiveBoolean(riveRef, 'skipIntro');

  // Log when Rive values change
  useEffect(() => {
    console.log('Rive values changed:', {
      daysRemaining,
      daysTotal,
      isDarkModeRive,
      skipIntro,
    });
  }, [daysRemaining, daysTotal, isDarkModeRive, skipIntro]);

  // Set initial configuration and sync state once Rive is ready
  useEffect(() => {
    if (riveRef) {
      console.log('Initial setup - Setting Rive inputs');
      
      // NOTE: Rive inputs often need a brief delay after mounting 
      // or a specific order to ensure the state machine picks them up 
      // before the first frame renders the transition.
      
      // Control Boolean inputs
      setSkipIntro(false);
      setIsDarkModeRive(isDarkMode);

      // Control Number inputs
      setDaysRemaining(4); 
      setDaysTotal(30);      
    }
  }, [riveRef, setSkipIntro, setIsDarkModeRive, isDarkMode, setDaysRemaining, setDaysTotal]);

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
          stateMachineName="CountdownController"
          autoplay={true}
          artboardName="COMP-TrialCountdown-mini"
          dataBinding={AutoBind(true)}
          onError={(event) => {
            console.error('❌ Rive Error:', JSON.stringify(event.nativeEvent));
          }}
          onStateChanged={(stateMachineName, stateName) => {
            console.log('State changed:', 'Machine:', stateMachineName, 'State:', stateName);
          }}
        />
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
    width: 112,
    height: 112,
    alignSelf: 'center',
  },
});

