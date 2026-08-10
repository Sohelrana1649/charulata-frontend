'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '627933808535-12olfmjeimfmbo44mdgf4hs2g4gran7f.apps.googleusercontent.com';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <LanguageProvider>
          {children}
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </LanguageProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
