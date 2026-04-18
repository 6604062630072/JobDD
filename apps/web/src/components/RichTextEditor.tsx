'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  Type,
  Minus,
  Undo,
  Redo,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

const TEXT_COLORS = [
  { color: '#000000', label: 'ดำ' },
  { color: '#374151', label: 'เทาเข้ม' },
  { color: '#DC2626', label: 'แดง' },
  { color: '#D97706', label: 'ส้ม' },
  { color: '#16A34A', label: 'เขียว' },
  { color: '#2563EB', label: 'น้ำเงิน' },
  { color: '#7C3AED', label: 'ม่วง' },
  { color: '#DB2777', label: 'ชมพู' },
  { color: '#0891B2', label: 'ฟ้า' },
];

const HEADING_OPTIONS = [
  { value: 'paragraph', label: 'ข้อความปกติ' },
  { value: 'h1', label: 'หัวข้อใหญ่ (H1)' },
  { value: 'h2', label: 'หัวข้อรอง (H2)' },
  { value: 'h3', label: 'หัวข้อย่อย (H3)' },
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-0.5" />;
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 160 }: RichTextEditorProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const isInternalChange = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({ placeholder: placeholder || 'พิมพ์รายละเอียด...' }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      isInternalChange.current = true;
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none prose prose-sm max-w-none text-gray-800 leading-relaxed',
        style: `min-height: ${minHeight}px; padding: 12px 16px;`,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    const current = editor.getHTML();
    if (current !== value) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  const getHeadingValue = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };

  const applyHeading = (val: string) => {
    if (val === 'paragraph') {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val[1]) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {/* Heading selector */}
        <select
          value={getHeadingValue()}
          onChange={(e) => applyHeading(e.target.value)}
          className="text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 mr-1 focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
        >
          {HEADING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <Divider />

        {/* Bold / Italic / Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="หนา (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="เอียง (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="ขีดเส้นใต้ (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Text color */}
        <div className="relative flex items-center">
          <button
            type="button"
            title="สีข้อความ"
            className="flex flex-col items-center p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => colorInputRef.current?.click()}
          >
            <Type className="w-4 h-4" />
            <div
              className="w-4 h-1 rounded-full mt-0.5"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            />
          </button>
          <input
            ref={colorInputRef}
            type="color"
            className="absolute opacity-0 w-0 h-0 pointer-events-none"
            defaultValue="#000000"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          />
          {/* Color swatches */}
          <div className="flex gap-0.5 ml-0.5">
            {TEXT_COLORS.map(({ color, label }) => (
              <button
                key={color}
                type="button"
                title={label}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className={`w-4 h-4 rounded-sm border border-white hover:scale-110 transition-transform ${
                  editor.getAttributes('textStyle').color === color ? 'ring-1 ring-offset-1 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <Divider />

        {/* Highlight */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive('highlight')}
          title="ไฮไลต์"
        >
          <Highlighter className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="รายการแบบจุด"
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="รายการแบบตัวเลข"
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Align */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="ชิดซ้าย"
        >
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="กึ่งกลาง"
        >
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="ชิดขวา"
        >
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Horizontal rule */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="เส้นขั้น"
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="ย้อนกลับ (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="ทำซ้ำ (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor area */}
      <div className="bg-white">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
