import React from 'react';
import { 
  Home, 
  Flame, 
  MapPin, 
  Vote, 
  GraduationCap, 
  ShieldAlert, 
  Trophy, 
  Building2, 
  Sparkles,
  Compass,
  ArrowRight
} from 'lucide-react';
import { APP_CATEGORIES, CategoryItem } from '../types/news';

interface CategoriesSheetProps {
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesSheet: React.FC<CategoriesSheetProps> = ({
  selectedCategory,
  onSelectCategory
}) => {
  // Map appropriate icons to categories
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'all':
        return <Home className="w-5 h-5 text-red-600" />;
      case 'breaking':
        return <Flame className="w-5 h-5 text-red-600" />;
      case 'chhattisgarh':
      case 'raipur':
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      case 'mahasamund':
      case 'pithora':
      case 'basna':
      case 'saraipali':
      case 'bagbahara':
        return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'politics':
        return <Vote className="w-5 h-5 text-purple-600" />;
      case 'education':
        return <GraduationCap className="w-5 h-5 text-amber-600" />;
      case 'crime':
        return <ShieldAlert className="w-5 h-5 text-rose-600" />;
      case 'sports':
        return <Trophy className="w-5 h-5 text-cyan-600" />;
      case 'entertainment':
        return <Sparkles className="w-5 h-5 text-pink-600" />;
      default:
        return <Compass className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Category Header */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold font-devanagari-heading text-slate-900">
          समाचार श्रेणियाँ व क्षेत्र
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          सवेरा 24 न्यूज़ - महासमुंद, छत्तीसगढ़ एवं देश-विदेश के प्रमुख वर्ग
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {APP_CATEGORIES.map((cat: CategoryItem) => {
          const isSelected = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all ${
                isSelected
                  ? 'bg-red-50/80 border-red-300 shadow-xs'
                  : 'bg-white border-slate-200/90 hover:border-red-200 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-50'}`}>
                  {getCategoryIcon(cat.id)}
                </div>
                <div className="min-w-0">
                  <h3 className={`font-devanagari-heading font-bold text-sm sm:text-base leading-tight truncate ${
                    isSelected ? 'text-red-700' : 'text-slate-900'
                  }`}>
                    {cat.hindiName}
                  </h3>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                    {cat.name}
                  </span>
                </div>
              </div>

              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isSelected ? 'bg-red-600 text-white' : 'text-slate-400 group-hover:text-red-600'
              }`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
