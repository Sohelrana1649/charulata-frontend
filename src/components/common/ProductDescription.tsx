'use client';

import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface ProductDescriptionProps {
  html?: string;
  className?: string;
}

export default function ProductDescription({ html, className = '' }: ProductDescriptionProps) {
  if (!html || !html.trim()) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed italic">
        No product description available.
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

  return (
    <div
      className={`product-description-prose prose dark:prose-invert max-w-none text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
