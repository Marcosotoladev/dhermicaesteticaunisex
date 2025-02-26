// lib/firebase/admin.ts
import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  getDoc,
  DocumentData
} from 'firebase/firestore';

// Obtener slots de tiempo para una fecha específica
export async function getAdminTimeSlotsForDate(date: string) {
  try {
    // Convertir fecha a formato yyyy-mm-dd
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    const q = query(
      collection(db, 'timeSlots'),
      where('date', '>=', formattedDate),
      where('date', '<', formattedDate + 'T23:59:59'),
      orderBy('date')
    );
    
    const querySnapshot = await getDocs(q);
    const timeSlots: any[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      timeSlots.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });
    
    return { timeSlots, error: null };
  } catch (error) {
    console.error('Error getting time slots:', error);
    return { timeSlots: [], error: 'Error al obtener horarios' };
  }
}

// Crear un nuevo slot de tiempo
export async function createTimeSlot(data: {
  date: string;
  available: boolean;
  durationMinutes: number;
}) {
  try {
    const docRef = await addDoc(collection(db, 'timeSlots'), data);
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating time slot:', error);
    return { id: null, error: 'Error al crear horario' };
  }
}

// Eliminar un slot de tiempo
export async function deleteTimeSlot(id: string) {
  try {
    await deleteDoc(doc(db, 'timeSlots', id));
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return { success: false, error: 'Error al eliminar horario' };
  }
}

// Obtener todos los profesionales
export async function getProfessionals() {
  try {
    const querySnapshot = await getDocs(collection(db, 'professionals'));
    const professionals: any[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      professionals.push({
        id: docSnapshot.id,
        ...docSnapshot.data()
      });
    });
    
    return { professionals, error: null };
  } catch (error) {
    console.error('Error getting professionals:', error);
    return { professionals: [], error: 'Error al obtener profesionales' };
  }
}

export async function getAppointments(
  status: 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
  date: string
) {
  try {
    // Crear consulta base
    let q = query(
      collection(db, 'appointments'),
      orderBy('date', 'desc')
    );
    
    // Aplicar filtro de estado si no es 'all'
    if (status !== 'all') {
      q = query(
        collection(db, 'appointments'),
        where('status', '==', status),
        orderBy('date', 'desc')
      );
    }
    
    // Aplicar filtro de fecha
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      q = query(
        collection(db, 'appointments'),
        where('date', '>=', startDate.toISOString()),
        where('date', '<=', endDate.toISOString()),
        orderBy('date', 'desc')
      );
      
      // Combinar filtros de estado y fecha
      if (status !== 'all') {
        q = query(
          collection(db, 'appointments'),
          where('status', '==', status),
          where('date', '>=', startDate.toISOString()),
          where('date', '<=', endDate.toISOString()),
          orderBy('date', 'desc')
        );
      }
    }
    
    const querySnapshot = await getDocs(q);
    const appointments: any[] = [];
    
    // Obtener datos de usuarios para mostrar emails
    const userPromises: Promise<void>[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      appointments.push({
        id: docSnapshot.id,
        ...data
      });
      
      // Cargar email del usuario si existe
      if (data.userId) {
        userPromises.push(
          getDoc(doc(db, 'users', data.userId))
            .then(userDoc => {
              if (userDoc.exists()) {
                const userData = userDoc.data() as { email?: string };
                const index = appointments.findIndex(a => a.id === docSnapshot.id);
                if (index >= 0 && userData.email) {
                  appointments[index].userEmail = userData.email;
                }
              }
            })
            .catch(err => console.error('Error getting user data:', err))
        );
      }
    });
    
    // Esperar a que se carguen todos los datos de usuarios
    await Promise.all(userPromises);
    
    return { appointments, error: null };
  } catch (error) {
    console.error('Error getting appointments:', error);
    return { appointments: [], error: 'Error al obtener citas' };
  }
}

// Actualizar estado de una cita
export async function updateAppointmentStatus(
  id: string, 
  status: 'confirmed' | 'completed' | 'cancelled'
) {
  try {
    await updateDoc(doc(db, 'appointments', id), { status });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating appointment status:', error);
    return { success: false, error: 'Error al actualizar estado' };
  }
}

// Asignar profesional a una cita
export async function assignProfessional(appointmentId: string, professionalId: string) {
  try {
    await updateDoc(doc(db, 'appointments', appointmentId), { 
      professionalId,
      assignedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error assigning professional:', error);
    return { success: false, error: 'Error al asignar profesional' };
  }
}

// Crear un nuevo profesional
export async function createProfessional(data: {
  name: string;
  specialty: string;
}) {
  try {
    const docRef = await addDoc(collection(db, 'professionals'), {
      ...data,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    console.error('Error creating professional:', error);
    return { id: null, error: 'Error al crear profesional' };
  }
}

// Actualizar un profesional
export async function updateProfessional(id: string, data: {
  name?: string;
  specialty?: string;
}) {
  try {
    await updateDoc(doc(db, 'professionals', id), {
      ...data,
      updatedAt: new Date().toISOString()
    });
    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating professional:', error);
    return { success: false, error: 'Error al actualizar profesional' };
  }
}

// Eliminar un profesional
export async function deleteProfessional(id: string) {
  try {
    await deleteDoc(doc(db, 'professionals', id));
    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting professional:', error);
    return { success: false, error: 'Error al eliminar profesional' };
  }
}