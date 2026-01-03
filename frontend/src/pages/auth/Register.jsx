import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (!formData.email.endsWith('@um5.ac.ma')) {
      setError('Veuillez utiliser votre email universitaire (@um5.ac.ma)');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.token) {
        await login(response.token);
        navigate('/student/dashboard'); // Redirection vers le dashboard étudiant
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Styles Dark Mode
  const inputStyle = "w-full bg-[#2a2a2a] border border-[#333] text-white rounded-xl p-4 focus:border-red-600 focus:outline-none transition-colors placeholder-gray-500";
  const labelStyle = "block text-sm font-bold text-gray-400 mb-2 ml-1";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: '#0f0f0f' }}>
      
      {/* Background Effects (Match Login) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-md w-full bg-[#1a1a1a] border border-[#333] rounded-2xl shadow-2xl p-8 relative z-10 backdrop-blur-sm">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
            Rejoindre <span className="text-red-600">ENSIAS Eats</span>
          </h1>
          <p className="text-gray-400">Créez votre compte étudiant</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Name Field */}
          <div>
            <label htmlFor="name" className={labelStyle}>Nom Complet</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="Ex: Yasser Moulay"
            />
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className={labelStyle}>Email UM5</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="prenom.nom@um5.ac.ma"
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className={labelStyle}>Mot de passe</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="Minimum 6 caractères"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className={labelStyle}>Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className={inputStyle}
              placeholder="Répétez le mot de passe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-900/20 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Création en cours...' : 'CRÉER MON COMPTE'}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center mt-8 text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-red-500 hover:text-red-400 font-bold hover:underline transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;