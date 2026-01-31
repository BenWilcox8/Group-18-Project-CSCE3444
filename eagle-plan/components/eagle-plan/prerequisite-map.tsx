"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock, Check, AlertTriangle } from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
  status: "completed" | "available" | "locked" | "in-progress";
  type: "major" | "minor" | "core" | "elective";
}

const sampleCourses: Course[] = [
  { id: "1", code: "CSCE 1030", name: "Computer Science I", credits: 3, prerequisites: [], status: "completed", type: "major" },
  { id: "2", code: "CSCE 1040", name: "Computer Science II", credits: 3, prerequisites: ["CSCE 1030"], status: "completed", type: "major" },
  { id: "3", code: "CSCE 2100", name: "Data Structures", credits: 3, prerequisites: ["CSCE 1040"], status: "in-progress", type: "major" },
  { id: "4", code: "CSCE 2110", name: "Discrete Structures", credits: 3, prerequisites: ["CSCE 1040"], status: "available", type: "major" },
  { id: "5", code: "CSCE 3110", name: "Algorithms", credits: 3, prerequisites: ["CSCE 2100", "CSCE 2110"], status: "locked", type: "major" },
  { id: "6", code: "CSCE 3600", name: "Operating Systems", credits: 3, prerequisites: ["CSCE 2100"], status: "locked", type: "major" },
  { id: "7", code: "CSCE 3550", name: "Computer Networks", credits: 3, prerequisites: ["CSCE 2100"], status: "locked", type: "major" },
  { id: "8", code: "CSCE 4110", name: "Design & Analysis of Algorithms", credits: 3, prerequisites: ["CSCE 3110"], status: "locked", type: "major" },
];

const statusConfig = {
  completed: {
    bg: "bg-completed/10",
    border: "border-completed",
    text: "text-completed",
    icon: Check,
  },
  available: {
    bg: "bg-primary/10",
    border: "border-primary",
    text: "text-primary",
    icon: ChevronRight,
  },
  locked: {
    bg: "bg-muted",
    border: "border-border",
    text: "text-muted-foreground",
    icon: Lock,
  },
  "in-progress": {
    bg: "bg-accent/10",
    border: "border-accent",
    text: "text-accent-foreground",
    icon: AlertTriangle,
  },
};

const typeConfig = {
  major: "Major Requirement",
  minor: "Minor Course",
  core: "Core Curriculum",
  elective: "Elective",
};

export function PrerequisiteMap() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const getPrerequisitePath = (courseId: string): string[] => {
    const course = sampleCourses.find((c) => c.id === courseId);
    if (!course) return [];
    
    const paths: string[] = [];
    const findPrereqs = (prereqs: string[]) => {
      prereqs.forEach((prereqCode) => {
        paths.push(prereqCode);
        const prereqCourse = sampleCourses.find((c) => c.code === prereqCode);
        if (prereqCourse) {
          findPrereqs(prereqCourse.prerequisites);
        }
      });
    };
    findPrereqs(course.prerequisites);
    return paths;
  };

  const highlightedCourses = hoveredCourse ? getPrerequisitePath(hoveredCourse) : [];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Prerequisite Visualization
        </CardTitle>
        <CardDescription>
          Color-coded course map showing dependencies and completion status. Hover over a course to see its prerequisite chain.
        </CardDescription>
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", config.bg, "border", config.border)} />
              <span className="text-sm text-muted-foreground capitalize">{status.replace("-", " ")}</span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleCourses.map((course) => {
            const config = statusConfig[course.status];
            const StatusIcon = config.icon;
            const isHighlighted = highlightedCourses.includes(course.code);

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  config.bg,
                  config.border,
                  isHighlighted && "ring-2 ring-primary ring-offset-2",
                  "hover:shadow-lg hover:scale-[1.02]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={cn("text-xs", config.text)}>
                    {typeConfig[course.type]}
                  </Badge>
                  <StatusIcon className={cn("h-4 w-4", config.text)} />
                </div>
                <h4 className="font-bold text-foreground">{course.code}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{course.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{course.credits} credits</span>
                  {course.prerequisites.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {course.prerequisites.length} prereq{course.prerequisites.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                
                {course.prerequisites.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Requires:</p>
                    <div className="flex flex-wrap gap-1">
                      {course.prerequisites.map((prereq) => {
                        const prereqCourse = sampleCourses.find((c) => c.code === prereq);
                        const prereqStatus = prereqCourse?.status || "locked";
                        return (
                          <Badge
                            key={prereq}
                            variant="secondary"
                            className={cn(
                              "text-xs",
                              prereqStatus === "completed" && "bg-completed/20 text-completed"
                            )}
                          >
                            {prereq}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {selectedCourse && (
          <div className="mt-6 p-4 bg-muted/50 rounded-xl">
            <h4 className="font-semibold mb-2">{selectedCourse.code}: {selectedCourse.name}</h4>
            <p className="text-sm text-muted-foreground mb-3">
              {selectedCourse.credits} credit hours • {typeConfig[selectedCourse.type]}
            </p>
            {selectedCourse.prerequisites.length > 0 ? (
              <div>
                <p className="text-sm font-medium mb-2">Prerequisite Chain:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {getPrerequisitePath(selectedCourse.id).reverse().map((prereq, idx, arr) => (
                    <div key={prereq} className="flex items-center gap-2">
                      <Badge variant="outline">{prereq}</Badge>
                      {idx < arr.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  ))}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  <Badge className="bg-primary text-primary-foreground">{selectedCourse.code}</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No prerequisites required</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
