import { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  useColorScheme,
} from 'react-native';
import { Button, Switch } from 'react-native-paper';
import Rive, {
  Fit,
  AutoBind,
  useRiveString,
  useRiveNumber,
  useRive,
  useRiveBoolean,
} from 'rive-react-native';

export default function TrialCountdown() {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');
  const [localDaysRemaining, setLocalDaysRemaining] = useState(1);
  const [localDaysTotal, setLocalDaysTotal] = useState(30);

  // Rive setup
  const [setRiveRef, riveRef] = useRive();

  // Rive AutoBind hooks for CountdownDisplay model
  const [trialText, setTrialText] = useRiveString(riveRef, 'trialText');
  const [trialComplete, setTrialComplete] = useRiveString(riveRef, 'trialComplete');
  const [daysRemaining, setDaysRemaining] = useRiveNumber(riveRef, 'daysRemaining');
  const [daysTotal, setDaysTotal] = useRiveNumber(riveRef, 'daysTotal');
  const [isDarkModeRive, setIsDarkModeRive] = useRiveBoolean(riveRef, 'isDarkMode');
  const [skipIntro, setSkipIntro] = useRiveBoolean(riveRef, 'skipIntro');

  // Set initial Rive values on mount/update
  useEffect(() => {
    if (riveRef) {
      setSkipIntro(true);
      setDaysRemaining(localDaysRemaining);
      setDaysTotal(localDaysTotal);
      setIsDarkModeRive(isDarkMode);
      riveRef.setTextRunValue('LabelText', 'Trial days left'); // Set TextRun value
      riveRef.setTextRunValue('CompleteText', 'Trial Complete'); // Set TextRun value
    }
  }, [
    isDarkMode,
    localDaysRemaining,
    localDaysTotal,
    setDaysRemaining,
    setDaysTotal,
    setIsDarkModeRive,
    setSkipIntro,
    riveRef,
  ]);

  const decreaseDays = () => {setLocalDaysRemaining((prev) => Math.max(0, prev - 1));};
  const increaseDays = () => {setLocalDaysRemaining((prev) => Math.min(localDaysTotal, prev + 1));};
  const resetTrial = () => {setLocalDaysRemaining(localDaysTotal);};
  const toggleDarkMode = () => {setIsDarkMode((prev) => !prev);};

  return (
    <SafeAreaView style={styles.safeAreaViewContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Rive
          resourceName="tryatt_trialcountdown7"
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

        <View style={styles.controls}>
          <Text style={styles.sectionTitle}>Trial Controls</Text>

          <View style={styles.controlRow}>
            <Text style={styles.label}>Days Remaining: {localDaysRemaining}</Text>
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={decreaseDays}
                disabled={localDaysRemaining === 0}
                style={styles.button}
              >
                -
              </Button>
              <Button
                mode="contained"
                onPress={increaseDays}
                disabled={localDaysRemaining === localDaysTotal}
                style={styles.button}
              >
                +
              </Button>
            </View>
          </View>

          <View style={styles.controlRow}>
            <Text style={styles.label}>Total Trial Days: {localDaysTotal}</Text>
          </View>

          <Button
            mode="contained"
            onPress={resetTrial}
            style={styles.resetButton}
          >
            Reset Trial
          </Button>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={isDarkMode} onValueChange={toggleDarkMode} />
          </View>

          {/* Display bound values */}
          <View style={styles.debugSection}>
            <Text style={styles.debugTitle}>Rive Values (Read-only):</Text>
            <Text style={styles.debugText}>
              Trial Text: {trialText ?? 'Not set'}
            </Text>
            <Text style={styles.debugText}>
              Trial Complete: {trialComplete ?? 'Not set'}
            </Text>
            <Text style={styles.debugText}>
              Days Remaining: {daysRemaining ?? 'Not set'}
            </Text>
            <Text style={styles.debugText}>
              Days Total: {daysTotal ?? 'Not set'}
            </Text>
            <Text style={styles.debugText}>
              Dark Mode: {isDarkModeRive !== undefined ? String(isDarkModeRive) : 'Not set'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaViewContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 32,
  },
  animation: {
    width: 350,
    height: 350,
    alignSelf: 'center',
    marginVertical: 20,
  },
  controls: {
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'stretch',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  controlRow: {
    marginVertical: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    minWidth: 60,
  },
  resetButton: {
    marginVertical: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    marginVertical: 2,
    color: '#666',
  },
});

