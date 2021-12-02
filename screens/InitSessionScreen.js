import * as React from 'react';
import { StyleSheet, ImageBackground, Text, View } from 'react-native';
import { Input, Button, Card } from 'react-native-elements';

import { validUser } from '../database/firebase';
import { storeDataString, getDataString, storeDataObject } from '../database/LocalStorage';


export default function InitSessionScreen(props) {

  const image = { uri: "https://cdn.pixabay.com/photo/2014/02/17/13/52/heart-268151_960_720.jpg" };

  const [state, setState] = React.useState({
    user: '',
    password: '',
    id_user: 'undefined',
  });

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value })
  }

  const validarUsuario = async () => {
    let array_resp = await validUser(state.user, state.password);
    //console.log(array_resp);
    if (array_resp.length === 1) {
      alert("Usuario validado");
      await storeDataString('id_user', array_resp[0].id);
      await storeDataObject('user_origin', { id: array_resp[0].id, user: array_resp[0].user });
      props.navigation.navigate('Root', { screen: 'TabProfile' });
    } else {
      alert("Usuario no registrado");
    }
  }

  const params_id_user = async () => {
    const params = await getDataString('id_user');
    if (params !== 'undefined') {
      props.navigation.navigate('Root', { screen: 'TabProfile' });
    }
  }
  React.useEffect(() => {
    params_id_user(); console.log('useEffect params_id_user');
  }, []);


  return (
    <View style={styles.container}>
      <ImageBackground source={image} resizeMode="cover" style={styles.imageBackground}>
        <Card containerStyle={{ backgroundColor: 'rgba(255, 255, 255, .8)' }}>
          {
            <View style={{ backgroundColor: 'rgba(255, 255, 255, .5)' }}>
              <Text style={styles.title}>Inicio de sesion</Text>
              <View style={styles.separator} />
              <Input placeholder='Usuario' leftIcon={{ color:'#154570', type: 'font-awesome', name: 'user' }}
                onChangeText={value => handleChangeText('user', value)} />
              <Input placeholder='Contraseña' leftIcon={{ color:'#154570', type: 'font-awesome', name: 'lock' }}
                onChangeText={value => handleChangeText('password', value)} />
              <Button
                containerStyle={{ marginTop: 10, backgroundColor:'rgba(38, 144, 19, 1)' }}
                title="Ingresar"
                titleStyle={{color:'#fff'}}
                type="outline"
                onPress={() => validarUsuario()} />
              <View style={styles.separator} />
              <Button title="Quiero registrarme" onPress={() => props.navigation.navigate('RegisterUser')} />
            </View>
          }
        </Card>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "center"
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'rgba(38, 144, 19, 1)',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
