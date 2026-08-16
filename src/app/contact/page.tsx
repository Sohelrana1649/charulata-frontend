'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  ExternalLink, 
  MessageCircle, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useSubmitContactFormMutation } from '@/store/api/userApi';
import { useTranslation } from '@/i18n/LanguageContext';

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const [submitContactForm, { isLoading: isSendingNote }] = useSubmitContactFormMutation();

  const [noteForm, setNoteForm] = useState({ name: '', email: '', message: '' });
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (noteForm.name && noteForm.email && noteForm.message) {
      try {
        await submitContactForm(noteForm).unwrap();
        setNoteSubmitted(true);
        setErrorMessage('');
        setNoteForm({ name: '', email: '', message: '' });
        setTimeout(() => {
          setNoteSubmitted(false);
        }, 5000);
      } catch (err: any) {
        setErrorMessage(err?.data?.message || 'Failed to send note. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 sm:py-16">
      <div className="mx-auto max-w-[1536px] 2xl:max-w-[1680px] px-4 sm:px-6 lg:px-10 xl:px-12 space-y-12">
        
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full border border-primary/20">
            {locale === 'bn' ? 'যোগাযোগ করুন' : 'Contact Us'}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-serif text-foreground tracking-tight">
            {locale === 'bn' ? 'আমাদের সাথে বার্তা আদান-প্রদান করুন' : 'Get in Touch with Charulata'}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {locale === 'bn' 
              ? 'আমাদের মগবাজার শোরুম ও হেড অফিসে আসুন অথবা নিচে বার্তা পাঠান। আমাদের টিম সার্বক্ষণিক সহায়তায় প্রস্তুত।'
              : 'Visit our Moghbazar showroom & head office or drop us a note below. Our customer care team is always here to assist you.'
            }
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* Flagship Info & Map Column */}
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{locale === 'bn' ? 'আমাদের অবস্থান' : 'Our Location'}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif mt-1">{locale === 'bn' ? 'শোরুম ও হেড অফিস' : 'Showroom & Head Office'}</h2>
              <p className="text-xs text-muted-foreground mt-1.5">
                {locale === 'bn' ? 'প্রিমিয়াম ফ্যাশন ও লাইফস্টাইল প্রোডাক্টের এক্সক্লুসিভ কালেকশন দেখতে আমাদের শোরুমে আসুন।' : 'Visit our showroom to explore our exclusive collection of premium fashion & lifestyle products.'}
              </p>
            </div>

            {/* Embedded Google Map */}
            <div className="relative w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-border bg-card shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.902!2d90.4040!3d23.7465!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDQ0JzQ3LjQiTiA5MMKwMjQnMTQuNCJF!5e0!3m2!1sen!2sbd"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full filter contrast-[1.02]"
              />
            </div>

            {/* Flagship Store Details Card */}
            <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl space-y-4 shadow-2xs">
              {/* Address */}
              <div className="flex items-center space-x-3.5 text-xs">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-foreground text-xs sm:text-sm leading-snug">{locale === 'bn' ? 'মূল শোরুম ও হেড অফিস' : 'Main Showroom & Head Office'}</p>
                  <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm font-semibold leading-snug">
                    {locale === 'bn' 
                      ? 'শফী কমপ্লেক্স, ১/এ আউটার সার্কুলার রোড, মগবাজার, ঢাকা'
                      : 'Shofi Complex, 1/A Outer Circular Rd, Moghbazar, Dhaka'
                    }
                  </p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-center space-x-3.5 text-xs border-t border-border pt-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Clock size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-foreground text-xs sm:text-sm leading-snug">{t('home.openingHours') || 'খোলার সময়'}</p>
                  <p className="mt-0.5 text-muted-foreground text-xs sm:text-sm font-semibold leading-snug">{t('home.storeTiming') || 'সকাল ১০:০০ - রাত ৯:০০ (প্রতিদিন)'}</p>
                </div>
              </div>

              {/* Helpline */}
              <div className="flex items-center space-x-3.5 text-xs border-t border-border pt-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-foreground text-xs sm:text-sm leading-snug">{t('home.callHelpline') || 'হেল্পলাইন নম্বর'}</p>
                  <a href="tel:01620556299" className="mt-0.5 text-primary hover:underline text-xs sm:text-sm font-mono font-bold leading-snug block">01620-556299</a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-3.5 text-xs border-t border-border pt-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Mail size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-foreground text-xs sm:text-sm leading-snug">{t('home.emailEnquiries') || 'ইমেইল অনুসন্ধান'}</p>
                  <a href="mailto:charulatalifestyl@gmail.com" className="mt-0.5 text-primary hover:underline text-xs sm:text-sm font-semibold leading-snug truncate block">charulatalifestyl@gmail.com</a>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                <a
                  href="https://maps.google.com/?q=Shofi+Complex,+1/A+Outer+Circular+Rd,+Moghbazar,+Dhaka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-bold text-foreground transition-colors"
                >
                  <MapPin size={15} className="text-primary" />
                  <span>{t('home.viewOnMap') || 'গুগল ম্যাপে দেখুন'}</span>
                  <ExternalLink size={13} className="text-muted-foreground" />
                </a>

                <a
                  href="https://wa.me/8801620556299"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 py-3 px-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 transition-colors"
                >
                  <MessageCircle size={15} className="text-emerald-500" />
                  <span>{t('home.whatsappChat') || 'হোয়াটসঅ্যাপ চ্যাট'}</span>
                  <ExternalLink size={13} className="text-emerald-500/70" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Message Form Card */}
          <div className="bg-card border border-border p-6 sm:p-8 rounded-2xl space-y-6 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">{locale === 'bn' ? 'বার্তা পাঠান' : 'Contact Form'}</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif mt-1">
                {locale === 'bn' ? 'আপনার মতামত বা জিজ্ঞাসা জানান' : 'Send us a note'}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">
                {locale === 'bn' ? 'যেকোনো কাস্টম অর্ডার বা পণ্যের তথ্যের জন্য আমাদের কাছে মেসেজ লিখুন।' : 'Have a query about sizing, custom sarees, or delivery status? Drop a message!'}
              </p>
            </div>

            <form onSubmit={handleSendNote} className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('home.yourName') || 'আপনার নাম'}</label>
                  <input 
                    type="text" 
                    required
                    placeholder={locale === 'bn' ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your name'}
                    value={noteForm.name}
                    onChange={(e) => setNoteForm({ ...noteForm, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-xs sm:text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('home.yourEmail') || 'ইমেইল ঠিকানা'}</label>
                  <input 
                    type="email" 
                    required
                    placeholder={locale === 'bn' ? 'আপনার ইমেইল দিন' : 'Enter your email'}
                    value={noteForm.email}
                    onChange={(e) => setNoteForm({ ...noteForm, email: e.target.value })}
                    className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-xs sm:text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('home.yourMessage') || 'বার্তা'}</label>
                <textarea 
                  required
                  rows={5}
                  placeholder={locale === 'bn' ? 'আপনার বার্তা লিখুন...' : 'Write your query or feedback here...'}
                  value={noteForm.message}
                  onChange={(e) => setNoteForm({ ...noteForm, message: e.target.value })}
                  className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-xs sm:text-sm text-foreground placeholder-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all resize-none"
                />
              </div>

              {noteSubmitted && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs rounded-xl font-bold flex items-center space-x-2">
                  <CheckCircle2 size={16} />
                  <span>{locale === 'bn' ? 'বার্তা সফলভাবে পাঠানো হয়েছে! শীঘ্রই আমরা আপনার সাথে যোগাযোগ করবো।' : 'Note submitted successfully! We will get back to you shortly.'}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs rounded-xl font-bold">
                  {errorMessage}
                </div>
              )}

              <button 
                type="submit"
                disabled={isSendingNote}
                className="w-full bg-primary hover:opacity-90 text-white text-xs sm:text-sm font-extrabold py-3.5 rounded-xl transition flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer shadow-sm"
              >
                <span>{isSendingNote ? (t('home.sending') || 'পাঠানো হচ্ছে...') : (t('home.sendMessage') || 'বার্তা পাঠান')}</span>
                {!isSendingNote && <Send size={14} />}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
