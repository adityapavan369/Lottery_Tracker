import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { inventoryAPI } from '../services/api';

export default function AddPackScreen({ navigation, route }) {
  const [name, setName] = useState('');
  const [packSize, setPackSize] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanning(false);
    setQrCode(data);
    Alert.alert('QR Code Scanned', `QR Code: ${data}`);
  };

  const handleSubmit = async () => {
    if (!name || !packSize || !qrCode) {
      Alert.alert('Error', 'Please fill all fields and scan QR code');
      return;
    }

    const size = parseInt(packSize);
    if (isNaN(size) || size <= 0) {
      Alert.alert('Error', 'Pack size must be a positive number');
      return;
    }

    setLoading(true);
    try {
      await inventoryAPI.addPack(name, size, qrCode);
      Alert.alert('Success', 'Ticket pack added successfully');
      if (route.params?.onPackAdded) {
        route.params.onPackAdded();
      }
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to add pack';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (scanning) {
    return (
      <View style={styles.container}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        <Button
          mode="contained"
          onPress={() => setScanning(false)}
          style={styles.cancelButton}
        >
          Cancel
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Title style={styles.title}>Add New Ticket Pack</Title>
        
        <TextInput
          label="Pack Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Lucky 7 Pack"
        />
        
        <TextInput
          label="Pack Size"
          value={packSize}
          onChangeText={setPackSize}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="Number of tickets"
        />
        
        <TextInput
          label="QR Code"
          value={qrCode}
          onChangeText={setQrCode}
          mode="outlined"
          style={styles.input}
          editable={false}
          placeholder="Scan QR code"
        />
        
        <Button
          mode="outlined"
          onPress={() => setScanning(true)}
          style={styles.scanButton}
          icon="qrcode-scan"
          disabled={hasPermission === false}
        >
          {hasPermission === false ? 'Camera Permission Denied' : 'Scan QR Code'}
        </Button>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
          disabled={!name || !packSize || !qrCode}
        >
          Add Pack
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
  input: {
    marginBottom: 15,
  },
  scanButton: {
    marginBottom: 15,
  },
  submitButton: {
    marginTop: 10,
    paddingVertical: 5,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
