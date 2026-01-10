import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          uid: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email.split('@')[0]
        });
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser({
            uid: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.email.split('@')[0]
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        let errorMessage = 'Lỗi đăng nhập';
        
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email hoặc password không đúng';
            break;
          case 'Email not confirmed':
            errorMessage = 'Vui lòng xác nhận email trước khi đăng nhập';
            break;
          default:
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      if (password !== confirmPassword) {
        return { success: false, error: 'Password không khớp' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Password phải có ít nhất 6 ký tự' };
      }

      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0]
          }
        }
      });

      if (error) {
        let errorMessage = 'Lỗi đăng ký';
        
        switch (error.message) {
          case 'User already registered':
            errorMessage = 'Email đã được sử dụng';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'Password phải có ít nhất 6 ký tự';
            break;
          default:
            errorMessage = error.message;
        }
        
        return { success: false, error: errorMessage };
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return { 
          success: true, 
          user: data.user,
          message: 'Vui lòng check email để xác nhận tài khoản'
        };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { success: false, error: 'Lỗi đăng xuất' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Lỗi kết nối' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};