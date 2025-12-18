import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Text, TextInput } from 'react-native-paper';
import { salesAPI, inventoryAPI } from '../services/api';

export default function DailySalesScreen({ navigation }) {
  const [todaySale, setTodaySale] = useState(null);
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousEndNumber, setPreviousEndNumber] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [saleData, packsData, prevData] = await Promise.all([
        salesAPI.getTodaySale(),
        inventoryAPI.getPacks(),
        salesAPI.getPreviousEndNumber(),
      ]);
      
      setTodaySale(saleData.sale);
      setPacks(packsData.packs);
      setPreviousEndNumber(prevData.previousEndNumber);
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDay = () => {
    if (packs.length === 0) {
      Alert.alert('Error', 'Please add a ticket pack first');
      return;
    }
    
    navigation.navigate('StartDay', {
      packs,
      previousEndNumber,
      onDayStarted: loadData,
    });
  };

  const handleCloseDay = () => {
    navigation.navigate('CloseDay', {
      sale: todaySale,
      onDayClosed: loadData,
    });
  };

  const handleViewHistory = () => {
    navigation.navigate('SalesHistory');
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title style={styles.title}>Daily Sales</Title>
      
      {previousEndNumber && !todaySale && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Paragraph style={styles.infoText}>
              Previous day ended at ticket #{previousEndNumber}
            </Paragraph>
            <Paragraph style={styles.infoSubtext}>
              Start number will be automatically set to #{previousEndNumber + 1}
            </Paragraph>
          </Card.Content>
        </Card>
      )}
      
      {todaySale ? (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Today's Sale</Title>
            <Paragraph>Pack: {todaySale.pack_name || 'N/A'}</Paragraph>
            <Paragraph>Start Ticket: #{todaySale.start_ticket_number}</Paragraph>
            
            {todaySale.status === 'open' ? (
              <>
                <Paragraph style={styles.statusOpen}>Status: Open</Paragraph>
                <Button
                  mode="contained"
                  onPress={handleCloseDay}
                  style={styles.button}
                  icon="check"
                >
                  Close Day
                </Button>
              </>
            ) : (
              <>
                <Paragraph>End Ticket: #{todaySale.end_ticket_number}</Paragraph>
                <Paragraph>Tickets Sold: {todaySale.tickets_sold}</Paragraph>
                <Paragraph style={styles.revenue}>
                  Total Revenue: ${todaySale.total_revenue}
                </Paragraph>
                <Paragraph style={styles.statusClosed}>Status: Closed</Paragraph>
              </>
            )}
          </Card.Content>
        </Card>
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Title>No Active Sale</Title>
            <Paragraph style={styles.subtitle}>
              Start a new sale for today
            </Paragraph>
            <Button
              mode="contained"
              onPress={handleStartDay}
              style={styles.button}
              icon="play"
            >
              Start Day
            </Button>
          </Card.Content>
        </Card>
      )}
      
      <Button
        mode="outlined"
        onPress={handleViewHistory}
        style={styles.historyButton}
        icon="history"
      >
        View Sales History
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
  },
  infoCard: {
    marginBottom: 15,
    backgroundColor: '#e3f2fd',
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
  subtitle: {
    marginBottom: 15,
    color: '#666',
  },
  button: {
    marginTop: 15,
  },
  historyButton: {
    marginTop: 10,
  },
  statusOpen: {
    marginTop: 10,
    color: '#4caf50',
    fontWeight: 'bold',
  },
  statusClosed: {
    marginTop: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  revenue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 5,
  },
});
