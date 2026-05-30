import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Register() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the full onboarding flow at /get-started
    navigate('/get-started', { replace: true });
  }, [navigate]);

  return null;
}

export default Register;
