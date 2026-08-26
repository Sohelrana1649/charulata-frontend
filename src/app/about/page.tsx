import type { Metadata } from 'next';
import AboutClientView from './AboutClientView';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'About Us | Charulata Lifestyle - Heritage & Elegance',
  description: 'Learn about Charulata Lifestyle, our rich heritage of authentic handloom crafts, royal panjabis, and premium ethnic fashion in Bangladesh.',
};

export default function AboutPage() {
  return <AboutClientView />;
}
