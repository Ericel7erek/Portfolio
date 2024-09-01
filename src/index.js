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

async function getUserIP() {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

async function trackVisitorInfo() {
    // Helper function to fetch the user's IP address
    const ip = await getUserIP();
    const userAgent = navigator.userAgent;
    
    // Create a unique key based on IP and User-Agent
    const userKey = `${ip}-${userAgent}`;
    
    // Reference to the visitor info document in a 'visitorInfo' collection
    const visitorInfoRef = doc(collection(db, 'visitorInfo'), ip);

    try {
        await runTransaction(db, async (transaction) => {
            const visitorInfoSnapshot = await transaction.get(visitorInfoRef);

            if (!visitorInfoSnapshot.exists()) {
                // New unique visitor, initialize their data
                transaction.set(visitorInfoRef, {
                    ip: ip,
                    userAgent: userAgent,
                    visitCount: 1,
                    firstVisit: new Date(),
                    lastVisit: new Date(),
                });
            } else {
                // Existing visitor, increment the visit count and update the last visit timestamp
                const newVisitCount = (visitorInfoSnapshot.data().visitCount || 0) + 1;
                transaction.update(visitorInfoRef, {
                    visitCount: newVisitCount,
                    lastVisit: new Date(),
                });
            }
        });

        // Call function to update the visitor count display if needed
    } catch (error) {
        console.error("Error tracking visitor info: ", error);
    }
}
// Call the function to update and display the visitor count
updateVisitorCount();
trackVisitorInfo()