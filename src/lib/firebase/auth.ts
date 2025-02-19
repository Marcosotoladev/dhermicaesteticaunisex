import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    User,
    AuthError // Importamos AuthError
  } from 'firebase/auth';
  import { auth } from './config';
  
  // Definimos un tipo para nuestras respuestas
  type AuthResponse = {
    user: User | null;
    error: string | null;
  };
  
  export const loginWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      const authError = error as AuthError; // Hacemos type casting
      return { user: null, error: authError.message };
    }
  };
  
  export const registerWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { user: userCredential.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { user: null, error: authError.message };
    }
  };
  
  export const loginWithGoogle = async (): Promise<AuthResponse> => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      return { user: userCredential.user, error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { user: null, error: authError.message };
    }
  };
  
  export const logOut = async (): Promise<{ error: string | null }> => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      return { error: authError.message };
    }
  };