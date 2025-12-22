// IMPORTANT: This file should only be imported on the server!
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Function to safely initialize and get the Firebase Admin app
export function initAdmin() {
  if (getApps().length > 0) {
    const existingApp = getApps()[0];
    return {
      app: existingApp,
      firestore: getFirestore(existingApp),
    };
  }

  // This environment variable is a JSON string of your service account key.
  // In your hosting environment (e.g., Vercel), you must set this variable.
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccount) {
    throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. The application will not work correctly.');
  }

  const app = initializeApp({
    credential: cert(JSON.parse(serviceAccount)),
  });

  return {
    app,
    firestore: getFirestore(app),
  };
}
