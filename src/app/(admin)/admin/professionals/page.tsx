// app/(admin)/admin/professionals/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getProfessionals, createProfessional, updateProfessional, deleteProfessional } from '@/lib/firebase/admin'
import { Button } from '@/components/ui/Button'
import { Plus, Edit, Trash } from 'lucide-react'

export default function AdminProfessionalsPage() {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState('')

  useEffect(() => {
    if (user) {
      loadProfessionals()
    }
  }, [user])

  const loadProfessionals = async () => {
    setLoading(true)
    const { professionals, error } = await getProfessionals()
    
    if (error) {
      setError(error)
    } else {
      setProfessionals(professionals)
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !specialty) {
      setError('Por favor completa todos los campos')
      return
    }
    
    try {
      if (editingId) {
        // Actualizar existente
        await updateProfessional(editingId, { name, specialty })
      } else {
        // Crear nuevo
        await createProfessional({ name, specialty })
      }
      
      // Limpiar formulario
      setName('')
      setSpecialty('')
      setIsAddingNew(false)
      setEditingId(null)
      
      // Recargar lista
      loadProfessionals()
    } catch (err) {
      setError('Error al guardar el profesional')
    }
  }

  const handleEdit = (professional: any) => {
    setName(professional.name)
    setSpecialty(professional.specialty)
    setEditingId(professional.id)
    setIsAddingNew(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este profesional?')) {
      return
    }
    
    await deleteProfessional(id)
    loadProfessionals()
  }

  const cancelForm = () => {
    setName('')
    setSpecialty('')
    setIsAddingNew(false)
    setEditingId(null)
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
      <h1 className="text-2xl font-bold text-dhermica-primary mb-6">Gestión de Profesionales</h1>

      {error && (
        <div className="bg-dhermica-error/10 text-dhermica-error p-4 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!isAddingNew ? (
        <div className="mb-6">
          <Button onClick={() => setIsAddingNew(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Agregar Profesional
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-medium text-dhermica-primary mb-4">
            {editingId ? 'Editar Profesional' : 'Nuevo Profesional'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-dhermica-primary mb-2">Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
                  placeholder="Nombre del profesional"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-dhermica-primary mb-2">Especialidad</label>
                <input
                  type="text"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-dhermica-success focus:ring-2 focus:ring-dhermica-success/20"
                  placeholder="Especialidad"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={cancelForm}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p>Cargando profesionales...</p>
        </div>
      ) : professionals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-dhermica-primary/70">No hay profesionales registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-medium text-dhermica-primary mb-4">Profesionales</h2>
          
          <div className="divide-y">
            {professionals.map((professional) => (
              <div key={professional.id} className="py-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{professional.name}</h3>
                  <p className="text-sm text-dhermica-primary/70">{professional.specialty}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(professional)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 text-dhermica-primary" />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(professional.id)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                  >
                    <Trash className="w-4 h-4 text-dhermica-error" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}