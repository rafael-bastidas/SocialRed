import * as React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar, Button, Card, CheckBox, Input } from 'react-native-elements';
import FullWidthImage from "react-native-fullwidth-image";

import { readAllCollection } from '../database/firebase';

export default function SearchScreen(props) {

  const [valueSearch, setValueSearch] = React.useState('');
  function handleChangeText(value) { setValueSearch(value); }


  const [checkers, setCheckers] = React.useState({ users: true, post: false });
  function controllerCheck(check) {
    check === 'users' ? setCheckers({ users: true, post: false }) : setCheckers({ users: false, post: true });
  }

  const [listUser, setListUser] = React.useState([]);
  const [listPost, setListPost] = React.useState([]);
  async function buscar() {
    let dataList = [];
    let argument = checkers.users ? { field: 'array_user', operator: 'array-contains', value: valueSearch } :
      { field: 'keywords', operator: 'array-contains', value: valueSearch };
    try {
      dataList = await readAllCollection(checkers.users ? 'users' : 'post', argument);
      console.log("Resultado de las busquedas:", dataList);
    } catch (error) {
      console.log("Ocurrio un error al leer lacoleccion");
    }
    checkers.users ? setListUser(dataList) : setListPost(dataList);
  }



  //AREA DE COMPONENTES DYNAMICOS
  const ListaUsuarios = () => {
    if (listUser.length === 0) {
      return (
        <View style={{ height:'100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text>No found</Text>
        </View>
      );
    } else {
      return (
        <View style={{ width: '100%' }}>
          {
            listUser.map((value, index) => {
              return (
                <Pressable key={index} onPress={() => props.navigation.navigate('ViewProfile', { paramUserDest: { id: value.id, user: value.doc.user } })}>
                  <Card>
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
      );
    }
  }

  const ListaPublicaciones = () => {
    if (listPost.length === 0) {
      return (
        <View style={{ height:'100%', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
          <Text>No found</Text>
        </View>
      );
    } else {
    return (
      <View style={{ width: '100%' }}>
        {
          listPost.map((value, index) => {
            return (
              <Card key={index}>
                {
                  <View>
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
                        <Button title="like"
                          onPress={() => console.log("Like")} />
                        <Button title="Repost"
                          style={{ marginStart: 10 }}
                          onPress={() => console.log("Like")} />
                      </View>
                      <Text style={{ display: 'flex', alignSelf: 'center' }}>{value.doc.date}</Text>
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
        <View style={{paddingBottom:15}}>
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

          {(
            () => {
              if (checkers.users) {
                return (<ListaUsuarios />);
              } else if (checkers.post) {
                return (<ListaPublicaciones />);
              }
            }
          )()}
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
