import * as React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Platform, Text, View, ActivityIndicator, ImageBackground } from 'react-native';
import { Avatar, Button, Card, Input, Overlay } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";
import { useIsFocused } from "@react-navigation/core";
import * as ImagePicker from 'expo-image-picker';
import { addDocToCollection, deletePostById, updatePostById, editUser, getAllPostByIdUser, getUrlPhoto, getUserById } from '../database/firebase'
import { getDataObject } from '../database/LocalStorage'
import { widthDim } from './DimensionesLayout'


export default function ProfileScreen({ route, navigation }) {

  const imageBg = { uri: "https://rafaelbastidas.com/apis/api-music/media/bg-1.png" };

  const [userOrigin, setUserOrigin] = React.useState({ id: "", user: "" });
  const isFocused = useIsFocused();
  React.useEffect(async () => {
    if (isFocused) {
      let user = await getDataObject('user_origin')
      setUserOrigin(user)
      initView(user);
    }
  }, [isFocused]);

  const [loader, setLoader] = React.useState({ visible: false, text: 'Cargando...', Backdrop: true, visibleLoad: false });
  function handleToggleOverlay() {
    if (loader.Backdrop) setLoader({ ...loader, visible: !loader.visible })
  }


  const [valueComment, setValueComment] = React.useState({ comment: '' });
  function handleChangeText(name, value) {
    if (value.length < 601) setValueComment({ ...valueComment, [name]: value })
  }

  async function openImagePickerAsync() {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
      pickImage();
    } else {
      console.log("es la web");
    }
  };
  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      const urlPhoto = await getUrlPhoto(result.uri);
      await editUser({ image: urlPhoto }, userProfile.id);
      const aux = userProfile.profile;
      aux.image = urlPhoto;
      setUserProfile({ ...userProfile, profile: aux });
    }
  };

  //Area de FUNCTIONS:
  const [userProfile, setUserProfile] = React.useState({ id: "", profile: {} });
  const [userPost, setUserPost] = React.useState({ post: [] });
  async function initView(user) {
    let idUser = userOrigin.id != "" ? userOrigin.id : user.id; console.log(idUser);
    let profileUser = await getUserById(idUser);
    setUserProfile({ id: idUser, profile: profileUser });

    let allPost = await getAllPostByIdUser(user);
    console.log("allPost", allPost);
    setUserPost({ post: allPost });
  }
  function validarKeywords() {
    let arrayHastg = valueComment.comment.split(" ");
    arrayHastg = arrayHastg.map(element => { return element.toLocaleLowerCase() })
    return arrayHastg;
  }
  async function addPublication() {
    if (valueComment.comment != '' || image !== '') {
      setLoader({ visible: true, text: 'Registrando mensaje...', Backdrop: false, visibleLoad: true });
      const urlPhoto = image !== '' ? await getUrlPhoto(image) : '';
      let newPost = {
        id_user: userProfile.id,
        user: userProfile.profile.user,
        body: valueComment.comment,
        image: urlPhoto,
        date: new Date().toLocaleDateString('nl', { year: 'numeric', month: '2-digit', day: 'numeric' }),
        keywords: validarKeywords(),
        likes: [],
        repost: []
      };
      try {
        let id_post = await addDocToCollection('post', newPost);
        let mergeNewPost = { ...newPost, id_post: id_post };
        let newArrayPost = userPost.post;
        newArrayPost.unshift(mergeNewPost);
        setUserPost({ post: newArrayPost });
        setImage(''); setValueComment({ comment: '' });
      } catch (error) {
        console.log("No se guardo");
      }
      setLoader({ ...loader, visible: false });
    } else {
      setLoader({ visible: true, text: 'No hay nada para compartir', Backdrop: true, visibleLoad: false });
    }
  }

  function delPublication(post) {
    setLoader({ visible: true, text: 'Borrando mensaje...', Backdrop: false, visibleLoad: true });
    let iddelPost = typeof post.id_post === 'undefined' ? '' : post.id_post
    if (post.id_user == userProfile.id) {
      deletePostById(iddelPost)
    } else {
      let index = post.repost.findIndex(element => { return element.id == userOrigin.id })
      /* console.log(index) */
      index != -1 ? post.repost.splice(index, 1) : post;
      //Se borra el comentario REPOSTED en caso de existir
      let listComentRepost = typeof post.repost_coment == 'undefined' ? [] : post.repost_coment;
      let indexListComentRepost = listComentRepost.findIndex(element => { return element.id == userOrigin.id });
      indexListComentRepost == -1 ? '' : post.repost_coment.splice(indexListComentRepost, 1);
      //Se actualiza
      updatePostById(iddelPost, post)
    }
    let listPost = userPost.post;
    listPost.splice(listPost.indexOf(post), 1);
    console.log("Se elimino el post");
    setUserPost({ post: listPost });
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

  const [visible, setVisible] = React.useState(false);
  const [list, setList] = React.useState([]);
  function toggleOverlay(list, index) {
    if (typeof list == 'undefined') {
      setList([])
    } else if (list == 'seguidores' || list == 'seguidos') {
      setList(userProfile.profile[list]);
    } else if (list == 'likes') {
      setList(userPost.post[index].likes)
    } else if (list == 'repost') {
      setList(userPost.post[index].repost)
    }
    setVisible(!visible);
  };

  //AREA DE COMPONENTES DYNAMICOS

  const ListPublication = () => {
    return (
      <View>
        {
          userPost.post.map((value, index) => {
            return (
              <Card key={index} containerStyle={{ borderRadius: 5, backgroundColor: 'rgba(254, 254, 254, 0.8)' }}>
                {
                  <View>
                    <Text style={{ position: 'absolute', right: 4, top: 4 }}>{value.date}</Text>
                    {(() => {
                      if (value.user != userOrigin.user) {
                        let listComentRepost = typeof value.repost_coment == 'undefined' ? [] : value.repost_coment;
                        let indexListComentRepost = listComentRepost.findIndex(element => { return element.id == userOrigin.id });
                        let comentario = indexListComentRepost == -1 ? '' : listComentRepost[indexListComentRepost].comentario;
                        
                        return (
                          <Text style={{ color: '#154570', fontWeight: 'bold', marginTop: 16, marginBottom: 8 }}>{"Reposted: " + comentario}</Text>
                        );
                      } else {
                        return null;
                      }
                    })()}
                    <Card.Title style={{ textAlign: 'left' }}>@{value.user}</Card.Title>
                    <Text style={{ marginStart: 10 }}>{value.body}</Text>
                    {(() => {
                      if (value.image === '') {
                        return (<View style={{ paddingVertical: 20 }} />);
                      } else {
                        return (
                          <View style={{ display: 'flex', alignItems: 'center', paddingVertical: 20 }}>
                            <FullWidthImage
                              source={{ uri: value.image }}
                              style={{ resizeMode: 'contain' }} />
                          </View>);
                      }
                    })()}

                    <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
                      <Button title={`(${value.likes.length}) like`}
                        buttonStyle={{ paddingVertical: 0, backgroundColor: '#FFBB50', borderRadius: 5 }}
                        onPress={() => toggleOverlay('likes', index)} />
                      <Button title={`(${value.repost.length}) repost`}
                        buttonStyle={{ paddingVertical: 0, marginStart: 10, backgroundColor: '#FFBB50', borderRadius: 5 }}
                        onPress={() => toggleOverlay('repost', index)} />
                      <Button
                        onPress={() => navigation.navigate('Comentar', { criterios: { accion: 'editarComentario', user: userOrigin, post: value } })}
                        buttonStyle={{ paddingVertical: 0, marginStart: 10, backgroundColor: '#b50000ff', borderRadius: 5 }}
                        title={'editar'} />
                      <Button
                        onPress={() => delPublication(value)}
                        buttonStyle={{ paddingVertical: 0, marginStart: 10, backgroundColor: '#b50000ff', borderRadius: 5 }}
                        title={'borrar'} />
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

  const VistaPrevia = () => {
    if (valueComment.comment.length > 0 || image !== '') {
      return (
        <Card>
          {
            <View>
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
    } else {
      return null;
    }
  }

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
                    onPress={() => openImagePickerAsync()}
                    source={{ uri: userProfile.profile.image === '' ? 'https://thumbs.dreamstime.com/b/vector-de-usuario-redes-sociales-perfil-avatar-predeterminado-retrato-vectorial-del-176194876.jpg' : userProfile.profile.image }}
                  />
                  <Card.Title h4={true} style={{ color: '#FFBB50' }}>{userProfile.profile.name}</Card.Title>
                  <Text style={{ fontStyle: 'normal', textAlign: 'center', color: '#154570' }}>Bio: {userProfile.profile.bio}</Text>
                  <Text style={{ fontStyle: 'normal', textAlign: 'left', marginTop: 10, color: '#154570' }}>Genero: {userProfile.profile.gender}</Text>
                  <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>Cumpleaños: {userProfile.profile.birthday}</Text>
                  <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>Ubicación: {userProfile.profile.location}</Text>

                  <View style={{ marginTop: 15, width: "100%" }}>
                    <Button title="Editar"
                      titleStyle={{ color: '#fff' }}
                      onPress={() => navigation.navigate('EditProfile')}
                      buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
                  </View>
                </View>
              }
            </Card>

            <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 15 }}>
              <Button title={typeof userProfile.profile.seguidores == 'undefined' ? 'Seguidores: 0' : `Seguidores: ${userProfile.profile.seguidores.length}`}
                onPress={() => toggleOverlay('seguidores')}
                buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
              <Button title={typeof userProfile.profile.seguidos == 'undefined' ? 'Seguidos: 0' : `Seguidos: ${userProfile.profile.seguidos.length}`}
                onPress={() => toggleOverlay('seguidos')}
                buttonStyle={{ marginStart: 10, backgroundColor: '#EC4B5F', borderRadius: 8 }} />
            </View>

            <View style={{ margin: 15, padding: 8, backgroundColor: 'rgba(254, 254, 254, 0.8)', marginTop: 15, borderRadius: 5 }}>
              <Text style={styles.title}>Escribe un comentario:</Text>
              <Input
                style={{ color: '#154570' }}
                placeholder='Max. 600 caracteres'
                rightIcon={{ color: '#154570', type: 'font-awesome', name: 'image', onPress: () => imageComentario() }}
                value={valueComment.comment}
                onChangeText={value => handleChangeText('comment', value)} />
              <Button
                title="comentar"
                style={{ width: "100%" }}
                onPress={() => addPublication()}
                buttonStyle={{ backgroundColor: '#EC4B5F', borderRadius: 8 }} />
            </View>

            <VistaPrevia />

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
    justifyContent: "space-around",
    marginTop: 10
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFBB50',
  },
  subtitle: {
    fontStyle: 'normal',
    textAlign: 'justify',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    alignSelf: 'center'
  },
});
