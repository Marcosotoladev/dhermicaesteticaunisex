// app/(dashboard)/appointments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserAppointments, cancelAppointment } from '@/lib/firebase/appointments'
import type { Appointment } from '@/types/appointment'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, X, ChevronDown, ChevronUp } from 'lucide-react'

export default function AppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (user) {
      loadAppointments()
    }
  }, [user])

  const loadAppointments = async () => {
    if (!user) return
    
    setLoading(true)
    const { appointments, error } = await getUserAppointments(user.uid)
    
    if (error) {
      setError(error)
    } else {
      setAppointments(appointments)
    }
    
    setLoading(false)
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres cancelar esta cita?')) {
      return
    }
    
    const { success, error } = await cancelAppointment(appointmentId)
    
    if (success) {
      // Recargar citas
      loadAppointments()
    } else {
      setError(error || 'Error al cancelar la cita')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="text-dhermica-warning bg-dhermica-warning/10 px-2 py-1 rounded-full text-xs">Pendiente</span>
      case 'confirmed':
        return <span className="text-dhermica-success bg-dhermica-success/10 px-2 py-1 rounded-full text-xs">Confirmado</span>
      case 'completed':
        return <span className="text-dhermica-info bg-dhermica-info/10 px-2 py-1 rounded-full text-xs">Completado</span>
      case 'cancelled':
        return <span className="text-dhermica-error bg-dhermica-error/10 px-2 py-1 rounded-full text-xs">Cancelado</span>
      default:
        return <span>{status}</span>
    }
  }

  const toggleExpand = (id: string) => {
    if (expandedAppointment === id) {
      setExpandedAppointment(null)
    } else {
      setExpandedAppointment(id)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p>Cargando tus citas...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-dhermica-primary">Mis Turnos</h1>
        <Button onClick={() => router.push('/dashboard/appointments/new')}>
          Nuevo Turno
        </Button>
      </div>

      {error && (
        <div className="bg-dhermica-error/10 text-dhermica-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm text-center">
          <p className="text-dhermica-primary/70 mb-4">No tienes turnos agendados</p>
          <Button onClick={() => router.push('/dashboard/appointments/new')}>
            Agendar un Turno
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {/* Cabecera del turno */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(appointment.id)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-dhermica-primary/70" />
                      <span className="text-sm text-dhermica-primary/70">
                        {formatDate(appointment.date)}
                      </span>
                    </div>
                    <h3 className="font-medium text-dhermica-primary mt-1">
                      {appointment.treatments.length > 1 
                        ? `${appointment.treatments.length} tratamientos` 
                        : appointment.treatments[0].treatmentName}
                    </h3>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <div className="text-xs text-dhermica-primary/70 mb-1">Total</div>
                      <div className="font-medium">${Number(appointment.totalPrice).toLocaleString()} ARS</div>
                    </div>
                    
                    {expandedAppointment === appointment.id ? (
                      <ChevronUp className="w-5 h-5 text-dhermica-primary/50" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-dhermica-primary/50" />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Detalles expandibles */}
              {expandedAppointment === appointment.id && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                  {/* Detalles de tratamientos */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-dhermica-primary mb-2">Tratamientos</h4>
                    <div className="space-y-3">
                      {appointment.treatments.map((treatment, idx) => (
                        <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium">{treatment.treatmentName}</h5>
                          <p className="text-sm text-dhermica-primary/70 mt-1">
                            Zonas: {treatment.zonas.join(', ')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Información adicional */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-dhermica-primary/70">Duración:</span>
                      <span className="ml-2">{appointment.totalDuration}</span>
                    </div>
                    <div>
                      <span className="text-dhermica-primary/70">Estado:</span>
                      <span className="ml-2">{getStatusLabel(appointment.status)}</span>
                    </div>
                    <div>
                      <span className="text-dhermica-primary/70">Género:</span>
                      <span className="ml-2">{appointment.genero === 'femenino' ? 'Mujer' : 'Hombre'}</span>
                    </div>
                  </div>
                  
                  {/* Notas */}
                  {appointment.notes && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-dhermica-primary mb-1">Notas</h4>
                      <p className="text-sm text-dhermica-primary/70 bg-gray-50 p-2 rounded">
                        {appointment.notes}
                      </p>
                    </div>
                  )}
                  
                  {/* Acciones */}
                  {appointment.status === 'pending' && (
                    <div className="flex justify-end">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelAppointment(appointment.id);
                        }}
                        className="text-dhermica-error bg-dhermica-error/10 hover:bg-dhermica-error/20 px-3 py-1.5 rounded-lg text-sm flex items-center"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancelar Turno
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}