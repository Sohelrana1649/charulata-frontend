'use client';

import React, { useState, useRef, useEffect } from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Heading3,
  List,
  ListOrdered,
  Palette,
  Smile,
  Link2,
  Unlink,
  Table as TableIcon,
  Columns,
  Rows,
  Trash2,
  Combine,
  Plus,
  Minus,
  Undo2,
  Redo2,
  Check,
  X,
} from 'lucide-react';

interface EditorToolbarProps {
  editor: Editor | null;
}

// Preset color palette for product highlights
const COLOR_SWATCHES = [
  { name: 'Default Dark', color: '#111827' },
  { name: 'Rose Red', color: '#E11D48' },
  { name: 'Amber Gold', color: '#D97706' },
  { name: 'Emerald Green', color: '#059669' },
  { name: 'Royal Blue', color: '#2563EB' },
  { name: 'Vibrant Purple', color: '#7C3AED' },
  { name: 'Charcoal Gray', color: '#4B5563' },
];

// Expanded emoji picker list
const EMOJI_PICKER_LIST = [
  '🔥', '⚡', '✨', '💥', '📦', '🚚', '✅', '⭐', '💯', '🏷️',
  '🛍️', '👕', '👗', '👔', '👟', '💎', '📱', '🎁', '✓', '◆',
  '•', '❤️', '😍', '👍', '🌟', '📌', '🎉', '🌿', '🧵', '📏',
  '🛡️', '🕒', '💳', '📢', '🥇', '🚀'
];

// 14 Quick action emojis displayed directly on the second row
const QUICK_EMOJIS = [
  '🔥', '⚡', '✨', '💥', '📦', '🚚', '✅', '⭐', '💯', '🏷️',
  '🛍️', '👕', '👗', '👔', '👟'
];

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const colorPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const linkInputRef = useRef<HTMLInputElement>(null);

  // Close popovers on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) {
        setShowLinkInput(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto focus input when link popover opens
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkInput]);

  if (!editor) {
    return null;
  }

  const insertEmoji = (emoji: string) => {
    editor.chain().focus().insertContent(emoji).run();
  };

  const applyColor = (hex: string) => {
    (editor.chain().focus() as any).setColor(hex).run();
    setShowColorPicker(false);
  };

  // Open link input and prefill with current URL if cursor is inside an existing link
  const handleOpenLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setShowLinkInput(!showLinkInput);
    setShowColorPicker(false);
    setShowEmojiPicker(false);
  };

  // Apply or update link on selected text (or insert URL as link text if no selection)
  const handleSetLink = (e?: React.FormEvent | React.MouseEvent | React.KeyboardEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run();
      setShowLinkInput(false);
      return;
    }

    let formattedUrl = linkUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl) && !formattedUrl.startsWith('/') && !formattedUrl.startsWith('#')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const { from, to } = editor.state.selection;
    if (from === to) {
      // Empty selection: insert the URL itself as link text and href
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${formattedUrl}</a>`)
        .run();
    } else {
      // Selection exists: wrap with link
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: formattedUrl, target: '_blank' })
        .run();
    }

    setShowLinkInput(false);
    setLinkUrl('');
  };

  // Remove link
  const handleUnsetLink = () => {
    editor.chain().focus().unsetLink().run();
    setShowLinkInput(false);
    setLinkUrl('');
  };

  // Insert default 3x3 table with header row
  const handleInsertTable = () => {
    try {
      if (typeof (editor.chain().focus() as any).insertTable === 'function') {
        (editor.chain().focus() as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      } else if (typeof (editor.commands as any).insertTable === 'function') {
        (editor.commands as any).insertTable({ rows: 3, cols: 3, withHeaderRow: true });
      } else {
        // Fallback: insert HTML table directly if extension command is not registered yet
        editor.chain().focus().insertContent(`
          <table class="w-full my-3 border-collapse border border-border text-xs sm:text-sm">
            <thead>
              <tr>
                <th class="border border-border bg-muted/80 font-bold p-2 text-left">Header 1</th>
                <th class="border border-border bg-muted/80 font-bold p-2 text-left">Header 2</th>
                <th class="border border-border bg-muted/80 font-bold p-2 text-left">Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-border p-2">Item 1</td>
                <td class="border border-border p-2">Item 2</td>
                <td class="border border-border p-2">Item 3</td>
              </tr>
              <tr>
                <td class="border border-border p-2">Item 4</td>
                <td class="border border-border p-2">Item 5</td>
                <td class="border border-border p-2">Item 6</td>
              </tr>
            </tbody>
          </table>
        `).run();
      }
    } catch (err) {
      console.warn('Table insertion fallback used:', err);
    }
  };

  const isTableActive = Boolean(editor.isActive('table'));
  const isLinkActive = Boolean(editor.isActive('link'));

  return (
    <div className="bg-muted/70 border-b border-border select-none">
      {/* ── Top Row: Main Formatting Actions ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border/50 text-foreground">
        
        {/* Bold Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
            editor.isActive('bold')
              ? 'bg-primary text-white shadow-xs font-black'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold size={15} />
        </button>

        {/* Italic Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
            editor.isActive('italic')
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic size={15} />
        </button>

        {/* Heading 3 Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 py-1.5 rounded-lg text-xs font-extrabold transition cursor-pointer flex items-center space-x-1 ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Heading 3"
        >
          <Heading3 size={15} />
          <span className="text-[11px]">H3</span>
        </button>

        <div className="w-[1px] h-5 bg-border mx-0.5 sm:mx-1" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
            editor.isActive('bulletList')
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Bullet List"
        >
          <List size={15} />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
            editor.isActive('orderedList')
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </button>

        <div className="w-[1px] h-5 bg-border mx-0.5 sm:mx-1" />

        {/* Text Color Picker Popover */}
        <div className="relative" ref={colorPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowColorPicker(!showColorPicker);
              setShowEmojiPicker(false);
              setShowLinkInput(false);
            }}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              showColorPicker ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground hover:bg-muted-foreground/15'
            }`}
            title="Text Color"
          >
            <Palette size={15} className="text-primary" />
            <span className="text-[11px] font-semibold hidden xs:inline">Color</span>
          </button>

          {showColorPicker && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl p-2.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
              {COLOR_SWATCHES.map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => applyColor(swatch.color)}
                  className="w-6 h-6 rounded-full border border-border shadow-xs hover:scale-110 transition cursor-pointer shrink-0"
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Emoji Picker Popover */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowColorPicker(false);
              setShowLinkInput(false);
            }}
            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center space-x-1 ${
              showEmojiPicker ? 'bg-primary/20 text-primary border border-primary/30' : 'text-foreground hover:bg-muted-foreground/15'
            }`}
            title="More Emojis"
          >
            <Smile size={15} className="text-amber-500" />
            <span className="text-[11px] font-semibold hidden xs:inline">Emoji</span>
          </button>

          {showEmojiPicker && (
            <div className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-3 grid grid-cols-6 gap-2 w-64 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              {EMOJI_PICKER_LIST.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    insertEmoji(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="text-base p-1.5 hover:bg-muted rounded-lg transition hover:scale-125 cursor-pointer flex items-center justify-center"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-[1px] h-5 bg-border mx-0.5 sm:mx-1" />

        {/* ── Link Popover & Unlink Button ── */}
        <div className="relative" ref={linkPopoverRef}>
          <div className="flex items-center space-x-0.5">
            <button
              type="button"
              onClick={handleOpenLink}
              className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                isLinkActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : showLinkInput
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
              }`}
              title={isLinkActive ? 'Edit Link' : 'Insert Link (Ctrl+K)'}
            >
              <Link2 size={15} />
            </button>

            {isLinkActive && (
              <button
                type="button"
                onClick={handleUnsetLink}
                className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-md transition cursor-pointer"
                title="Remove Link"
              >
                <Unlink size={13} />
              </button>
            )}
          </div>

          {showLinkInput && (
            <div
              className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-2xl shadow-2xl p-2.5 flex items-center gap-1.5 min-w-[260px] sm:min-w-[300px] animate-in fade-in zoom-in-95 duration-150"
            >
              <input
                ref={linkInputRef}
                type="text"
                placeholder="Paste URL (e.g. https://...)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSetLink(e);
                  }
                }}
                className="flex-1 bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none font-mono"
              />
              <button
                type="button"
                onClick={handleSetLink}
                className="p-1.5 bg-primary text-white rounded-xl hover:opacity-90 transition cursor-pointer shrink-0"
                title="Apply Link"
              >
                <Check size={14} />
              </button>
              <button
                type="button"
                onClick={() => setShowLinkInput(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition cursor-pointer shrink-0"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* ── Table Insert Button ── */}
        <button
          type="button"
          onClick={handleInsertTable}
          className={`p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
            isTableActive
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground hover:bg-muted-foreground/15 hover:text-foreground'
          }`}
          title="Insert Table (3x3)"
        >
          <TableIcon size={15} />
        </button>

        <div className="w-[1px] h-5 bg-border mx-0.5 sm:mx-1" />

        {/* Undo Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted-foreground/15 text-foreground"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={15} />
        </button>

        {/* Redo Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 sm:p-2 rounded-lg text-xs font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted-foreground/15 text-foreground"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 size={15} />
        </button>
      </div>

      {/* ── Second Row: Quick Frequently-Used Emojis ── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 overflow-x-auto text-xs border-b border-border/40">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider shrink-0 mr-1 select-none">
          QUICK EMOJIS:
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {QUICK_EMOJIS.map((emoji, i) => (
            <button
              key={i}
              type="button"
              onClick={() => insertEmoji(emoji)}
              className="text-sm p-1 hover:bg-card hover:shadow-2xs rounded-md transition hover:scale-125 cursor-pointer"
              title={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contextual Mini-Toolbar for Active Table Editing ── */}
      {isTableActive && (
        <div className="flex items-center flex-wrap gap-1 px-3 py-1.5 bg-primary/10 border-b border-primary/20 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[10px] font-black uppercase text-primary tracking-wider shrink-0 mr-1.5 flex items-center space-x-1">
            <TableIcon size={13} className="text-primary" />
            <span>Table Controls:</span>
          </span>

          <div className="flex items-center flex-wrap gap-1">
            {/* Column operations */}
            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().addColumnBefore().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.addColumnBefore?.()}
              className="px-2 py-1 bg-card hover:bg-primary/20 text-foreground text-[11px] font-bold rounded-lg border border-border transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Add Column Before"
            >
              <Plus size={11} className="text-primary" />
              <span>Col Before</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().addColumnAfter().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.addColumnAfter?.()}
              className="px-2 py-1 bg-card hover:bg-primary/20 text-foreground text-[11px] font-bold rounded-lg border border-border transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Add Column After"
            >
              <Plus size={11} className="text-primary" />
              <span>Col After</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().deleteColumn().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.deleteColumn?.()}
              className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 text-[11px] font-bold rounded-lg border border-rose-500/20 transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Delete Column"
            >
              <Minus size={11} />
              <span>Del Col</span>
            </button>

            <div className="w-[1px] h-4 bg-primary/30 mx-0.5" />

            {/* Row operations */}
            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().addRowBefore().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.addRowBefore?.()}
              className="px-2 py-1 bg-card hover:bg-primary/20 text-foreground text-[11px] font-bold rounded-lg border border-border transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Add Row Before"
            >
              <Plus size={11} className="text-primary" />
              <span>Row Before</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().addRowAfter().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.addRowAfter?.()}
              className="px-2 py-1 bg-card hover:bg-primary/20 text-foreground text-[11px] font-bold rounded-lg border border-border transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Add Row After"
            >
              <Plus size={11} className="text-primary" />
              <span>Row After</span>
            </button>

            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().deleteRow().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.deleteRow?.()}
              className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-600 text-[11px] font-bold rounded-lg border border-rose-500/20 transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Delete Row"
            >
              <Minus size={11} />
              <span>Del Row</span>
            </button>

            <div className="w-[1px] h-4 bg-primary/30 mx-0.5" />

            {/* Merge / Split cell */}
            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().mergeOrSplit().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.mergeOrSplit?.()}
              className="px-2 py-1 bg-card hover:bg-primary/20 text-foreground text-[11px] font-bold rounded-lg border border-border transition cursor-pointer disabled:opacity-30 flex items-center space-x-1"
              title="Merge or Split Cells"
            >
              <Combine size={12} className="text-primary" />
              <span>Merge/Split</span>
            </button>

            {/* Delete entire table */}
            <button
              type="button"
              onClick={() => {
                try { editor.chain().focus().deleteTable().run(); } catch (_) {}
              }}
              disabled={!editor?.can?.()?.deleteTable?.()}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-extrabold rounded-lg shadow-xs transition cursor-pointer flex items-center space-x-1"
              title="Delete Entire Table"
            >
              <Trash2 size={12} />
              <span>Delete Table</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
