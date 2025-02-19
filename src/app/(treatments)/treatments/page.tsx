'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { db } from '@/lib/firebase/config'; // Asegúrate de que la configuración esté correcta
import { collection, getDocs } from 'firebase/firestore';
import PromoButton from '@/components/promoButton/PromoButton';

const Catalogo = () => {
  const [filterCategory, setFilterCategory] = useState('');
  const [filterName, setFilterName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [treatments, setTreatments] = useState<any[]>([]);

  // Cargar los tratamientos desde Firestore
  useEffect(() => {
    const fetchTreatments = async () => {
      const querySnapshot = await getDocs(collection(db, 'treatments'));
      const treatmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTreatments(treatmentsData);
    };

    fetchTreatments();
  }, []);

  // Obtener categorías únicas
  const uniqueCategories = useMemo(() =>
    [...new Set(treatments.map(t => t.categoria))],
    [treatments]
  );

  const filteredTreatments = useMemo(() => {
    return treatments.filter((t) => {
      // Normalizar strings removiendo espacios extras y convirtiendo a minúsculas
      const normalizedName = t.nombre.toLowerCase().trim();
      const normalizedSearch = filterName.toLowerCase().trim();
      
      const matchCategory = !filterCategory ||
        t.categoria.toLowerCase() === filterCategory.toLowerCase();
      const matchName = !filterName ||
        normalizedName.includes(normalizedSearch);

      return matchCategory && matchName;
    });
  }, [filterCategory, filterName, treatments]);

  // Componente para las píldoras de categorías
  const CategoryPills = () => (
    <div className="flex gap-2 overflow-x-auto pb-2 md:hidden m-8">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setFilterCategory('')}
        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
          filterCategory === '' 
            ? 'bg-[#34baab] text-white'
            : 'bg-white text-[#484450] border border-[#459a96]'
        }`}
      >
        Todos
      </motion.button>
      {uniqueCategories.map((cat) => (
        <motion.button
          key={cat}
          whileTap={{ scale: 0.95 }}
          onClick={() => setFilterCategory(cat)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${
            filterCategory === cat
              ? 'bg-[#34baab] text-white'
              : 'bg-white text-[#484450] border border-[#459a96]'
          }`}
        >
          {cat}
        </motion.button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#c4c8c5]/20">
      <div className="container mx-auto p-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-4xl font-bold mb-4 text-[#484450] text-center"
        >
          Catálogo de Tratamientos
        </motion.h1>
        <div className='flex justify-center mb-4 w-full'>
          <PromoButton />
        </div>

        {/* Barra de búsqueda móvil */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#34baab]" size={20} />
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Buscar tratamiento..."
              className="w-full pl-10 pr-12 py-3 border border-[#459a96] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34baab] bg-white"
            />
            <button
              onClick={() => setShowFilters(true)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-4"
            >
              <SlidersHorizontal className="text-[#34baab]" size={20} />
            </button>
          </div>
        </div>

        {/* Píldoras de categorías móvil */}
        <CategoryPills  />

        {/* Panel de filtros móvil simplificado */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            >
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl p-6"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-[#484450]">Categorías</h3>
                  <button onClick={() => setShowFilters(false)}>
                    <X className="text-[#484450]" size={24} />
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setFilterCategory('');
                      setShowFilters(false);
                    }}
                    className={`w-full p-3 rounded-lg text-left ${
                      filterCategory === ''
                        ? 'bg-[#34baab] text-white'
                        : 'bg-white text-[#484450] border border-[#459a96]'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {uniqueCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setFilterCategory(cat);
                        setShowFilters(false);
                      }}
                      className={`w-full p-3 rounded-lg text-left ${
                        filterCategory === cat
                          ? 'bg-[#34baab] text-white'
                          : 'bg-white text-[#484450] border border-[#459a96]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtros desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex mb-8 p-6 bg-white rounded-xl shadow-md gap-6"
        >
          <div className="flex-1">
            <label className="block text-[#484450] font-semibold mb-2">
              <Filter size={18} className="inline mr-2" />
              Categoría
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-3 border border-[#459a96] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34baab] bg-white"
            >
              <option value="">Todas las categorías</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-[#484450] font-semibold mb-2">
              <Search size={18} className="inline mr-2" />
              Nombre
            </label>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full p-3 border border-[#459a96] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#34baab]"
            />
          </div>
        </motion.div>

        {/* Grid de cards - Ahora 2 columnas en móvil */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
          {filteredTreatments.map((treatment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden relative"
            >
              <div className="p-4 md:p-6">
                <h2 className="text-base md:text-xl font-bold mb-2 md:mb-3 text-[#484450] capitalize">
                  {treatment.nombre}
                </h2>
                <p className="text-[#466067] text-xs md:text-sm mb-3 md:mb-4 line-clamp-3">
                  {treatment.info_general.descripcionCorta}
                </p>
                <Link
                  href={`/treatments/${treatment.id}`}
                  className="block"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-[#34baab] text-white py-2 px-4 rounded-lg 
                             hover:bg-[#459a96] transition-colors duration-300 text-sm md:text-base"
                  >
                    Ver más
                  </motion.button>
                </Link>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                whileHover={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-[#34baab] origin-left"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Catalogo;
