import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, runTransaction, query, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  projectNumber: process.env.REACT_APP_FIREBASE_PROJECT_NUMBER
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export Firestore functions
export async function updateVisitorCount() {
  const docRef = doc(collection(db, 'visitors'), 'visitorCount');

  await runTransaction(db, async (transaction) => {
    const docSnapshot = await transaction.get(docRef);
    if (!docSnapshot.exists()) {
      transaction.set(docRef, { count: 1 });
    } else {
      const newCount = docSnapshot.data().count + 1;
      transaction.update(docRef, { count: newCount });
    }
  });

  const updatedDoc = await getDocs(query(collection(db, 'visitors')));
  updatedDoc.forEach(doc => {
    if (doc.id === 'visitorCount') {
      document.getElementById('visitor-count').innerText = doc.data().count;
    }
  });
}

export async function trackVisitorInfo() {
  const response = await fetch('https://api.ipify.org?format=json');
  const data = await response.json();
  const ip = data.ip;
  const userAgent = navigator.userAgent;
  const visitorInfoRef = doc(collection(db, 'visitorInfo'), ip);

  await runTransaction(db, async (transaction) => {
    const visitorInfoSnapshot = await transaction.get(visitorInfoRef);

    if (!visitorInfoSnapshot.exists()) {
      transaction.set(visitorInfoRef, {
        ip,
        userAgent,
        visitCount: 1,
        firstVisit: new Date(),
        lastVisit: new Date(),
      });
    } else {
      const newVisitCount = (visitorInfoSnapshot.data().visitCount || 0) + 1;
      transaction.update(visitorInfoRef, {
        visitCount: newVisitCount,
        lastVisit: new Date(),
      });
    }
  });
}
