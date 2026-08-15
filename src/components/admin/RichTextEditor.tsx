'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Heading3, 
  List, 
  ListOrdered, 
  Undo, 
  Redo 
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [3],
        },
      }),
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none min-h-[160px] max-h-[400px] overflow-y-auto p-3.5 focus:outline-none text-xs sm:text-sm text-foreground bg-muted/30 rounded-b-xl',
      },
    },
  });

  // Keep content in sync when form resets or loads existing product
  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      if (content !== currentHTML && (content === '' || currentHTML === '<p></p>')) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="w-full min-h-[180px] bg-muted/40 border border-border rounded-xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading TipTap Editor...
      </div>
    );
  }

  return (
    <div className="w-full border border-border rounded-xl overflow-hidden bg-card focus-within:border-primary transition-colors shadow-2xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/80 border-b border-border text-foreground">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 ${
            editor.isActive('bold')
              ? 'bg-primary text-white shadow-xs'
              : 'hover:bg-muted text-foreground/80 hover:text-foreground'
          }`}
          title="Bold"
          aria-label="Bold"
        >
          <Bold size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 ${
            editor.isActive('italic')
              ? 'bg-primary text-white shadow-xs'
              : 'hover:bg-muted text-foreground/80 hover:text-foreground'
          }`}
          title="Italic"
          aria-label="Italic"
        >
          <Italic size={15} />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 px-2 rounded-lg transition-colors cursor-pointer text-xs font-extrabold flex items-center space-x-1 min-w-[32px] h-8 ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary text-white shadow-xs'
              : 'hover:bg-muted text-foreground/80 hover:text-foreground'
          }`}
          title="Heading 3"
          aria-label="Heading 3"
        >
          <Heading3 size={15} />
          <span className="text-[11px] font-mono">H3</span>
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white shadow-xs'
              : 'hover:bg-muted text-foreground/80 hover:text-foreground'
          }`}
          title="Bullet List"
          aria-label="Bullet List"
        >
          <List size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 ${
            editor.isActive('orderedList')
              ? 'bg-primary text-white shadow-xs'
              : 'hover:bg-muted text-foreground/80 hover:text-foreground'
          }`}
          title="Numbered List"
          aria-label="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 hover:bg-muted text-foreground/80 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="Undo"
          aria-label="Undo"
        >
          <Undo size={15} />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center justify-center min-w-[32px] h-8 hover:bg-muted text-foreground/80 hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
          title="Redo"
          aria-label="Redo"
        >
          <Redo size={15} />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
