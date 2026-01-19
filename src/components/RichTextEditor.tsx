'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import { Underline } from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline as UnderlineIcon,
  Highlighter,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
  Trash2 as Trash2Icon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

function TableButton({ editor }: { editor: any }) {
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const insertTable = () => {
    if (editor) {
      editor.chain().focus().insertTable({ rows: rows, cols: cols, withHeaderRow: true }).run();
    }
    setShowTableDialog(false);
  };

  const deleteTable = () => {
    if (editor) {
      editor.chain().focus().deleteTable().run();
    }
  };

  const isInTable = editor?.isActive('table') || false;

  return (
    <>
      <button
        onClick={() => setShowTableDialog(true)}
        className={cn(
          'p-2 rounded hover:bg-muted transition-colors',
          showTableDialog && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
        )}
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>
      
      {isInTable && (
        <button
          onClick={deleteTable}
          className="p-2 rounded hover:bg-destructive/80 text-destructive transition-colors"
          title="Delete Table"
        >
          <Trash2Icon className="w-4 h-4" />
        </button>
      )}

      {showTableDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Insert Table</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Rows</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rows}
                  onChange={(e) => setRows(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Columns</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={cols}
                  onChange={(e) => setCols(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={insertTable}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Insert
              </button>
              <button
                onClick={() => setShowTableDialog(false)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({ content, onChange, placeholder = "Start writing...", className }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Remove underline from StarterKit to avoid duplication
        strike: {},
        code: {},
      }),
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'left',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      // Force re-render when selection changes to update active states
      setForceUpdate(prev => prev + 1);
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none',
        style: 'min-height: 200px; padding: 8px 0;',
      },
    },
  });

  if (!isMounted) {
    return (
      <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
        <div className="border-b border-border bg-muted/50 p-2">
          <div className="flex flex-wrap gap-1">
            {/* Placeholder toolbar */}
            <div className="flex gap-1 border-r border-border pr-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex gap-1 border-r border-border pr-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex gap-1 border-r border-border pr-2">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex gap-1">
              <div className="w-8 h-8 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <div className="min-h-[200px] bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="border-b border-border bg-muted/50 p-2">
        <div className="flex flex-wrap gap-1">
          {/* Text Formatting */}
          <div className="flex gap-1 border-r border-border pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('bold') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('italic') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('strike') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('code') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Code"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('underline') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Underline"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Text Alignment */}
          <div className="flex gap-1 border-r border-border pr-2">
            <button
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive({ textAlign: 'left' }) && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive({ textAlign: 'center' }) && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive({ textAlign: 'right' }) && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
          </div>

          {/* Highlight */}
          <div className="flex gap-1 border-r border-border pr-2">
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('highlight') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </button>
          </div>

          {/* Lists */}
          <div className="flex gap-1 border-r border-border pr-2">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('bulletList') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('orderedList') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Quote */}
          <div className="flex gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'p-2 rounded hover:bg-muted transition-colors',
                editor.isActive('blockquote') && 'bg-[hsl(var(--active-format))] text-[hsl(var(--active-format-foreground))]'
              )}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
          </div>

          {/* Table */}
          <div className="flex gap-1">
            <TableButton editor={editor} />
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="p-3 sm:p-4">
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
}
