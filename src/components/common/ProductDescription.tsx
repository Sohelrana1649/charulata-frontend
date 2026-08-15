'use client';

import React, { useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useTranslation } from '@/i18n/LanguageContext';

interface ProductDescriptionProps {
  html?: string;
  className?: string;
  isCollapsible?: boolean;
}

export default function ProductDescription({ html, className = '', isCollapsible = true }: ProductDescriptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { locale } = useTranslation();

  if (!html || !html.trim()) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        {locale === 'bn' ? 'কোন বিস্তারিত বিবরণ পাওয়া যায়নি।' : 'No product description available.'}
      </p>
    );
  }

  // Check if string contains HTML tags
  const isHtml = /<[a-z][\s\S]*>/i.test(html);

  // Format legacy plain strings (with newlines) into HTML paragraphs if HTML tags are missing
  const rawContent = isHtml 
    ? html 
    : html
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => `<p>${line}</p>`)
        .join('');

  // Sanitize HTML string against XSS attacks using DOMPurify
  const cleanHtml = DOMPurify.sanitize(rawContent, {
    ALLOWED_TAGS: [
      'p', 'b', 'i', 'em', 'strong', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
      'ul', 'ol', 'li', 'br', 'span', 'div', 'blockquote', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'title'],
  });

  // Calculate if content is long enough to require "Read More" collapse
  const textLength = cleanHtml.replace(/<[^>]*>/g, '').length;
  const shouldCollapse = isCollapsible && textLength > 220;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div
          className={`product-description-prose prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans transition-all duration-300 ease-in-out ${
            shouldCollapse && !isExpanded ? 'max-h-[220px] overflow-hidden' : 'max-h-none'
          } ${className}`}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />

        {/* Bottom Fade Gradient when Collapsed */}
        {shouldCollapse && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card via-card/80 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand / Collapse Toggle Button */}
      {shouldCollapse && (
        <div className="pt-1 flex justify-start">
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold text-xs sm:text-sm rounded-xl border border-primary/20 hover:border-primary/40 transition-all cursor-pointer shadow-2xs group"
          >
            <BookOpen size={14} className="text-primary group-hover:scale-110 transition-transform" />
            <span>
              {isExpanded
                ? (locale === 'bn' ? 'কমিয়ে সংক্ষেপ করুন ↑' : 'Show Less ↑')
                : (locale === 'bn' ? 'বিস্তারিত আরও পড়ুন ↓' : 'Read More Description ↓')}
            </span>
            {isExpanded ? (
              <ChevronUp size={14} className="text-primary" />
            ) : (
              <ChevronDown size={14} className="text-primary animate-bounce" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
