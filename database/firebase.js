// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
const firebaseConfig = {
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
    if (typeof clausula_query === 'undefined') {
        querySnapshot = await getDocs(collectionRef);
    } else {
        console.log(clausula_query);
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

export async function getAllPostByIdUser(id) {

    let response = [];
    const collectionRef = collection(db, 'post');
    const q = query(collectionRef, where("id_user", "==", id));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        response.push({ ...doc.data(), id_post: doc.id });
    });
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