import React, {useState, useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Image, Animated } from 'react-native';
import { styled } from 'nativewind';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from "@react-native-firebase/auth"

const Stack = createNativeStackNavigator();
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledButton = styled(TouchableOpacity);
const StyledImage = styled(Image);

function Onboarding() {


    return (
        <View className="flex h-full bg-white items-center justify-between px-4">
              <View className='flex justify-center items-center'>
                <Image className='w-28 h-28 mt-44' source={require('../public/duo.png')}/>
                <Image className='w-32 h-8 mt-2' source={require('../public/duolingologo.png')}/>
                <Text className='text-slate-400 px-20 text-center text-md mt-2'>The free, fun, and effective way to learn a language!</Text>
              </View>
              <View className='w-full flex flex-col gap-y-3.5 justify-end mb-3'>
                <TouchableOpacity className='h-10 w-full flex justify-center  bg-[#56CD02] border border-b-4 border-[#57A700] rounded-xl'>
                  <Text className='text-white text-center text-md font-bold'>CONTINUE</Text>
                </TouchableOpacity>
              </View>
        </View>
      );
  }

export default Onboarding;