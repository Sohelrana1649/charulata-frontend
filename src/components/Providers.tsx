'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LanguageProvider, Locale } from '@/i18n/LanguageContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthSync from '@/components/AuthSync';

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
    const isExtensionError = (msg?: string, src?: string, stack?: string) => {
      const combined = `${msg || ''} ${src || ''} ${stack || ''}`;
      return (
        combined.includes('chrome-extension://') ||
        combined.includes('moz-extension://') ||
        combined.includes('eppiocemhmnlbhjplcgkofciiegomcon') ||
        combined.includes("reading 'M_ID'") ||
        combined.includes('M_ID')
      );
    };

    const handleExtensionError = (event: ErrorEvent) => {
      if (isExtensionError(event.message, event.filename, event.error?.stack)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    const handleExtensionRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (isExtensionError(reason?.message || String(reason || ''), reason?.fileName, reason?.stack)) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleExtensionError, true);
    window.addEventListener('unhandledrejection', handleExtensionRejection, true);
    return () => {
      window.removeEventListener('error', handleExtensionError, true);
      window.removeEventListener('unhandledrejection', handleExtensionRejection, true);
    };
  }, []);

  return (
    <Provider store={store}>
      <AuthSync />
      <GoogleOAuthProvider clientId={googleClientId}>
        <LanguageProvider initialLocale={initialLocale}>
          {children}
          <ToastContainer position="top-right" autoClose={3000} theme="dark" />
        </LanguageProvider>
      </GoogleOAuthProvider>
    </Provider>
  );
}
