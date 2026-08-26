import type { Metadata } from 'next';
import ContactClientView from './ContactClientView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Contact Us | Charulata Lifestyle - Showroom & Support',
  description: 'Get in touch with Charulata Lifestyle. Visit our flagship showroom in Moghbazar, Dhaka or send us a message online.',
};

export default function ContactPage() {
  return <ContactClientView />;
}
