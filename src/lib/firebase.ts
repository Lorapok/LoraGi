import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  limit,
  updateDoc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';

// Lorapok Labs Firebase Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD1Nfa8mTtRtfQMF6qVfwJSoaxlmuNSQeA',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lorapok-labs.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lorapok-labs',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lorapok-labs.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '128956510957',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:128956510957:web:9b3638f91411f4960552e4',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-X4JMRQJNQ4',
};

// Initialize or reuse app
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export interface LoragiUser {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  publishedCount?: number;
}

export interface CommunityVideo {
  id: string;
  title: string;
  description: string;
  category: 'flowmusic' | 'object_removal' | 'cyberpunk' | 'music_video' | 'shorts' | 'remix';
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  durationFormatted: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  views: number;
  likes: number;
  tags: string[];
  createdAt: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  hasOutro?: boolean;
  hasObjectRemoval?: boolean;
}

// Fallback seed community gallery items (rich pre-populated Flow Music & Lorapok creations)
export const DEFAULT_GALLERY_VIDEOS: CommunityVideo[] = [
  {
    id: 'vid-flow-1',
    title: 'Nocturnal Bioluminescence (Google Flow Music Take #1)',
    description: 'Generative ambient electronica produced with Google Flow Music. Precision sliced and mastered in LoraGi with a cybernetic outro.',
    category: 'flowmusic',
    videoUrl: 'https://storage.googleapis.com/producer-app-public/assets/3bcaf576-a168-476f-a7bf-14a725c10d96.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/producer-app-public/assets/3bcaf576-a168-476f-a7bf-14a725c10d96.jpg',
    duration: 32,
    durationFormatted: '00:32',
    authorId: 'lorapok-official',
    authorName: 'Maizied Hasan',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Maizied',
    views: 14200,
    likes: 1240,
    tags: ['FlowMusic', 'AI Music', 'Bio-Digital', 'Ambient'],
    createdAt: Date.now() - 3600 * 1000 * 6,
    aspectRatio: '16:9',
    hasOutro: true,
  },
  {
    id: 'vid-flow-2',
    title: 'Cyber Caterpillar Groove • Heavy Bassline & Synths',
    description: 'AI-generated dynamic music video take generated via Flow Music prompt and sliced into 4 high-energy sections.',
    category: 'flowmusic',
    videoUrl: 'https://storage.googleapis.com/producer-app-public/assets/4d986565-19b1-4755-8e6a-ace0739e9bd5.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/producer-app-public/assets/4d986565-19b1-4755-8e6a-ace0739e9bd5.jpg',
    duration: 28,
    durationFormatted: '00:28',
    authorId: 'vaultie-agent',
    authorName: 'Vaultie (Lorapok Labs)',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Vaultie',
    views: 9800,
    likes: 854,
    tags: ['FlowMusic', 'Bass', 'Electronic', 'Slicer'],
    createdAt: Date.now() - 3600 * 1000 * 22,
    aspectRatio: '16:9',
    hasOutro: true,
  },
  {
    id: 'vid-obj-1',
    title: 'AI Inpainting Demo: Watermark & Mic Stand Removal',
    description: 'Using LoraGi AI Object Removal engine with content-aware temporal tracking to seamlessly erase unwanted background artifacts.',
    category: 'object_removal',
    videoUrl: 'https://storage.googleapis.com/producer-app-public/assets/7473163e-30fd-475a-8ed1-80691f3f47e6.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/producer-app-public/assets/7473163e-30fd-475a-8ed1-80691f3f47e6.jpg',
    duration: 35,
    durationFormatted: '00:35',
    authorId: 'lora-ai-team',
    authorName: 'Lorapok AI Studio',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LorapokAI',
    views: 22100,
    likes: 2190,
    tags: ['ObjectRemoval', 'Inpainting', 'AI Tool', 'Visual FX'],
    createdAt: Date.now() - 3600 * 1000 * 48,
    aspectRatio: '16:9',
    hasObjectRemoval: true,
  },
  {
    id: 'vid-flow-3',
    title: 'Neon Tokyo Rain • Lo-Fi Synthwave Generation',
    description: 'Flow Music session 806433e8 take 3, cut down into a 24-second vertical teaser with animated cyber card ending.',
    category: 'shorts',
    videoUrl: 'https://storage.googleapis.com/producer-app-public/assets/99c61b59-c5f2-44d9-846a-ac409719cb9e.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/producer-app-public/assets/99c61b59-c5f2-44d9-846a-ac409719cb9e.jpg',
    duration: 24,
    durationFormatted: '00:24',
    authorId: 'borshon-mondol',
    authorName: 'Borshon Mondol',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Borshon',
    views: 18400,
    likes: 1940,
    tags: ['Shorts', 'LoFi', 'Tokyo', 'Synthwave'],
    createdAt: Date.now() - 3600 * 1000 * 72,
    aspectRatio: '9:16',
    hasOutro: true,
  },
  {
    id: 'vid-flow-4',
    title: 'Cyberpunk Metamorphosis Anthem (LoraGi Remaster)',
    description: 'Full audio-visual electronic anthem with dual cut portions: high energy intro + drop climax.',
    category: 'cyberpunk',
    videoUrl: 'https://storage.googleapis.com/producer-app-public/assets/a8dd2531-bb51-47e6-9281-ca70d983f78d.mp4',
    thumbnailUrl: 'https://storage.googleapis.com/producer-app-public/assets/a8dd2531-bb51-47e6-9281-ca70d983f78d.jpg',
    duration: 38,
    durationFormatted: '00:38',
    authorId: 'titi-creator',
    authorName: 'Titi Labs',
    authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Titi',
    views: 31200,
    likes: 3410,
    tags: ['Cyberpunk', 'Anthem', 'Remix', 'Drop'],
    createdAt: Date.now() - 3600 * 1000 * 96,
    aspectRatio: '16:9',
    hasOutro: true,
  },
];

// Local storage key for persistent community videos
const STORAGE_KEY_GALLERY = 'loragi_community_videos_v1';

export function getLocalGallery(): CommunityVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GALLERY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_GALLERY_VIDEOS;
}

export function saveLocalGallery(videos: CommunityVideo[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GALLERY, JSON.stringify(videos));
  } catch {}
}

// Publish video to Firebase Firestore & local mirror
export async function publishVideoToGallery(videoData: Omit<CommunityVideo, 'id' | 'views' | 'likes' | 'createdAt'>): Promise<CommunityVideo> {
  const newId = `vid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const fullVideo: CommunityVideo = {
    ...videoData,
    id: newId,
    views: 1,
    likes: 0,
    createdAt: Date.now(),
  };

  // 1. Try Firebase Firestore
  try {
    const docRef = doc(db, 'loragi_videos', newId);
    await setDoc(docRef, {
      ...fullVideo,
      serverTime: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Firestore publish fallback to local cache:', err);
  }

  // 2. Always persist to local cache
  const existing = getLocalGallery();
  const updated = [fullVideo, ...existing];
  saveLocalGallery(updated);

  return fullVideo;
}

// Fetch published videos from Firestore or local fallback
export async function fetchCommunityVideos(): Promise<CommunityVideo[]> {
  try {
    const q = query(collection(db, 'loragi_videos'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firestoreVideos = snap.docs.map((d) => d.data() as CommunityVideo);
      // Merge with default seed items if unique
      const existingIds = new Set(firestoreVideos.map((v) => v.id));
      const merged = [
        ...firestoreVideos,
        ...DEFAULT_GALLERY_VIDEOS.filter((v) => !existingIds.has(v.id)),
      ];
      saveLocalGallery(merged);
      return merged;
    }
  } catch (err) {
    console.warn('Using local community gallery cache:', err);
  }

  return getLocalGallery();
}

// Like video
export async function likeVideoInGallery(videoId: string): Promise<number> {
  const videos = getLocalGallery();
  let newLikes = 0;
  const updated = videos.map((v) => {
    if (v.id === videoId) {
      newLikes = v.likes + 1;
      return { ...v, likes: newLikes };
    }
    return v;
  });
  saveLocalGallery(updated);

  try {
    const docRef = doc(db, 'loragi_videos', videoId);
    await updateDoc(docRef, { likes: increment(1) });
  } catch {}

  return newLikes;
}

// Increment views
export async function incrementVideoViews(videoId: string): Promise<void> {
  const videos = getLocalGallery();
  const updated = videos.map((v) => {
    if (v.id === videoId) {
      return { ...v, views: v.views + 1 };
    }
    return v;
  });
  saveLocalGallery(updated);

  try {
    const docRef = doc(db, 'loragi_videos', videoId);
    await updateDoc(docRef, { views: increment(1) });
  } catch {}
}
