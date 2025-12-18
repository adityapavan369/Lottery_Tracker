import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Text, List } from 'react-native-paper';
import { salesAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';

export default function StartDayScreen({ navigation, route }) {
  const { packs, previousEndNumber, onDayStarted } = route.params;
  const [selectedPackId, setSelectedPackId] = useState('');
  const [startNumber, setStartNumber] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (previousEndNumber) {
      setStartNumber(String(previousEndNumber + 1));
    }
    if (packs.length > 0) {
      setSelectedPackId(String(packs[0].id));
    }
  }, [previousEndNumber, packs]);

  const handleSubmit = async () => {
    if (!selectedPackId || !startNumber) {
      Alert.alert('Error', 'Please select a pack and enter start number');
      return;
    }

    const startNum = parseInt(startNumber);
    if (isNaN(startNum) || startNum <= 0) {
      Alert.alert('Error', 'Start number must be a positive number');
      return;
    }

    setLoading(true);
    try {
      await salesAPI.startDay(parseInt(selectedPackId), startNum);
      Alert.alert('Success', 'Day started successfully');
      if (onDayStarted) {
        onDayStarted();
      }
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to start day';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Start New Day</Title>
        
        {previousEndNumber && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Previous day ended at ticket #{previousEndNumber}
            </Text>
            <Text style={styles.infoSubtext}>
              Automatically set to start at #{previousEndNumber + 1}
            </Text>
          </View>
        )}
        
        <Text style={styles.label}>Select Ticket Pack:</Text>
        <View style={styles.pickerContainer}>
          {packs.map((pack) => (
            <List.Item
              key={pack.id}
              title={pack.name}
              description={`${pack.pack_size} tickets`}
              left={props => <List.Icon {...props} icon="package-variant" />}
              onPress={() => setSelectedPackId(String(pack.id))}
              style={[
                styles.packItem,
                selectedPackId === String(pack.id) && styles.packItemSelected
              ]}
            />
          ))}
        </View>
        
        <TextInput
          label="Start Ticket Number"
          value={startNumber}
          onChangeText={setStartNumber}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="Enter starting ticket number"
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
          disabled={!selectedPackId || !startNumber}
        >
          Start Day
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  pickerContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  packItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  packItemSelected: {
    backgroundColor: '#e8f5e9',
  },
  input: {
    marginBottom: 20,
  },
  button: {
    paddingVertical: 5,
  },
});
