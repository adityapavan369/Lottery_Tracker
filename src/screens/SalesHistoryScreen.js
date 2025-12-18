import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { salesAPI } from '../services/api';

export default function SalesHistoryScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await salesAPI.getSalesHistory();
      setSales(data.sales);
    } catch (error) {
      Alert.alert('Error', 'Failed to load sales history');
    } finally {
      setLoading(false);
    }
  };

  const renderSale = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.date}>
            {new Date(item.sale_date).toLocaleDateString()}
          </Title>
          <View
            style={[
              styles.statusBadge,
              item.status === 'open' ? styles.statusOpen : styles.statusClosed
            ]}
          >
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Paragraph>Pack: {item.pack_name || 'N/A'}</Paragraph>
        <Paragraph>Start: #{item.start_ticket_number}</Paragraph>
        
        {item.status === 'closed' && (
          <>
            <Paragraph>End: #{item.end_ticket_number}</Paragraph>
            <Paragraph>Tickets Sold: {item.tickets_sold}</Paragraph>
            <Paragraph style={styles.revenue}>
              Revenue: ${item.total_revenue}
            </Paragraph>
          </>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={sales}
        renderItem={renderSale}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onRefresh={loadHistory}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No sales history yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  date: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#4caf50',
  },
  statusClosed: {
    backgroundColor: '#757575',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  revenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4caf50',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
  },
});
