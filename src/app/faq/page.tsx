import type { Metadata } from 'next';
import FaqClientView from './FaqClientView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Frequently Asked Questions (FAQ) | Charulata Lifestyle',
  description: 'Find answers to common questions about delivery, payments, cash on delivery, returns, and showroom visits at Charulata Lifestyle.',
};

export default function FAQPage() {
  return <FaqClientView />;
}
