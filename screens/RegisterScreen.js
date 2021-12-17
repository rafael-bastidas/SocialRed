import * as React from 'react';
import { StyleSheet, ScrollView, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Input, Button, Overlay } from 'react-native-elements';
import { registerUser } from '../database/firebase';
import { dataRegister } from '../database/DatosInit'
import { widthDim } from './DimensionesLayout'
import { storeDataObject } from "../database/LocalStorage";

export default function RegisterScreen(props) {

    const image = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };

    const [state, setState] = React.useState(dataRegister);

    const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
    function handleToggleOverlay() {
        if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
    }

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value })
    }

    const configurarArrayUser = () => {
        const c = state.user.toLowerCase()
        var array = [];
        for (let i = 1; i < c.length + 1; i++) {
            array.push(c.substring(0, i));
        }
        return array;
    }

    async function registrarUsuario() {
        if (state.name !== '' && state.user !== '' && state.password !== '') {
            setLoader({ visible: true, text: 'Cargando...', Backdrop: false, visibleLoad: true });
            let id_user = await registerUser({ ...state, user: state.user.toLocaleLowerCase(), array_user: configurarArrayUser() });
            console.log("id_user", id_user);
            if (id_user !== 'undefined' && id_user !== 'user-registered') {
                /* alert("Usuario Registrado"); */
                /* await storeDataString('id_user', id_user); */
                await storeDataObject('user_origin', { id: id_user, user: state.user.toLocaleLowerCase() });
                props.navigation.navigate('Root');
            } else if (id_user === 'user-registered') {
                setLoader({ visible: true, text: 'El usuario ya existe', Backdrop: true, visibleLoad: false });
            } else if (id_user === 'undefined') {
                setLoader({ visible: true, text: 'Usuario no registrado', Backdrop: true, visibleLoad: false });
            } else {
                setLoader({ ...loader, visible: false });
            }

        } else {
            setLoader({ visible: true, text: 'Los campos nombre, usuario y contraseña son obligatorios', Backdrop: true, visibleLoad: false });
        }
    }

    return (
        <ScrollView>
            <View >
                <ImageBackground source={image} resizeMode="cover" style={styles.container}>
                <Text style={styles.title}>DATOS PERSONALES:</Text>

        <View style={{backgroundColor:'rgba(254, 254, 254, 0.8)', marginTop:15, borderRadius: 5}}>
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Nombre completo:'}
                    leftIcon={{ color: '#154570', type: 'font-awesome', name: 'user' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.name}
                    onChangeText={value => handleChangeText('name', value)} />
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Genero:'}
                    leftIcon={{ color: '#154570', type: 'font-awesome', name: 'transgender-alt' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.gender}
                    onChangeText={value => handleChangeText('gender', value)} />
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Dirección:'}
                    leftIcon={{ color: '#154570', type: 'Entypo', name: 'location-pin' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.location}
                    onChangeText={value => handleChangeText('location', value)} />
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Fecha de nacimiento:'}
                    leftIcon={{ color: '#154570', type: 'font-awesome', name: 'birthday-cake' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.birthday}
                    onChangeText={value => handleChangeText('birthday', value)} />
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Biografia:'}
                    leftIcon={{ color: '#154570', type: 'Ant-Design', name: 'info-outline' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.bio}
                    onChangeText={value => handleChangeText('bio', value)} />
            </View>

                <Text style={styles.title}>DATOS DE INICIO DE SESION:</Text>
                <View style={{backgroundColor:'rgba(254, 254, 254, 0.8)', marginTop:15, borderRadius: 5}}>
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Usuario:'}
                    leftIcon={{ color: '#154570', type: 'font-awesome', name: 'user' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.user}
                    onChangeText={value => handleChangeText('user', value)} />
                <Input
                    labelStyle={{ color: '#0084c8', marginLeft: 15 }}
                    label={'Contraseña:'}
                    leftIcon={{ color: '#154570', type: 'font-awesome', name: 'lock' }}
                    inputStyle={{ color: '#005c94', marginLeft: 15 }}
                    value={state.password}
                    onChangeText={value => handleChangeText('password', value)}
                    secureTextEntry={true} />
                </View>

                <Button title="Registrarme"
                    type="outline"
                    titleStyle={{ color: '#fff' }}
                    containerStyle={{ marginVertical: 20, backgroundColor: '#EC4B5F', borderRadius:8 }}
                    onPress={() => registrarUsuario()} />

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
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#9eabb0ff',
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 15,
        color: '#171B24',
        backgroundColor: '#FFBB50',
        borderRadius: 8
    },
});
