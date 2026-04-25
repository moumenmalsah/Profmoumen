import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Content, ContentCategory } from '../types';
import ContentCard from '../components/ContentCard';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal } from 'lucide-react';

interface CategoryPageProps {
  category: ContentCategory;
  title: string;
}

export default function CategoryPage({ category, title }: CategoryPageProps) {
  const [contents, setContents] = useState<Content[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);
      const path = 'contents';
      try {
        const q = query(
          collection(db, path), 
          where('category', '==', category),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
        setContents(data);
        setFilteredContents(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchContents();
  }, [category]);

  useEffect(() => {
    const results = contents.filter(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredContents(results);
  }, [searchTerm, contents]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter uppercase text-slate-900">{title}</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Ressources disponibles</p>
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white transition-all text-xs font-bold uppercase tracking-tighter"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-slate-100 animate-pulse h-24 rounded-xl"></div>
          ))}
        </div>
      ) : filteredContents.length > 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredContents.map((content) => (
              <div key={content.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded shrink-0 ${
                    content.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                    content.type === 'youtube' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                  }`}>
                    {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎬' : '🧩'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{content.title}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-medium italic">
                      {content.description || 'Aucune description'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => window.open(content.url, '_blank')}
                    className="px-4 py-1.5 border border-slate-200 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                  >
                    Ouvrir
                  </button>
                  {content.type === 'pdf' && (
                    <a 
                      href={content.url} 
                      download
                      className="px-4 py-1.5 bg-slate-900 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
                    >
                      Télécharger
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-200">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Aucun résultat trouvé.</p>
        </div>
      )}
    </div>
  );
}
