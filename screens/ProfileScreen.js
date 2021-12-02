import * as React from 'react';
import { ScrollView, StyleSheet, SafeAreaView, Platform, Text, View } from 'react-native';
import { Avatar, Badge, Button, Card, Input } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";

import * as ImagePicker from 'expo-image-picker';


import { addDocToCollection, deletePostById, editUser, getAllPostByIdUser, getUrlPhoto, getUserById } from '../database/firebase'
import { getDataString } from '../database/LocalStorage'

export default function ProfileScreen(props) {

  React.useEffect(() => {
    initView();
    console.log("getinitView-Profile");
  }, []);

  const [valueComment, setValueComment] = React.useState({
    comment: '',
  });

  const [userProfile, setUserProfile] = React.useState({
    id: "",
    profile: {},
  });

  const [userPost, setUserPost] = React.useState({
    post: [],
  });

  const handleChangeText = (name, value) => {
    if (value.length < 601) {
      setValueComment({ ...valueComment, [name]: value });
    }
  }

  const openImagePickerAsync = async () => {
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
  const pickImage = async () => {
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
  async function getIdUser() { return await getDataString('id_user'); }

  async function initView() {
    let idUser;
    try { idUser = await getIdUser(); } catch (error) { idUser = "" }

    let profileUser = await getUserById(idUser);
    setUserProfile({ id: idUser, profile: profileUser });

    let allPost = await getAllPostByIdUser(idUser);
    console.log("allPost", allPost);
    setUserPost({ post: allPost });
  }
  function validarKeywords(){
    let arrayHastg = valueComment.comment.split(" ");
    /* arrayHastg.shift(); */
    return arrayHastg;
  }
  async function addPublication() {

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
  }

  function delPublication(post) {

    deletePostById(typeof post.id_post === 'undefined' ? '' : post.id_post);
    let listPost = userPost.post;
    listPost.splice(listPost.indexOf(post), 1);
    console.log("Se elimino el post");
    setUserPost({ post: listPost });

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

  //AREA DE COMPONENTES DYNAMICOS

  const ListPublication = () => {
    return (
      <View>
        {
          userPost.post.map((value, index) => {
            return (
              <Card key={index}>
                {
                  <View>
                    <Badge
                      onPress={() => delPublication(value)}
                      status="error"
                      value={<Text style={{ margin: 8, fontSize: 24, backgroundColor:'#fff' }}>X</Text>}
                      containerStyle={{ position: 'absolute', top: -4, right: -4, padding: 8 }}
                    />
                    <Card.Title style={{ textAlign: 'left' }}>@{value.user}</Card.Title>
                    <Text>{value.body}</Text>
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
    <SafeAreaView style={styles.containerSafeAreaView}>
      <ScrollView>
        <View style={styles.containerView}>
          <Card containerStyle={{ padding: 0, margin: 0, backgroundColor: 'rgba(157, 219, 201, 1)' }}>
            {
              <View style={styles.container}>
                <Avatar
                  size="xlarge"
                  rounded
                  onPress={() => openImagePickerAsync()}
                  source={{ uri: userProfile.profile.image === '' ? 'https://thumbs.dreamstime.com/b/vector-de-usuario-redes-sociales-perfil-avatar-predeterminado-retrato-vectorial-del-176194876.jpg' : userProfile.profile.image }}
                />
                <Card.Title h4={true} style={{ color: '#338960' }}>{userProfile.profile.name}</Card.Title>
                <Text style={{ fontStyle: 'normal', textAlign: 'center', color: '#154570' }}>Bio: {userProfile.profile.bio}</Text>
                <Text style={{ fontStyle: 'normal', textAlign: 'left', marginTop: 10, color: '#154570' }}>Genero: {userProfile.profile.gender}</Text>
                <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>Cumpleaños: {userProfile.profile.birthday}</Text>
                <Text style={{ fontStyle: 'normal', textAlign: 'left', color: '#154570' }}>Ubicación: {userProfile.profile.location}</Text>

                <View style={{ marginTop: 15, width: "100%" }}>
                  <Button title="Editar"
                    onPress={() => props.navigation.navigate('EditProfile')} />
                </View>
              </View>
            }
          </Card>

          <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', padding: 15 }}>
            <Button title="Seguidores: 0"
              onPress={() => console.log('Mostrar lista de seguidores')} />
            <Button title="Seguidos 0"
              onPress={() => console.log('Mostrar lista de seguidos')} />
          </View>

          <View style={{ padding: 15 }}>
            <Text style={styles.title}>Escribe un comentario:</Text>
            <Input
              style={{ color: '#154570' }}
              placeholder='Max. 600 caracteres'
              rightIcon={{ color:'#154570', type: 'font-awesome', name: 'image', onPress: () => imageComentario() }}
              value={valueComment.comment}
              onChangeText={value => handleChangeText('comment', value)} />
            <Button
              title="comentar"
              style={{ width: "100%" }}
              onPress={() => addPublication()} />
          </View>

          <VistaPrevia />

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
    paddingBottom: 15,
    backgroundColor: 'rgba(181, 226, 213, 1)',
  },
  container: {
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15
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
    alignSelf: 'center'
  },
});
