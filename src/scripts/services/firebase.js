import * as firebase from 'firebase'
firebase.initializeApp({
  apiKey: 'AIzaSyClQ5Hz1TiJQIcF834ntsVLRXbQkZ1lkYg',
  authDomain: 'feedback-ae1a2.firebaseapp.com',
  databaseURL: 'https://feedback-ae1a2.firebaseio.com',
  projectId: 'feedback-ae1a2',
  storageBucket: 'feedback-ae1a2.appspot.com',
  messagingSenderId: '421778894917'
})

export default {
  authenticated () {
    return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ 'interactive': true }, (token) => {
        var credential = firebase.auth.GoogleAuthProvider.credential(null, token)
        firebase.auth().signInWithCredential(credential).then((user) => {
          resolve()
        })
      })
    })
  }
}
