// lib/firebase/storage.ts
import { storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { auth } from './config';

export async function uploadProfileImage(userId: string, file: File) {
  try {
    // Crear referencia para la imagen
    const storageRef = ref(storage, `profiles/${userId}/profile.jpg`);
    
    // Subir la imagen
    await uploadBytes(storageRef, file);
    
    // Obtener la URL de descarga
    const downloadURL = await getDownloadURL(storageRef);
    
    // Actualizar el perfil del usuario
    const currentUser = auth.currentUser;
    if (currentUser) {
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
    }
    
    return { url: downloadURL, error: null };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { url: null, error: 'Error al subir la imagen' };
  }
}