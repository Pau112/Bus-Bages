const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// S'activa quan s'afegeix un nou event de notificació
exports.sendPushNotification = functions.firestore
  .document("notif_events/{eventId}")
  .onCreate(async (snap) => {
    const { tripId, title, body, kind } = snap.data();

    // Buscar tots els tokens subscrits a aquest tripId
    const subsSnap = await admin.firestore()
      .collection("subscriptions")
      .where("tripId", "==", tripId)
      .get();

    if (subsSnap.empty) return null;

    const tokens = subsSnap.docs.map(d => d.data().token).filter(Boolean);
    if (tokens.length === 0) return null;

    const message = {
      notification: { title, body },
      data: { tripId, title, body, kind: kind || "other" },
      tokens: tokens,
      webpush: {
        notification: {
          title,
          body,
          icon: "https://pau112.github.io/Bus-Bages/icon.png",
          badge: "https://pau112.github.io/Bus-Bages/icon.png",
          tag: tripId + "_" + (kind || "other"),
        },
        fcmOptions: {
          link: "https://pau112.github.io/Bus-Bages/"
        }
      }
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      // Eliminar tokens invàlids
      const toDelete = [];
      response.responses.forEach((r, i) => {
        if (!r.success && (
          r.error.code === "messaging/invalid-registration-token" ||
          r.error.code === "messaging/registration-token-not-registered"
        )) {
          toDelete.push(subsSnap.docs[i].ref.delete());
        }
      });
      await Promise.all(toDelete);
    } catch (e) {
      console.error("Error sending notification:", e);
    }

    return null;
  });
