"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Download, FileText, Calendar, Check, Loader2, ExternalLink, Copy } from "lucide-react";

interface ExportFormat {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  extension: string;
}

const exportFormats: ExportFormat[] = [
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

export interface PlanData {
  student: string;
  major: string;
  expectedGraduation: string;
  totalCredits: number;
  completedCredits: number;
  semesters: {
    name: string;
    courses: { code: string; name: string; credits: number }[];
  }[];
}

interface ExportPlanProps {
  planData?: PlanData | null;
}

const samplePlanData = {
  student: "Student",
  major: "Computer Science",
  expectedGraduation: "TBD",
  totalCredits: 124,
  completedCredits: 0,
  semesters: [{ name: "Upload Transcript", courses: [{ code: "---", name: "Upload your transcript to see courses", credits: 0 }] }],
};

export function ExportPlan({ planData }: ExportPlanProps) {
  const data = planData || samplePlanData;
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "exporting" | "success">("idle");
  const [copiedLink, setCopiedLink] = useState(false);

  const downloadFile = (content: string, mimeType: string, filename: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = (formatId: string) => {
    setSelectedFormat(formatId);
    setExportStatus("exporting");

    setTimeout(() => {
      if (formatId === "csv") {
        const csvContent = generateCSV();
        downloadFile(csvContent, 'text/csv;charset=utf-8;', 'eagle_plan.csv');
      } else if (formatId === "ical") {
        const icsContent = generateICS();
        downloadFile(icsContent, 'text/calendar;charset=utf-8;', 'eagle_plan_calendar.ics');
      }
      
      setExportStatus("success");
      setTimeout(() => setExportStatus("idle"), 2000);
    }, 800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://eagleplan.unt.edu/share/abc123");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const generateCSV = () => {
    let csv = "Semester,Course Code,Course Name,Credits\n";
    data.semesters.forEach((sem) => {
      sem.courses.forEach((course) => {
        csv += `${sem.name},${course.code},"${course.name}",${course.credits}\n`;
      });
    });
    return csv;
  };

  const generateICS = () => {
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//EaglePlan//Degree Schedule//EN\n";
    
    data.semesters.forEach((sem, semIndex) => {
      const term = sem.name.split(" ")[0]?.toLowerCase() || "";
      const year = sem.name.split(" ")[1] || new Date().getFullYear().toString();
      
      let month = "08"; 
      if (term === "spring") month = "01";
      if (term === "summer") month = "06";
      if (term === "winter") month = "12";
      
      sem.courses.forEach((course, courseIndex) => {
        const day = String(15 + courseIndex).padStart(2, '0');
        const dateString = `${year}${month}${day}`;
        
        ics += "BEGIN:VEVENT\n";
        ics += `DTSTART;VALUE=DATE:${dateString}\n`;
        ics += `DTEND;VALUE=DATE:${dateString}\n`;
        ics += `SUMMARY:${course.code} - ${course.name}\n`;
        ics += `DESCRIPTION:Credits: ${course.credits}\\nSemester: ${sem.name}\n`;
        ics += "END:VEVENT\n";
      });
    });
    
    ics += "END:VCALENDAR";
    return ics;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-primary" />
          Export Schedule
        </CardTitle>
        <CardDescription>Download your upcoming schedule</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Badge variant="outline" className="text-xs">{format.extension}</Badge>
                </div>
                <h5 className="font-semibold text-foreground mb-1">{format.name}</h5>
                <p className="text-sm text-muted-foreground">{format.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
          <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-primary" /> Share with Advisor
          </h4>
          <p className="text-sm text-muted-foreground mb-3">Generate a shareable link to your schedule</p>
          <div className="flex gap-2">
            <div className="flex-1 p-3 bg-background rounded-lg border border-border text-sm text-muted-foreground truncate">
              https://eagleplan.unt.edu/share/abc123
            </div>
            <Button variant="outline" onClick={handleCopyLink}>
              {copiedLink ? <><Check className="h-4 w-4 mr-2" /> Copied!</> : <><Copy className="h-4 w-4 mr-2" /> Copy</>}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}