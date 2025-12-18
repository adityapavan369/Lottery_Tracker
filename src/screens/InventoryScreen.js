import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { FAB, Card, Title, Paragraph, Text } from 'react-native-paper';
import { inventoryAPI } from '../services/api';

export default function InventoryScreen({ navigation }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    setLoading(true);
    try {
      const data = await inventoryAPI.getPacks();
      setPacks(data.packs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load ticket packs');
    } finally {
      setLoading(false);
    }
  };

  const renderPack = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>Pack Size: {item.pack_size} tickets</Paragraph>
        <Paragraph>QR Code: {item.qr_code}</Paragraph>
        <Text style={styles.date}>
          Added: {new Date(item.added_at).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={packs}
        renderItem={renderPack}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        onRefresh={loadPacks}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No ticket packs yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first pack
            </Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddPack', { onPackAdded: loadPacks })}
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
  date: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
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
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
