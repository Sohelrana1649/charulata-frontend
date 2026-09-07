'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider, Locale } from '@/i18n/LanguageContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '627933808535-12olfmjeimfmbo44mdgf4hs2g4gran7f.apps.googleusercontent.com';

export default function Providers({ 
  children,
  initialLocale = 'bn',
}: { 
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  React.useEffect(() => {
    // Suppress intrusive third-party Chrome extension runtime errors (e.g. Urban VPN, adblockers)
    // from triggering Next.js development error modal overlays
    const handleExtensionError = (event: ErrorEvent) => {
      if (
        event.filename?.includes('chrome-extension://') ||
        event.message?.includes('chrome-extension://') ||
        event.filename?.includes('moz-extension://') ||
        event.message?.includes("reading 'M_ID'")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleExtensionError, true);
    return () => window.removeEventListener('error', handleExtensionError, true);
  }, []);

  return (
    <Provider store={store}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <LanguageProvider initialLocale={initialLocale}>
          {children}
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </LanguageProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
