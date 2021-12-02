import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import EditProfileScreen from './screens/EditProfileScreen';
import HomeScreen from './screens/HomeScreen';
import InitSessionScreen from './screens/InitSessionScreen';
import NotFoundScreen from './screens/NotFoundScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import SearchScreen from './screens/SearchScreen';
import ViewProfileScreen from './screens/ViewProfileScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <Navigation />
      <StatusBar />
    </SafeAreaProvider>
  );
}

const linkingConfiguration = {
  prefixes: [Linking.makeUrl('/')],
  config: {
    screens: {
      Root: {
        screens: {
          TabHome: {
            screens: { HomeScreen: 'home' },
          },
          TabSearch: {
            screens: { SearchScreen: 'search' },
          },
          TabProfile:{
            screens:{ ProfileScreen: 'profile' }
          },
        },
      },
      InitSession: 'init-sesion',
      RegisterUser: 'register-user',
      EditProfile: 'edit-profile',
      ViewProfile: 'view-profile',
      NotFound: '*',
    },
  },
};

function Navigation() {
  return (
    <NavigationContainer linking={linkingConfiguration}>
      <RootNavigator />
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();
function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="InitSession" component={InitSessionScreen} options={{
        title: 'Inicio de sesion',
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', },
        headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' }
      }} />
      <Stack.Screen name="RegisterUser" component={RegisterScreen} options={{
        title: 'Registro de usuario',
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', },
        headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' },
      }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{
        title: 'Editar perfil',
        headerBackVisible: true,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', },
        headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' }
      }} />
      <Stack.Screen name="ViewProfile" component={ViewProfileScreen} options={{
        title: 'Vista perfil',
        headerBackVisible: true,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold', },
        headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' }
      }} />
      <Stack.Screen name="Root" component={BottomTabNavigator} options={{
        headerShown: false
      }} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
 const BottomTab = createBottomTabNavigator();

 function BottomTabNavigator() {
 
   return (
     <BottomTab.Navigator
       initialRouteName="TabHome"
       /* screenOptions={{ tabBarActiveTintColor: Colors[colorScheme].tint, }} */
       >
       <BottomTab.Screen
         name="TabHome"
         component={HomeScreen}
         options={{
           title: 'Inicio',
           headerTintColor: '#fff',
           headerTitleStyle: { fontWeight: 'bold', },
           headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' },
           tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabSearch"
         component={SearchScreen}
         options={{
           title: 'Busqueda',
           headerTintColor: '#fff',
           headerTitleStyle: { fontWeight: 'bold', },
           headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' },
           tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
         }}
       />
       <BottomTab.Screen
         name="TabProfile"
         component={ProfileScreen}
         options={(props) => ({
           title: 'Perfil',
           headerTintColor: '#fff',
           headerTitleStyle: { fontWeight: 'bold', },
           headerStyle: { backgroundColor: 'rgba(32, 137, 220, 1)' },
           headerRight: () => <Icon raised color={'#154570'} name='logout' onPress={() => props.navigation.navigate('InitSession')} />,
           tabBarIcon: ({ color }) => <TabBarIcon name="user-circle-o" color={color} />,
         })}
       />
     </BottomTab.Navigator>
   );
 }
 
 /**
  * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
  */
 function TabBarIcon(props) {
   return <FontAwesome size={30} style={{ marginBottom: -3 }} {...props} />;
 }
 