import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, ScrollView, SafeAreaView, FlatList, StyleSheet, Animated } from 'react-native';
import { styled } from 'nativewind';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Starter from './pages/Starter';
import SplashScreen from 'react-native-splash-screen'
import auth from '@react-native-firebase/auth';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import Video from 'react-native-video';
import TrackPlayer from 'react-native-track-player';
import storage from '@react-native-firebase/storage';


const Stack = createNativeStackNavigator();

function App() {

  SplashScreen.hide();

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();
  console.log(user);

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {

  return (
    <View>
      <Starter />
    </View>
  );
} else {
  return (
        <GameScreen user={user}/>
  );
}
}

export default App;















const GameScreen = ({ user }) => {

  const [musicSelected, setMusicSelected] = useState(false);
  const [songs, setSongs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSong, setSelectedSong] = useState(null);
  const spinValue = useRef(new Animated.Value(0)).current;
  const [choirName, setChoirName] = useState('');   // State for storing the choir name
  const [selectedChoir, setSelectedChoir] = useState(null);
  const [player, setPlayer] = useState(null);
  const [paused, setPaused] = useState(true);

  // handle audio and video

  const handleSelectSong = song => {
    setSelectedSong(song);
    setMusicSelected(true);
    // Optionally stop the current player if any
    if (player) {
      player.pause();
    }
  };

  // Subscribe to users firestore and retrieve choir_selected
  useEffect(() => {
    let userSubscriberUnsubscribe = () => {};
    let choirSubscriberUnsubscribe = () => {};
    
    // Subscribe to user data to get the selected choir
    const userSubscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .onSnapshot(userDocumentSnapshot => {
        const userData = userDocumentSnapshot.data();
        const selectedChoir = userData?.choir_selected;
        
        // Fetch choir name and songs if a choir is selected
        if (selectedChoir) {
          // Fetch the choir document to get the choir name
          firestore().collection('choirs').doc(selectedChoir).get().then(choirDoc => {
            if (choirDoc.exists) {
              const choirData = choirDoc.data();
              setChoirName(choirData.name); // Store the choir name in state

              // Subscribe to songs in the selected choir
              const choirSubscriber = firestore()
                .collection('choirs')
                .doc(selectedChoir)
                .collection('songs')
                .onSnapshot(snapshot => {
                  const songsData = snapshot.docs.map(doc => ({
                    songId: doc.id,
                    name: doc.data().name,
                    files: doc.data().files || []
                  }));
                  setSongs(songsData);
                  console.log(songsData);
                });
              
              choirSubscriberUnsubscribe = choirSubscriber; // Store unsubscribe function for cleanup
            } else {
              setChoirName('No choir found');
            }
          }).catch(error => {
            console.error("Error fetching choir details:", error);
            setChoirName('Error fetching choir');
          });
        } else {
          setChoirName('No choir selected');
        }
      });

    userSubscriberUnsubscribe = userSubscriber; // Store unsubscribe function for cleanup

    return () => {
      userSubscriberUnsubscribe();
      choirSubscriberUnsubscribe();
    };
  }, [user.uid]);
  
  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true,
      }),
      { iterations: -1 }
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '7000deg'],
  });


  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const screenWidth = event.nativeEvent.layoutMeasurement.width;
    const pageIndex = Math.floor(contentOffsetX / screenWidth);
    setCurrentPage(pageIndex);
  };

  const handleBackToSongs = () => {
    setMusicSelected(false);
    setSelectedSong(null);
  };


  // handle audio playback

  useEffect(() => {
    TrackPlayer.setupPlayer().then(() => {
        console.log('TrackPlayer initialized');
    }).catch(error => {
        console.error('Error initializing TrackPlayer:', error);
    });

    return () => {
    };
  }, []);


  async function playAudio(file_url) {
    const file_proper_url = await storage().ref(file_url).getDownloadURL();
    console.log(file_proper_url);
    setPaused(!paused);

    await TrackPlayer.add({
        id: file_url,
        url: file_proper_url,
        title: 'Track Title',
        artist: 'Track Artist',
    });

    if (paused) {
      await TrackPlayer.play();
    } else {
      await TrackPlayer.pause();
    }

  }

  // random signout function

  async function signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      console.log(error);
    }
  }

  

  return (
    <View className="flex-1">
      {/* Status Bar */}
      <StatusBar barStyle="light-content" backgroundColor="#FFCE00" />
        <Text className=' text-slate-900'>{choirName}</Text>

      {/* Top Bar */}
      <View className="flex-row justify-between px-4 py-3 items-center bg-[#FFCE00]">
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

      {/* Top Bar */}
      <View className="flex-row p-4 bg-[#FFCE00] flex justify-center border-b border-[#ddb516] ">
        <Text className="text-white font-bold">SONG: {songs.length > 0 && currentPage < songs.length ? songs[currentPage].name.toUpperCase() : 'LOADING...'}</Text>
      </View>

      {musicSelected && selectedSong ? (
            <View className="flex-1 bg-white">
            <View className="w-screen h-screen flex items-center justify-center bg-white -mt-36">
              <Text className="text-2xl mb-4">{selectedSong.name}</Text>


              {selectedSong.files && selectedSong.files.map((file, index) => (
                <View>
                  <Text key={index}>{file.name}{file.url}</Text>

                  <TouchableOpacity onPress={() => playAudio(file.url)} className="mt-4 bg-blue-500 text-white p-2 rounded">
                    <Text>GET LINK AND PLAY AUDIO</Text>
                  </TouchableOpacity>

                </View>
              ))}


              <TouchableOpacity onPress={handleBackToSongs} className="mt-4 bg-blue-500 text-white p-2 rounded">
                <Text>Back to Songs</Text>
              </TouchableOpacity>
            </View>
            </View>
      
        ) : (

        <>
            <GestureHandlerRootView className="flex-1 bg-white">
              <GestureScrollView
                className="flex"
                horizontal={true}
                pagingEnabled={true}
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={{ flexGrow: 1 }}
              >
              
                {songs.map((song, index) => (
                  <View key={song.songId} className="w-screen h-screen flex items-center justify-center bg-white -mt-36">
                    <TouchableOpacity
                    onPress={() => handleSelectSong(song)}>
                      <Animated.Image
                        source={require('./public/musicdisk.png')}
                        style={{ width: 120, height: 120, transform: [{ rotate: spin }] }}
                      />
                      <Text className="text-2xl">{song.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <View className="w-screen h-screen flex items-center justify-center">
                  <Text className="text-2xl">Page 2</Text>
                </View>
                <View className="w-screen h-screen flex items-center justify-center">
                  <Text className="text-2xl">Page 3</Text>
                </View>
              </GestureScrollView>
            </GestureHandlerRootView>

            <View className="flex-row justify-center p-4 bg-white">
              {songs.map((_, index) => (
                <View
                  key={index}
                  className={`h-2 w-2 rounded-full m-1 ${currentPage === index ? 'bg-gray-500' : 'bg-gray-300'}`}
                />
              ))}
            </View>

          </>
        )}



      {/* Bottom Nav */}
      <View className="flex-row justify-between p-4 bg-white items-center border-t border-gray-200">
        <TouchableOpacity>
          <Image source={require('./public/duo.png')} className="h-6 w-6" />
        </TouchableOpacity>
        {/* ... other nav items */}
        <TouchableOpacity onPress={signOut}>
          <Image source={require('./public/1.png')} className="h-6 w-6" />
        </TouchableOpacity>
      </View>
    </View>
  );
 
}

const styles = StyleSheet.create({
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});