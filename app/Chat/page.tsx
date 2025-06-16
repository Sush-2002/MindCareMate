"use client";

import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { MessageCircleCode, Upload, Send, Copy, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import toast, { Toaster } from "react-hot-toast";
import styles from "@/styles/styles.module.css";
import { BeatLoader } from "react-spinners";

export default function Home() {
  // State variables
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [output, setOutput] = useState("The response will appear here...");
  const [loading, setLoading] = useState(false);

  // Handles Enter key to submit the prompt
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit();
    }
  };

  // Handles file upload and reads text content
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      toast.error("No file selected!");
      return;
    }

    if (!file.type.includes("text")) {
      toast.error("File type not supported!");
      return;
    }

    const reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPrompt(reader.result);
      }
    };
  };

  // Copies output to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  // Downloads the output as a text file
  const downloadFile = () => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "chat.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // Handles API call for generating a response
  const onSubmit = async () => {
    if (!prompt.trim()) {
      toast.error("Prompt cannot be empty!");
      return;
    }

    setOutput("The response will appear here...");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt: prompt }),
      });

      // Ensure valid response before parsing JSON
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong!");
      }

      const data = await response.json();
      if (!data.text) {
        throw new Error("No response from the server!");
      }

      setResponse(data.text);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Animates the response text character by character
  useEffect(() => {
    if (!response) return;
    setOutput("");

    response.split("").forEach((char, i) => {
      setTimeout(() => {
        setOutput((prev) => prev + char);
      }, i * 10);
    });
  }, [response]);

  return (
    <main className="flex flex-col items-center h-screen gap-4 mt-10">
      <Toaster />
      <div className="flex gap-2 items-center mb-5">
        <MessageCircleCode size="64" />
        <span className="text-3xl font-bold">Council</span>
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={prompt}
            className="min-w-[320px] sm:min-w-[400px] md:min-w-[500px] h-[50px] pr-12"
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={onKeyDown}
          />
          {loading ? (
            <button className="absolute top-3 right-3">
              <BeatLoader color="#000" size={8} />
            </button>
          ) : (
            <button
              onClick={onSubmit}
              className="absolute top-3 right-3 hover:scale-110 transition"
            >
              <Send />
            </button>
          )}
        </div>
        <input type="file" onChange={onFileChange} className="hidden" />
        <Button
          variant="outline"
          className="w-[40px] p-1"
          onClick={() => (document.querySelector("input[type=file]") as HTMLInputElement)?.click()}
        >
          <Upload className="w-[20px]" />
        </Button>
      </div>

      <div className="flex gap-3 items-center">
        <Card className="p-5 min-w-[320px] sm:w-[500px] md:min-w-[600px] min-h-[150px] max-h-[400px] lg:min-w-[700px] overflow-y-scroll">
          <div className={styles.textwrapper}>
            <Markdown className="w-full h-full">{output}</Markdown>
          </div>
        </Card>
        <div className="flex flex-col gap-5">
          <Button variant="outline" className="w-[40px] p-1" onClick={copyToClipboard}>
            <Copy className="w-[20px]" />
          </Button>
          <Button variant="outline" className="w-[40px] p-1" onClick={downloadFile}>
            <Download className="w-[20px]" />
          </Button>
        </div>
      </div>
    </main>
  );
}
