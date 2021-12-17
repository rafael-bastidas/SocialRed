import * as React from 'react';
import { SafeAreaView, StyleSheet, ScrollView, ActivityIndicator, Text, View } from 'react-native';
import { Input, Button, Overlay } from 'react-native-elements';
import { widthDim } from './DimensionesLayout'
import { editUser, getUserById } from '../database/firebase';
import { getDataObject } from '../database/LocalStorage';
import { dataRegister } from '../database/DatosInit'

export default function EditProfileScreen(props) {

    let userOrigin = { id: "", user: "" };
    React.useEffect(async () => {
        userOrigin = await getDataObject('user_origin');
        initView();
        console.log("getinitView-EditProfile");
    }, []);

    const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad:false });
    function handleToggleOverlay() {
        if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
    }

    const [userProfile, setUserProfile] = React.useState({ id: "", profile: {} });

    const [state, setState] = React.useState({
        name: '',
        gender: '',
        location: '',
        birthday: '',
        bio:'',
        user: '',
        password: ''
    });

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value })
    }

    const editarUsuario = async () => {
        if (state.name !== '' && state.user !== '' && state.password !== '') {
            await editUser(state, userProfile.id);
            props.navigation.navigate('Root', { screen: 'TabProfile' }, { flatUpdateBio: true });
        } else {
            setLoader({ visible: true, text: 'Los campos nombre y contraseña son obligatorios', Backdrop: true, visibleLoad: false });
        }
    }

    async function initView() {
        let idUser = userOrigin.id;
        let profileUser = await getUserById(idUser);
        setUserProfile({ id: idUser, profile: profileUser });
        setState({
            ...state,
            bio: typeof profileUser.bio === 'undefined' ? '' : profileUser.bio,
            name: typeof profileUser.name === 'undefined' ? '' : profileUser.name,
            gender: typeof profileUser.gender === 'undefined' ? '' : profileUser.gender,
            location: typeof profileUser.location === 'undefined' ? '' : profileUser.location,
            birthday: typeof profileUser.birthday === 'undefined' ? '' : profileUser.birthday,
            user: typeof profileUser.user === 'undefined' ? '' : profileUser.user,
            password: typeof profileUser.password === 'undefined' ? '' : profileUser.password
        });
    }



    if (state.name === '') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Cargando...</Text>
            </View>
        );
    } else {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(181, 226, 213, 1)' }}>
                <ScrollView>
                    <View style={styles.container}>
                        <Text style={styles.title}>Datos personales:</Text>

                        <Input placeholder='Nombre completo'
                            leftIcon={{ color: '#154570', type: 'font-awesome', name: 'user' }}
                            value={state.name}
                            onChangeText={value => handleChangeText('name', value)} />
                        <Input placeholder='Genero'
                            leftIcon={{ color: '#154570', type: 'font-awesome', name: 'transgender-alt' }}
                            value={state.gender}
                            onChangeText={value => handleChangeText('gender', value)} />
                        <Input placeholder='Dirección de habitación'
                            leftIcon={{ color: '#154570', type: 'Entypo', name: 'location-pin' }}
                            value={state.location}
                            onChangeText={value => handleChangeText('location', value)} />
                        <Input placeholder='Fecha de nacimiento'
                            leftIcon={{ color: '#154570', type: 'font-awesome', name: 'birthday-cake' }}
                            value={state.birthday}
                            onChangeText={value => handleChangeText('birthday', value)} />
                        <Input placeholder='Bio'
                            leftIcon={{ color: '#154570', name: 'info-outline' }}
                            value={state.bio}
                            onChangeText={value => handleChangeText('bio', value)} />

                        <Text style={styles.title}>Datos de inicio de sesion:</Text>

                        <Input placeholder='Usuario'
                            disabled
                            leftIcon={{ color: '#154570', type: 'font-awesome', name: 'user' }}
                            value={state.user}
                            onChangeText={value => handleChangeText('user', value)} />
                        <Input placeholder='Contraseña'
                            leftIcon={{ color: '#154570', type: 'font-awesome', name: 'lock' }}
                            value={state.password}
                            onChangeText={value => handleChangeText('password', value)} />

                        <Button title="Guardar cambios"
                            type="outline"
                            titleStyle={{ color: '#fff' }}
                            containerStyle={{ marginVertical: 20, backgroundColor: 'rgba(38, 144, 19, 1)' }}
                            onPress={() => editarUsuario()} />

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
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(181, 226, 213, 1)',
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 15,
        color: '#338960'
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
        alignSelf: 'center'
    },
});
