import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Card, Paragraph, Text } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { salesAPI } from '../services/api';

export default function CloseDayScreen({ navigation, route }) {
  const { sale, onDayClosed } = route.params;
  const [endNumber, setEndNumber] = useState('');
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
    // Extract ticket number from QR code (assuming format includes number)
    const match = data.match(/\d+/);
    if (match) {
      setEndNumber(match[0]);
      Alert.alert('QR Code Scanned', `Ticket Number: ${match[0]}`);
    } else {
      setEndNumber(data);
      Alert.alert('QR Code Scanned', `Data: ${data}`);
    }
  };

  const calculateStats = () => {
    if (!endNumber || !sale) return null;
    
    const endNum = parseInt(endNumber);
    if (isNaN(endNum)) return null;
    
    const TICKET_PRICE = 1.00; // Should match backend configuration
    const ticketsSold = endNum - sale.start_ticket_number + 1;
    const totalRevenue = ticketsSold * TICKET_PRICE;
    
    return { ticketsSold, totalRevenue };
  };

  const handleSubmit = async () => {
    if (!endNumber) {
      Alert.alert('Error', 'Please enter end ticket number or scan QR code');
      return;
    }

    const endNum = parseInt(endNumber);
    if (isNaN(endNum) || endNum <= 0) {
      Alert.alert('Error', 'End number must be a positive number');
      return;
    }

    if (endNum < sale.start_ticket_number) {
      Alert.alert('Error', 'End number must be greater than or equal to start number');
      return;
    }

    setLoading(true);
    try {
      const result = await salesAPI.closeDay(endNum);
      Alert.alert(
        'Success',
        `Day closed successfully!\n\nTickets Sold: ${result.ticketsSold}\nTotal Revenue: $${result.totalRevenue}`
      );
      if (onDayClosed) {
        onDayClosed();
      }
      navigation.goBack();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to close day';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const stats = calculateStats();

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
        <Title style={styles.title}>Close Day</Title>
        
        <Card style={styles.card}>
          <Card.Content>
            <Paragraph>Pack: {sale.pack_name || 'N/A'}</Paragraph>
            <Paragraph>Start Ticket: #{sale.start_ticket_number}</Paragraph>
          </Card.Content>
        </Card>
        
        <TextInput
          label="End Ticket Number"
          value={endNumber}
          onChangeText={setEndNumber}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
          placeholder="Enter or scan last sold ticket"
        />
        
        <Button
          mode="outlined"
          onPress={() => setScanning(true)}
          style={styles.scanButton}
          icon="qrcode-scan"
          disabled={hasPermission === false}
        >
          {hasPermission === false ? 'Camera Permission Denied' : 'Scan Last Sold Ticket'}
        </Button>
        
        {stats && (
          <Card style={styles.statsCard}>
            <Card.Content>
              <Title style={styles.statsTitle}>Calculated Results</Title>
              <Paragraph style={styles.statItem}>
                Tickets Sold: {stats.ticketsSold}
              </Paragraph>
              <Paragraph style={styles.revenue}>
                Total Revenue: ${stats.totalRevenue.toFixed(2)}
              </Paragraph>
            </Card.Content>
          </Card>
        )}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
          disabled={!endNumber}
        >
          Close Day
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
  card: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 15,
  },
  scanButton: {
    marginBottom: 20,
  },
  statsCard: {
    marginBottom: 20,
    backgroundColor: '#e8f5e9',
  },
  statsTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  statItem: {
    fontSize: 16,
    marginVertical: 5,
  },
  revenue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 5,
  },
  button: {
    paddingVertical: 5,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
});
