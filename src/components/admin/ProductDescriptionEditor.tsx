'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import EditorToolbar from './EditorToolbar';

export interface ProductDescriptionEditorProps {
  /**
   * Controlled HTML content passed from parent form
   */
  content?: string;
  /**
   * Initial HTML content for editing existing product
   */
  initialContent?: string;
  /**
   * Callback fired when editor content changes
   */
  onChange: (html: string) => void;
  /**
   * Placeholder displayed when content is empty
   */
  placeholder?: string;
}

export default function ProductDescriptionEditor({
  content,
  initialContent,
  onChange,
  placeholder = 'Write product description, features, specifications, and care instructions...',
}: ProductDescriptionEditorProps) {
  const currentContent = content !== undefined ? content : (initialContent || '');

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // 1. StarterKit: Core extensions (bold, italic, lists, history, paragraphs, H3)
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
      // 2. TextStyle: Prerequisite for setting custom font color
      TextStyle,
      // 3. Color: Allows setting inline text colors from color swatches
      Color,
      // 4. Placeholder: Shows subtle gray placeholder text when editor is blank
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none before:h-0',
      }),
      // 5. Link: Hyperlink support with autolink and clean styling
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 transition cursor-pointer font-medium',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      // 6. Table & Grid Extensions
      Table.configure({
        resizable: false,
        HTMLAttributes: {
          class: 'w-full my-3 border-collapse border border-border text-xs sm:text-sm rounded-xl overflow-hidden shadow-2xs',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border-b border-border/80 divide-x divide-border/60',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-border bg-muted/80 font-bold p-2.5 text-left text-foreground text-xs uppercase tracking-wider',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-border p-2.5 text-foreground align-top bg-card/60',
        },
      }),
    ],
    content: currentContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === '<p></p>' ? '' : html);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[220px] max-h-[450px] overflow-y-auto overflow-x-auto p-4 focus:outline-none text-xs sm:text-sm text-foreground bg-card rounded-b-2xl',
      },
    },
  });

  // Keep editor content in sync with parent when form is reset or loaded
  useEffect(() => {
    if (editor && currentContent !== undefined) {
      const currentHTML = editor.getHTML();
      if (currentContent !== currentHTML && (currentContent === '' || currentHTML === '<p></p>')) {
        editor.commands.setContent(currentContent || '');
      }
    }
  }, [currentContent, editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[260px] bg-muted/30 border border-border rounded-2xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading Tiptap Editor...
      </div>
    );
  }

  return (
    <div className="w-full border border-border rounded-2xl overflow-hidden bg-card focus-within:border-primary/80 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-2xs">
      {/* ── Top Header Toolbar with Quick Emojis & Table Controls ── */}
      <EditorToolbar editor={editor} />

      {/* ── Main Editing Area ── */}
      <div className="overflow-x-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
