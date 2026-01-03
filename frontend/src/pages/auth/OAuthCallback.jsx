import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      // Check if this is an error callback
      const errorMessage = searchParams.get('message');
      if (errorMessage) {
        const errorMessages = {
          invalid_domain: 'Veuillez utiliser votre email @um5.ac.ma',
          auth_failed: 'Échec de l\'authentification. Veuillez réessayer.',
        };
        setError(errorMessages[errorMessage] || 'Échec de l\'authentification');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Check if this is a success callback
      const token = searchParams.get('token');
      const needsOnboarding = searchParams.get('onboarding') === 'true';

      if (token) {
        try {
          await login(token);
          if (needsOnboarding) {
            navigate('/onboarding');
          } else {
            navigate('/student/dashboard'); // Assure-toi que c'est la bonne route dashboard
          }
        } catch (err) {
          setError('Impossible de finaliser la connexion.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
        }
      } else {
        setError('Réponse d\'authentification invalide');
        setLoading(false);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
      
      {/* Background Effects (Match Login) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-10 text-center relative z-10 backdrop-blur-sm">
        
        {loading ? (
          <div className="flex flex-col items-center">
            {/* Custom Red Spinner */}
            <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-[#333]"></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-red-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connexion en cours...</h2>
            <p className="text-gray-400">Nous configurons votre espace sécurisé.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center text-4xl mb-6 border border-red-900/50 text-red-500">
                ❌
            </div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Échec de connexion</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <p className="text-sm text-gray-600 animate-pulse">Redirection vers l'accueil...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-green-900/20 rounded-full flex items-center justify-center text-4xl mb-6 border border-green-900/50 text-green-500">
                ✅
            </div>
            <h2 className="text-2xl font-bold text-green-500 mb-2">Succès !</h2>
            <p className="text-gray-400">Bienvenue sur ENSIAS Eats.</p>
            <p className="text-sm text-gray-600 mt-4">Chargement du dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;