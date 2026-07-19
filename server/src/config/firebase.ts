import admin from 'firebase-admin';

const isDemoMode = process.env.DEMO_MODE === 'true';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (!isDemoMode && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          clientId: process.env.FIREBASE_CLIENT_ID,
        } as admin.ServiceAccount),
      });
    }
    db = admin.firestore();
    auth = admin.auth();
    console.log('✅ Firebase Admin initialized');
  } catch (error) {
    console.warn('⚠️  Firebase Admin init failed, running in demo mode:', (error as Error).message);
  }
} else {
  console.log('🎭 Running in DEMO MODE — Firebase not connected');
}

export { db, auth, admin };
export default admin;
