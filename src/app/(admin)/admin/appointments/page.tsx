// app/(admin)/admin/appointments/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getAppointments, updateAppointmentStatus, assignProfessional, getProfessionals } from '@/lib/firebase/admin'
import { Button } from '@/components/ui/Button'
import { Check, X, Calendar, Clock, User } from 'lucide-react'

export default function AdminAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, filter, selectedDate])

  const loadData = async () => {
    setLoading(true)
    
    // Cargar citas según filtro
    const { appointments, error: appError } = await getAppointments(filter, selectedDate)
    
    if (appError) {
      setError(appError)
    } else {
      setAppointments(appointments)
    }
    
    // Cargar profesionales
    const { professionals, error: profError } = await getProfessionals()
    
    if (profError) {
      setError(profError)
    } else {
      setProfessionals(professionals)
    }
    
    setLoading(false)
  }

  const handleStatusChange = async (id: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    const { success, error } = await updateAppointmentStatus(id, status)
    
    if (success) {
      loadData()
    } else {
      setError(error || 'Error al actualizar el estado')
    }
  }

  const handleAssignProfessional = async (appointmentId: string, professionalId: string) => {
    const { success, error } = await assignProfessional(appointmentId, professionalId)
    
    if (success) {
      loadData()
    } else {
      setError(error || 'Error al asignar profesional')
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

  if (!user) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 text-center">
        <p className="text-dhermica-primary/70">Debes iniciar sesión como administrador para acceder a esta página</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dhermica-primary mb-6">Gestión de Turnos</h1>

      {error && (
        <div className="bg-dhermica-error/10 text-dhermica-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Filtrar por estado</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="confirmed">Confirmados</option>
              <option value="completed">Completados</option>
              <option value="cancelled">Cancelados</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Filtrar por fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            />
          </div>
          
          <div className="md:mt-8">
            <Button onClick={loadData} variant="secondary">
              Actualizar
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p>Cargando turnos...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-dhermica-primary/70">No hay turnos que coincidan con el filtro</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="bg-white rounded-xl shadow-sm p-6"
            >
              <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="w-4 h-4 mr-2 text-dhermica-primary/70" />
                    <span className="text-sm">{formatDate(appointment.date)}</span>
                  </div>
                  <h3 className="font-medium text-lg text-dhermica-primary">
                    {appointment.treatments.length > 1 
                      ? `${appointment.treatments.length} tratamientos` 
                      : appointment.treatments[0].treatmentName}
                  </h3>
                  <p className="text-sm text-dhermica-primary/70">
                    Cliente: {appointment.userEmail || appointment.userId}
                  </p>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="text-sm text-dhermica-primary/70 mb-1">Total</div>
                  <div className="font-medium text-lg">${Number(appointment.totalPrice).toLocaleString()} ARS</div>
                  <div className="text-sm text-dhermica-primary/70">{appointment.totalDuration}</div>
                </div>
              </div>
              
              {/* Detalles de tratamientos */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-dhermica-primary mb-2">Tratamientos</h4>
                <div className="space-y-2">
                  {appointment.treatments.map((treatment: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <h5 className="font-medium">{treatment.treatmentName}</h5>
                      <p className="text-sm text-dhermica-primary/70 mt-1">
                        Zonas: {treatment.zonas.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Asignar profesional */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-dhermica-primary mb-2">Profesional asignado</h4>
                <select
                  value={appointment.professionalId || ''}
                  onChange={(e) => handleAssignProfessional(appointment.id, e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
                >
                  <option value="">Seleccionar profesional</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name} - {prof.specialty}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Acciones */}
              <div className="flex justify-end space-x-3">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                      className="bg-dhermica-success/10 text-dhermica-success px-3 py-1.5 rounded-lg flex items-center hover:bg-dhermica-success/20"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      className="bg-dhermica-error/10 text-dhermica-error px-3 py-1.5 rounded-lg flex items-center hover:bg-dhermica-error/20"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancelar
                    </button>
                  </>
                )}
                
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusChange(appointment.id, 'completed')}
                    className="bg-dhermica-info/10 text-dhermica-info px-3 py-1.5 rounded-lg flex items-center hover:bg-dhermica-info/20"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Marcar completado
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}