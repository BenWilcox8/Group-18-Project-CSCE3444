"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ArrowRight, Check, RefreshCw, BookOpen } from "lucide-react";

interface MajorInfo {
  id: string;
  name: string;
  totalCredits: number;
  courses: string[];
  coreCredits: number;
}

const majors: MajorInfo[] = [
  {
    id: "cs",
    name: "Computer Science",
    totalCredits: 124,
    coreCredits: 42,
    courses: [
      "CSCE 1030", "CSCE 1040", "CSCE 2100", "CSCE 2110", "CSCE 3110",
      "CSCE 3600", "CSCE 3550", "CSCE 4110", "CSCE 4350", "CSCE 4200",
      "MATH 1710", "MATH 1720", "MATH 2700", "MATH 2730", "PHYS 1710"
    ],
  },
  {
    id: "it",
    name: "Information Technology",
    totalCredits: 120,
    coreCredits: 42,
    courses: [
      "CSCE 1030", "CSCE 1040", "CSCE 2100", "ITSS 3300", "ITSS 4300",
      "CSCE 3550", "ITSS 4370", "BCIS 3610", "BCIS 4620", "ITSS 4360",
      "MATH 1680", "MATH 1710", "STAT 2300"
    ],
  },
  {
    id: "ce",
    name: "Computer Engineering",
    totalCredits: 128,
    coreCredits: 42,
    courses: [
      "CSCE 1030", "CSCE 1040", "CSCE 2100", "CSCE 2110", "CSCE 3110",
      "EENG 2610", "EENG 3410", "EENG 3710", "CSCE 4200", "EENG 4310",
      "MATH 1710", "MATH 1720", "MATH 2700", "MATH 2730", "PHYS 1710", "PHYS 1720"
    ],
  },
  {
    id: "ds",
    name: "Data Science",
    totalCredits: 120,
    coreCredits: 42,
    courses: [
      "CSCE 1030", "CSCE 1040", "CSCE 2100", "STAT 2300", "STAT 3110",
      "STAT 4100", "CSCE 4350", "MATH 1710", "MATH 1720", "MATH 2700",
      "STAT 4200", "STAT 4210", "CSCE 4290"
    ],
  },
];

export function MajorComparison() {
  const [primaryMajor, setPrimaryMajor] = useState<string>("cs");
  const [compareMajor, setCompareMajor] = useState<string>("it");

  const primary = majors.find((m) => m.id === primaryMajor)!;
  const compare = majors.find((m) => m.id === compareMajor)!;

  const overlappingCourses = primary.courses.filter((course) =>
    compare.courses.includes(course)
  );

  const uniqueToPrimary = primary.courses.filter(
    (course) => !compare.courses.includes(course)
  );

  const uniqueToCompare = compare.courses.filter(
    (course) => !primary.courses.includes(course)
  );

  const overlapPercentage = Math.round(
    (overlappingCourses.length / Math.max(primary.courses.length, compare.courses.length)) * 100
  );

  const additionalCreditsNeeded = uniqueToCompare.length * 3; // Assuming 3 credits per course

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          Major Overlap Analysis
        </CardTitle>
        <CardDescription>
          Compare majors to see overlapping credits and requirements for switching or adding a double major
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Major Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Current Major</label>
            <Select value={primaryMajor} onValueChange={setPrimaryMajor}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Compare With</label>
            <Select value={compareMajor} onValueChange={setCompareMajor}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {majors.filter((m) => m.id !== primaryMajor).map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-primary/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-primary">{overlapPercentage}%</p>
            <p className="text-sm text-muted-foreground">Course Overlap</p>
          </div>
          <div className="p-4 bg-completed/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-completed">{overlappingCourses.length}</p>
            <p className="text-sm text-muted-foreground">Shared Courses</p>
          </div>
          <div className="p-4 bg-accent/10 rounded-xl text-center">
            <p className="text-3xl font-bold text-accent-foreground">{uniqueToCompare.length}</p>
            <p className="text-sm text-muted-foreground">Additional Courses</p>
          </div>
          <div className="p-4 bg-muted rounded-xl text-center">
            <p className="text-3xl font-bold text-foreground">+{additionalCreditsNeeded}</p>
            <p className="text-sm text-muted-foreground">Extra Credits</p>
          </div>
        </div>

        {/* Visual Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Primary Major */}
          <div className="p-4 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-foreground">{primary.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {primary.totalCredits} total credits • {primary.courses.length} major courses
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Unique Courses ({uniqueToPrimary.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {uniqueToPrimary.map((course) => (
                  <Badge key={course} variant="outline" className="text-xs">
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Overlapping Courses */}
          <div className="p-4 bg-completed/5 rounded-xl border border-completed/20">
            <div className="flex items-center gap-2 mb-3">
              <Check className="h-4 w-4 text-completed" />
              <h4 className="font-semibold text-foreground">Overlapping Courses</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              These courses count toward both majors
            </p>
            <div className="flex flex-wrap gap-1">
              {overlappingCourses.map((course) => (
                <Badge
                  key={course}
                  className="text-xs bg-completed/20 text-completed border-completed/30"
                >
                  {course}
                </Badge>
              ))}
            </div>
          </div>

          {/* Compare Major */}
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/20">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="h-4 w-4 text-accent-foreground" />
              <h4 className="font-semibold text-foreground">{compare.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {compare.totalCredits} total credits • {compare.courses.length} major courses
            </p>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Additional Courses Needed ({uniqueToCompare.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {uniqueToCompare.map((course) => (
                  <Badge
                    key={course}
                    variant="outline"
                    className="text-xs border-accent/50"
                  >
                    {course}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Switch Analysis */}
        <div className="p-4 bg-muted/50 rounded-xl">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Switch Analysis: {primary.name} to {compare.name}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">If you switch from {primary.name}:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-completed" />
                  <span>{overlappingCourses.length} courses will transfer directly</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3 w-3 text-completed" />
                  <span>{overlappingCourses.length * 3} credits apply to new major</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">You will need to complete:</p>
              <ul className="space-y-1">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>{uniqueToCompare.length} additional major courses</span>
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <span>Approximately {Math.ceil(uniqueToCompare.length / 4)} extra semesters</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
