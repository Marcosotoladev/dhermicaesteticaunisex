// lib/firebase/appointments.ts
import { db } from './config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  updateDoc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import type { Appointment, Treatment } from '@/types/appointment';

// Obtener tratamientos
export async function getTreatments() {
  try {
    const querySnapshot = await getDocs(collection(db, 'treatments'));
    const treatments: Treatment[] = [];
    
    querySnapshot.forEach((doc) => {
      treatments.push({
        id: doc.id,
        ...doc.data() as Omit<Treatment, 'id'>
      });
    });
    
    return { treatments, error: null };
  } catch (error) {
    console.error('Error getting treatments:', error);
    return { treatments: [], error: 'Error al obtener tratamientos' };
  }
}

// Obtener slots de tiempo disponibles para un tratamiento y fecha
export async function getAvailableTimeSlots(date: string, duration: string) {
  try {
    // Convertir fecha a formato yyyy-mm-dd
    const formattedDate = new Date(date).toISOString().split('T')[0];
    
    // Extraer duración en minutos
    const durationMinutes = parseInt(duration.split(' ')[0]);
    
    // Consultar slots disponibles para esa fecha
    const q = query(
      collection(db, 'timeSlots'),
      where('date', '>=', formattedDate),
      where('date', '<', formattedDate + 'T23:59:59'),
      where('available', '==', true),
      where('durationMinutes', '>=', durationMinutes),
      orderBy('durationMinutes'),
      orderBy('date')
    );
    
    const querySnapshot = await getDocs(q);
    const timeSlots: any[] = [];
    
    querySnapshot.forEach((doc) => {
      timeSlots.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { timeSlots, error: null };
  } catch (error) {
    console.error('Error getting time slots:', error);
    return { timeSlots: [], error: 'Error al obtener horarios disponibles' };
  }
}

// Y la función createAppointment
export async function createAppointment(
  appointmentData: Partial<Appointment>,
  timeSlotId: string
) {
  try {
    // Obtener el time slot
    const timeSlotDoc = await getDoc(doc(db, 'timeSlots', timeSlotId));
    
    if (!timeSlotDoc.exists()) {
      return { appointment: null, error: 'El horario seleccionado no existe' };
    }
    
    const timeSlotData = timeSlotDoc.data();
    
    if (!timeSlotData.available) {
      return { appointment: null, error: 'El horario seleccionado ya no está disponible' };
    }
    
    // Crear la cita con los datos
    const fullAppointmentData: Omit<Appointment, 'id'> = {
      ...appointmentData as any,
      date: timeSlotData.date,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    const appointmentRef = await addDoc(collection(db, 'appointments'), fullAppointmentData);
    
    // Actualizar el time slot como no disponible
    await updateDoc(doc(db, 'timeSlots', timeSlotId), {
      available: false,
      appointmentId: appointmentRef.id
    });
    
    return { 
      appointment: {
        id: appointmentRef.id,
        ...fullAppointmentData
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { appointment: null, error: 'Error al crear la cita' };
  }
}

// Obtener citas del usuario
export async function getUserAppointments(userId: string) {
  try {
    const q = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];
    
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data() as Omit<Appointment, 'id'>
      });
    });
    
    return { appointments, error: null };
  } catch (error) {
    console.error('Error getting user appointments:', error);
    return { appointments: [], error: 'Error al obtener citas' };
  }
}

// Cancelar una cita
export async function cancelAppointment(appointmentId: string) {
  try {
    // Obtener la cita
    const appointmentDoc = await getDoc(doc(db, 'appointments', appointmentId));
    
    if (!appointmentDoc.exists()) {
      return { success: false, error: 'La cita no existe' };
    }
    
    // Actualizar el estado de la cita
    await updateDoc(doc(db, 'appointments', appointmentId), {
      status: 'cancelled'
    });
    
    // Buscar el time slot asociado
    const q = query(
      collection(db, 'timeSlots'),
      where('appointmentId', '==', appointmentId)
    );
    
    const querySnapshot = await getDocs(q);
    
    // Liberar el time slot
    querySnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, {
        available: true,
        appointmentId: null
      });
    });
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return { success: false, error: 'Error al cancelar la cita' };
  }
}