import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl sm:text-8xl font-black text-white mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Page introuvable</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link 
          href="/"
          className="inline-block bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}