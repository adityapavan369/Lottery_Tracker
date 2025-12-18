import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import InventoryScreen from './src/screens/InventoryScreen';
import AddPackScreen from './src/screens/AddPackScreen';
import DailySalesScreen from './src/screens/DailySalesScreen';
import StartDayScreen from './src/screens/StartDayScreen';
import CloseDayScreen from './src/screens/CloseDayScreen';
import SalesHistoryScreen from './src/screens/SalesHistoryScreen';
import { authAPI } from './src/services/api';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function InventoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="InventoryList" 
        component={InventoryScreen}
        options={{ title: 'Inventory' }}
      />
      <Stack.Screen 
        name="AddPack" 
        component={AddPackScreen}
        options={{ title: 'Add Ticket Pack' }}
      />
    </Stack.Navigator>
  );
}

function SalesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="DailySalesList" 
        component={DailySalesScreen}
        options={{ title: 'Daily Sales' }}
      />
      <Stack.Screen 
        name="StartDay" 
        component={StartDayScreen}
        options={{ title: 'Start Day' }}
      />
      <Stack.Screen 
        name="CloseDay" 
        component={CloseDayScreen}
        options={{ title: 'Close Day' }}
      />
      <Stack.Screen 
        name="SalesHistory" 
        component={SalesHistoryScreen}
        options={{ title: 'Sales History' }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Sales') {
            iconName = focused ? 'cash-register' : 'cash-register';
          } else if (route.name === 'Inventory') {
            iconName = focused ? 'package-variant' : 'package-variant-closed';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Sales" 
        component={SalesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Inventory" 
        component={InventoryStack}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await authAPI.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
