import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMicrosoftLogin = async () => {
    try {
      const response = await authService.getMicrosoftLoginUrl();
      if (response.success && response.authUrl) {
        window.location.href = response.authUrl;
      } else {
        setError('La connexion Microsoft n\'est pas disponible.');
      }
    } catch (err) {
      console.error('Erreur login:', err);
      setError('Échec de la connexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
      
      {/* Background Effects (Lueur Rouge) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

      {/* Login Card */}
      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-10 relative z-10 backdrop-blur-sm">
        
        {/* Logo & Title */}
        <div className="text-center mb-10">
          {/* IMAGE DU LOGO (Remplace 'votre-image.png' par le vrai nom du fichier dans public) */}
          <img 
            src="/logo.png" 
            alt="ENSIAS Eats Logo" 
className="w-[180px] h-auto mx-auto mb-6 object-contain drop-shadow-[0_0_15px_rgba(229,9,20,0.3)]"          />

          {/* <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
            ENSIAS <span className="text-red-600">Eats</span>
          </h1> */}
          <p className="text-gray-400 font-medium">Smart Campus Cafeteria</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Microsoft Login Button */}
        <button
          type="button"
          onClick={handleMicrosoftLogin}
          disabled={loading}
          className="w-full group relative flex items-center justify-center px-6 py-4 bg-white text-black rounded-xl hover:bg-gray-200 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          {/* Microsoft Logo SVG */}
          <svg className="w-6 h-6 mr-3 relative z-10" viewBox="0 0 23 23">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          
          <span className="font-bold text-lg relative z-10">
            {loading ? 'Connexion...' : 'Se connecter avec Microsoft'}
          </span>
        </button>

        {/* Footer */}
        <div className="mt-8 text-center border-t border-[#333] pt-6">
           <p className="text-xs text-gray-600">
             © 2026 NutriLogic Team • ENSIAS EATS
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;