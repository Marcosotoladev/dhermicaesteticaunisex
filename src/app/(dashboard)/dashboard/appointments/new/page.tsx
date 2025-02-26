// app/(dashboard)/appointments/new/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getTreatments, getAvailableTimeSlots, createAppointment } from '@/lib/firebase/appointments'
import type { Treatment, TreatmentZone, TreatmentCartItem } from '@/types/appointment'
import { Button } from '@/components/ui/Button'
import { ShoppingCart, Plus, Trash, Check } from 'lucide-react'

export default function NewAppointmentPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [categories, setCategories] = useState<string[]>([])
  const [treatments, setTreatments] = useState<Treatment[]>([])
  const [filteredTreatments, setFilteredTreatments] = useState<Treatment[]>([])
  const [timeSlots, setTimeSlots] = useState<any[]>([])

  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null)
  const [selectedZones, setSelectedZones] = useState<TreatmentZone[]>([])
  const [cartItems, setCartItems] = useState<TreatmentCartItem[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('')
  const [gender, setGender] = useState<'masculino' | 'femenino'>('femenino')
  const [notes, setNotes] = useState<string>('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creatingAppointment, setCreatingAppointment] = useState(false)
  const [showAddingPanel, setShowAddingPanel] = useState(true)

  useEffect(() => {
    loadTreatments()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      const filtered = treatments.filter(
        treatment => treatment.categoria === selectedCategory
      )
      setFilteredTreatments(filtered)
    } else {
      setFilteredTreatments([])
    }
  }, [selectedCategory, treatments])

  const loadTreatments = async () => {
    setLoading(true)

    // Cargar tratamientos
    const { treatments, error } = await getTreatments()

    if (error) {
      setError(error)
    } else {
      setTreatments(treatments)

      // Extraer categorías únicas
      const uniqueCategories = [...new Set(treatments.map(t => t.categoria))]
      setCategories(uniqueCategories)
    }

    setLoading(false)
  }

  const handleDateChange = async (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot('')

    if (cartItems.length === 0) {
      return
    }

    // Verificar si todos los tratamientos están disponibles ese día
    const exclusiveTreatments = cartItems.filter(item =>
      item.treatment.exclusivo && item.treatment.diasDisponibles
    )

    if (exclusiveTreatments.length > 0) {
      const selectedDay = new Date(date).getDay() // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const dayName = dayNames[selectedDay]

      for (const item of exclusiveTreatments) {
        if (!item.treatment.diasDisponibles!.includes(dayName)) {
          setError(`El tratamiento ${item.treatment.nombre} solo está disponible los días: ${item.treatment.diasDisponibles!.join(', ')}`)
          return
        }
      }
    }

    // Cargar time slots disponibles para el total de duración
    const totalDuration = calculateTotalDuration()
    const { timeSlots, error } = await getAvailableTimeSlots(date, totalDuration)

    if (error) {
      setError(error)
    } else {
      setTimeSlots(timeSlots)
    }
  }

  const toggleZoneSelection = (zone: TreatmentZone) => {
    if (selectedZones.some(z => z.nombre === zone.nombre)) {
      setSelectedZones(selectedZones.filter(z => z.nombre !== zone.nombre))
    } else {
      setSelectedZones([...selectedZones, zone])
    }
  }

  const addToCart = () => {
    if (!selectedTreatment || selectedZones.length === 0) {
      return
    }

    setCartItems([...cartItems, {
      treatment: selectedTreatment,
      zones: [...selectedZones]
    }])

    // Limpiar selección actual
    setSelectedZones([])
    setSelectedTreatment(null)
    setSelectedCategory('')
  }

  const removeCartItem = (index: number) => {
    const newCartItems = [...cartItems];
    newCartItems.splice(index, 1);
    setCartItems(newCartItems);
  }

  const calculateTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.zones.reduce((zoneTotal, zone) => {
        // Forzar conversión a número
        const precio = gender === 'femenino'
          ? Number(zone.precioFemenino)
          : Number(zone.precioMasculino);
        return zoneTotal + precio;
      }, 0);
      return total + itemTotal;
    }, 0);
  }

  const calculateTotalDuration = () => {
    // Suponiendo que la duración está en formato "XX min"
    const totalMinutes = cartItems.reduce((total, item) => {
      return total + item.zones.reduce((zoneTotal, zone) => {
        const minutes = parseInt(zone.duracion)
        return zoneTotal + (isNaN(minutes) ? 0 : minutes)
      }, 0)
    }, 0)

    return `${totalMinutes} min`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Debes iniciar sesión para agendar un turno')
      return
    }

    if (cartItems.length === 0 || !selectedTimeSlot) {
      setError('Por favor, selecciona al menos un tratamiento y un horario')
      return
    }

    setCreatingAppointment(true)
    setError(null)

    const appointmentData = {
      userId: user.uid,
      treatments: cartItems.map(item => ({
        treatmentId: item.treatment.id,
        treatmentName: item.treatment.nombre,
        zonas: item.zones.map(z => z.nombre)
      })),
      genero: gender,
      totalPrice: calculateTotalPrice(),
      totalDuration: calculateTotalDuration(),
      notes: notes
    }

    const { appointment, error } = await createAppointment(appointmentData, selectedTimeSlot)

    if (error) {
      setError(error)
      setCreatingAppointment(false)
    } else {
      // Redireccionar a la página de citas
      router.push('/appointments')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <p>Cargando tratamientos...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-dhermica-primary mb-6">Nuevo Turno</h1>

      {error && (
        <div className="bg-dhermica-error/10 text-dhermica-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          {/* Selección de género */}
          <div>
            <h2 className="text-lg font-medium text-dhermica-primary mb-4">¿Para quién es el tratamiento?</h2>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setGender('femenino')}
                className={`flex-1 py-3 px-4 rounded-xl ${gender === 'femenino'
                  ? 'bg-dhermica-success text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-dhermica-primary'
                  }`}
              >
                Mujer
              </button>
              <button
                type="button"
                onClick={() => setGender('masculino')}
                className={`flex-1 py-3 px-4 rounded-xl ${gender === 'masculino'
                  ? 'bg-dhermica-success text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-dhermica-primary'
                  }`}
              >
                Hombre
              </button>
            </div>
          </div>

          {/* Panel para agregar tratamientos */}
          {showAddingPanel ? (
            <div className="border rounded-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-dhermica-primary">Agregar tratamiento</h2>
                {selectedZones.length > 0 && (
                  <button
                    type="button"
                    onClick={addToCart}
                    className="bg-dhermica-success text-white py-1 px-3 rounded-lg flex items-center text-sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Agregar
                  </button>
                )}
              </div>

              {/* Selección de categoría */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-dhermica-primary mb-2">Selecciona una categoría</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category)
                        setSelectedTreatment(null)
                        setSelectedZones([])
                      }}
                      className={`py-1.5 px-3 rounded-lg text-center text-sm ${selectedCategory === category
                        ? 'bg-dhermica-success text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-dhermica-primary'
                        }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selección de tratamiento */}
              {selectedCategory && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-dhermica-primary mb-2">Selecciona un tratamiento</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredTreatments.map((treatment) => (
                      <div
                        key={treatment.id}
                        onClick={() => {
                          setSelectedTreatment(treatment)
                          setSelectedZones([])
                        }}
                        className={`p-3 rounded-xl border cursor-pointer ${selectedTreatment?.id === treatment.id
                          ? 'border-dhermica-success bg-dhermica-success/5'
                          : 'border-gray-200 hover:border-dhermica-success/50'
                          }`}
                      >
                        <h3 className="font-medium">{treatment.nombre}</h3>
                        {treatment.metodo && (
                          <p className="text-xs text-dhermica-primary/70">Método: {treatment.metodo}</p>
                        )}
                        {treatment.exclusivo && (
                          <p className="text-xs text-dhermica-warning">
                            Tratamiento con días específicos
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selección de zonas */}
              {selectedTreatment && (
                <div>
                  <h3 className="text-sm font-medium text-dhermica-primary mb-2">Selecciona las zonas a tratar</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {selectedTreatment.zonas.map((zone) => (
                      <button
                        key={zone.nombre}
                        type="button"
                        onClick={() => toggleZoneSelection(zone)}
                        className={`py-1.5 px-2 rounded-lg text-center relative text-sm ${selectedZones.some(z => z.nombre === zone.nombre)
                          ? 'bg-dhermica-success text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-dhermica-primary'
                          }`}
                      >
                        <span className="block">{zone.nombre}</span>
                        <span className="block text-xs">
                          ${Number(gender === 'femenino' ? zone.precioFemenino : zone.precioMasculino).toLocaleString()} ARS
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setShowAddingPanel(true)}
              variant="secondary"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar tratamiento
            </Button>
          )}

          {/* Carrito / Resumen */}
          {cartItems.length > 0 && (
            <div className="border rounded-xl p-4">
              <h2 className="text-lg font-medium text-dhermica-primary mb-4 flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Servicios seleccionados
              </h2>

              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="border-b pb-3">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{item.treatment.nombre}</h3>
                        <p className="text-sm text-dhermica-primary/70">
                          Zonas: {item.zones.map(z => z.nombre).join(', ')}
                        </p>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium mr-3">
                          ${item.zones.reduce((total, z) => {
                            return total + Number(gender === 'femenino' ? z.precioFemenino : z.precioMasculino);
                          }, 0).toLocaleString()} ARS
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCartItem(index)}
                          className="text-dhermica-error p-1"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between font-medium text-lg pt-2">
                  <span>Total:</span>
                  <span>${calculateTotalPrice().toLocaleString()} ARS</span>
                </div>

                <div className="flex justify-end text-sm text-dhermica-primary/70">
                  Duración estimada: {calculateTotalDuration()}
                </div>
              </div>
            </div>
          )}

          {/* Selección de fecha */}
          {cartItems.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-dhermica-primary mb-4">Selecciona una fecha</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
              />
            </div>
          )}

          {/* Selección de horario */}
          {selectedDate && timeSlots.length > 0 && (
            <div>
              <h2 className="text-lg font-medium text-dhermica-primary mb-4">Selecciona un horario</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const time = new Date(slot.date).toLocaleTimeString('es-AR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`py-2 px-4 rounded-lg text-center ${selectedTimeSlot === slot.id
                        ? 'bg-dhermica-success text-white'
                        : 'bg-gray-100 hover:bg-gray-200 text-dhermica-primary'
                        }`}
                    >
                      {time}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notas adicionales */}
          {cartItems.length > 0 && selectedDate && selectedTimeSlot && (
            <div>
              <h2 className="text-lg font-medium text-dhermica-primary mb-4">Notas adicionales (opcional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="¿Alguna indicación especial para tu cita?"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
                rows={3}
              />
            </div>
          )}

          {/* Botón de envío */}
          <Button
            type="submit"
            loading={creatingAppointment}
            disabled={
              cartItems.length === 0 ||
              !selectedDate ||
              !selectedTimeSlot ||
              creatingAppointment
            }
            className="w-full"
          >
            Confirmar Turno
          </Button>
        </div>
      </form>
    </div>
  )
}