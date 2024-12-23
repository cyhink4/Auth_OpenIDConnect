import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login, checkAuthStatus } from '../../services/api';
import '../../styles/auth.css'; 

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    password: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        navigate('/');
        return;
      }
  
      const isAuthenticated = await checkAuthStatus();
      if (isAuthenticated) {
        navigate('/');
        return;
      }
  
      const params = new URLSearchParams(location.search);
      if (params.get('error')) {
        setError('Authentication failed');
        return;
      }
    
      const accessToken = params.get('accessToken');
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        navigate('/');
      }
    };
  
    checkAuth();
  }, [location, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      const response = await login(formData.name, formData.password);
      console.log(`Check res::::`,response)
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        navigate('/');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err); 
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:9192/auth/google';
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Please enter your details</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Username"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="auth-button">
            Sign In
          </button>
          
          <div className="auth-divider">
            <span>or continue with</span>
          </div>
          
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="google-button"
          >
            <i className="fa-brands fa-google"></i>
            <span>Sign in with Google</span>
          </button>

          <p className="auth-footer">
            Don't have an account? 
            <Link to="/register" className="auth-link">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
