# InterviewIQ

Dark, gold-accented interview prep platform built with React + Firebase.

## Setup

```bash
npm install
npm start
```

## Firebase Setup

1. Go to https://console.firebase.google.com
2. Create a new project
3. Enable **Authentication** → Sign-in methods → Google + Email/Password
4. Go to **Project Settings** → Your apps → Add Web App
5. Copy your config into `src/firebase.js`

## Project Structure

```
src/
├── App.jsx                  # Router + auth state
├── firebase.js              # Firebase config (fill in your keys)
├── index.js                 # Entry point
├── styles/
│   └── global.css           # Design tokens + shared styles
├── data/
│   └── mockData.js          # Sample questions/history (replace with Firestore)
├── components/
│   ├── Navbar.jsx
│   └── Navbar.module.css
└── pages/
    ├── LandingPage.jsx      # Home / marketing page
    ├── LandingPage.module.css
    ├── AuthPage.jsx         # Login + Signup (Google + Email/Password)
    ├── AuthPage.module.css
    ├── Dashboard.jsx        # Main app (Aptitude / HR / Coding / History / Analytics)
    └── Dashboard.module.css
```

## Connecting Firestore for Real Session History

In `Dashboard.jsx`, replace `MOCK_HISTORY` with a Firestore query:

```js
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const q = query(
  collection(db, 'sessions'),
  where('uid', '==', user.uid),
  orderBy('createdAt', 'desc')
);
const snap = await getDocs(q);
const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
```

After each practice session, write a doc to `sessions` collection:
```js
await addDoc(collection(db, 'sessions'), {
  uid: user.uid,
  module: 'Aptitude',
  topic: 'Number Series',
  score: 82,
  time: '18 min',
  createdAt: serverTimestamp(),
});
```
