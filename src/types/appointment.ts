// types/appointment.ts

export interface TreatmentCartItem {
  treatment: Treatment;
  zones: TreatmentZone[];
}

export interface TreatmentZone {
  nombre: string;
  duracion: string;
  precioFemenino: number;
  precioMasculino: number;
  frecuencia: string;
}

export interface Treatment {
  id: string;
  categoria: string;
  nombre: string;
  metodo?: string;
  zonas: TreatmentZone[];
  info_especifica?: any;
  info_general?: any;
  exclusivo?: boolean;
  diasDisponibles?: string[]; // Los días de la semana disponibles
}

export interface TimeSlot {
  id: string;
  date: string; // Formato ISO
  available: boolean;
  appointmentId?: string;
  professionalId?: string; // Asignado por el administrador
}

export interface Appointment {
  treatmentId: ReactNode;
  id: string;
  userId: string;
  professionalId?: string;
  treatments: {
    treatmentId: string;
    treatmentName: string;
    zonas: string[];
  }[];
  genero: 'masculino' | 'femenino';
  date: string;
  totalPrice: number;
  totalDuration: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}