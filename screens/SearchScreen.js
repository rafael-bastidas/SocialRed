import * as React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, ImageBackground, ActivityIndicator } from 'react-native';
import { Avatar, Button, Card, CheckBox, Input, Overlay } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";
import { widthDim } from './DimensionesLayout'
import { readAllCollection, likePost, rePost, updatePostById, colectionref } from '../database/firebase';
import { useIsFocused } from "@react-navigation/core";
import { getDataObject } from '../database/LocalStorage';

import { query, onSnapshot, where } from "firebase/firestore";

export default function SearchScreen(props) {

  const image = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };

  const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
  function handleToggleOverlay() {
    if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
  }

  const [valueSearch, setValueSearch] = React.useState('');
  function handleChangeText(value) { setValueSearch(value); }


  const [checkers, setCheckers] = React.useState({ users: true, post: false });
  function controllerCheck(check) {
    check === 'users' ? setCheckers({ users: true, post: false }) : setCheckers({ users: false, post: true });
  }

  const [listUser, setListUser] = React.useState([]);
  const [listPost, setListPost] = React.useState([]);
  async function buscar() {
    /* setLoader({ visible: true, text: 'Buscando...', Backdrop: false, visibleLoad: true });
    let dataList = [];
    let argument = checkers.users ? { field: 'array_user', operator: 'array-contains', value: valueSearch.toLocaleLowerCase() } :
      { field: 'keywords', operator: 'array-contains', value: valueSearch.toLocaleLowerCase() };
    try {
      dataList = await readAllCollection(checkers.users ? 'users' : 'post', argument);
      console.log("Resultado de las busquedas:", dataList);
    } catch (error) {
      console.log("Ocurrio un error al leer lacoleccion");
    }
    checkers.users ? setListUser(dataList) : setListPost(dataList);
    setLoader({ ...loader, visible: false }); */
    setLoader({ visible: true, text: 'Buscando...', Backdrop: false, visibleLoad: true });
    let dataList = []
    let argument = {}
    if (checkers.users) {
      try {
        argument = { field: 'array_user', operator: 'array-contains', value: valueSearch.toLocaleLowerCase() }
        dataList = await readAllCollection('users', argument);
        setListUser(dataList)
        console.log("Resultado de las busquedas:", dataList);
      } catch (error) {
        console.log("Ocurrio un error al leer la coleccion");
      }
    } else if (checkers.post) {
      argument = { field: 'keywords', operator: 'array-contains', value: valueSearch.toLocaleLowerCase() }
      cargarPostCustom(argument);
    }
    setLoader({ ...loader, visible: false });
  }
  function cargarPostCustom(clausula_query) {
    const q = query(colectionref, where(clausula_query.field,clausula_query.operator,clausula_query.value));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allPost = [];
      querySnapshot.forEach((doc) => {
        allPost.push({ id: doc.id, doc: doc.data() });
      });
      console.log("Result-Posts", allPost)
      setListPost(allPost);
    });
  }

  //Inicializar vista
  const [userOrigin, setUserOrigin] = React.useState({ id: "", user: "" });
  const isFocused = useIsFocused();
  React.useEffect(async () => {
    if (isFocused) {
      const user = await getDataObject('user_origin');
      setUserOrigin(user);
    }
  }, [isFocused]);

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
  }

  //Manejo de repost
  async function controllerRepost(post) {
    let iddelPost = typeof post.id === 'undefined' ? '' : post.id
    console.log(iddelPost, userOrigin)
    let index = post.doc.repost.findIndex(element => { return element.id == userOrigin.id })
    if (index == -1) {
      /* alert("Darle like") */
      await rePost(post.id, userOrigin);
    } else if (index > -1) {
      /* alert("Darle unlike") */
      post.doc.repost.splice(index, 1)
      updatePostById(post.id, post.doc);
    }
  }

  //AREA DE COMPONENTES DYNAMICOS
  const ListaUsuarios = () => {
    if (listUser.length === 0) {
      return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text>No found</Text>
        </View>
      );
    } else {
      return (
        <ScrollView>
          <View style={{ width: '100%' }}>
            <Text
              style={{
                fontSize: 20, fontWeight: 'bold', backgroundColor: '#FFBB50', marginTop: 20, marginHorizontal: 10, padding: 10,
                textAlign: 'left', color: '#171B24', borderRadius: 8
              }}>Resultados</Text>
            {
              listUser.map((value, index) => {
                return (
                  <Pressable key={index} onPress={() => props.navigation.navigate('ViewProfile', { paramUserDest: { id: value.id, user: value.doc.user } })}>
                    <Card containerStyle={{ backgroundColor: 'rgba(254, 254, 254, 0.8)', borderRadius: 8 }}>
                      {
                        <View style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                          <Avatar
                            size="medium"
                            rounded
                            source={{ uri: value.doc.image === '' ? 'https://thumbs.dreamstime.com/b/vector-de-usuario-redes-sociales-perfil-avatar-predeterminado-retrato-vectorial-del-176194876.jpg' : value.doc.image }}
                          />
                          <View style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                            <Card.Title style={{ paddingLeft: 10, textAlign: 'left', marginBottom: 0, fontSize: 20 }}>@{value.doc.user}</Card.Title>
                          </View>
                        </View>
                      }
                    </Card>
                  </Pressable>
                );
              })
            }
          </View>
        </ScrollView>
      );
    }
  }

  const ListaPublicaciones = () => {
    if (listPost.length === 0) {
      return (
        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text>No found</Text>
        </View>
      );
    } else {
      return (
        <ScrollView>
          <View style={{ width: '100%' }}>
            <Text
              style={{
                fontSize: 20, fontWeight: 'bold', backgroundColor: '#FFBB50', marginTop: 20, marginHorizontal: 10, padding: 10,
                textAlign: 'left', color: '#171B24', borderRadius: 8
              }}>Resultados</Text>
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
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
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
        </ScrollView>
      );
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={image} resizeMode="cover" style={{ paddingBottom: 15, flex: 1 }}>
        <Text
          style={{
            fontSize: 20, fontWeight: 'bold', backgroundColor: '#FFBB50', margin: 10, padding: 10,
            textAlign: 'left', color: '#171B24', borderRadius: 8
          }}>ENCUENTRA A TUS AMIGOS</Text>
        <View style={{ backgroundColor: 'rgba(254, 254, 254, 0.8)', borderRadius: 5, marginHorizontal: 10 }}>
          <Input
            style={{ color: '#154570' }}
            placeholder='Buscar...'
            rightIcon={{ color: '#154570', type: 'font-awesome', name: 'search', onPress: buscar }}
            value={valueSearch}
            onChangeText={value => handleChangeText(value)} />

          <View style={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
            <CheckBox
              containerStyle={{ backgroundColor: 'rbga(0,0,0,0)', borderColor: 'transparent' }}
              textStyle={{ color: '#154570' }}
              center
              title='Usuarios'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={checkers.users}
              onPress={() => controllerCheck('users')} />
            <CheckBox
              containerStyle={{ backgroundColor: 'rbga(0,0,0,0)', borderColor: 'transparent' }}
              textStyle={{ color: '#154570' }}
              center
              title='Publicaciones'
              checkedIcon='dot-circle-o'
              uncheckedIcon='circle-o'
              checked={checkers.post}
              onPress={() => controllerCheck('post')} />
          </View>
        </View>

        {(
          () => {
            if (checkers.users) {
              return (<ListaUsuarios />);
            } else if (checkers.post) {
              return (<ListaPublicaciones />);
            }
          }
        )()}
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
  containerSafeAreaView: {
    flex: 1,
  },
  containerView: {
    backgroundColor: 'rgba(181, 226, 213, 1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
