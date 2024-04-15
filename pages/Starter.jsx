import React, {useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Animated } from 'react-native';
import { styled } from 'nativewind';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from "@react-native-firebase/auth"
import Onboarding from './Onboarding'
import {NavigationContainer} from '@react-navigation/native';


const Stack = createNativeStackNavigator();
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledInput = styled(TextInput);
const StyledButton = styled(TouchableOpacity);
const StyledImage = styled(Image);

function Starter() {

  const [currentScreen, setCurrentScreen] = useState(0);
  const [onboardError, setOnboardError] = useState('');
  const [login, setLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [onboardingCode, setOnboardingCode] = useState('');


  const nextScreen = () => {
    setCurrentScreen(currentScreen + 1);
  };

  // Function to go back to the previous screen
  const prevScreen = () => {
    if (currentScreen > 0) {
      setCurrentScreen(currentScreen - 1);
    }
  };

  function setTheLogin() {
    setLogin(!login);
  };

  function openOnboarding() {
    setCurrentScreen(1);    
  };

  function setTheLoginAndClearInputs() {
    setLogin(!login);
    setUsername('');
    setPassword('');
    setPasswordVisible(true);
  }

  function codeEntered() {
    // if onboarding code is correct
    if (onboardingCode === '123456') {
      nextScreen()
    } else {
      setOnboardError('Wrong code, sorry!');
    }
  }



  const screens = [

    <View>

    </View>,

    // FIRST SCREEN

    <View className="flex h-full bg-white items-center justify-between px-4">
        
        <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-3">
          <Image className='h-[15px] w-[18px]' source={require('../public/grayarrow.png')}/>
        </TouchableOpacity>

      <View className='flex justify-center items-center'>
        <Image className='w-44 h-44 mt-44' source={require('../public/1.png')}/>
        <Image className='w-52 h-8 mt-2' source={require('../public/logo.png')}/>
        <Text className='text-slate-400 px-20 text-center text-md mt-2 text-md'>The fun and effective way to learn choir music at home.</Text>
      </View>
      <View className='w-full flex flex-col gap-y-3.5 justify-end mb-3'>
        <TouchableOpacity className='h-10 w-full flex justify-center  bg-[#FFDE1A] border border-b-4 border-[#FFCE00] rounded-xl'>
          <Text className='text-white text-center text-md font-bold' onPress={nextScreen}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>,

    // SECOND SCREEN

    <View className="flex h-full bg-white items-center justify-between px-4">
        
        <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-3">
          <Image className='h-[15px] w-[18px]' source={require('../public/grayarrow.png')}/>
        </TouchableOpacity>

      <View className='flex justify-center items-center'>
        <Image className='w-44 h-44 mt-16' source={require('../public/2.png')}/>
        <Image className='w-52 h-8 mt-2' source={require('../public/logo.png')}/>
        <Text className='text-slate-400 px-20 text-center text-md mt-2 text-md'>Enter your choir code below to join as an official member!</Text>



        <TextInput
                  className="border border-gray-300 pl-4 bg-[#F7F7F7] rounded-xl text-lg text-gray-700 mt-6"
                  placeholder="Choir Membership Code"
                  onChangeText={setOnboardingCode}
                  value={onboardingCode}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                  maxLength={6}
                />

      <Text className='text-red-400 px-20 text-center text-md mt-2 text-md'>{onboardError}</Text>


      </View>

        {onboardingCode.length === 0 ? (
        <View className='w-full flex flex-col gap-y-3.5 justify-end mb-3'>
          <TouchableOpacity
            className='h-10 w-full flex justify-center bg-gray-300 rounded-xl'
            disabled={true}
          >
            <Text className='text-white text-center text-md font-bold'>CONTINUE</Text>
          </TouchableOpacity>
          </View>
        ) : (
          <View className='w-full flex flex-col gap-y-3.5 justify-end mb-3'>
            <TouchableOpacity
              className='h-10 w-full flex justify-center bg-[#FFDE1A] border border-b-4 border-[#FFCE00] rounded-xl'
              onPress={nextScreen}
            >
              <Text className='text-white text-center text-md font-bold' onPress={codeEntered}>CONTINUE</Text>
            </TouchableOpacity>
          </View>
        )}

    </View>,

    // THIRD SCREEN

        <View className="h-full w-full bg-white flex items-center">
          <View className="w-full px-4 flex justify-between flex-col h-full">

          <TouchableOpacity onPress={prevScreen} className="flex items-center absolute left-2 top-3">
                  <Image className='h-[15px] w-[18px]' source={require('../public/grayarrow.png')}/>
                </TouchableOpacity>

            <View>
              <View className="flex flex-row items-center justify-center relative mb-4 mt-16">

                <Text className="text-lg font-bold flex items-center justify-center text-gray-400">Create an account and join ChoirName</Text>
              </View>

              <View className="rounded-xl border border-gray-300">
                <TextInput
                  className="border-b border-gray-300 pl-4 bg-[#F7F7F7] rounded-t-xl text-lg text-gray-700"
                  placeholder="Username or email"
                  onChangeText={setUsername}
                  value={username}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                />
                
                
                <View className="bg-[#F7F7F7] flex flex-row items-center justify-between rounded-b-xl">

                  <TextInput
                    className="p-2 pl-4 bg-[#F7F7F7] rounded-b-xl text-lg text-gray-700"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={passwordVisible}
                    placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <Image
                      className="w-6 h-6 mr-3 opacity-40"
                      source={passwordVisible ? require('../public/password_eye.png') : require('../public/password_eye_strike.png')}
                    />
                  </TouchableOpacity>
                </View>


              </View>

              {username.length > 0 && password.length > 0 ? (

                <TouchableOpacity className='mt-4 h-10 w-full flex justify-center border rounded-xl border-b-4 bg-[#FFCE00] border-[#FFA700]' onPress={setTheLogin}>
                  <Text className='text-white text-center font-bold text-lg'>CREATE ACCOUNT</Text>
                </TouchableOpacity>

              ) : (

                <TouchableOpacity className="mb-2 bg-gray-200 p-2 rounded-xl mt-4">
                <Text className="text-center font-semibold text-lg">CREATE ACCOUNT</Text>
                </TouchableOpacity>

              )
            }

              <Text className="font-bold text-center mb-4 text-[#FFCE00] mt-4 text-lg">FORGOT PASSWORD</Text>

            </View>

            <View className="">
              <View className="flex flex-row justify-between mb-4 gap-x-4">

                <TouchableOpacity className='mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300'>
                    <Image className='h-6 w-6' source={require('../public/fb.png')}/>
                    <Text className='text-[#0266FF] text-center font-bold text-lg flex items-center justify-center'>FACEBOOK</Text>
                </TouchableOpacity>

                <TouchableOpacity className='mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300'>
                    <Image className='h-6 w-6' source={require('../public/google.png')}/>
                    <Text className='text-gray-500 text-center font-bold text-lg flex items-center justify-center'>GOOGLE</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-center text-sm text-gray-500 mb-4">
                By signing in to Harmony Hive, you agree to our Terms and Privacy Policy.
              </Text>
            </View>

          </View>
        </View>,
  ];


    if (currentScreen > 0) {

      return (
        <View>
  
        {screens[currentScreen]}
  
        </View>

      );
    }


    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={Starter}
        options={{title: 'Harmony Hive'}}
      />
    </Stack.Navigator>
  </NavigationContainer>

    if (!login) {

      return (
        <View className="h-full w-full bg-white flex items-center">
          <View className="w-full px-4 flex justify-between flex-col h-full">

            <View className="">
              
              <View className="flex flex-row items-center justify-center relative mb-4 mt-4">
                <TouchableOpacity onPress={setTheLoginAndClearInputs} className="w-5 h-auto flex items-center absolute left-0">
                  <Text className="text-4xl font-light">×</Text>
                </TouchableOpacity>
                <Text className="text-lg font-bold flex items-center justify-center text-gray-400">Enter your details</Text>
              </View>

              <View className="rounded-xl border border-gray-300">
                <TextInput
                  className="border-b border-gray-300 pl-4 bg-[#F7F7F7] rounded-t-xl text-lg text-gray-700"
                  placeholder="Username or email"
                  onChangeText={setUsername}
                  value={username}
                  placeholderTextColor="rgba(0, 0, 0, 0.3)"
                  autoCapitalize="none"
                />
                
                
                <View className="bg-[#F7F7F7] flex flex-row items-center justify-between rounded-b-xl">

                  <TextInput
                    className="p-2 pl-4 bg-[#F7F7F7] rounded-b-xl text-lg text-gray-700"
                    placeholder="Password"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry={passwordVisible}
                    placeholderTextColor="rgba(0, 0, 0, 0.3)"
                    autoCapitalize="none"
                  />

                  <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                    <Image
                      className="w-6 h-6 mr-3 opacity-40"
                      source={passwordVisible ? require('../public/password_eye.png') : require('../public/password_eye_strike.png')}
                    />
                  </TouchableOpacity>
                </View>


              </View>

              {username.length > 0 && password.length > 0 ? (

                <TouchableOpacity className='mt-4 h-10 w-full flex justify-center border rounded-xl border-b-4 bg-[#19B1F4] border-[#1797D2]' onPress={setTheLogin}>
                  <Text className='text-white text-center font-bold text-lg'>SIGN IN</Text>
                </TouchableOpacity>

              ) : (

                <TouchableOpacity className="mb-2 bg-gray-200 p-2 rounded-xl mt-4">
                <Text className="text-center font-semibold text-lg">SIGN IN</Text>
                </TouchableOpacity>

              )
            }

              <Text className="font-bold text-center mb-4 text-[#19B1F4] mt-4 text-lg">FORGOT PASSWORD</Text>

            </View>

            <View className="">
              <View className="flex flex-row justify-between mb-4 gap-x-4">

                <TouchableOpacity className='mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300'>
                    <Image className='h-6 w-6' source={require('../public/fb.png')}/>
                    <Text className='text-[#0266FF] text-center font-bold text-lg flex items-center justify-center'>FACEBOOK</Text>
                </TouchableOpacity>

                <TouchableOpacity className='mt-4 gap-x-1 h-12 flex flex-row justify-center items-center border flex-1 rounded-xl border-b-4 bg-white border-slate-300'>
                    <Image className='h-6 w-6' source={require('../public/google.png')}/>
                    <Text className='text-gray-500 text-center font-bold text-lg flex items-center justify-center'>GOOGLE</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-center text-sm text-gray-500 mb-4">
                By signing in to Harmony Hive, you agree to our Terms and Privacy Policy.
              </Text>
            </View>

          </View>
        </View>

    );

    }

    return (
        <View className="flex h-full bg-white items-center justify-between px-4">
              <View className='flex justify-center items-center'>
                <Image className='w-28 h-28 mt-44' source={require('../public/7.png')}/>
                <Image className='w-40 h-8 mt-2' source={require('../public/logo.png')}/>
                <Text className='text-slate-400 px-20 text-center text-md mt-2'>The fun and effective way to learn choir music at home.</Text>
              </View>
              <View className='w-full flex flex-col gap-y-3.5 justify-end mb-3'>
                <TouchableOpacity className='h-10 w-full flex justify-center  bg-[#FFCE00] border border-b-4 border-[#FFA700] rounded-xl' onPress={openOnboarding}>
                  <Text className='text-white text-center text-md font-bold'>GET STARTED</Text>
                </TouchableOpacity>
                                
                <TouchableOpacity className='h-10 w-full flex justify-center border rounded-xl border-b-4 border-slate-400' onPress={setTheLogin}>
                  <Text className='text-[#FFA700] text-center text-md font-bold'>I ALREADY HAVE AN ACCOUNT</Text>
                </TouchableOpacity>
              </View>
        </View>
      );
  }

export default Starter;