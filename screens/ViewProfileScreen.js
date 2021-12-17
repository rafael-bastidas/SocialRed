import * as React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Text, View, ImageBackground } from 'react-native';
import { Avatar, Button, Card, Overlay } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";
import { widthDim } from './DimensionesLayout'
import { dejarseguirUser, seguirUser, updatePostById, likePost, rePost, colectionref, colectionrefUser } from '../database/firebase'
import { getDataObject } from '../database/LocalStorage'
import { dataViewProfile } from '../database/DatosInit'

import { query, onSnapshot, where } from "firebase/firestore";


export default function ViewProfileScreen({ route, navigation }) {

    //GET THE PARAMS navigation.navigate('ViewProfileScreen', { paramUserDest: {id,user} })
    const { paramUserDest } = route.params;

    const imageBg = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };


    //HOOK useEffect
    React.useEffect(() => { initView(); }, []);




    //HOOK useState
    const [userOrigin, setUserOrigin] = React.useState({ id: "", user: "" });
    const [userDestProfile, setUserDestProfile] = React.useState({ id: "", profile: {} });

    const [userDestPost, setUserDestPost] = React.useState({ post: [] });


    //Manejo de likes
    async function controllerLikes(post) {
        let iddelPost = typeof post.id === 'undefined' ? '' : post.id
        console.log(iddelPost, paramUserDest)
        let index = post.doc.likes.findIndex(element => { return element.id == paramUserDest.id })
        if (post.id == paramUserDest.id) {
            alert("El post es del usuario")
        } else if (index == -1) {
            /* alert("Darle like") */
            await likePost(post.id, paramUserDest);
        } else if (index > -1) {
            /* alert("Darle unlike") */
            post.doc.likes.splice(index, 1)
            updatePostById(post.id, post.doc);
        }
    }
    //Manejo de repost
    async function controllerRepost(post) {
        let iddelPost = typeof post.id === 'undefined' ? '' : post.id
        console.log(iddelPost, userOrigin)
        let index = post.doc.repost.findIndex(element => { return element.id == userOrigin.id })
        if (index == -1) {
            /* alert("Darle like") */
            await rePost(post.id, userOrigin);
            navigation.navigate('Comentar', { criterios: { accion: 'editarComentario', user: userOrigin, post: post.doc } });
        } else if (index > -1) {
            /* alert("Darle unlike") */
            post.doc.repost.splice(index, 1);
            //Se borra el comentario REPOSTED en caso de existir
            let listComentRepost = typeof post.doc.repost_coment == 'undefined' ? [] : post.doc.repost_coment;
            let indexListComentRepost = listComentRepost.findIndex(element => { return element.id == userOrigin.id });
            indexListComentRepost == -1 ? '' : post.doc.repost_coment.splice(indexListComentRepost, 1);
            //Se actualiza
            updatePostById(post.id, post.doc);
        }
    }
    /* const [postdelUserDest, setPostdelUserDest] = React.useState([]);
    const [rePostdelUserDest, setRePostdelUserDest] = React.useState([]); */
    //Manejo de actualizado de post
    let postdelUserDest_Aux = [];
    let rePostdelUserDest_Aux = [];
    function getListenerPostByUserId() {
        /* updateSetUserDestPost() */
        const q1 = query(colectionref, where("id_user", "==", paramUserDest.id));
        const q2 = query(colectionref, where("repost", "array-contains", paramUserDest));
        const unsubscribe1 = onSnapshot(q1, (querySnapshot1) => {
            const allPostdelUserDest = [];
            querySnapshot1.forEach((doc) => {
                allPostdelUserDest.push({ doc: doc.data(), id: doc.id });
            });
            console.log("Actualizo post del usuario", allPostdelUserDest)
            /* setPostdelUserDest(allPostdelUserDest); */
            postdelUserDest_Aux = allPostdelUserDest
            updateSetUserDestPost();
        });
        const unsubscribe2 = onSnapshot(q2, (querySnapshot2) => {
            const allRePostdelUserDest = [];
            querySnapshot2.forEach((doc) => {
                allRePostdelUserDest.push({ doc: doc.data(), id: doc.id });
            });
            console.log("Actualizo repost del usuario", allRePostdelUserDest)
            /* setRePostdelUserDest(allRePostdelUserDest); */
            rePostdelUserDest_Aux = allRePostdelUserDest
            updateSetUserDestPost();
        });
    }
    function updateSetUserDestPost() {
        /* let allPostDest = postdelUserDest.concat(rePostdelUserDest); */
        let allPostDest = postdelUserDest_Aux.concat(rePostdelUserDest_Aux)
        setUserDestPost({ post: allPostDest });
    }

    function getListenerUserByUser() {
        const q = query(colectionrefUser, where("user", "==", paramUserDest.user));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const profileUserDest = [];
            querySnapshot.forEach((doc) => {
                profileUserDest.push({ doc: doc.data(), id: doc.id });
            });
            console.log("Actualizo perfil del usuario", profileUserDest)
            let profile = profileUserDest.length > 0 ? profileUserDest[0].doc : dataViewProfile;
            setUserDestProfile({ id: paramUserDest.id, profile: profile });
        });
    }

    //Area de FUNCTIONS:
    async function getUser() { return await getDataObject('user_origin'); }

    async function initView() {
        let userOrigin;
        try { userOrigin = await getUser(); setUserOrigin(userOrigin) } catch (error) { setUserOrigin({ id: '', user: '' }) }

        /* let profileUserDest = await getUserById(paramUserDest.id);
        setUserDestProfile({ id: paramUserDest.id, profile: profileUserDest }); */
        getListenerUserByUser()

        /* let allPost = await getAllPostByIdUser(paramUserDest);
        setUserDestPost({ post: allPost }); */
        getListenerPostByUserId()
    }

    async function followUser() {
        /* console.log("Se esta siguiendo al usuario");
        await seguirUser(userOrigin.id, userDestProfile.id); */

        let index = userDestProfile.profile.seguidores.findIndex(element => { return element.id == userOrigin.id })
        if (index == -1) {
            /* alert("Darle follow") */
            await seguirUser(userOrigin.id, userDestProfile.id);
        } else if (index > -1) {
            /* alert("Darle unfollow") */
            await dejarseguirUser(userOrigin.id, userDestProfile.id);
        }
    }


    const [visible, setVisible] = React.useState(false);
    const [list, setList] = React.useState([]);
    function toggleOverlay(list, index) {
        if (typeof list == 'undefined') {
            setList([])
        } else if (list == 'seguidores' || list == 'seguidos') {
            setList(userDestProfile.profile[list]);
        }
        setVisible(!visible);
    };

    //AREA DE COMPONENTES DYNAMICOS
    const ListPublication = () => {
        return (
            <View>
                {
                    userDestPost.post.map((value, index) => {
                        return (
                            <Card key={index} containerStyle={{ borderRadius: 5, backgroundColor: 'rgba(254, 254, 254, 0.8)' }}>
                                {
                                    <View>
                                        <Text style={{ position: 'absolute', right: 4, top: 4 }}>{value.doc.date}</Text>
                                        {(() => {
                                            if (value.doc.user != userDestProfile.profile.user) {
                                                let listComentRepost = typeof value.doc.repost_coment == 'undefined' ? [] : value.doc.repost_coment;
                                                let indexListComentRepost = listComentRepost.findIndex(element => { return element.id == userDestProfile.id });
                                                let comentario = indexListComentRepost == -1 ? '' : listComentRepost[indexListComentRepost].comentario;

                                                return (
                                                    <Text style={{ color: '#154570', fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>{"Reposted: " + comentario}</Text>
                                                );
                                            } else {
                                                return null;
                                            }
                                        })()}
                                        <Card.Title style={{ textAlign: 'left' }}>@{value.doc.user}</Card.Title>
                                        <Text>{value.doc.body}</Text>
                                        {(() => {
                                            if (value.image === '') {
                                                return (<View style={{ paddingVertical: 20 }} />);
                                            } else {
                                                return (
                                                    <View style={{ display: 'flex', alignItems: 'center', paddingVertical: 20 }}>
                                                        <FullWidthImage
                                                            source={{ uri: value.doc.image }}
                                                            style={{ resizeMode: 'contain' }} />
                                                    </View>);
                                            }
                                        })()}
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                                            <Button title={typeof value.doc.likes == 'undefined' ? "like" : `(${value.doc.likes.length}) like`}
                                                onPress={() => controllerLikes(value)}
                                                buttonStyle={{ paddingVertical: 0, backgroundColor: '#FFBB50', borderRadius: 5 }} />
                                            <Button title={typeof value.doc.repost == 'undefined' ? "repost" : `(${value.doc.repost.length}) repost`}
                                                onPress={() => controllerRepost(value)}
                                                buttonStyle={{ paddingVertical: 0, marginStart: 10, backgroundColor: '#FFBB50', borderRadius: 5 }} />
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
        <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(181, 226, 213, 1)' }}>
            <ScrollView>
                <View>
                    <ImageBackground source={imageBg} resizeMode="cover" style={styles.containerView}>
                        <Card containerStyle={{ padding: 0, margin: 0, backgroundColor: 'rgba(254, 254, 254, 0.8)' }}>
                            {
                                <View style={styles.container}>
                                    <Avatar
                                        size="xlarge"
                                        rounded
                                        source={{ uri: userDestProfile.profile.image }}
                                    />
                                    <Card.Title h4={true} style={{ color: '#FFBB50' }}>{userDestProfile.profile.name}</Card.Title>
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
                                        <Button
                                            titleStyle={{ color: '#fff' }}
                                            title={userDestProfile.profile.seguidores?.findIndex(element => { return element.id == userOrigin.id }) > -1 ? "Dejar de seguir" : "Seguir"}
                                            onPress={followUser}
                                            buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
                                    </View>
                                </View>
                            }
                        </Card>

                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 15 }}>
                            <Button title={typeof userDestProfile.profile.seguidores == 'undefined' ? 'Seguidores: 0' : `Seguidores: ${userDestProfile.profile.seguidores.length}`}
                                style={{ marginTop: 0 }}
                                onPress={() => toggleOverlay('seguidores')}
                                buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
                            <Button title={typeof userDestProfile.profile.seguidos == 'undefined' ? 'Seguidos: 0' : `Seguidos: ${userDestProfile.profile.seguidos.length}`}
                                style={{ marginTop: 0 }}
                                onPress={() => toggleOverlay('seguidos')}
                                buttonStyle={{ marginStart: 10, backgroundColor: '#EC4B5F', borderRadius: 8 }} />
                        </View>

                        <Text
                            style={{
                                fontSize: 20, fontWeight: 'bold', backgroundColor: '#FFBB50', margin: 15, padding: 10,
                                textAlign: 'left', color: '#171B24', borderRadius: 8
                            }}>PUBLICACIONES</Text>
                        <ListPublication />
                        <Overlay isVisible={visible} onBackdropPress={toggleOverlay}>
                            <View style={{ width: widthDim - 90, alignItems: 'center' }}>
                                {
                                    (() => {
                                        if (typeof list == 'undefined') {
                                            return (<Text>Why</Text>);
                                        } else if (list.length == 0) {
                                            return (<Text>Lista vacia</Text>);
                                        } else {
                                            return (
                                                <View>
                                                    {
                                                        list.map((value, index) => {
                                                            return (<Text key={index}>{index + 1}. {value.user}</Text>);
                                                        })
                                                    }
                                                </View>
                                            );
                                        }
                                    })()
                                }
                            </View>
                        </Overlay>
                    </ImageBackground>
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
        paddingBottom: 15,
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
        color: '#338960'
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
