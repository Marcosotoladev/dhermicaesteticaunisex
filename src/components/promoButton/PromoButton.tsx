'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const PromoButton = () => {
  return (
    <Link 
      href="/promociones" 
      className="inline-block"
    >
      <button 
        className="
          group 
          flex items-center 
          gap-2 
          min-w-[200px]
          bg-[#484450] hover:bg-[#34baab] 
          text-white 
          rounded-lg 
          px-6 py-3
          transition-all duration-300 
          shadow-lg hover:shadow-xl
        "
      >
        <Sparkles 
          className="
            w-5 h-5 
            text-[#34baab] 
            group-hover:text-white 
            transition-colors
          " 
        />
        <span className="text-base font-semibold">
          Ver Promociones
        </span>
      </button>
    </Link>
  );
};

export default PromoButton;