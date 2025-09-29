'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur capturée:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-6xl font-black text-red-500 mb-4">Oops!</h1>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          Une erreur s'est produite
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          {error.message || 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
        </p>
        <button
          onClick={reset}
          className="inline-block bg-white text-black font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-all duration-300"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}