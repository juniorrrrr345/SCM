'use client';
import { useState, useEffect, useRef } from 'react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
}

export default function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  categories
}: CategoryFilterProps) {
  const [showCategories, setShowCategories] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="sticky top-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/10">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 max-w-7xl mx-auto">
        {/* Dropdown Catégories - Design premium */}
        <div className="relative flex-1" ref={categoryRef}>
          <button
            onClick={() => {
              setShowCategories(!showCategories);
            }}
                          className="w-full bg-black/30 hover:bg-black/50 border border-white/20 hover:border-white/30 text-white py-2.5 sm:py-3 lg:py-3.5 px-3 sm:px-4 lg:px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium sm:font-semibold transition-all duration-300 flex items-center justify-between backdrop-blur-md group"
          >
                          <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-md sm:rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="truncate text-sm sm:text-base">{selectedCategory.replace(/\s*📦\s*/g, '').trim()}</span>
              </div>
            <svg className={`w-5 h-5 transition-all duration-300 flex-shrink-0 ${showCategories ? 'rotate-180 text-blue-400' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {showCategories && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-black/85 backdrop-blur-xl rounded-2xl shadow-2xl z-[9999] border border-white/30 overflow-hidden animate-fadeIn">
              {/* En-tête du dropdown */}
              <div className="px-5 py-4 bg-white/15 backdrop-blur-sm border-b border-white/20">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold text-base">Catégories</span>
                  <span className="text-blue-400 text-sm font-medium bg-blue-500/20 px-2 py-1 rounded-lg">{categories.length - 1}</span>
                </div>
              </div>
              
              {/* Liste avec scroll élégant - hauteur adaptative */}
              <div className="max-h-60 sm:max-h-64 lg:max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-500/30 scrollbar-track-transparent">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setShowCategories(false);
                    }}
                    className={`w-full text-left px-5 py-4 text-sm font-medium hover:bg-white/15 transition-all duration-200 border-b border-white/10 last:border-b-0 group ${
                      selectedCategory === category ? 'bg-white/25 text-white border-l-4 border-l-green-500' : 'text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-1 font-medium group-hover:translate-x-1 transition-transform">{category.replace(/\s*📦\s*/g, '').trim()}</span>
                      {selectedCategory === category && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scaleIn">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}