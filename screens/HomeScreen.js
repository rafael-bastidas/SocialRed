import * as React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(181, 226, 213, 1)' }}>
      <View style={{ height:'100%', display:'flex', flexDirection:'row', justifyContent:'center', alignItems: 'center' }}>
        <Text>Vista de inicio</Text>
      </View>
    </View>
  );
}
