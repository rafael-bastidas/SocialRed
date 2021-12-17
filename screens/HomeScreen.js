import * as React from 'react';
import { SafeAreaView, ScrollView, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Button, Card, Overlay } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";
import { useIsFocused } from "@react-navigation/core";
import { readAllCollection, likePost, rePost, updatePostById, colectionref } from '../database/firebase';
import { getDataObject } from '../database/LocalStorage';
import { widthDim } from './DimensionesLayout'
import { query, onSnapshot } from "firebase/firestore";


export default function HomeScreen({ route, navigation }) {

  const image = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };
  const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
  function handleToggleOverlay() {
    if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
  }

  function cargarPostCustom() {
    setLoader({ visible: true, text: 'Actualizando...', Backdrop: false, visibleLoad: true });
    const q = query(colectionref);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allPost = [];
      querySnapshot.forEach((doc) => {
        allPost.push({ id: doc.id, doc: doc.data() });
      });
      console.log("allPost", allPost)
      setListPost(allPost);
    });
    setLoader({ ...loader, visible: false });
  }

  //Inicializar vista
  const [userOrigin, setUserOrigin] = React.useState({ id: "", user: "" });
  const isFocused = useIsFocused();
  React.useEffect(async () => {
    if (isFocused) {
      /* cargarPost(); */ cargarPostCustom();
      const user = await getDataObject('user_origin');
      setUserOrigin(user);
    }
  }, [isFocused]);

  //Estado de carga
  const [flatLoading, setFlatLoading] = React.useState(false);

  //Carga de post
  const [listPost, setListPost] = React.useState([]);
  /* async function cargarPost() {
    setFlatLoading(true);
    let dataList = [];
    try {
      dataList = await readAllCollection('post');
      console.log("Resultado de las busquedas:", dataList);
    } catch (error) {
      console.log("Ocurrio un error al leer la coleccion");
    }
    setListPost(dataList);
    setFlatLoading(false);
  } */

  //Manejo de likes
  async function controllerLikes(post) {

    let iddelPost = typeof post.id === 'undefined' ? '' : post.id
    console.log(iddelPost, userOrigin)
    let index = post.doc.likes.findIndex(element => { return element.id == userOrigin.id })
    if (index == -1) {
      /* alert("Darle like") */
      await likePost(post.id, userOrigin);
    } else if (index > -1) {
      /* alert("Darle unlike") */
      post.doc.likes.splice(index, 1)
      updatePostById(post.id, post.doc);
    }
    /* let listPost = userPost.post;
    listPost.splice(listPost.indexOf(post), 1);
    console.log("Se elimino el post");
    setUserPost({ post: listPost }); */
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

  //AREA DE COMPONENTES DYNAMICOS
  const ListaPublicaciones = () => {
    if (listPost.length === 0) {
      return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text>No hay post</Text>
        </View>
      );
    } else {
      return (
        <View style={{ width: '100%' }}>
          {
            listPost.map((value, index) => {
              return (
                <Card key={index} containerStyle={{ backgroundColor: 'rgba(254, 254, 254, 0.8)', borderRadius: 8 }}>
                  {
                    <View>
                      <Text style={{ position: 'absolute', right: 4, top: 4 }}>{value.doc.date}</Text>
                      <Card.Title style={{ textAlign: 'left' }}>@{value.doc.user}</Card.Title>
                      <Text>{value.doc.body}</Text>
                      {(() => {
                        if (value.doc.image === '') {
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
                      <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
                          <Button title={typeof value.doc.likes == 'undefined' ? "like" : `(${value.doc.likes.length}) like`}
                            onPress={() => controllerLikes(value)}
                            buttonStyle={{ paddingVertical: 0, backgroundColor: '#FFBB50', borderRadius: 5 }} />
                          <Button title={typeof value.doc.repost == 'undefined' ? "repost" : `(${value.doc.repost.length}) repost`}
                            style={{ marginStart: 10 }}
                            onPress={() => controllerRepost(value)}
                            buttonStyle={{ paddingVertical: 0, marginStart: 10, backgroundColor: '#FFBB50', borderRadius: 5 }} />
                        </View>
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
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(181, 226, 213, 1)' }}>
      <ScrollView>
        <View style={{ paddingBottom: 15 }}>
          <ImageBackground source={image} resizeMode="cover" style={{ flex: 1 }}>
            <ListaPublicaciones />
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
    </SafeAreaView>
  );
}
