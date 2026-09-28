"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import axios from "axios";
import Cookies from "js-cookie";
import {
  SendHorizonal,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  List,
  ListOrdered,
} from "lucide-react";

import { FormEvent, useState } from "react";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

export default function BlogPost() {
  const [head, setHead] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
        defaultAlignment: "left",
      }),
    ],
    content: "<p>Write your blog content here... ✍️</p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setBody(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "w-full block min-h-40 resize-none rounded-b-2xl border border-transparent bg-input/50 px-3 py-2 text-base transition-[color,box-shadow] duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 ProseMirror",
      },
    },

  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await axios.post(
        `${backendUrl}/blog`,
        {
          head,
          body: body || editor?.getHTML() || "",
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      setHead("");
      setBody("");
      editor?.commands.setContent("<p></p>");
      setLoading(false);
      toast.add({
        type: "success",
        description: response.data.message,
      });
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
        ? err.message
        : "An unexpected error occurred";

      setLoading(false);
      toast.add({
        type: "error",
        description: errorMessage,
      });
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <Card className="max-w-5xl w-full m-5">
      <CardHeader>
        <CardTitle>Create a new blog here</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldLabel className="w-20 shrink-0">Title: </FieldLabel>
              <Input
                required
                type="text"
                value={head}
                onChange={(e) => setHead(e.target.value)}
                placeholder="Enter the title"
              />
            </Field>
            <Field orientation="vertical">
              <FieldLabel>Body: </FieldLabel>
              <div className="flex flex-col rounded-2xl overflow-hidden border">
                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 p-2 bg-muted/40 border-b">
                  <ToggleGroup size="sm">
                    <ToggleGroupItem
                      value="bold"
                      aria-label="Bold"
                      data-state={editor.isActive("bold") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                      <Bold className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="italic"
                      aria-label="Italic"
                      data-state={editor.isActive("italic") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                      <Italic className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="underline"
                      aria-label="Underline"
                      data-state={editor.isActive("underline") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="strikethrough"
                      aria-label="Strikethrough"
                      data-state={editor.isActive("strike") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                      <Strikethrough className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <div className="h-4 w-px bg-border mx-1" />

                  <ToggleGroup size="sm">
                    <ToggleGroupItem
                      value="left"
                      aria-label="Align left"
                      data-state={editor.isActive({ textAlign: "left" }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="center"
                      aria-label="Align center"
                      data-state={editor.isActive({ textAlign: "center" }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="right"
                      aria-label="Align right"
                      data-state={editor.isActive({ textAlign: "right" }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    >
                      <AlignRight className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="justify"
                      aria-label="Align justify"
                      data-state={editor.isActive({ textAlign: "justify" }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    >
                      <AlignJustify className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <div className="h-4 w-px bg-border mx-1" />

                  <ToggleGroup size="sm">
                    <ToggleGroupItem
                      value="h1"

                      aria-label="Heading 1"
                      data-state={editor.isActive("heading", { level: 1 }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                      <Heading1 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="h2"
                      aria-label="Heading 2"
                      data-state={editor.isActive("heading", { level: 2 }) ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                      <Heading2 className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="bullet-list"
                      aria-label="Bullet list"
                      data-state={editor.isActive("bulletList") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                      <List className="h-4 w-4" />
                    </ToggleGroupItem>
                    <ToggleGroupItem
                      value="ordered-list"
                      aria-label="Numbered list"
                      data-state={editor.isActive("orderedList") ? "on" : "off"}
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </ToggleGroupItem>
                  </ToggleGroup>

                </div>

                <EditorContent editor={editor} />
              </div>
            </Field>
          </FieldGroup>
          <div className="flex justify-end mt-4">
            <Button type="submit" size="lg" disabled={loading}>
              Post
              <SendHorizonal />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

