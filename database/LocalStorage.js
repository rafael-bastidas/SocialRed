import AsyncStorage from '@react-native-async-storage/async-storage';

export async function storeDataString(key, value) {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        // saving error
    }
}

export async function getDataString(key) {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) {
            return value;
        } else {
            return 'undefined';
        }
    } catch (e) {
        return 'undefined';
    }
}

export async function storeDataObject(key, value) {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        return 'undefined';
    }
}

export async function getDataObject(key) {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : 'undefined';
    } catch (e) {
        return 'undefined';
    }
}
