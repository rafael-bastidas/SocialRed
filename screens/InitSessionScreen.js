import * as React from 'react';
import { StyleSheet, ImageBackground, Text, View, ActivityIndicator } from 'react-native';
import { Input, Button, Card, Overlay } from 'react-native-elements';
import { widthDim } from './DimensionesLayout'

import { validUser } from '../database/firebase';
import { getDataObject, storeDataObject } from '../database/LocalStorage';


export default function InitSessionScreen(props) {

  const image = { uri: "https://rafaelbastidas.com/apis/api-music/media/image_fondo.png" };

  const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
  function handleToggleOverlay() {
    if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
  }

  const [state, setState] = React.useState({
    user: '',
    password: '',
    id_user: 'undefined',
  });

  const handleChangeText = (name, value) => {
    setState({ ...state, [name]: value })
  }

  const validarUsuario = async () => {
    setLoader({ visible: true, text: 'Verificando...', Backdrop: false, visibleLoad: true });
    let array_resp = await validUser(state.user, state.password);
    //console.log(array_resp);
    if (array_resp.length === 1) {
      await storeDataObject('user_origin', { id: array_resp[0].id, user: state.user });
      setLoader({ ...loader, visible: false });
      props.navigation.navigate('Root', { screen: 'TabProfile' });
    } else {
      setLoader({ visible: true, text: 'Usuario no registrado', Backdrop: true, visibleLoad: false });
    }
  }

  const params_id_user = async () => {
    const params = await getDataObject('user_origin');
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
        <Card containerStyle={{ backgroundColor: 'rgba(255, 255, 255, .8)', borderRadius: 8 }}>
          {
            <View style={{ backgroundColor: 'rgba(255, 255, 255, .5)' }}>
              <Text style={styles.title}>Inicio de sesion</Text>
              <View style={styles.separator} />
              <Input placeholder='Usuario' leftIcon={{ color: '#154570', type: 'font-awesome', name: 'user' }}
                onChangeText={value => handleChangeText('user', value)} />
              <Input placeholder='Contraseña' leftIcon={{ color: '#154570', type: 'font-awesome', name: 'lock' }}
                onChangeText={value => handleChangeText('password', value)}
                secureTextEntry={true} />
              <Button
                containerStyle={{ marginTop: 10, backgroundColor: '#EC4B5F', borderRadius: 8 }}
                title="Ingresar"
                titleStyle={{ color: '#fff' }}
                type="outline"
                onPress={() => validarUsuario()} />
              <View style={styles.separator} />
              <Button title="Quiero registrarme"
                onPress={() => props.navigation.navigate('RegisterUser')}
                style={{ borderRadius: 8, backgroundColor: '#154570' }} />
            </View>
          }
        </Card>
        <Overlay isVisible={loader.visible} onBackdropPress={() => handleToggleOverlay()}>
          {(() => {
            if (loader.visibleLoad) {
              return (
                <View style={{ width: widthDim - 100, alignItems: 'center' }}>
                  <ActivityIndicator color="#154570" size="large" />
                  <Text>{loader.text}</Text>
                </View>)
            } else {
              return (
                <View style={{ width: widthDim - 100, alignItems: 'center' }}>
                  <Text>{loader.text}</Text>
                </View>)
            }
          })()}
        </Overlay>
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
    color: '#FFBB50'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    /* width: '80%', */
  },
});
