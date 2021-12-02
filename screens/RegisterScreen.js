import * as React from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import { Input, Button } from 'react-native-elements';

import { registerUser } from '../database/firebase';
import { storeDataString } from '../database/LocalStorage';

export default function RegisterScreen(props) {

    const [state, setState] = React.useState({
        name: '',
        gender: '',
        location: '',
        birthday: '',
        user: '',
        password: '',
        repit_password: ''
    });

    const [flatLoader, setFlatLoader] = React.useState(false);

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

    const registrarUsuario = async () => {
        if (state.name !== '' && state.user !== '' && state.password !== '' && state.password === state.repit_password) {
            setFlatLoader(true);
            let id_user = await registerUser({ ...state, image: '', array_user: configurarArrayUser() });
            console.log("id_user", id_user);
            if (id_user !== 'undefined' && id_user !== 'user-registered') {
                alert("Usuario Registrado");
                await storeDataString('id_user', id_user);
                props.navigation.navigate('Root');
            } else if (id_user === 'user-registered') {
                alert("El nombre de usuario ya existe");
            } else if (id_user === 'undefined') {
                alert("Usuario no registrado");
            }
            setFlatLoader(false);
        } else {

        }
    }

    return (
        <ScrollView>
                <View style={styles.container}>
                    <Text style={styles.title}>Datos personales:</Text>

                    <Input placeholder='Nombre completo'
                        leftIcon={{ type: 'font-awesome', name: 'user' }}
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

                    <Button title="Registrarme"
                        type="outline"
                        titleStyle={{ color: '#fff' }}
                        containerStyle={{marginVertical:20, backgroundColor: 'rgba(38, 144, 19, 1)'}}
                        onPress={() => registrarUsuario()} />
                </View>
            </ScrollView>
    );
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
        color:'#338960'
    },
});
