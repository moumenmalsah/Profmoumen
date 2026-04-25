import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Content, ContentCategory, ContentFormData, ContentType } from '../types';
import { Plus, Trash2, Edit3, Save, X, ExternalLink, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminPage() {
  const { user, isTeacher, loading: authLoading } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue } = useForm<ContentFormData>();

  const fetchAllContents = async () => {
    setLoading(true);
    const path = 'contents';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
      setContents(data);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTeacher) {
      fetchAllContents();
    }
  }, [isTeacher]);

  const onSubmit = async (data: ContentFormData) => {
    setSubmitting(true);
    const path = 'contents';
    try {
      if (editingId) {
        const docRef = doc(db, path, editingId);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, path), {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      reset();
      setIsAdding(false);
      setEditingId(null);
      await fetchAllContents();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) return;
    const path = 'contents';
    try {
      await deleteDoc(doc(db, path, id));
      await fetchAllContents();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const handleEdit = (content: Content) => {
    setEditingId(content.id);
    setValue('title', content.title);
    setValue('description', content.description || '');
    setValue('category', content.category);
    setValue('type', content.type);
    setValue('url', content.url);
    setIsAdding(true);
  };

  if (authLoading) return <div className="p-20 text-center italic">Chargement...</div>;

  if (!isTeacher) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <h1 className="text-4xl font-bold mb-4">Accès Restreint</h1>
        <p className="text-gray-500 italic serif">Seul le Professeur Moumen peut accéder à cette page.</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter text-slate-900 uppercase">Gestion Administrative</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Contrôle du contenu pédagogique</p>
        </div>
        
        <button
          onClick={() => { setIsAdding(!isAdding); if (isAdding) { setEditingId(null); reset(); } }}
          className={`flex items-center space-x-2 px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
            isAdding ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:scale-105'
          }`}
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isAdding ? 'Annuler' : 'Nouveau Contenu'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-8 bg-white border border-slate-200 p-8 rounded-xl shadow-sm"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Titre du document</label>
                  <input
                    {...register('title', { required: true })}
                    className="w-full px-4 py-2 rounded border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                    placeholder="Ex: Analyse Combinatoire"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Description / Notes</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-4 py-2 rounded border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm italic"
                    placeholder="Quelques détails..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Catégorie</label>
                    <select
                      {...register('category', { required: true })}
                      className="w-full px-4 py-2 rounded border border-slate-200 text-sm font-medium"
                    >
                      <option value="course">Cours</option>
                      <option value="exercise">Exercice</option>
                      <option value="video">Vidéo</option>
                      <option value="tool">Outil / H5P</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Format</label>
                    <select
                      {...register('type', { required: true })}
                      className="w-full px-4 py-2 rounded border border-slate-200 text-sm font-medium"
                    >
                      <option value="pdf">PDF</option>
                      <option value="youtube">YouTube</option>
                      <option value="h5p">H5P</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Lien externe (URL)</label>
                  <input
                    {...register('url', { required: true })}
                    className="w-full px-4 py-2 rounded border border-slate-200 font-mono text-[11px] text-slate-500"
                    placeholder="https://..."
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingId ? 'Valider les modifications' : 'Publier la ressource'}</span>
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Ressource / Lien</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Type</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={3} className="px-6 py-6 animate-pulse bg-slate-50/20 h-16"></td></tr>
              ))
            ) : contents.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-20 text-center text-slate-400 text-sm font-medium uppercase italic tracking-widest">Le catalogue est vide.</td></tr>
            ) : (
              contents.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-900">{item.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium italic">{item.url}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-100 rounded border border-slate-200 text-slate-600">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded transition-all" title="Modifier">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded transition-all" title="Supprimer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
