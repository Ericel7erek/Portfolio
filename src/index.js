import initScrollReveal from "./scripts/scrollReveal";
import initTiltEffect from "./scripts/tiltAnimation";
import { targetElements, defaultProps } from "./data/scrollRevealConfig";
import { initializeApp } from 'firebase/app';  // Import Firebase core
import { getFirestore, collection, doc, getDocs, updateDoc, setDoc, runTransaction, query } from 'firebase/firestore';  // Import Firestore

initScrollReveal(targetElements, defaultProps);
initTiltEffect();

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    projectNumber: process.env.REACT_APP_FIREBASE_PROJECT_NUMBER
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to update the visitor count
async function updateVisitorCount() {
    const docRef = doc(collection(db, 'visitors'), 'visitorCount');  // Reference to the document 'visitorCount' in 'visitors' collection

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

// Call the function to update and display the visitor count
updateVisitorCount();
