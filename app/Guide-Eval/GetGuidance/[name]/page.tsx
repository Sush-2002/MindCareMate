"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import toast, { Toaster } from "react-hot-toast";
import { BeatLoader } from "react-spinners";

export default function Page({ params }: { params: { name?: string } }) {
    const name = params.name || "Unknown Topic"; // Default fallback
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("The response will appear here...");

    useEffect(() => {
        console.log("Page loaded with name:", name);
    }, [name]);

    const onSubmit = async () => {
        if (!name || name.trim() === "") {
            toast.error("Invalid topic name.");
            return;
        }

        try {
            setOutput("Generating response...");
            toast.success(`Generating response for: ${name}`);

            setLoading(true);

            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userPrompt: `What is ${name} and how can it be cured?` }),
            });

            // Debugging API response
            const textResponse = await res.text();
            console.log("API Raw Response:", textResponse);

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (jsonError) {
                console.error("JSON Parse Error:", jsonError);
                toast.error("Invalid response from API.");
                setLoading(false);
                return;
            }

            setLoading(false);

            if (!res.ok) {
                toast.error(data.error || "API request failed.");
                return;
            }

            if (!data.text) {
                toast.error("No response from AI.");
                return;
            }

            setOutput(data.text);
        } catch (error) {
            toast.error("An error occurred while processing your request.");
            console.error("Fetch Error:", error);
            setLoading(false);
        }
    };

    return (
        <div>
            <Toaster />
            <div className="flex flex-col items-center h-screen gap-6">
                <h1 className="text-4xl font-extrabold mt-1">{name}</h1>
                <h2 className="text-xl font-bold">
                    Generating details for: <span className="text-red-500">{name}</span>
                </h2>

                <Card className={cn("p-5 whitespace-normal min-w-[320px] sm:w-[500px] md:min-w-[600px]")}>
                    <Markdown className="w-full h-full">{output}</Markdown>
                </Card>

                {loading ? (
                    <Button disabled>
                        <BeatLoader color="white" size={8} />
                    </Button>
                ) : (
                    <Button onClick={onSubmit}>Get Details</Button>
                )}
            </div>
        </div>
    );
}
