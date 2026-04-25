import { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Content } from '../types';
import ContentCard from '../components/ContentCard';
import { motion } from 'motion/react';
import { ArrowRight, BookOpen, PenTool, Video, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const [recentContent, setRecentContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      const path = 'contents';
      try {
        const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
        setRecentContent(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };
    fetchRecent();
  }, []);

  const stats = [
    { label: 'Cours PDF', count: 'Documents', icon: '📄', color: 'bg-red-50 text-red-600', path: '/cours' },
    { label: 'Exercices', count: 'Séries', icon: '📝', color: 'bg-green-50 text-green-600', path: '/exercices' },
    { label: 'Vidéos', count: 'YouTube', icon: '🎬', color: 'bg-blue-50 text-blue-600', path: '/videos' },
    { label: 'Interactifs', count: 'H5P', icon: '🧩', color: 'bg-purple-50 text-purple-600', path: '/outils' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <section className="bg-blue-600 text-white p-10 rounded-2xl relative overflow-hidden shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tighter mb-4 uppercase">Excellence Éducative</h1>
          <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
            Bienvenue sur la plateforme de PROFMOUMEN. Accédez à vos supports de cours, exercices interactifs et vidéos pédagogiques en un clic.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <BookOpen className="w-64 h-64 -mr-16 -mt-16" />
        </div>
      </section>

      {/* Quick Access Tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link to={stat.path} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow group">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mb-4 text-2xl shadow-sm border border-black/5 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <h3 className="font-bold text-slate-800">{stat.label}</h3>
              <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">{stat.count}</p>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* Recent Resources List */}
      <section className="bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Dernières Publications</h2>
          <Link to="/cours" className="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">Voir tout</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="px-6 py-6 animate-pulse bg-slate-50/20 h-20"></div>
            ))
          ) : recentContent.length > 0 ? (
            recentContent.map((content) => (
              <div key={content.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded shrink-0 ${
                    content.type === 'pdf' ? 'bg-red-50 text-red-500' : 
                    content.type === 'youtube' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                  }`}>
                    {content.type === 'pdf' ? '📄' : content.type === 'youtube' ? '🎬' : '🧩'}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">{content.title}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-tighter font-medium">
                      {content.type.toUpperCase()} • {format(content.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}
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
                  {content.type === 'youtube' && (
                    <button 
                      onClick={() => window.open(content.url, '_blank')}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-blue-500 transition-all shadow-sm shadow-blue-500/10"
                    >
                      Regarder
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400 text-sm italic">Aucune ressource disponible.</div>
          )}
        </div>
      </section>
    </div>
  );
}
