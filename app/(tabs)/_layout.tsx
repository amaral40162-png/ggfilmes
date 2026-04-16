import { Tabs } from "expo-router";
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: 85,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0,0,0,0.9)',
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          ) : null
        ),
        tabBarActiveTintColor: '#ff4081',
        tabBarInactiveTintColor: '#666',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'bold',
          marginTop: 5,
        },
      }}
    >
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: "Início",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="assistidos" 
        options={{ 
          title: "Vistos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={26} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="quero-ver" 
        options={{ 
          title: "Desejos",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "heart" : "heart-outline"} size={26} color={color} />
          )
        }} 
      />
      <Tabs.Screen 
        name="perfil" 
        options={{ 
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
          )
        }} 
      />
    </Tabs>
  );
}