"use client";

import { forwardRef, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { editorImageSrc } from "./rich-text-editor-extensions";
import { ToolbarButton } from "./rich-text-toolbar-button";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export interface RichTextImageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  editor: Editor | null;
  /** Read through a ref, so a new function each render is fine. */
  uploadImage: React.RefObject<((file: File) => Promise<string | null>) | undefined>;
  /** What the editor's status region says. */
  onStatus: (message: string) => void;
  apple: boolean;
}

/**
 * Insert image: opens the file picker, hands the file to the app's
 * `uploadImage`, and inserts the URL it returns at the caret.
 *
 * The app owns failure. A `null` or a rejection inserts nothing and resets the
 * button; the rejection is caught here so it never escapes as an unhandled
 * one, and the app shows its own message.
 *
 * A relative URL is made absolute (`editorImageSrc`). One the sanitizer would
 * drop on save, such as a `data:` or `blob:` URL, inserts nothing and says so in
 * the status region. An upload that finishes after the editor was disabled (a
 * save started) inserts nothing either: the value being saved is already sent.
 */
export const RichTextImageButton = forwardRef<HTMLButtonElement, RichTextImageButtonProps>(
  ({ editor, uploadImage, onStatus, apple, disabled, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    async function onPick(input: HTMLInputElement) {
      const file = input.files?.[0];
      // Cleared straight away, so picking the same file again is a change.
      input.value = "";
      if (!file || !editor) return;
      // The person can keep typing while the upload runs; focus left on the
      // button would fall to <body> the moment it is disabled.
      editor.commands.focus();
      if (!IMAGE_TYPES.includes(file.type)) {
        onStatus("Choose a PNG, JPEG, GIF or WebP image.");
        return;
      }
      setUploading(true);
      onStatus("Uploading image…");
      try {
        const uploaded = await uploadImage.current?.(file);
        const src = uploaded ? editorImageSrc(uploaded) : null;
        if (src && !editor.isDestroyed && editor.isEditable) {
          editor.chain().focus().setImage({ src, alt: file.name }).run();
          onStatus("Image inserted.");
        } else if (uploaded && !src) {
          onStatus("The uploaded image's address can't be saved, so it wasn't inserted.");
        } else {
          onStatus("");
        }
      } catch {
        onStatus("");
      } finally {
        setUploading(false);
      }
    }

    return (
      <>
        <ToolbarButton
          ref={ref}
          label={uploading ? "Uploading image…" : "Insert image"}
          icon={uploading ? LoaderCircle : ImagePlus}
          iconClassName={uploading ? "animate-spin motion-reduce:animate-none" : undefined}
          apple={apple}
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          {...props}
        />
        {/* Not a styled control: an invisible mechanism behind the Button above.
            Carbon has no file-picker component. */}
        <input
          ref={inputRef}
          type="file"
          accept={IMAGE_TYPES.join(",")}
          hidden
          tabIndex={-1}
          aria-hidden="true"
          onChange={(event) => void onPick(event.currentTarget)}
        />
      </>
    );
  },
);
RichTextImageButton.displayName = "RichTextImageButton";
