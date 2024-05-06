import React from 'react';
import { useState, useEffect, useRef } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import { View, Text, TextInput, TouchableOpacity, Image, StatusBar, ScrollView, SafeAreaView, FlatList, StyleSheet, Animated } from 'react-native';
import { styled } from 'nativewind';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Starter from './pages/Starter';
import ChatScreen from './pages/ChatScreen';
import SplashScreen from 'react-native-splash-screen'
import auth from '@react-native-firebase/auth';
import { ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import firestore from '@react-native-firebase/firestore';
import Video from 'react-native-video';
import TrackPlayer from 'react-native-track-player';
import storage from '@react-native-firebase/storage';
import Slider from '@react-native-community/slider'
import { ActivityIndicator, LayoutAnimation, UIManager } from "react-native";
import { Images } from './public/index'
import { Platform } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';


UIManager.setLayoutAnimationEnabledExperimental &&
UIManager.setLayoutAnimationEnabledExperimental(true);

const volumeControlTime = 3000;




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
    <SafeAreaProvider>
        <GameScreen user={user}/>
    </SafeAreaProvider>
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
  const [player, setPlayer] = useState(null);
  const [paused, setPaused] = useState(true);
  const [chatScreen, setChatScreen] = useState(false);
  const [choirId, setChoirId] = useState(null);

  function goToChat () {
    setChatScreen(true);
  }

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
        setChoirId(selectedChoir);
        
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



  // random signout function

  async function signOut() {
    try {
      await auth().signOut();
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <NavigationContainer>
    <View className="flex-1">

      { chatScreen? ( <ChatScreen 
      onBack={() => setChatScreen(false)} choirId={choirId} user={user}/> ) 
      
      : ( 
        <>
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
            <View className="flex-1 bg-emerald-200">
            <View className="w-screen h-screen flex items-center justify-center -mt-36">
              <Text className="text-2xl mb-4">{selectedSong.name}</Text>

            {selectedSong && selectedSong.files && selectedSong.files.map((file, index) => (

                <View
                key={`${file.name}-${index}_view`}
                >
                  <Text 
                  key={`${file.name}-${index}_text`}>{file.name}{file.url}</Text>

                  <AudioPlayer
                  key={`${file.name}-${index}_audioplayer`}
                    url={'https://firebasestorage.googleapis.com/v0/b/harmonyhive-b4705.appspot.com/o/TUnrM8z359eWvkV6xnFY%2Fsongs%2F2UtpRdsrS4wY8bZA8rLe%2Fmixaund-optimistic-inspirational.mp3?alt=media&token=9bdd7e0f-f6e3-46c9-bbac-208ad92b6840'}
                  />

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

            {/* Bottom Nav */}
            <View className="flex-row justify-between p-4 bg-white items-center border-t border-gray-200">
              <TouchableOpacity>
                <Image source={require('./public/duo.png')} className="h-6 w-6" />
              </TouchableOpacity>

              <TouchableOpacity onPress={goToChat}>
                <Image source={require('./public/chaticon.png')} className="h-6 w-6" />
              </TouchableOpacity>

              <TouchableOpacity onPress={signOut}>
                <Image source={require('./public/1.png')} className="h-6 w-6" />
              </TouchableOpacity>
            </View>

          </>
        )}
</>
      )}

    




    </View>
    </NavigationContainer>
  );
 
}























 



const AudioPlayer = (props) => {
  const { url, style, repeatOnComponent, repeatOffComponent } = props;
  const [paused, setPaused] = useState(true);

  const videoRef = useRef(null);
  const controlTimer = useRef(0);

  const [totalLength, setTotalLength] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [volumeControl, setVolumeControl] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const onSeek = (time) => {
    time = Math.round(time);
    videoRef && videoRef.current.seek(time);
    setCurrentPosition(time);
    setPaused(false);
  };

  const fixDuration = (data) => {
    setLoading(false);
    setTotalLength(Math.floor(data.duration));
  };

  const setTime = (data) => {
    setCurrentPosition(Math.floor(data.currentTime));
  };

  const togglePlay = () => {
    setPaused(!paused);
  };

  const toggleRepeat = () => {
    setRepeat(!repeat);
  };

  const toggleVolumeControl = () => {
    setVolumeTimer(!volumeControl);
    LayoutAnimation.easeInEaseOut();
    setVolumeControl(!volumeControl);
  };

  const setVolumeTimer = (setTimer = true) => {
    clearTimeout(controlTimer.current);
    controlTimer.current = 0;
    if (setTimer) {
      controlTimer.current = setTimeout(() => {
        LayoutAnimation.easeInEaseOut();
        setVolumeControl(false);
      }, volumeControlTime);
    }
  };

  const onVolumeChange = (vol) => {
    setVolumeTimer();
    setVolume(vol);
  };

  const resetAudio = () => {
    if (!repeat) {
      setPaused(true);
    }
    setCurrentPosition(0);
  };

  function toHHMMSS(secs) {
    const sec_num = parseInt(secs, 10);
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor(sec_num / 60) % 60;
    const seconds = sec_num % 60;
  
    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  }

  return (
    <View style={[style && style, {}]}>
      <Video
        source={{ uri: url }}
        ref={videoRef}
        playInBackground={false}
        audioOnly={true}
        playWhenInactive={false}
        paused={paused}
        onEnd={resetAudio}
        onLoad={fixDuration}
        onLoadStart={() => setLoading(true)}
        onProgress={setTime}
        volume={volume}
        repeat={repeat}
        style={{ height: 0, width: 0 }}
      />

      <View>
        <View className="justify-end items-center">
          {loading && (
            <View className="m-16">
              <ActivityIndicator size="large" color="#FFF"/>
            </View>
          ) || (
            <View className="flex flex-row justify-around items-center w-11/12 mb-10"
            >
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
                className="align-middle relative"
                onPress={toggleRepeat}
              >
                

                <Image source={Images.repeatIcon} className="h-[30px] w-[30px] object-contain"/>
                {!repeat && <View
                className="absolute transform -rotate-[60deg] top-15 left--1 w-30 h-1 border-b-2 border-white"
                />}
              </TouchableOpacity>
              <TouchableOpacity className="align-middle relative justify-center items-center" onPress={togglePlay}>
                <Image
                  source={paused ? Images.playIcon :  Images.pauseIcon}
                  className="h-[30px] w-[30px] object-contain"
                />
              </TouchableOpacity>
              <View
                style={[
                  styles.volumeControlContainer,
                  volumeControl ? { paddingHorizontal: 12 } : { backgroundColor: "transparent" }
                ]}
              >
                <TouchableOpacity
                  hitSlop={{ top: 10, bottom: 10, right: 10, left: 10 }}
                  className="align-middle relative"

                  onPress={toggleVolumeControl}
                >
                  <Image
                    source={volume === 0 ?  Images.muteIcon : Images.soundIcon}
                    className="h-[30px] w-[30px] object-contain"
                  />
                </TouchableOpacity>
                {volumeControl && (
                  <Slider
                    className="w-1/2"
                    minimumValue={0}
                    maximumValue={1}
                    minimumTrackTintColor={'#fff'}
                    maximumTrackTintColor={'grey'}
                    thumbTintColor={'#fff'}
                    onSlidingComplete={onVolumeChange}
                    value={volume}
                  />
                )}
              </View>
            </View>
          )}

          <View className="px-16 pb-12 w-full"
          >

            <Slider
              className="h-28 w-full mb-3"
              minimumValue={0}
              maximumValue={Math.max(totalLength, 1, currentPosition + 1)}
              minimumTrackTintColor={'#fff'}
              maximumTrackTintColor={'grey'}
              onSlidingComplete={onSeek}
              value={currentPosition}
            />
            <View className="flex flex-row justify-between">


              <Text className="text-white text-lg">
                {toHHMMSS(currentPosition)}
              </Text>
              <Text className="text-white text-lg">
                {toHHMMSS(totalLength)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({

  volumeControlContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: "#00000099",
    paddingHorizontal: 16,
    borderRadius: 50,
    ...Platform.select({
      ios: {
        height: 44
      },
      android: {
        height: 40
      },
    }),
  },
}); 