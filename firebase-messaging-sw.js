importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD0G3NS5Hofp9DnzRJKgVJ-oRioq47P0c4",
  authDomain: "bus-bages-481b5.firebaseapp.com",
  projectId: "bus-bages-481b5",
  storageBucket: "bus-bages-481b5.firebasestorage.app",
  messagingSenderId: "1043250771775",
  appId: "1:1043250771775:web:42990cc3c56bb55b8b058a"
});

const messaging = firebase.messaging();

// Mostrar notificació quan la app està en segon pla o tancada
messaging.onBackgroundMessage(payload => {
  const { title, body, tripId } = payload.data;
  self.registration.showNotification(title, {
    body: body,
    icon: '/Bus-Bages/icon.png',
    badge: '/Bus-Bages/icon.png',
    tag: tripId,
    data: { tripId }
  });
});
