// lib/firebase/profile.ts
import { db } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { ProfileData } from '@/types/profile';

export async function saveProfile(userId: string, profileData: ProfileData) {
  try {
    await setDoc(doc(db, 'profiles', userId), {
      ...profileData,
      updatedAt: new Date(),
      isComplete: true
    });
    return { error: null };
  } catch (error) {
    console.error('Error saving profile:', error);
    return { error: 'Error al guardar el perfil' };
  }
}

export async function getProfile(userId: string) {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { profile: docSnap.data(), error: null };
    } else {
      return { profile: null, error: null };
    }
  } catch (error) {
    console.error('Error getting profile:', error);
    return { profile: null, error: 'Error al obtener el perfil' };
  }
}