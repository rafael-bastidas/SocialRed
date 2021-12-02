import * as React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Text, View } from 'react-native';
import { Avatar, Button, Card } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";

import { getAllPostByIdUser, getUserById } from '../database/firebase'
import { getDataObject } from '../database/LocalStorage'

export default function ViewProfileScreen({ route, navigation }) {

    //GET THE PARAMS navigation.navigate('ViewProfileScreen', { paramUserDest: {id,user} })
    const { paramUserDest } = route.params;




    //HOOK useEffect
    React.useEffect(() => { initView(); }, []);




    //HOOK useState
    const [userDestProfile, setUserDestProfile] = React.useState({ id: "", profile: {} });

    const [userDestPost, setUserDestPost] = React.useState({ post: [] });




    //Area de FUNCTIONS:
    async function getUser() { return await getDataObject('user_origin'); }

    async function initView() {
        let userOrigin;
        try { userOrigin = await getUser(); } catch (error) { userOrigin = { id: '', user: '' } }

        let profileUserDest = await getUserById(paramUserDest.id);
        setUserDestProfile({ id: paramUserDest.id, profile: profileUserDest });

        let allPost = await getAllPostByIdUser(paramUserDest.id);
        setUserDestPost({ post: allPost });
    }




    //AREA DE COMPONENTES DYNAMICOS
    const ListPublication = () => {
        return (
            <View>
                {
                    userDestPost.post.map((value, index) => {
                        return (
                            <Card key={index}>
                                {
                                    <View>
                                        <Card.Title style={{ textAlign: 'left' }}>@{value.user}</Card.Title>
                                        <Text>{value.body}</Text>
                                        <View style={{ display: 'flex', alignItems: 'center', paddingVertical: 20 }}>
                                            <FullWidthImage
                                                source={{ uri: value.image }}
                                                style={{ resizeMode: 'contain' }} />
                                        </View>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                                                <Button title="like"
                                                    onPress={() => console.log("Like")} />
                                                <Button title="Repost"
                                                    style={{ marginStart: 10 }}
                                                    onPress={() => console.log("Like")} />
                                            </View>
                                            <Text style={{ display: 'flex', alignSelf: 'center' }}>{value.date}</Text>
                                        </View>
                                    </View>
                                }
                            </Card>
                        );
                    })
                }
            </View>
        );
    }





    //COMPONENTE PRINCIPAL A RENDERIZAR
    return (
        <SafeAreaView style={styles.containerSafeAreaView}>
            <ScrollView>
                <View style={styles.containerView}>
                    <Card containerStyle={{ padding: 0, margin: 0, backgroundColor: 'rgba(157, 219, 201, 1)' }}>
                        {
                            <View style={styles.container}>
                                <Avatar
                                    size="xlarge"
                                    rounded
                                    source={{ uri: userDestProfile.profile.image === '' ? 'https://thumbs.dreamstime.com/b/vector-de-usuario-redes-sociales-perfil-avatar-predeterminado-retrato-vectorial-del-176194876.jpg' : userDestProfile.profile.image }}
                                />
                                <Card.Title h4={true} style={{color:'#338960'}}>{userDestProfile.profile.name}</Card.Title>
                                <Text style={{ fontStyle: 'normal', textAlign: 'center', color: '#154570' }}>
                                    Bio: {userDestProfile.profile.bio}
                                </Text>
                                <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>
                                    Genero: {userDestProfile.profile.gender}
                                </Text>
                                <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>
                                    Cumpleaños: {userDestProfile.profile.birthday},
                                </Text>
                                <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>
                                    Ubicación: {userDestProfile.profile.location}
                                </Text>
                                <View style={{ marginTop: 15, width: "100%" }}>
                                    <Button title="Seguir"
                                        onPress={() => console.log('Seguir al usuario')} />
                                </View>
                            </View>
                        }
                    </Card>

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding:15 }}>
                        <Button title="Seguidores: 0"
                            style={{ marginTop: 0 }}
                            onPress={() => console.log('Mostrar lista de seguidores')} />
                        <Button title="Seguidos 0"
                            style={{ marginTop: 0 }}
                            onPress={() => console.log('Mostrar lista de seguidos')} />
                    </View>


                    <View style={styles.separator} />

                    <Text style={styles.title}>Publicaciones:</Text>
                    <ListPublication />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    containerSafeAreaView: {
        flex: 1,
    },
    containerView: {
        padding: 8,
        backgroundColor: 'rgba(181, 226, 213, 1)',
    },
    container: {
        height: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    container2: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around"
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color:'#338960'
    },
    subtitle: {
        fontStyle: 'normal',
        textAlign: 'justify',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});
