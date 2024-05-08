import React, { useState, useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { Image, UIManager, View, Text } from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Starter from './pages/Starter';
import ChatScreen from './pages/ChatScreen';
import Profile from './pages/Profile';
import GameScreen from './pages/GameScreen';
import auth from '@react-native-firebase/auth';
import SplashScreen from 'react-native-splash-screen'

UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function App() {

  SplashScreen.hide();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  const [isLoading, setIsLoading ] = useState(true);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber;
  }, []);

  if (initializing) return null

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {!user ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="Starter"
              component={Starter}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        ) : (
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarActiveTintColor: 'blue',
              tabBarInactiveTintColor: 'gray',
              tabBarIcon: ({ color, size }) => {
                let iconSource;
                if (route.name === 'Game') {
                  iconSource = require('./public/duo.png');
                } else if (route.name === 'Chat') {
                  iconSource = require('./public/chaticon.png');
                } else if (route.name === 'Profile') {
                  iconSource = require('./public/1.png');
                }
                return <Image source={iconSource} style={{ width: size, height: size, tintColor: color }} />;
              },
            })}
          >
            <Tab.Screen name="Game" >
              {props => <GameScreen {...props} user={user} />}
            </Tab.Screen>
            <Tab.Screen name="Profile">
              {props => <Profile {...props} user={user} />}
            </Tab.Screen>
            <Tab.Screen name="Chat" options={{ tabBarStyle: { display: 'none' }, }} >
              {props => <ChatScreen {...props} onBack={() => props.navigation.goBack()} user={user}  />}
            </Tab.Screen>
          </Tab.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;