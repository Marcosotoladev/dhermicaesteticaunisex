'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Clock, AlertCircle, CheckCircle2, Heart, ListChecks, ShieldAlert, Timer, Wallet } from 'lucide-react';
import { db } from '@/lib/firebase/config'; // Asegúrate de que la configuración esté correcta
import { doc, getDoc } from 'firebase/firestore';

const TreatmentDetail = () => {
  const { id } = useParams(); // Usamos el id directamente como parámetro de la URL
  const [treatment, setTreatment] = useState(null);

  // Buscar el tratamiento usando el id desde Firestore
  useEffect(() => {
    const fetchTreatment = async () => {
      const docRef = doc(db, 'treatments', id); // Buscamos el tratamiento por su id
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTreatment({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such document!');
      }
    };

    if (id) {
      fetchTreatment();
    }
  }, [id]);

  if (!treatment) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-[#484450]">Tratamiento no encontrado</h1>
      </div>
    );
  }

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-[#c4c8c5]/20">
      <div className="container mx-auto p-4">
        {/* Header con título y descripción principal */}
        <motion.div 
          className="bg-white rounded-xl p-6 mb-6 shadow-md"
          {...fadeIn}
        >
          <h1 className="text-4xl font-bold text-[#484450] capitalize mb-4">
            {treatment.nombre}
          </h1>
          <p className="text-[#466067] text-lg">
            {treatment.info_general.descripcionLarga}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna izquierda: Precios y detalles importantes */}
          <motion.div 
            className="md:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Tarjeta de Precios y Duración */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#484450] mb-4 flex items-center gap-2">
                <Wallet className="text-[#34baab]" size={24} />
                Precios y Duración
              </h2>
              <div className="space-y-4">
                {treatment.zonas.map((zona, index) => (
                  <div key={index} className="border-b border-[#c4c8c5] last:border-0 pb-4">
                    <h3 className="font-semibold text-[#484450] mb-2">{zona.nombre}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[#466067]">Femenino</p>
                        <p className="text-lg font-bold text-[#34baab]">${zona.precioFemenino}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#466067]">Masculino</p>
                        <p className="text-lg font-bold text-[#34baab]">${zona.precioMasculino}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm text-[#466067]">
                      <Clock size={16} />
                      <span>{zona.duracion}</span>
                      <Timer size={16} className="ml-2" />
                      <span>Frecuencia: {zona.frecuencia}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraindicaciones */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#484450] mb-4 flex items-center gap-2">
                <ShieldAlert className="text-[#FF5733]" size={24} />
                Contraindicaciones
              </h2>
              <ul className="space-y-2">
                {treatment.info_general.contraindicaciones.map((contra, index) => (
                  <li key={index} className="flex items-start gap-2 text-[#466067]">
                    <AlertCircle size={18} className="text-[#FF5733] mt-1 flex-shrink-0" />
                    <span>{contra}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Columna central y derecha: Información detallada */}
          <motion.div 
            className="md:col-span-2 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* Beneficios y Resultados */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#484450] mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-[#34baab]" size={24} />
                Beneficios y Resultados
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#484450] mb-2 flex items-center gap-2">
                    <Heart size={18} className="text-[#34baab]" />
                    Tratamos
                  </h3>
                  <ul className="space-y-2">
                    {treatment.info_general.sintomas.map((sintoma, index) => (
                      <li key={index} className="flex items-start gap-2 text-[#466067]">
                        <span className="text-[#34baab]">•</span>
                        {sintoma}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#484450] mb-2 flex items-center gap-2">
                    <ListChecks size={18} className="text-[#34baab]" />
                    Resultados
                  </h3>
                  <ul className="space-y-2">
                    {treatment.info_general.resultados.map((resultado, index) => (
                      <li key={index} className="flex items-start gap-2 text-[#466067]">
                        <span className="text-[#34baab]">•</span>
                        {resultado}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Cuidados Pre y Post */}
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h2 className="text-xl font-semibold text-[#484450] mb-4">Cuidados del Tratamiento</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#484450] mb-2">Pre-Tratamiento</h3>
                  <ul className="space-y-2">
                    {treatment.info_general.cuidados_pre.map((cuidado, index) => (
                      <li key={index} className="flex items-start gap-2 text-[#466067]">
                        <span className="text-[#34baab]">•</span>
                        {cuidado}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-[#484450] mb-2">Post-Tratamiento</h3>
                  <ul className="space-y-2">
                    {treatment.info_general.cuidados_post.map((cuidado, index) => (
                      <li key={index} className="flex items-start gap-2 text-[#466067]">
                        <span className="text-[#34baab]">•</span>
                        {cuidado}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Información Específica */}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentDetail;



