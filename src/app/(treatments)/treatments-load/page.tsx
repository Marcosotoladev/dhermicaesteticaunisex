"use client"

import { useState } from 'react';
import { db } from '@/lib/firebase/config'; // Asegúrate de que la configuración esté correcta
import { collection, addDoc } from 'firebase/firestore';

type Zona = {
  nombre: string;
  duracion: string;
  precioFemenino: string;
  precioMasculino: string;
  frecuencia: string;
};

const TreatmentForm = () => {
  const [categoria, setCategoria] = useState('');
  const [nombre, setNombre] = useState('');
  const [metodo, setMetodo] = useState('');
  const [zonas, setZonas] = useState([{ nombre: '', duracion: '', precioFemenino: '', precioMasculino: '', frecuencia: '' }]);
  const [descripcionCorta, setDescripcionCorta] = useState('');
  const [descripcionLarga, setDescripcionLarga] = useState('');
  const [sintomas, setSintomas] = useState(['']);
  const [resultados, setResultados] = useState(['']);
  const [cuidadosPre, setCuidadosPre] = useState(['']);
  const [cuidadosPost, setCuidadosPost] = useState(['']);
  const [contraindicaciones, setContraindicaciones] = useState(['']);

  const handleZonasChange = (index: number, field: keyof Zona, value: string) => {
    const newZonas = [...zonas];
    newZonas[index][field] = value;
    setZonas(newZonas);
  };

  const handleAddArrayItem = (arraySetter: React.Dispatch<React.SetStateAction<any[]>>, currentArray: any[]) => {
    arraySetter([...currentArray, '']);
  };

  const handleArrayChange = (index: number, value: string, arraySetter: React.Dispatch<React.SetStateAction<any[]>>, currentArray: any[]) => {
    const updatedArray = [...currentArray];
    updatedArray[index] = value;
    arraySetter(updatedArray);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTreatment = {
        categoria,
        nombre,
        metodo,
        zonas,
        info_general: {
          descripcionCorta,
          descripcionLarga,
          sintomas,
          resultados,
          cuidados_pre: cuidadosPre,
          cuidados_post: cuidadosPost,
          contraindicaciones,
        },
      };

      // Agregar el tratamiento a la colección "treatments" en Firestore
      await addDoc(collection(db, 'treatments'), newTreatment);

      // Limpiar el formulario después de enviar
      setCategoria('');
      setNombre('');
      setMetodo('');
      setZonas([{ nombre: '', duracion: '', precioFemenino: '', precioMasculino: '', frecuencia: '' }]);
      setDescripcionCorta('');
      setDescripcionLarga('');
      setSintomas(['']);
      setResultados(['']);
      setCuidadosPre(['']);
      setCuidadosPost(['']);
      setContraindicaciones(['']);

      alert('Tratamiento agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar el tratamiento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Categoría */}
      <div>
        <label>Categoría</label>
        <input
          type="text"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Nombre */}
      <div>
        <label>Nombre</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Método */}
      <div>
        <label>Método</label>
        <input
          type="text"
          value={metodo}
          onChange={(e) => setMetodo(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Zonas */}
      <div>
        <label>Zonas tratadas</label>
        {zonas.map((zona, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              placeholder="Nombre de la zona"
              value={zona.nombre}
              onChange={(e) => handleZonasChange(index, 'nombre', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Duración"
              value={zona.duracion}
              onChange={(e) => handleZonasChange(index, 'duracion', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Precio Femenino"
              value={zona.precioFemenino}
              onChange={(e) => handleZonasChange(index, 'precioFemenino', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="number"
              placeholder="Precio Masculino"
              value={zona.precioMasculino}
              onChange={(e) => handleZonasChange(index, 'precioMasculino', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Frecuencia"
              value={zona.frecuencia}
              onChange={(e) => handleZonasChange(index, 'frecuencia', e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setZonas([...zonas, { nombre: '', duracion: '', precioFemenino: '', precioMasculino: '', frecuencia: '' }])}
          className="text-blue-500"
        >
          Añadir zona
        </button>
      </div>

      {/* Descripción corta */}
      <div>
        <label>Descripción Corta</label>
        <textarea
          value={descripcionCorta}
          onChange={(e) => setDescripcionCorta(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Descripción larga */}
      <div>
        <label>Descripción Larga</label>
        <textarea
          value={descripcionLarga}
          onChange={(e) => setDescripcionLarga(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Síntomas */}
      <div>
        <label>Síntomas</label>
        {sintomas.map((item, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, setSintomas, sintomas)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem(setSintomas, sintomas)}
          className="text-blue-500"
        >
          Añadir síntoma
        </button>
      </div>

      {/* Resultados */}
      <div>
        <label>Resultados</label>
        {resultados.map((item, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, setResultados, resultados)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem(setResultados, resultados)}
          className="text-blue-500"
        >
          Añadir resultado
        </button>
      </div>

      {/* Cuidados pre */}
      <div>
        <label>Cuidados Pre</label>
        {cuidadosPre.map((item, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, setCuidadosPre, cuidadosPre)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem(setCuidadosPre, cuidadosPre)}
          className="text-blue-500"
        >
          Añadir cuidado pre
        </button>
      </div>

      {/* Cuidados post */}
      <div>
        <label>Cuidados Post</label>
        {cuidadosPost.map((item, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, setCuidadosPost, cuidadosPost)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem(setCuidadosPost, cuidadosPost)}
          className="text-blue-500"
        >
          Añadir cuidado post
        </button>
      </div>

      {/* Contraindicaciones */}
      <div>
        <label>Contraindicaciones</label>
        {contraindicaciones.map((item, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange(index, e.target.value, setContraindicaciones, contraindicaciones)}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => handleAddArrayItem(setContraindicaciones, contraindicaciones)}
          className="text-blue-500"
        >
          Añadir contraindicaciones
        </button>
      </div>

      {/* Botón para guardar */}
      <button type="submit" className="w-full p-3 bg-[#34baab] text-white rounded">
        Guardar Tratamiento
      </button>
    </form>
  );
};

export default TreatmentForm;

