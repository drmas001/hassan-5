import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

export function useSessionTimeout() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('lastActivity');
    toast.error('Session expired. Please login again.');
    navigate('/login');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    localStorage.setItem('lastActivity', Date.now().toString());
  }, []);

  useEffect(() => {
    const checkTimeout = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      const user = localStorage.getItem('user');

      if (user && lastActivity) {
        const timeSinceLastActivity = Date.now() - parseInt(lastActivity);
        if (timeSinceLastActivity > TIMEOUT_DURATION) {
          logout();
        }
      }
    };

    // Set initial last activity
    resetTimer();

    // Add event listeners for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Check for timeout every minute
    const interval = setInterval(checkTimeout, 60000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [logout, resetTimer]);
}