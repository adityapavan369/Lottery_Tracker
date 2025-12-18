import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Title, Text } from 'react-native-paper';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await authAPI.login(email, password);
        Alert.alert('Success', 'Logged in successfully');
      } else {
        await authAPI.register(email, password);
        Alert.alert('Success', 'Account created successfully');
      }
      navigation.replace('Main');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'An error occurred';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Title style={styles.title}>Lottery Tracker</Title>
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          secureTextEntry
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.button}
        >
          {isLogin ? 'Login' : 'Register'}
        </Button>
        
        <Button
          mode="text"
          onPress={() => setIsLogin(!isLogin)}
          style={styles.toggleButton}
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  toggleButton: {
    marginTop: 10,
  },
});
