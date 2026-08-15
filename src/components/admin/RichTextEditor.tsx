'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  Heading3, 
  List, 
  ListOrdered, 
  Undo, 
  Redo,
  Smile,
  Palette
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const EMOJI_LIST = [
  '🔥', '⚡', '✨', '💥', '📦', '🚚', '✅', '⭐', '💯', '🏷️',
  '🛍️', '👕', '👗', '👔', '👟', '💎', '📱', '🎁', '✓', '◆',
  '•', '❤️', '😍', '👍', '🌟', '📌', '🎉'
];

const COLOR_PRESETS = [
  { name: 'Red', color: '#E11D48' },
  { name: 'Gold', color: '#D97706' },
  { name: 'Green', color: '#059669' },
  { name: 'Blue', color: '#2563EB' },
  { name: 'Purple', color: '#7C3AED' },
  { name: 'Dark', color: '#111827' }
];

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

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
        class: 'prose dark:prose-invert max-w-none min-h-[180px] max-h-[400px] overflow-y-auto p-3.5 focus:outline-none text-xs sm:text-sm text-foreground bg-muted/30 rounded-b-xl',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined) {
      const currentHTML = editor.getHTML();
      if (content !== currentHTML && (content === '' || currentHTML === '<p></p>')) {
        editor.commands.setContent(content || '');
      }
    }
  }, [content, editor]);

  const insertEmoji = (emoji: string) => {
    if (editor) {
      editor.chain().focus().insertContent(emoji).run();
    }
  };

  const applyColor = (colorHex: string) => {
    if (editor) {
      const selection = editor.state.selection;
      if (!selection.empty) {
        const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
        editor.chain().focus().insertContent(`<span style="color: ${colorHex}">${selectedText}</span>`).run();
      } else {
        editor.chain().focus().insertContent(`<span style="color: ${colorHex}">colored text</span>`).run();
      }
    }
  };

  if (!editor) {
    return (
      <div className="w-full min-h-[180px] bg-muted/40 border border-border rounded-xl animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading Rich Text Editor...
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

        {/* Color Picker Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowEmojiPicker(false);
            }}
            className="p-1.5 px-2 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center space-x-1 min-w-[32px] h-8 hover:bg-muted text-foreground/80 hover:text-foreground"
            title="Text Color"
          >
            <Palette size={15} className="text-primary" />
            <span className="text-[10px] hidden sm:inline">Color</span>
          </button>

          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 p-2 bg-card border border-border rounded-xl shadow-xl z-50 flex items-center gap-1.5 animate-in fade-in duration-150">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => {
                    applyColor(preset.color);
                    setShowColorPicker(false);
                  }}
                  className="w-5 h-5 rounded-full border border-border/60 hover:scale-125 transition-transform cursor-pointer shadow-xs"
                  style={{ backgroundColor: preset.color }}
                  title={preset.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Emoji Quick Picker Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
            }}
            className="p-1.5 px-2 rounded-lg transition-colors cursor-pointer text-xs font-bold flex items-center space-x-1 min-w-[32px] h-8 hover:bg-muted text-amber-500 hover:text-amber-600"
            title="Insert Emoji"
          >
            <Smile size={15} />
            <span className="text-[10px] hidden sm:inline">Emoji</span>
          </button>

          {showEmojiPicker && (
            <div className="absolute top-full left-0 mt-1 p-2.5 bg-card border border-border rounded-xl shadow-xl z-50 grid grid-cols-7 gap-1.5 max-w-[240px] animate-in fade-in duration-150">
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    insertEmoji(emoji);
                  }}
                  className="w-7 h-7 text-base flex items-center justify-center rounded-lg hover:bg-muted transition-all cursor-pointer hover:scale-125"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

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

      {/* Emoji Quick Strip Bar */}
      <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-muted/40 border-b border-border/60 overflow-x-auto no-scrollbar text-sm">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
          Quick Emojis:
        </span>
        {EMOJI_LIST.slice(0, 15).map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => insertEmoji(emoji)}
            className="hover:scale-125 transition-transform cursor-pointer p-0.5"
            title={`Insert ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}
