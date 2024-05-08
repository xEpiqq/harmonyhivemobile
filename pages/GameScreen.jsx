import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StatusBar, Animated } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { GestureHandlerRootView, ScrollView as GestureScrollView } from 'react-native-gesture-handler';
import ChatScreen from './ChatScreen';
import AudioPlayer from './components/AudioPlayer';


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
    const [profileScreen, setProfileScreen] = useState(false);
    const [choirId, setChoirId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);


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
                setIsLoading(false)
              } else {
                setChoirName('No choir found');
              }
            }).catch(error => {
              console.error("Error fetching choir details:", error);
              setChoirName('Error fetching choir');
              setIsLoading(false)
            });
          } else {
            setChoirName('No choir selected');
            setIsLoading(false)
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

    if (isLoading) {
      return (
        <Image source={require('../public/loadingscreen.png')} className="h-screen w-screen" />
      );
    }
  
    return (
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
            <Image source={require('../public/duo.png')} className="h-6 w-10" />
            <Text className="text-white ml-2">1</Text>
          </View>
          {/* Center */}
          <View className="flex-row items-center">
            <Text className="text-white mx-2">5636</Text>
            <Image source={require('../public/duo.png')} className="h-6 w-6" />
          </View>
          {/* Right Side */}
          <View className="flex-row items-center">
            <Text className="text-white mr-2">5</Text>
            <Image source={require('../public/duo.png')} className="h-6 w-6" />
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
                          source={require('../public/musicdisk.png')}
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
        </>
        )}
  
      </View>
    );
   
  }
  
export default GameScreen