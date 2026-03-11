"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronRight, Lock, Check, AlertTriangle, Plus, Trash2 } from "lucide-react";

export interface ParsedCourse {
  code: string;
  name: string;
  credits: number;
  grade: string;
  semester: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
  status: "completed" | "available" | "locked" | "in-progress";
  type: "major" | "minor" | "core" | "elective";
}

interface PrerequisiteMapProps {
  parsedCourses?: ParsedCourse[];
  plannedCourses?: Course[];
  onAddCourse?: (course: Course) => void;
  onRemoveCourse?: (courseId: string) => void;
}

const masterCurriculum: Course[] = [
  { id: "1", code: "CSCE 1030", name: "Computer Science I", credits: 3, prerequisites: [], status: "locked", type: "major" },
  { id: "2", code: "CSCE 1040", name: "Computer Science II", credits: 3, prerequisites: ["CSCE 1030"], status: "locked", type: "major" },
  { id: "3", code: "CSCE 2100", name: "Data Structures", credits: 3, prerequisites: ["CSCE 1040"], status: "locked", type: "major" },
  { id: "4", code: "CSCE 2110", name: "Discrete Structures", credits: 3, prerequisites: ["CSCE 1040"], status: "locked", type: "major" },
  { id: "5", code: "CSCE 3110", name: "Algorithms", credits: 3, prerequisites: ["CSCE 2100", "CSCE 2110"], status: "locked", type: "major" },
  { id: "6", code: "CSCE 3600", name: "Operating Systems", credits: 3, prerequisites: ["CSCE 2100"], status: "locked", type: "major" },
  { id: "7", code: "CSCE 3550", name: "Computer Networks", credits: 3, prerequisites: ["CSCE 2100"], status: "locked", type: "major" },
  { id: "8", code: "CSCE 4110", name: "Design & Analysis of Algorithms", credits: 3, prerequisites: ["CSCE 3110"], status: "locked", type: "major" },
  { id: "9", code: "MATH 1710", name: "Calculus I", credits: 4, prerequisites: [], status: "locked", type: "core" },
  { id: "10", code: "MATH 1720", name: "Calculus II", credits: 4, prerequisites: ["MATH 1710"], status: "locked", type: "core" },
  { id: "11", code: "MATH 2700", name: "Linear Algebra", credits: 3, prerequisites: ["MATH 1720"], status: "locked", type: "major" },
  { id: "12", code: "PHYS 1710", name: "Physics I", credits: 4, prerequisites: ["MATH 1710"], status: "locked", type: "core" },
  { id: "13", code: "ENGL 1310", name: "College Writing I", credits: 3, prerequisites: [], status: "locked", type: "core" },
];

const statusConfig = {
  completed: { bg: "bg-completed/10", border: "border-completed", text: "text-completed", icon: Check },
  // UPDATED: Now uses strict Tailwind blue utility classes
  available: { bg: "bg-blue-500/10", border: "border-blue-500", text: "text-blue-500", icon: ChevronRight },
  locked: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground", icon: Lock },
  "in-progress": { bg: "bg-accent/10", border: "border-accent", text: "text-accent-foreground", icon: AlertTriangle },
};

const typeConfig = {
  major: "Major Requirement", minor: "Minor Course", core: "Core Curriculum", elective: "Elective",
};

const isPassingGrade = (grade: string) => {
  if (!grade) return false;
  const passingGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
  return passingGrades.includes(grade.toUpperCase());
};

export function PrerequisiteMap({ 
  parsedCourses = [], 
  plannedCourses = [], 
  onAddCourse, 
  onRemoveCourse 
}: PrerequisiteMapProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [hoveredCourse, setHoveredCourse] = useState<string | null>(null);

  const displayCourses = useMemo(() => {
    return masterCurriculum.map(course => {
      const studentCourse = parsedCourses.find(pc => pc.code === course.code);
      const isCompleted = studentCourse && isPassingGrade(studentCourse.grade);
      
      if (isCompleted) return { ...course, status: "completed" as const };

      const arePrereqsMet = course.prerequisites.every(prereqCode => {
        const prereq = parsedCourses.find(pc => pc.code === prereqCode);
        return prereq && isPassingGrade(prereq.grade);
      });

      if (course.prerequisites.length === 0 || arePrereqsMet) {
        if (plannedCourses.some(pc => pc.id === course.id)) {
          return { ...course, status: "in-progress" as const };
        }
        return { ...course, status: "available" as const };
      }

      return { ...course, status: "locked" as const };
    });
  }, [parsedCourses, plannedCourses]);

  const getPrerequisitePath = (courseId: string): string[] => {
    const course = displayCourses.find((c) => c.id === courseId);
    if (!course) return [];
    
    const paths: string[] = [];
    const findPrereqs = (prereqs: string[]) => {
      prereqs.forEach((prereqCode) => {
        if (!paths.includes(prereqCode)) {
          paths.push(prereqCode);
          const prereqCourse = displayCourses.find((c) => c.code === prereqCode);
          if (prereqCourse) findPrereqs(prereqCourse.prerequisites);
        }
      });
    };
    findPrereqs(course.prerequisites);
    return paths;
  };

  const highlightedCourses = hoveredCourse ? getPrerequisitePath(hoveredCourse) : [];
  
  const activeCourse = selectedCourseId ? displayCourses.find(c => c.id === selectedCourseId) : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Prerequisite Visualization</CardTitle>
        <CardDescription>
          Click a course to add it to your upcoming schedule.
        </CardDescription>
        <div className="flex flex-wrap gap-3 mt-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <div key={status} className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", config.bg, "border", config.border)} />
              <span className="text-sm text-muted-foreground capitalize">
                {status === "in-progress" ? "In Cart" : status}
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayCourses.map((course) => {
            const config = statusConfig[course.status];
            const StatusIcon = config.icon;
            const isHighlighted = highlightedCourses.includes(course.code);

            return (
              <div
                key={course.id}
                onClick={() => setSelectedCourseId(course.id)}
                onMouseEnter={() => setHoveredCourse(course.id)}
                onMouseLeave={() => setHoveredCourse(null)}
                className={cn(
                  "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  config.bg, config.border,
                  isHighlighted && "ring-2 ring-blue-500 ring-offset-2", // Updated ring to blue as well
                  "hover:shadow-lg hover:scale-[1.02]"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className={cn("text-xs", config.text)}>{typeConfig[course.type]}</Badge>
                  <StatusIcon className={cn("h-4 w-4", config.text)} />
                </div>
                <h4 className="font-bold text-foreground">{course.code}</h4>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{course.name}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{course.credits} credits</span>
                </div>
              </div>
            );
          })}
        </div>

        {activeCourse && (
          <div className="mt-6 p-4 bg-muted/50 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="font-semibold mb-1">{activeCourse.code}: {activeCourse.name}</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {activeCourse.credits} credit hours • {typeConfig[activeCourse.type]}
              </p>
              {activeCourse.prerequisites.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium">Requires:</span>
                  {activeCourse.prerequisites.map((prereq) => (
                    <Badge key={prereq} variant="outline" className="text-xs">{prereq}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No prerequisites</p>
              )}
            </div>
            
            <div>
              {activeCourse.status === "in-progress" ? (
                <Button variant="destructive" onClick={() => onRemoveCourse?.(activeCourse.id)} className="w-full md:w-auto">
                  <Trash2 className="w-4 h-4 mr-2" /> Remove from Cart
                </Button>
              ) : (
                <Button 
                  onClick={() => onAddCourse?.(activeCourse)} 
                  disabled={activeCourse.status === "locked" || activeCourse.status === "completed"}
                  className="w-full md:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {activeCourse.status === "completed" ? "Already Completed" : activeCourse.status === "locked" ? "Prerequisites Not Met" : "Add to Schedule"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}