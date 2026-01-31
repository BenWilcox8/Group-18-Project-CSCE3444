"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Check,
  Loader2,
  ExternalLink,
  Copy,
} from "lucide-react";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

const exportFormats: ExportFormat[] = [
  {
    id: "sheets",
    name: "Google Sheets",
    description: "Export and open directly in Google Sheets",
    icon: <FileSpreadsheet className="h-6 w-6" />,
    extension: ".xlsx",
  },
  {
    id: "csv",
    name: "CSV File",
    description: "Comma-separated values for any spreadsheet app",
    icon: <FileText className="h-6 w-6" />,
    extension: ".csv",
  },
  {
    id: "ical",
    name: "Calendar (iCal)",
    description: "Import course schedule to your calendar",
    icon: <Calendar className="h-6 w-6" />,
    extension: ".ics",
  },
];

const samplePlanData = {
  student: "John Doe",
  major: "Computer Science",
  expectedGraduation: "Spring 2027",
  totalCredits: 124,
  completedCredits: 45,
  semesters: [
    {
      name: "Fall 2025",
      courses: [
        { code: "CSCE 3110", name: "Algorithms", credits: 3 },
        { code: "MATH 2730", name: "Multivariable Calculus", credits: 3 },
        { code: "PHIL 1800", name: "Ethics", credits: 3 },
      ],
    },
    {
      name: "Spring 2026",
      courses: [
        { code: "CSCE 3600", name: "Operating Systems", credits: 3 },
        { code: "CSCE 3550", name: "Computer Networks", credits: 3 },
      ],
    },
    {
      name: "Fall 2026",
      courses: [
        { code: "CSCE 4110", name: "Design & Analysis of Algorithms", credits: 3 },
        { code: "CSCE 4350", name: "Software Engineering", credits: 3 },
      ],
    },
    {
      name: "Spring 2027",
      courses: [
        { code: "CSCE 4200", name: "Computer Architecture", credits: 3 },
        { code: "CSCE 4600", name: "Operating Systems II", credits: 3 },
      ],
    },
  ],
};

export function ExportPlan() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle");
  const [copiedLink, setCopiedLink] = useState(false);

  const handleExport = (formatId: string) => {
    setSelectedFormat(formatId);
    setExportStatus("exporting");

    // Simulate export
    setTimeout(() => {
      setExportStatus("success");
      
      // Reset after showing success
      setTimeout(() => {
        setExportStatus("idle");
      }, 2000);
    }, 1500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://eagleplan.unt.edu/share/abc123");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generatePreviewCSV = () => {
    let csv = "Semester,Course Code,Course Name,Credits\n";
    samplePlanData.semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        csv += `${sem.name},${course.code},"${course.name}",${course.credits}\n`;
      });
    });
    return csv;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Degree Plan
        </CardTitle>
        <CardDescription>
          Download your degree plan in various formats or share it with your advisor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Summary */}
        <div className="p-4 bg-muted/50 rounded-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">{samplePlanData.major}</p>
              <p className="text-sm text-muted-foreground">Major</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{samplePlanData.expectedGraduation}</p>
              <p className="text-sm text-muted-foreground">Expected Graduation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-completed">{samplePlanData.completedCredits}</p>
              <p className="text-sm text-muted-foreground">Completed Credits</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{samplePlanData.totalCredits - samplePlanData.completedCredits}</p>
              <p className="text-sm text-muted-foreground">Remaining Credits</p>
            </div>
          </div>
        </div>

        {/* Export Formats */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Export Formats
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {exportFormats.map((format) => (
              <button
                key={format.id}
                onClick={() => handleExport(format.id)}
                disabled={exportStatus === "exporting"}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all hover:shadow-md",
                  selectedFormat === format.id && exportStatus === "success"
                    ? "border-completed bg-completed/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    selectedFormat === format.id && exportStatus === "success"
                      ? "bg-completed/20 text-completed"
                      : "bg-primary/10 text-primary"
                  )}>
                    {selectedFormat === format.id && exportStatus === "exporting" ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : selectedFormat === format.id && exportStatus === "success" ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      format.icon
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {format.extension}
                  </Badge>
                </div>
                <h5 className="font-semibold text-foreground mb-1">{format.name}</h5>
                <p className="text-sm text-muted-foreground">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Share Link */}
        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" />
            Share with Advisor
          </h4>
          <p className="text-sm text-muted-foreground mb-3">
            Generate a shareable link to your degree plan for review
          </p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-background rounded-lg border border-border text-sm text-muted-foreground truncate">
              https://eagleplan.unt.edu/share/abc123
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
              {copiedLink ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Export Preview
          </h4>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/50 px-4 py-2 border-b border-border flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/50" />
                <div className="w-3 h-3 rounded-full bg-accent/50" />
                <div className="w-3 h-3 rounded-full bg-completed/50" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">degree_plan.csv</span>
            </div>
            <pre className="p-4 text-xs text-muted-foreground overflow-x-auto font-mono">
              {generatePreviewCSV()}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
