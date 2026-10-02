import { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Heading4,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ContentImage } from '@/lib/api-types';

/**
 * Rich-text editor for content_html (services, cases, posts), dashboard only.
 *
 * Pasting from Google Docs, Word or a web page keeps only what the site renders: TipTap drops anything
 * outside its schema (styles, classes, fonts). The server sanitizes again on save (content/sanitize.py),
 * so this is convenience, not security.
 *
 * Images are stored by reference: uploads go to /api/content-images/ and the HTML gets
 * <img data-image-id="ID">; the src shown here comes from the API and is dropped by the server on save.
 */

// Same levels the server keeps (sanitize.py); the page title is the h1.
const HEADING_LEVELS = [2, 3, 4] as const;

const ContentImageNode = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      imageId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image-id'),
        renderHTML: (attributes) => (attributes.imageId ? { 'data-image-id': attributes.imageId } : {}),
      },
    };
  },
});

/** h1 → h2 and h5/h6 → h4 (instead of plain paragraphs); images from elsewhere are dropped (upload them instead). */
const normalizePastedHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const rename = (from: string, to: string) =>
    doc.body.querySelectorAll(from).forEach((element) => {
      const replacement = doc.createElement(to);
      replacement.innerHTML = element.innerHTML;
      element.replaceWith(replacement);
    });
  rename('h1', 'h2');
  rename('h5, h6', 'h4');
  doc.body.querySelectorAll('img:not([data-image-id])').forEach((element) => element.remove());
  return doc.body.innerHTML;
};

const uploadImage = async (file: File) => {
  const form = new FormData();
  form.append('image', file);
  return api.post<ContentImage>('/content-images/', form);
};

const imageFiles = (files: FileList | null | undefined) =>
  Array.from(files || []).filter((file) => file.type.startsWith('image/'));

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

export const RichTextEditor = ({ value, onChange, onError, disabled }: RichTextEditorProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  // The paste/drop handlers are set once, when the editor is created: they reach it through this ref.
  const editorRef = useRef<Editor | null>(null);
  const [uploading, setUploading] = useState(0);
  const [showHtml, setShowHtml] = useState(false);

  // Upload, then insert each image at the cursor (or at the drop position).
  const insertImages = async (editor: Editor, files: File[], position?: number) => {
    setUploading((count) => count + files.length);
    for (const file of files) {
      try {
        const uploaded = await uploadImage(file);
        const node = editor.schema.nodes.image.create({ src: uploaded.image, alt: '', imageId: String(uploaded.id) });
        const at = position ?? editor.state.selection.from;
        editor.view.dispatch(editor.state.tr.insert(at, node));
      } catch (error) {
        console.error('Error uploading image:', error);
        onError(`Não foi possível enviar ${file.name}.`);
      } finally {
        setUploading((count) => count - 1);
      }
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: { levels: [...HEADING_LEVELS] },
        link: { openOnClick: false, autolink: true },
      }),
      ContentImageNode.configure({ allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: { class: 'case-content min-h-[360px] px-5 py-4 focus:outline-none' },
      transformPastedHTML: normalizePastedHtml,
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (!files.length || !editorRef.current) return false;
        insertImages(editorRef.current, files);
        return true;
      },
      handleDrop: (view, event) => {
        const files = imageFiles(event.dataTransfer?.files);
        if (!files.length || !editorRef.current) return false;
        const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        insertImages(editorRef.current, files, position);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChange(current.getHTML()),
  });

  editorRef.current = editor;

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [editor, disabled]);

  if (!editor) return null;

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = imageFiles(event.target.files);
    event.target.value = '';
    if (files.length) await insertImages(editor, files);
  };

  const handleLink = () => {
    const previous = editor.getAttributes('link').href as string | undefined;
    const href = window.prompt('Endereço do link (vazio para remover):', previous || 'https://');
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run();
  };

  const toggleHtml = () => {
    // Leaving the HTML view: load what was typed there back into the editor.
    if (showHtml) editor.commands.setContent(value, { emitUpdate: true });
    setShowHtml((current) => !current);
  };

  const tools = [
    { label: 'Título', icon: Heading2, active: editor.isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'Subtítulo', icon: Heading3, active: editor.isActive('heading', { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: 'Título menor', icon: Heading4, active: editor.isActive('heading', { level: 4 }), run: () => editor.chain().focus().toggleHeading({ level: 4 }).run() },
    { label: 'Negrito', icon: Bold, active: editor.isActive('bold'), run: () => editor.chain().focus().toggleBold().run() },
    { label: 'Itálico', icon: Italic, active: editor.isActive('italic'), run: () => editor.chain().focus().toggleItalic().run() },
    { label: 'Sublinhado', icon: UnderlineIcon, active: editor.isActive('underline'), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: 'Lista', icon: List, active: editor.isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Lista numerada', icon: ListOrdered, active: editor.isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Citação', icon: Quote, active: editor.isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Link', icon: Link2, active: editor.isActive('link'), run: handleLink },
    { label: 'Inserir imagem', icon: ImagePlus, active: false, run: () => imageInputRef.current?.click() },
  ];

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 border-b border-border/80 bg-card/95 p-3 backdrop-blur-sm">
        {tools.map(({ label, icon: Icon, active, run }) => (
          <Button
            key={label}
            type="button"
            variant={active ? 'default' : 'outline'}
            className="h-8 px-2"
            onClick={run}
            disabled={disabled || showHtml}
            title={label}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <Button
          type="button"
          variant="outline"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || showHtml || !editor.can().undo()}
          title="Desfazer"
          aria-label="Desfazer"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || showHtml || !editor.can().redo()}
          title="Refazer"
          aria-label="Refazer"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={showHtml ? 'default' : 'outline'}
          className="ml-auto h-8 gap-2 px-2 text-xs"
          onClick={toggleHtml}
          disabled={disabled}
        >
          <Code2 className="h-4 w-4" />
          HTML
        </Button>
        {uploading > 0 && (
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Enviando imagem…
          </span>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
          disabled={disabled}
        />
      </div>

      <div className="max-h-[62vh] min-h-0 overflow-y-auto">
        {showHtml ? (
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
            spellCheck={false}
            className="min-h-[360px] w-full resize-y bg-transparent px-5 py-4 font-mono text-sm outline-none"
            aria-label="HTML do conteúdo"
          />
        ) : (
          <EditorContent editor={editor} />
        )}
      </div>
    </div>
  );
};
