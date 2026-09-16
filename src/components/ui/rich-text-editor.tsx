import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage: (file: File) => Promise<string>;
  disabled?: boolean;
  editorMinHeightClass?: string;
  contentScrollHeightClass?: string;
}

export const RichTextEditor = ({
  value,
  onChange,
  onUploadImage,
  disabled,
  editorMinHeightClass = 'min-h-[320px]',
  contentScrollHeightClass = 'max-h-[62vh]',
}: RichTextEditorProps) => {
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Image.configure({
        allowBase64: false,
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `tiptap-editor prose prose-invert max-w-none ${editorMinHeightClass} px-4 py-3 focus:outline-none`,
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    const currentHtml = editor.getHTML();
    if (value !== currentHtml) {
      editor.commands.setContent(value || '<p></p>', false);
    }
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !editor) return;

    try {
      const imageUrl = await onUploadImage(file);
      editor.chain().focus().setImage({ src: imageUrl, alt: file.name }).run();
    } catch (error) {
      console.error('Error uploading inline image:', error);
    } finally {
      event.target.value = '';
    }
  };

  if (!editor) return null;

  const toolbarButtonClass = 'h-8 px-2';

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card/40">
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 border-b border-border/80 bg-card/95 p-3 backdrop-blur-sm">
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          disabled={disabled}
        >
          <Heading3 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'outline'}
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className={toolbarButtonClass}
          onClick={() => imageInputRef.current?.click()}
          disabled={disabled}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          className={toolbarButtonClass}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
        >
          <Redo2 className="h-4 w-4" />
        </Button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          disabled={disabled}
        />
      </div>

      <div className={`min-h-0 overflow-y-auto ${contentScrollHeightClass}`}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
