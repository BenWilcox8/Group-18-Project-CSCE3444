"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ParsedCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

interface TranscriptUploadProps {
  onParsed?: (courses: ParsedCourse[]) => void;
}

export function TranscriptUpload({ onParsed }: TranscriptUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [parsedCourses, setParsedCourses] = useState<ParsedCourse[]>([]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  // REAL PARSING: Sends the PDF to your backend API route
  const processTranscript = async (uploadedFile: File) => {
    setStatus("parsing");
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      
      const response = await fetch('/api/parse-transcript', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Server failed to parse transcript');
      }
      
      const data = await response.json();
      
      if (data.courses && data.courses.length > 0) {
        setParsedCourses(data.courses);
        setStatus("success");
        onParsed?.(data.courses);
      } else {
        // If the array is empty, the Regex didn't catch anything in the text
        console.error("No courses found. Check the Regex!");
        setStatus("error");
      }
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.name.endsWith(".pdf"))) {
      setFile(droppedFile);
      processTranscript(droppedFile);
    }
  }, [onParsed]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      processTranscript(selectedFile);
    }
  }, [onParsed]);

  // Only calculate total credits for classes that were successfully extracted
  const totalCredits = parsedCourses.reduce((sum, course) => sum + course.credits, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Transcript Parser
        </CardTitle>
        <CardDescription>
          Upload your UNT transcript (PDF) to automatically detect completed courses and credits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/50",
            status === "success" && "border-completed bg-completed/5"
          )}
        >
          {status === "idle" && (
            <>
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-1">
                Drop your transcript here
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse files
              </p>
              <label>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button variant="outline" asChild>
                  <span>Select PDF File</span>
                </Button>
              </label>
            </>
          )}

          {status === "parsing" && (
            <>
              <Loader2 className="h-12 w-12 mx-auto text-primary mb-4 animate-spin" />
              <p className="text-foreground font-medium mb-1">
                Parsing transcript...
              </p>
              <p className="text-sm text-muted-foreground">
                Analyzing {file?.name}
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <Check className="h-12 w-12 mx-auto text-completed mb-4" />
              <p className="text-foreground font-medium mb-1">
                Successfully parsed!
              </p>
              <p className="text-sm text-muted-foreground">
                Found {parsedCourses.length} courses ({totalCredits} credits)
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
              <p className="text-foreground font-medium mb-1">
                Failed to parse transcript
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Please try again with a valid UNT transcript PDF
              </p>
              <Button variant="outline" onClick={() => setStatus("idle")}>
                Try Again
              </Button>
            </>
          )}
        </div>

        {status === "success" && parsedCourses.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Detected Courses
            </h4>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {parsedCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">{course.code}</p>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{course.grade}</p>
                    <p className="text-sm text-muted-foreground">{course.credits} credits</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
