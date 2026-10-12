import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  type Firestore,
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: 'AIzaSyB98Pf9y3H7p6UGJW9MY_FxA8EfN4HSycA',
  authDomain: 'healthnest-e4d23.firebaseapp.com',
  projectId: 'healthnest-e4d23',
  storageBucket: 'healthnest-e4d23.firebasestorage.app',
  messagingSenderId: '1098113309918',
  appId: '1:1098113309918:web:d92e4a877c8087ae26f64f',
  measurementId: 'G-DFTK5S0CF8',
};

// Check for runtime environment variables if available
const env = typeof import.meta !== 'undefined' ? import.meta.env : undefined;
if (env) {
  if (env.VITE_FIREBASE_API_KEY) firebaseConfig.apiKey = env.VITE_FIREBASE_API_KEY;
  if (env.VITE_FIREBASE_AUTH_DOMAIN) firebaseConfig.authDomain = env.VITE_FIREBASE_AUTH_DOMAIN;
  if (env.VITE_FIREBASE_PROJECT_ID) firebaseConfig.projectId = env.VITE_FIREBASE_PROJECT_ID;
  if (env.VITE_FIREBASE_STORAGE_BUCKET) firebaseConfig.storageBucket = env.VITE_FIREBASE_STORAGE_BUCKET;
  if (env.VITE_FIREBASE_MESSAGING_SENDER_ID) firebaseConfig.messagingSenderId = env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  if (env.VITE_FIREBASE_APP_ID) firebaseConfig.appId = env.VITE_FIREBASE_APP_ID;
  if (env.VITE_FIREBASE_MEASUREMENT_ID) firebaseConfig.measurementId = env.VITE_FIREBASE_MEASUREMENT_ID;
}

// Initialize Firebase safely for both browser and Node/prerender
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
export const db: Firestore = getFirestore(app);

// Initialize Analytics (browser only)
export let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics unsupported or blocked
    });
}

export interface AppointmentData {
  requestId: string;
  name: string;
  phone: string;
  email?: string;
  service: string;
  date: string;
  time: string | FormDataEntryValue | null;
  consent: boolean;
  language: string;
}

export function generateReference(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HN-${rand}`;
}

export async function saveAppointmentToFirebase(
  appointment: AppointmentData,
): Promise<{ reference: string }> {
  const reference = generateReference();
  const appointmentsRef = collection(db, 'appointments');

  await addDoc(appointmentsRef, {
    reference,
    requestId: appointment.requestId,
    patientName: appointment.name,
    phone: appointment.phone,
    email: appointment.email || null,
    service: appointment.service,
    visitDate: appointment.date,
    visitTime: appointment.time,
    language: appointment.language,
    consent: appointment.consent,
    consentVersion: '2026-10-12',
    status: 'pending',
    createdAt: serverTimestamp(),
  });

  return { reference };
}
