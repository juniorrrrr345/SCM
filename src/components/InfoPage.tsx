'use client';

interface InfoPageProps {
  content: string;
}

export default function InfoPage({ content }: InfoPageProps) {
  const parseMarkdown = (text: string) => {
    return text
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl sm:text-3xl font-bold text-white mb-6 text-center">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl sm:text-2xl font-bold text-white mb-4 mt-8">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-lg sm:text-xl font-bold text-white mb-3 mt-6">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 text-gray-300 mb-1">$1. $2</li>')
      .replace(/`(.+?)`/g, '<code class="bg-gray-800 px-2 py-1 rounded text-green-400">$1</code>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="container mx-auto px-4 pt-32 sm:pt-36 md:pt-40 pb-24 max-w-4xl">
      {/* Titre de la page avec style boutique */}
      <div className="text-center mb-8">
        <h1 className="shop-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-3">
          Informations
        </h1>
        <div className="w-20 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
      </div>

      {/* Affichage instantané du contenu */}
      {content ? (
        <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
          <div 
            className="prose prose-lg max-w-none text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
          />
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <p>Aucun contenu disponible</p>
        </div>
      )}
    </div>
  );
}