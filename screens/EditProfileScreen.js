import * as React from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, Text, View } from 'react-native';

import { Input, Button } from 'react-native-elements';

import { editUser, getUserById } from '../database/firebase';
import { getDataString } from '../database/LocalStorage';

export default function EditProfileScreen(props) {

    React.useEffect(() => {
        initView();
        console.log("getinitView-EditProfile");
    }, []);

    const [userProfile, setUserProfile] = React.useState({
        id: "",
        profile,
    });

    const [state, setState] = React.useState({
        bio: '',
        name: '',
        gender: '',
        location: '',
        birthday: '',
        user: '',
        password: '',
        repit_password: ''
    });

    const handleChangeText = (name, value) => {
        setState({ ...state, [name]: value })
    }

    const editarUsuario = async () => {
        if (state.name !== '' && state.user !== '' && state.password !== '' && state.password === state.repit_password) {
            await editUser(state, userProfile.id);
            console.log("Se guardo");
            props.navigation.navigate('Root', { screen: 'TabProfile' });
        } else {
            console.log("Complete toda la informacion");
        }
    }

    async function getIdUser() { return await getDataString('id_user'); }
    async function initView() {
        let idUser;
        try { idUser = await getIdUser(); } catch (error) { idUser = "" }

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
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    } else {
        return (
            <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Datos personales:</Text>

                    <Input placeholder='Nombre completo'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'user' }}
                        value={state.name}
                        onChangeText={value => handleChangeText('name', value)} />
                    <Input placeholder='Genero'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'transgender-alt' }}
                        value={state.gender}
                        onChangeText={value => handleChangeText('gender', value)} />
                    <Input placeholder='Dirección de habitación'
                        leftIcon={{ color:'#154570', type: 'Entypo', name: 'location-pin' }}
                        value={state.location}
                        onChangeText={value => handleChangeText('location', value)} />
                    <Input placeholder='Fecha de nacimiento'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'birthday-cake' }}
                        value={state.birthday}
                        onChangeText={value => handleChangeText('birthday', value)} />
                    <Input placeholder='Bio'
                        leftIcon={{ color:'#154570', type: 'Ant-Design', name: 'profile' }}
                        value={state.bio}
                        onChangeText={value => handleChangeText('bio', value)} />

                    <Text style={styles.title}>Datos de inicio de sesion:</Text>

                    <Input placeholder='Usuario'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'user' }}
                        value={state.user}
                        onChangeText={value => handleChangeText('user', value)} />
                    <Input placeholder='Contraseña'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'lock' }}
                        value={state.password}
                        onChangeText={value => handleChangeText('password', value)} />
                    <Input placeholder='Reperir contraseña'
                        leftIcon={{ color:'#154570', type: 'font-awesome', name: 'lock' }}
                        onChangeText={value => handleChangeText('repit_password', value)} />

                    <Button title="Guardar cambios"
                        type="outline"
                        titleStyle={{ color: '#fff' }}
                        style={{marginVertical:'20px', backgroundColor: 'rgba(38, 144, 19, 1)'}}
                        onPress={() => editarUsuario()} />
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(181, 226, 213, 1)',
        paddingHorizontal: '15px',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: '15px',
        color:'#338960'
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
        alignSelf: 'center'
    },
});
