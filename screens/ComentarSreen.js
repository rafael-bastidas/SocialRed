import * as React from 'react';
import { ScrollView, SafeAreaView, Platform, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Button, Card, Input, Overlay } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";
import { useIsFocused } from "@react-navigation/core";
import * as ImagePicker from 'expo-image-picker';
import { updatePostById, getUrlPhoto } from '../database/firebase'
import { getDataObject } from '../database/LocalStorage'
import { widthDim } from './DimensionesLayout'


export default function ComentarScreen({ route, navigation }) {

    //GET THE PARAMS { criterios: { accion:'editarComentario', user:userOrigin, post:value } }
    const { criterios } = route.params;

    const imageBg = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };

    //const [userOrigin, setUserOrigin] = React.useState({ id: "", user: "" });
    const isFocused = useIsFocused();
    React.useEffect(async () => {
        if (isFocused) {
            console.log("criterios", criterios);
            if (criterios.accion == "editarComentario") {
                setValueComment({ comment: criterios.post.body });
                criterios.post.image != "" ? setImage(criterios.post.image) : '';
                //Valor del repost
                if (criterios.post.user != criterios.user.user) {
                    let listComentRepost = typeof criterios.post.repost_coment == 'undefined' ? [] : criterios.post.repost_coment;
                    let indexListComentRepost = listComentRepost.findIndex(element => { return element.id == criterios.user.id });
                    if (indexListComentRepost == -1) {
                        setComment('');
                    } else {
                        setComment(listComentRepost[indexListComentRepost].comentario);
                    } 
                }
            }
        }
    }, [isFocused]);

    const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
    function handleToggleOverlay() {
        if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
    }


    const [valueComment, setValueComment] = React.useState({ comment: '' });
    function handleChangeText(name, value) {
        if (value.length < 101) setValueComment({ ...valueComment, [name]: value })
    }
    const [comment, setComment] = React.useState('');
    function handleChangeText2(value) {
        if (value.length < 101) setComment(value)
    }

    function searchComentAndEdit(list, _id, itemList) {
        //Estructura de la lista [{id,comentario}]
        let listValid = typeof list == 'undefined' ? [] : list;
        let indexListValid = listValid.findIndex(element => { return element.id == _id });
        if (indexListValid == -1) {
            listValid.push(itemList);
        } else {
            listValid[indexListValid] = itemList;
        }
        return listValid;
    }

    //Area de FUNCTIONS:

    function validarKeywords() {
        let arrayHastg = valueComment.comment.split(" ");
        arrayHastg = arrayHastg.map(element => { return element.toLocaleLowerCase() })
        return arrayHastg;
    }
    async function addPublication() {

        setLoader({ visible: true, text: 'Registrando mensaje...', Backdrop: false, visibleLoad: true });
        try {
            if (criterios.post.user != criterios.user.user) {
                //ES un REPOST
                let listRepostComent = searchComentAndEdit(criterios.post.repost_coment, criterios.user.id, {id: criterios.user.id, comentario: comment})
                updatePostById(criterios.post.id_post, { repost_coment: listRepostComent });
            } else {
                // ES UN POST PROPIO
                const urlPhoto = image !== '' && !image.includes("firebasestorage") ? await getUrlPhoto(image) : image;
                criterios.post.body = valueComment.comment;
                criterios.post.keywords = validarKeywords();
                criterios.post.image = urlPhoto;
                updatePostById(criterios.post.id_post, { body: criterios.post.body, keywords: criterios.post.keywords, image: criterios.post.image });
            }
            navigation.navigate('Root', { screen: 'TabProfile' });
        } catch (error) {
            console.log("No se guardo");
        }
        setLoader({ ...loader, visible: false });

    }


    const [image, setImage] = React.useState('');
    async function imageComentario() {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            console.log(result);

            if (!result.cancelled) {
                setImage(result.uri);
            } else {
                setImage('');
            }
        } else {
            console.log("es la web");
        }
    }



    const VistaPrevia = () => {

        return (
            <Card>
                {
                    <View>
                        {(() => {
                            if (criterios.post.user != criterios.user.user) {
                                return (
                                    <Text style={{ color: '#154570', fontWeight: 'bold' }}>{comment}</Text>
                                );
                            } else {
                                return null;
                            }
                        })()}
                        <Text style={{ color: '#154570' }}>{valueComment.comment}</Text>
                        {(() => {
                            if (image !== '') {
                                return (
                                    <View style={{ display: 'flex', alignItems: 'center', paddingVertical: 20 }}>
                                        <FullWidthImage
                                            source={{ uri: image }}
                                            style={{ resizeMode: 'contain' }} />
                                    </View>
                                );
                            } else {
                                return null;
                            }
                        })()}
                    </View>
                }
            </Card>
        );

    }

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground source={imageBg} resizeMode="cover" style={{ flex: 1 }}>


                <View style={{ margin: 15, padding: 8, backgroundColor: 'rgba(254, 254, 254, 0.8)', marginTop: 15, borderRadius: 5 }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFBB50' }}>Escribe un comentario:</Text>
                    <Input
                        style={{ color: '#154570' }}
                        placeholder='Max. 100 caracteres'
                        rightIcon={{ color: '#154570', type: 'font-awesome', name: 'image', onPress: () => criterios.post.user != criterios.user.user ? console.log("No eres el usuario propietario del post") : imageComentario() }}
                        value={criterios.post.user != criterios.user.user ? comment : valueComment.comment}
                        onChangeText={value => criterios.post.user != criterios.user.user ? handleChangeText2(value) : handleChangeText('comment', value)} />
                    <Button
                        title="comentar"
                        style={{ width: "100%" }}
                        onPress={() => addPublication()}
                        buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
                </View>

                <VistaPrevia />

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
