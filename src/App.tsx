import { useEffect, useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { auth, login, logout } from './lib/firebase.ts';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Home, LogIn, LogOut, Menu, X, Plus, BookOpen, PenTool, Video, Settings, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';

// Auth Context
const AuthContext = createContext<{
  user: User | null;
  isTeacher: boolean;
  loading: boolean;
}>({ user: null, isTeacher: false, loading: true });

export const useAuth = () => useContext(AuthContext);

const TEACHER_EMAIL = 'moumenmalsah@gmail.com';

function Sidebar() {
  const { user, isTeacher } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Accueil', path: '/', key: 'H' },
    { name: 'Cours', path: '/cours', key: 'C' },
    { name: 'Exercices', path: '/exercices', key: 'E' },
    { name: 'Vidéos', path: '/videos', key: 'V' },
    { name: 'Outils', path: '/outils', key: 'O' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 h-screen sticky top-0">
      <div className="p-8">
        <Link to="/" className="text-2xl font-bold tracking-tighter hover:text-blue-400 transition-colors">
          PROF<span className="text-blue-400">MOUMEN</span>
        </Link>
        <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-widest font-semibold">Espace Éducatif</p>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center space-x-3 p-3 rounded-lg font-medium transition-all group ${
              location.pathname === link.path 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className={`w-5 h-5 flex items-center justify-center border-2 rounded-sm text-[10px] font-bold transition-colors ${
              location.pathname === link.path ? 'border-white' : 'border-slate-500 group-hover:border-white'
            }`}>
              {link.key}
            </span>
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        {isTeacher ? (
          <Link 
            to="/admin"
            className={`w-full flex items-center justify-center space-x-2 py-2.5 rounded border text-sm font-medium transition-all ${
              location.pathname === '/admin'
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Accès Admin</span>
          </Link>
        ) : (
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Version v1.0</p>
        )}
      </div>
    </aside>
  );
}

function Header() {
  const { user } = useAuth();
  const location = useLocation();
  
  const getBreadcrumb = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Tableau de bord';
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-4 text-sm">
        <span className="text-slate-400">PROFMOUMEN</span>
        <span className="text-slate-300">/</span>
        <span className="font-semibold text-slate-700">{getBreadcrumb()}</span>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="hidden sm:block">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900 uppercase tracking-tighter">Bienvenue</p>
            <p className="text-[10px] text-slate-400">{user?.email || 'Visiteur'}</p>
          </div>
        </div>
        {user ? (
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs border border-blue-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all uppercase"
            title="Se déconnecter"
          >
            {user.email?.[0] || 'U'}
          </button>
        ) : (
          <button 
            onClick={login}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/20"
          >
            Connexion
          </button>
        )}
      </div>
    </header>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isTeacher, setIsTeacher] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsTeacher(u?.email === TEACHER_EMAIL);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isTeacher, loading }}>
      <Router>
        <div className="flex min-h-screen bg-slate-50 font-sans">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-7xl mx-auto w-full">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/cours" element={<CategoryPage category="course" title="Cours" />} />
                  <Route path="/exercices" element={<CategoryPage category="exercise" title="Exercices" />} />
                  <Route path="/videos" element={<CategoryPage category="video" title="Vidéos" />} />
                  <Route path="/outils" element={<CategoryPage category="tool" title="Outils" />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}
