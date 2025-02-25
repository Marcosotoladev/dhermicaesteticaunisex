// lib/firebase/profile.ts
import { db } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import type { ProfileData } from '@/types/profile';
import { updateProfile } from 'firebase/auth';
import { auth } from './config';

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

export async function updateProfileImage(file: File) {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { error: 'Usuario no autenticado' };
    }

    // Reducir la imagen a un tamaño más pequeño
    const compressedImage = await compressImage(file, 100); // 100px de ancho
    
    // Guardar la imagen reducida en Firestore
    await updateDoc(doc(db, 'profiles', user.uid), {
      profileImageData: compressedImage
    });
    
    // No actualizar photoURL en Auth, solo en Firestore
    return { url: compressedImage, error: null };
  } catch (error) {
    console.error('Error updating profile image:', error);
    return { url: null, error: 'Error al actualizar la imagen' };
  }
}

// Función para comprimir la imagen
async function compressImage(file: File, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcular proporciones
        const ratio = maxWidth / img.width;
        const width = maxWidth;
        const height = img.height * ratio;
        
        // Configurar canvas
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen reducida
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Obtener como base64 con menor calidad (0.7 = 70%)
        const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
        resolve(compressedImage);
      };
      
      img.onerror = (error) => {
        reject(error);
      };
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}