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
  const [nombre, setNombre] = useState('');
  const [metodo, setMetodo] = useState('');
  const [zonas, setZonas] = useState([{ nombre: '', duracion: '', precioFemenino: '', precioMasculino: '', frecuencia: '' }]);
  const [descripcion, setDescripcion] = useState('');
  const [equipamiento, setEquipamiento] = useState('');
  const [tipoTecnologia, setTipoTecnologia] = useState('');
  const [parametros, setParametros] = useState({ tipo_energia: '', frecuencia: '', profundidades_trabajo: [], potencia: '', cartuchos: '' });
  const [cuidadosEspeciales, setCuidadosEspeciales] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Información general
  const [descripcionCorta, setDescripcionCorta] = useState('');
  const [descripcionLarga, setDescripcionLarga] = useState('');
  const [caracteristicasTecnicas, setCaracteristicasTecnicas] = useState(['']);
  const [ventajasTecnologia, setVentajasTecnologia] = useState(['']);
  const [sintomas, setSintomas] = useState(['']);
  const [resultados, setResultados] = useState(['']);
  const [contraindicaciones, setContraindicaciones] = useState(['']);
  const [cuidadosPre, setCuidadosPre] = useState(['']);
  const [cuidadosPost, setCuidadosPost] = useState(['']);

  const handleZonasChange = (index: number, field: keyof Zona, value: string) => {
    const newZonas = [...zonas];
    newZonas[index][field] = value; // Ahora field es un valor válido de 'Zona'
    setZonas(newZonas);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTreatment = {
        nombre,
        metodo,
        zonas,
        info_especifica: {
          descripcion,
          equipamiento,
          tipo_tecnologia: tipoTecnologia,
          parametros_tecnicos: parametros,
          cuidados_especiales: cuidadosEspeciales,
          observaciones,
        },
        info_general: {
          descripcionCorta,
          descripcionLarga,
          caracteristicas_tecnicas: caracteristicasTecnicas,
          ventajas_tecnologia: ventajasTecnologia,
          sintomas,
          resultados,
          contraindicaciones,
          cuidados_pre: cuidadosPre,
          cuidados_post: cuidadosPost,
        },
      };

      // Agregar tratamiento a Firestore
      await addDoc(collection(db, 'treatments'), newTreatment);

      // Limpiar el formulario
      alert('Tratamiento agregado exitosamente');
    } catch (error) {
      console.error('Error al agregar tratamiento:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica del tratamiento */}
      <div>
        <label>Nombre del tratamiento</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

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

      {/* Información técnica */}
      <div>
        <label>Descripción</label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label>Equipamiento</label>
        <input
          type="text"
          value={equipamiento}
          onChange={(e) => setEquipamiento(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label>Tipo de tecnología</label>
        <input
          type="text"
          value={tipoTecnologia}
          onChange={(e) => setTipoTecnologia(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Parámetros técnicos */}
      <div>
        <label>Parámetros técnicos</label>
        <input
          type="text"
          placeholder="Tipo de energía"
          value={parametros.tipo_energia}
          onChange={(e) => setParametros({ ...parametros, tipo_energia: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Frecuencia"
          value={parametros.frecuencia}
          onChange={(e) => setParametros({ ...parametros, frecuencia: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {/* Otros campos de parámetros técnicos... */}
      </div>

      {/* Descripción y cuidados */}
      <div>
        <label>Descripción corta</label>
        <textarea
          value={descripcionCorta}
          onChange={(e) => setDescripcionCorta(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div>
        <label>Descripción larga</label>
        <textarea
          value={descripcionLarga}
          onChange={(e) => setDescripcionLarga(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      {/* Características técnicas, ventajas, síntomas, resultados, etc. */}
      {/* Los arrays de texto puedes agregarlos de forma similar con inputs para cada uno */}

      <button type="submit" className="w-full p-3 bg-[#34baab] text-white rounded">
        Guardar Tratamiento
      </button>
    </form>
  );
};

export default TreatmentForm;
