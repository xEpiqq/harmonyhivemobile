import React from 'react';
import { useState } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, ScrollView } from 'react-native';
import { styled } from 'nativewind';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Starter from './pages/Starter';
import SplashScreen from 'react-native-splash-screen'

const Stack = createNativeStackNavigator();

function App() {

  SplashScreen.hide();

  return (
    // <NavigationContainer>
    //   <Stack.Navigator>
    //     <Stack.Screen
    //       name="Home"
    //       component={Starter}
    //       options={{title: 'Harmony Hive'}}
    //     />
    //   </Stack.Navigator>
    // </NavigationContainer>
    <View>
      <Starter />
    </View>
  );
}

export default App;

const GameScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Placeholder data for the scrollable content
  const contentItems = [
    { id: 'item-1', content: 'Content 1' },
    { id: 'item-2', content: 'Content 2' },
    { id: 'item-3', content: 'Content 3' },
    { id: 'item-4', content: 'Content 4' },
    { id: 'item-5', content: 'Content 5' },
  ];

  // Calculate the pagination dots
  const paginationDots = contentItems.map((_, index) => (
    <View
      key={`dot-${index}`}
      className={`h-2 w-2 rounded-full ${activeIndex === index ? 'bg-white' : 'bg-gray-400'} mx-1`}
    />
  ));

  // Update active index on scroll
  const handleScroll = (event) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const activeIndex = Math.floor(contentOffset / viewSize);
    setActiveIndex(activeIndex);
  };

  return (
    <View className="flex-1 bg-green-500">
    {/* Status Bar */}
    <StatusBar barStyle="light-content" backgroundColor="#38b2ac" />

    {/* Top Bar */}
    <View className="flex-row justify-between p-4 items-center">
      {/* Left Side */}
      <View className="flex-row items-center">
        <Image source={require('./public/duo.png')} className="h-6 w-10" />
        <Text className="text-white ml-2">1</Text>
      </View>
      {/* Center */}
      <View className="flex-row items-center">
        <Text className="text-white mx-2">5636</Text>
        <Image source={require('./public/duo.png')} className="h-6 w-6" />
      </View>
      {/* Right Side */}
      <View className="flex-row items-center">
        <Text className="text-white mr-2">5</Text>
        <Image source={require('./public/duo.png')} className="h-6 w-6" />
      </View>
    </View>

    {/* Content Section */}
    <ScrollView
      horizontal
      pagingEnabled
      onMomentumScrollEnd={handleScroll}
      className="flex-grow"
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <View className="justify-center items-center w-full">
        <Text className="text-white text-lg">Content 1</Text>
      </View>
      <View className="justify-center items-center w-full">
        <Text className="text-white text-lg">Content 2</Text>
      </View>
      <View className="justify-center items-center w-full">
        <Text className="text-white text-lg">Content 3</Text>
      </View>
      <View className="justify-center items-center w-full">
        <Text className="text-white text-lg">Content 4</Text>
      </View>
      <View className="justify-center items-center w-full">
        <Text className="text-white text-lg">Content 5</Text>
      </View>
    </ScrollView>

    {/* Pagination Dots */}
    <View className="flex-row justify-center p-4">
      {paginationDots}
    </View>

    {/* Bottom Nav */}
    <View className="flex-row justify-between p-4 bg-white items-center">
      {/* Repeat this TouchableOpacity for each bottom nav item */}
      <TouchableOpacity>
        <Image source={require('./public/duo.png')} className="h-6 w-6" />
      </TouchableOpacity>
      {/* ... other nav items */}
    </View>
  </View>
  );
};