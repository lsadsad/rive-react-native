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

export default function TrialCountdown() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode] = useState(systemColorScheme === 'dark');

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
     
      // Control Boolean inputs
      setSkipIntro(false);
      setIsDarkModeRive(isDarkMode);

      // Control Number inputs
      setDaysRemaining(5); 
      setDaysTotal(30);
      
      // Control Text runs directly on the reference
      riveRef.setTextRunValue('LabelText', 'Trial days left'); 
      riveRef.setTextRunValue('CompleteText', 'Trial Complete'); 

      // riveRef.play();
    }
  }, [riveRef, setSkipIntro, setIsDarkModeRive, isDarkMode, setDaysRemaining, setDaysTotal]);

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          resourceName="tryatt_trialcountdown11"
          fit={Fit.Contain}
          style={styles.animation}
          ref={setRiveRef}
          stateMachineName="CountdownController"
          autoplay={true}
          artboardName="COMP-TrialCountdown"
          dataBinding={AutoBind(true)}
          onStateChanged={(stateMachineName, stateName) => {
            console.log(
              'State changed:',
              'Machine:',
              stateMachineName,
              'State:',
              stateName
            );
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
    width: 368,
    height: 368,
    alignSelf: 'center',
  },
});
