// Initialize your Web app as described in the Get started for Web
// Firebase previously initialized using firebase.initializeApp().
var db = firebase.firestore();
if (location.hostname === "localhost") {
  db.useEmulator("localhost", 8080);
}
firebase.functions().useEmulator("localhost", 5001);
