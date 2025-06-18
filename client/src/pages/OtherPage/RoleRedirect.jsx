// pages/OtherPage/RoleRedirect.jsx
import { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from '../../context/UserContext';

export default function RoleRedirect() {
  const { user } = useContext(userContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/signin', { replace: true });
    } else if (user.role === 'attendees') {
      navigate('/attendeeInterface', { replace: true });
    } else {
      navigate('/home', { replace: true }); // 🔄 updated from /dashboard to /home
    }
  }, [user, navigate]);

  return null;
}
