// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyBnLV4fGpCdmvmSE_O3yvNzK2p0rOgrkng",
    authDomain: "red-social-rafael-carrizalez.firebaseapp.com",
    projectId: "red-social-rafael-carrizalez",
    storageBucket: "red-social-rafael-carrizalez.appspot.com",
    messagingSenderId: "746077450078",
    appId: "1:746077450078:web:cf28bf26451cefabf769cf"
};

// Initialize Firebase
initializeApp(firebaseConfig);
const db = getFirestore();
const storage = getStorage();
export const colectionref = collection(db, "post");
export const colectionrefUser = collection(db, "users");


export async function getUrlPhoto(uri) {
    // Why are we using XMLHttpRequest? See:
    // https://github.com/expo/expo/issues/2402#issuecomment-443726662
    const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
            resolve(xhr.response);
        };
        xhr.onerror = function (e) {
            console.log(e);
            reject(new TypeError("Network request failed"));
        };
        xhr.responseType = "blob";
        xhr.open("GET", uri, true);
        xhr.send(null);
    });

    
    const fileRef = ref(storage, `image${new Date().getTime()}`);
    const result = await uploadBytes(fileRef, blob);

    // We're done with the blob, close and release it
    blob.close();

    const url = await getDownloadURL(fileRef);
    console.log("url", url);
    return url;
}

export async function addDocToCollection(nameCollection, doc) {

    try {
        const docRef = await addDoc(collection(db, nameCollection), doc);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "undefined";
    }

};

export async function readAllCollection(nameCollection, clausula_query) {

    let response = [];
    const collectionRef = collection(db, nameCollection);
    let querySnapshot;
    console.log("clausula_query", typeof clausula_query);
    if (typeof clausula_query === 'undefined') {
        querySnapshot = await getDocs(collectionRef);
    } else {
        const q = query(collectionRef, where(clausula_query.field,clausula_query.operator,clausula_query.value));
        querySnapshot = await getDocs(q);
    }
    
    querySnapshot.forEach((doc) => {
        response.push({ id: doc.id, doc: doc.data() });
    });
    
    return response;

};

export async function getUserById(id) {

    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return {};
    }
    
};

export async function getPostById(id) {

    const docRef = doc(db, "post", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return {};
    }
    
};

export async function getAllPostByIdUser(user) {
console.log(user);
    let response1 = [];
    let response2 = [];
    const collectionRef = collection(db, 'post');
    const q1 = query(collectionRef, where("id_user", "==", user.id));
    const q2 = query(collectionRef, where("repost", "array-contains", user));
    const querySnapshot1 = await getDocs(q1);
    const querySnapshot2 = await getDocs(q2);
    querySnapshot1.forEach((doc) => {
        response1.push({ ...doc.data(), id_post: doc.id });
    });
    querySnapshot2.forEach((doc) => {
        response2.push({ ...doc.data(), id_post: doc.id });
    });
    const response = response1.concat(response2);
    return response;
}

export async function validUser(user, password) {

    let response = [];
    const collectionRef = collection(db, 'users');
    const q = query(collectionRef, where("user", "==", user), where("password", "==", password));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        response.push({ id: doc.id, doc: doc.data() });
    });
    return response;

};

export async function editUser(document, id) {

    const idRef = doc(db, 'users', id);
    setDoc(idRef, document, { merge: true });
}

export async function registerUser(doc) {

    let response = [];
    const collectionRef = collection(db, 'users');
    const q = query(collectionRef, where("user", "==", doc.user));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        response.push({ id: doc.id, doc: doc.data() });
    });

    if (response.length === 1) {
        return "user-registered";
    } else {
        try {
            const docRef = await addDoc(collection(db, "users"), doc);
            return docRef.id;
        } catch (e) {
            console.error("Error adding document: ", e);
            return "undefined";
        }
    }

};

export async function deletePostById(id) {
    
    let resp = await deleteDoc(doc(db, "post", id));
    console.log(resp);
}
export async function updatePostById(id,document) {
    
    const idRef = doc(db, 'post', id);
    console.log("Documento.. ",document);
    let resp = setDoc(idRef, document, { merge: true });
    console.log(resp);
}



// FUNCIONES PARA SEGUIR O DEJAR DE SEGUIR:
export async function seguirUser(idOrigin, idDest){
    
    let datosUserOrigin = await getUserById(idOrigin);
    let datosUserDest = await getUserById(idDest);

    datosUserOrigin.seguidos.push({ id:idDest, user:datosUserDest.user });
    datosUserDest.seguidores.push({ id:idOrigin, user:datosUserOrigin.user });

    const idRefOrigin = doc(db, 'users', idOrigin);
    setDoc(idRefOrigin, datosUserOrigin, { merge: true });

    const idRefDest = doc(db, 'users', idDest);
    setDoc(idRefDest, datosUserDest, { merge: true });
}
export async function dejarseguirUser(idOrigin, idDest){
    let datosUserOrigin = await getUserById(idOrigin);
    let datosUserDest = await getUserById(idDest);

    let indexUserOrigin = datosUserOrigin.seguidos.findIndex(element => { return element.id == idDest })
    let indexUserDest = datosUserDest.seguidores.findIndex(element => { return element.id == idOrigin })

    indexUserOrigin > -1 ? datosUserOrigin.seguidos.splice(indexUserOrigin,1) : console.log("No q Linea aprox 228")
    indexUserDest > -1 ? datosUserDest.seguidores.splice(indexUserDest,1) : console.log("No q Linea aprox 229")

    const idRefOrigin = doc(db, 'users', idOrigin);
    setDoc(idRefOrigin, datosUserOrigin, { merge: true });

    const idRefDest = doc(db, 'users', idDest);
    setDoc(idRefDest, datosUserDest, { merge: true });
}

// FUNCIONES PARA CONTROL DE LIKES:
export async function likePost(idPost, user){
    
    let datosPost = await getPostById(idPost);

    const index = datosPost.likes.findIndex(element => element.id == user.id);
    console.log("Index encontrado.. ",index, datosPost);
    if (index == -1) {
        datosPost.likes.push(user);
    } else {
        datosPost.likes.splice(index, 1);
    }
    const idRefPost = doc(db, 'post', idPost);
    setDoc(idRefPost, datosPost, { merge: true });
}

// FUNCIONES PARA CONTROL DE REPOST:
export async function rePost(idPost, user){
    
    let datosPost = await getPostById(idPost);

    const index = datosPost.repost.findIndex(element => element.id == user.id);
    if (index == -1) {
        datosPost.repost.push(user);
    } else {
        datosPost.repost.splice(index, 1);
    }
    const idRefPost = doc(db, 'post', idPost);
    setDoc(idRefPost, datosPost, { merge: true });
}

