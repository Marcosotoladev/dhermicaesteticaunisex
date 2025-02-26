// app/(admin)/admin/time-slots/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getAdminTimeSlotsForDate, createTimeSlot, deleteTimeSlot } from '@/lib/firebase/admin'
import { Button } from '@/components/ui/Button'
import { Clock, Trash, Plus } from 'lucide-react'

export default function AdminTimeSlotsPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [interval, setInterval] = useState(30) // minutos
  const [timeSlots, setTimeSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadTimeSlots()
    }
  }, [user, selectedDate])

  const loadTimeSlots = async () => {
    setLoading(true)
    const { timeSlots, error } = await getAdminTimeSlotsForDate(selectedDate)
    
    if (error) {
      setError(error)
    } else {
      setTimeSlots(timeSlots)
    }
    
    setLoading(false)
  }

  const handleGenerateTimeSlots = async () => {
    if (!user) return
    
    setError(null)
    
    // Convertir horas a minutos para calcular
    const start = convertTimeToMinutes(startTime)
    const end = convertTimeToMinutes(endTime)
    
    if (start >= end) {
      setError('La hora de inicio debe ser anterior a la hora de fin')
      return
    }
    
    // Generar time slots
    const slots = []
    
    for (let time = start; time < end; time += interval) {
      const hours = Math.floor(time / 60)
      const minutes = time % 60
      
      const timeString = `${selectedDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
      
      slots.push({
        date: timeString,
        available: true,
        durationMinutes: interval
      })
    }
    
    // Crear slots en Firestore
    for (const slot of slots) {
      await createTimeSlot(slot)
    }
    
    // Recargar slots
    loadTimeSlots()
  }

  const handleDeleteTimeSlot = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      return
    }
    
    await deleteTimeSlot(id)
    loadTimeSlots()
  }

  const convertTimeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    })
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
      <h1 className="text-2xl font-bold text-dhermica-primary mb-6">Gestión de Horarios</h1>

      {error && (
        <div className="bg-dhermica-error/10 text-dhermica-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-dhermica-primary mb-4">Crear Horarios</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Hora de inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Hora de fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-dhermica-primary mb-2">Intervalo (min)</label>
            <select
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>1 hora</option>
              <option value={90}>1.5 horas</option>
              <option value={120}>2 horas</option>
            </select>
          </div>
        </div>
        
        <Button onClick={handleGenerateTimeSlots} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Generar Horarios
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-medium text-dhermica-primary mb-4">
          Horarios para {new Date(selectedDate).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </h2>
        
        {loading ? (
          <p className="text-center py-4">Cargando horarios...</p>
        ) : timeSlots.length === 0 ? (
          <p className="text-center py-4 text-dhermica-primary/70">No hay horarios disponibles para esta fecha</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {timeSlots.map((slot) => (
              <div 
                key={slot.id}
                className={`p-3 rounded-lg border ${
                  slot.available
                    ? 'border-dhermica-success bg-dhermica-success/5'
                    : 'border-dhermica-error bg-dhermica-error/5'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{formatTime(slot.date)}</span>
                  <button
                    onClick={() => handleDeleteTimeSlot(slot.id)}
                    className="text-dhermica-error p-1 hover:bg-dhermica-error/10 rounded-full"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs">
                  {slot.available 
                    ? <span className="text-dhermica-success">Disponible</span>
                    : <span className="text-dhermica-error">Reservado</span>
                  }
                </div>
                <div className="text-xs text-dhermica-primary/70">
                  {slot.durationMinutes} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}