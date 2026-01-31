"use client";

import React from "react"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GripVertical, Lock, Unlock, Plus, Trash2, AlertCircle } from "lucide-react";

interface PlannedCourse {
  id: string;
  code: string;
  name: string;
  credits: number;
  isLocked: boolean;
  type: "major" | "minor" | "core" | "elective";
}

interface Semester {
  id: string;
  name: string;
  year: number;
  season: "Fall" | "Spring" | "Summer";
  courses: PlannedCourse[];
  maxCredits: number;
}

const initialSemesters: Semester[] = [
  {
    id: "s1",
    name: "Fall 2025",
    year: 2025,
    season: "Fall",
    maxCredits: 18,
    courses: [
      { id: "c1", code: "CSCE 3110", name: "Algorithms", credits: 3, isLocked: false, type: "major" },
      { id: "c2", code: "MATH 2730", name: "Multivariable Calculus", credits: 3, isLocked: true, type: "major" },
      { id: "c3", code: "PHIL 1800", name: "Ethics", credits: 3, isLocked: false, type: "core" },
    ],
  },
  {
    id: "s2",
    name: "Spring 2026",
    year: 2026,
    season: "Spring",
    maxCredits: 18,
    courses: [
      { id: "c4", code: "CSCE 3600", name: "Operating Systems", credits: 3, isLocked: false, type: "major" },
      { id: "c5", code: "CSCE 3550", name: "Computer Networks", credits: 3, isLocked: false, type: "major" },
    ],
  },
  {
    id: "s3",
    name: "Fall 2026",
    year: 2026,
    season: "Fall",
    maxCredits: 18,
    courses: [
      { id: "c6", code: "CSCE 4110", name: "Design & Analysis of Algorithms", credits: 3, isLocked: false, type: "major" },
    ],
  },
  {
    id: "s4",
    name: "Spring 2027",
    year: 2027,
    season: "Spring",
    maxCredits: 18,
    courses: [],
  },
];

const availableCourses: PlannedCourse[] = [
  { id: "ac1", code: "CSCE 4350", name: "Software Engineering", credits: 3, isLocked: false, type: "major" },
  { id: "ac2", code: "CSCE 4200", name: "Computer Architecture", credits: 3, isLocked: false, type: "major" },
  { id: "ac3", code: "CSCE 4600", name: "Operating Systems II", credits: 3, isLocked: false, type: "elective" },
  { id: "ac4", code: "ARTS 1301", name: "Art Appreciation", credits: 3, isLocked: false, type: "core" },
  { id: "ac5", code: "HIST 2610", name: "US History I", credits: 3, isLocked: false, type: "core" },
];

const typeColors = {
  major: "bg-major-course/20 border-major-course text-major-course",
  minor: "bg-minor-course/20 border-minor-course text-minor-course",
  core: "bg-accent/20 border-accent text-accent-foreground",
  elective: "bg-muted border-border text-muted-foreground",
};

export function SemesterPlanner() {
  const [semesters, setSemesters] = useState<Semester[]>(initialSemesters);
  const [draggedCourse, setDraggedCourse] = useState<PlannedCourse | null>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);

  const handleDragStart = (course: PlannedCourse, sourceId: string) => {
    if (course.isLocked) return;
    setDraggedCourse(course);
    setDragSource(sourceId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetSemesterId: string) => {
    if (!draggedCourse || !dragSource) return;

    setSemesters((prev) => {
      const newSemesters = prev.map((semester) => {
        // Remove from source
        if (semester.id === dragSource || dragSource === "available") {
          return {
            ...semester,
            courses: semester.courses.filter((c) => c.id !== draggedCourse.id),
          };
        }
        return semester;
      });

      // Add to target
      return newSemesters.map((semester) => {
        if (semester.id === targetSemesterId) {
          const totalCredits = semester.courses.reduce((sum, c) => sum + c.credits, 0);
          if (totalCredits + draggedCourse.credits <= semester.maxCredits) {
            return {
              ...semester,
              courses: [...semester.courses, { ...draggedCourse, id: `${draggedCourse.id}-${Date.now()}` }],
            };
          }
        }
        return semester;
      });
    });

    setDraggedCourse(null);
    setDragSource(null);
  };

  const toggleLock = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id === semesterId) {
          return {
            ...semester,
            courses: semester.courses.map((course) => {
              if (course.id === courseId) {
                return { ...course, isLocked: !course.isLocked };
              }
              return course;
            }),
          };
        }
        return semester;
      })
    );
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id === semesterId) {
          return {
            ...semester,
            courses: semester.courses.filter((c) => c.id !== courseId),
          };
        }
        return semester;
      })
    );
  };

  const getTotalCredits = (courses: PlannedCourse[]) =>
    courses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Drag-and-Drop Course Scheduler</CardTitle>
        <CardDescription>
          Plan your semesters by dragging courses. Lock courses to keep them in place. Color coding shows course types.
        </CardDescription>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-major-course" />
            <span className="text-sm text-muted-foreground">Major</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-minor-course" />
            <span className="text-sm text-muted-foreground">Minor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Core</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
            <span className="text-sm text-muted-foreground">Elective</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Courses */}
        <div className="p-4 bg-muted/30 rounded-xl">
          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Available Courses
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableCourses.map((course) => (
              <div
                key={course.id}
                draggable
                onDragStart={() => handleDragStart(course, "available")}
                className={cn(
                  "px-3 py-2 rounded-lg border cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
                  typeColors[course.type]
                )}
              >
                <span className="font-medium text-sm">{course.code}</span>
                <span className="text-xs ml-2 opacity-75">({course.credits})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Semester Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {semesters.map((semester) => {
            const totalCredits = getTotalCredits(semester.courses);
            const isOverloaded = totalCredits > semester.maxCredits;

            return (
              <div
                key={semester.id}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(semester.id)}
                className={cn(
                  "p-4 rounded-xl border-2 border-dashed transition-all min-h-[200px]",
                  draggedCourse && totalCredits + draggedCourse.credits <= semester.maxCredits
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  isOverloaded && "border-destructive bg-destructive/5"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-foreground">{semester.name}</h4>
                  <div className="flex items-center gap-2">
                    {isOverloaded && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    <Badge
                      variant={isOverloaded ? "destructive" : "secondary"}
                    >
                      {totalCredits}/{semester.maxCredits} credits
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  {semester.courses.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Drag courses here
                    </div>
                  ) : (
                    semester.courses.map((course) => (
                      <div
                        key={course.id}
                        draggable={!course.isLocked}
                        onDragStart={() => handleDragStart(course, semester.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border transition-all",
                          typeColors[course.type],
                          course.isLocked
                            ? "opacity-75 cursor-not-allowed"
                            : "cursor-grab active:cursor-grabbing hover:shadow-md"
                        )}
                      >
                        <GripVertical
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            course.isLocked ? "opacity-30" : "opacity-60"
                          )}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{course.code}</p>
                          <p className="text-xs opacity-75 truncate">{course.name}</p>
                        </div>
                        <span className="text-xs font-medium">{course.credits} cr</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => toggleLock(semester.id, course.id)}
                        >
                          {course.isLocked ? (
                            <Lock className="h-3 w-3" />
                          ) : (
                            <Unlock className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeCourse(semester.id, course.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
