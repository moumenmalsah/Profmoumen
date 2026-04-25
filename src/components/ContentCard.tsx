import { FileText, Play, ExternalLink, Download, Layout } from 'lucide-react';
import { Content } from '../types';
import { motion } from 'motion/react';

interface ContentCardProps {
  content: Content;
}

export default function ContentCard({ content }: ContentCardProps) {
  const getIcon = () => {
    switch (content.type) {
      case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
      case 'youtube': return <Play className="w-5 h-5 text-red-600" />;
      case 'h5p': return <Layout className="w-5 h-5 text-purple-600" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (content.type) {
      case 'pdf': return 'Document PDF';
      case 'youtube': return 'Vidéo YouTube';
      case 'h5p': return 'Interactif H5P';
      default: return 'Ressource';
    }
  };

  const handleOpen = () => {
    window.open(content.url, '_blank', 'referrer');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform duration-300">
            {getIcon()}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
            {content.category}
          </span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">
          {content.title}
        </h3>
        
        {content.description && (
          <p className="text-gray-500 text-sm mb-6 line-clamp-3 italic serif leading-relaxed flex-grow">
            {content.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
          <span className="text-[11px] font-medium text-gray-400 uppercase tracking-tighter">
            {getLabel()}
          </span>
          <div className="flex space-x-2">
            {content.type === 'pdf' && (
              <a 
                href={content.url} 
                download 
                className="p-2 rounded-full hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors"
                title="Télécharger"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button 
              onClick={handleOpen}
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 hover:bg-blue-600 transition-all hover:translate-x-1"
            >
              <span>{content.type === 'youtube' ? 'Regarder' : 'Ouvrir'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
