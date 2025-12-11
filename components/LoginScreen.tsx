
import React from 'react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const handleGuestLogin = () => {
    onLogin({ id: 'guest', name: 'Guest', isGuest: true });
  };

  const handleMockSocialLogin = (provider: string) => {
    onLogin({ id: 'user_123', name: 'Abdullah', isGuest: false });
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 font-arabic bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-md w-full text-center border border-stone-100">
        <div className="w-20 h-20 bg-emerald-900 rounded-full mx-auto flex items-center justify-center mb-6 shadow-lg">
          <span className="text-4xl">☪️</span>
        </div>
        
        <h1 className="text-3xl font-bold text-emerald-900 mb-2">Al-Alim</h1>
        <p className="text-stone-500 mb-10">Your Personal Islamic AI Scholar</p>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleMockSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 py-3 rounded-xl transition-all font-medium"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" className="w-5 h-5" />
            Sign in with Google
          </button>
          
          <button 
            onClick={() => handleMockSocialLogin('Facebook')}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 rounded-xl transition-all font-medium"
          >
            <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="F" className="w-5 h-5 bg-white rounded-full" />
            Sign in with Facebook
          </button>
          
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-stone-400">Or</span>
            </div>
          </div>
          
          <button 
            onClick={handleGuestLogin}
            className="w-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 py-3 rounded-xl transition-all font-semibold"
          >
            Continue as Guest
          </button>
        </div>
        
        <p className="mt-8 text-xs text-stone-400">
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
