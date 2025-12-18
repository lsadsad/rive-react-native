import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

// Import both versions
import WorkingVersion from './FraudSpamCard';
import EngineersTestVersion from './FraudSpamCard_engineers_test';
import EngineersFixedVersion from './FraudSpamCard_engineers_fixed';

type VersionType = 'working' | 'engineers' | 'fixed';

export default function FraudSpamCardComparison() {
  const [selectedVersion, setSelectedVersion] = useState<VersionType>('working');

  const renderVersion = () => {
    switch (selectedVersion) {
      case 'working':
        return <WorkingVersion />;
      case 'engineers':
        return <EngineersTestVersion />;
      case 'fixed':
        return <EngineersFixedVersion />;
      default:
        return <WorkingVersion />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Version Selector */}
      <View style={styles.selectorContainer}>
        <Text style={styles.title}>Compare Versions</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.versionButton,
              selectedVersion === 'working' && styles.activeButton,
            ]}
            onPress={() => setSelectedVersion('working')}
          >
            <Text
              style={[
                styles.buttonText,
                selectedVersion === 'working' && styles.activeButtonText,
              ]}
            >
              ✅ Working
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.versionButton,
              selectedVersion === 'engineers' && styles.activeButton,
            ]}
            onPress={() => setSelectedVersion('engineers')}
          >
            <Text
              style={[
                styles.buttonText,
                selectedVersion === 'engineers' && styles.activeButtonText,
              ]}
            >
              ⚠️ Engineers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.versionButton,
              selectedVersion === 'fixed' && styles.activeButton,
            ]}
            onPress={() => setSelectedVersion('fixed')}
          >
            <Text
              style={[
                styles.buttonText,
                selectedVersion === 'fixed' && styles.activeButtonText,
              ]}
            >
              🔧 Fixed
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          {selectedVersion === 'working' && (
            <>
              <Text style={styles.infoTitle}>✅ Working Version</Text>
              <Text style={styles.infoText}>
                • callsAnalyzedValue: 215{'\n'}
                • callsDayValue: 0.6{'\n'}
                • layoutScaleFactor: -1.0{'\n'}
                • No ?v=3 in URL
              </Text>
            </>
          )}
          {selectedVersion === 'engineers' && (
            <>
              <Text style={styles.infoTitle}>⚠️ Engineers' Version (Issues)</Text>
              <Text style={styles.infoText}>
                ❌ callsAnalyzedValue: 15 (should be 215){'\n'}
                ❌ callsDayValue: 1 (should be 0.6){'\n'}
                ❌ layoutScaleFactor: 1.0 (should be -1.0){'\n'}
                ❌ Has ?v=3 in URL
              </Text>
            </>
          )}
          {selectedVersion === 'fixed' && (
            <>
              <Text style={styles.infoTitle}>🔧 Fixed Engineers' Version</Text>
              <Text style={styles.infoText}>
                ✅ All issues corrected{'\n'}
                ✅ Should match working version{'\n'}
                ✅ Ready for production
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Render the selected version */}
      <View style={styles.contentContainer}>
        {renderVersion()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  selectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  versionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#45a049',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
  infoBox: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  contentContainer: {
    flex: 1,
  },
});
