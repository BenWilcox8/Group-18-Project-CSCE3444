"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/eagle-plan/header";
import { TranscriptUpload } from "@/components/eagle-plan/transcript-upload";
import { PrerequisiteMap, Course, ParsedCourse } from "@/components/eagle-plan/prerequisite-map";
import { ExportPlan, PlanData } from "@/components/eagle-plan/export-plan";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Clock, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [studentStats, setStudentStats] = useState({
    creditsCompleted: 0,
    totalCredits: 124,
    gpa: 0.0,
    semestersRemaining: 8,
    coursesThisSemester: 0,
  });

  const [transcriptCourses, setTranscriptCourses] = useState<ParsedCourse[]>([]);
  const [plannedCourses, setPlannedCourses] = useState<Course[]>([]);

  const handleAddCourse = (course: Course) => {
    if (!plannedCourses.find(c => c.id === course.id)) {
      setPlannedCourses([...plannedCourses, course]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setPlannedCourses(plannedCourses.filter(c => c.id !== courseId));
  };

  const calculateGPA = (courses: ParsedCourse[]) => {
    const gradePoints: Record<string, number> = {
      "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0,
    };
    let totalPoints = 0, totalCreditsForGPA = 0;
    courses.forEach((course) => {
      const gradeKey = course.grade.toUpperCase();
      if (gradePoints[gradeKey] !== undefined) {
        totalPoints += gradePoints[gradeKey] * course.credits;
        totalCreditsForGPA += course.credits;
      }
    });
    return totalCreditsForGPA > 0 ? Number((totalPoints / totalCreditsForGPA).toFixed(2)) : 0;
  };

  const handleTranscriptParsed = (courses: ParsedCourse[]) => {
    if (!courses.length) return;
    setTranscriptCourses(courses);

    const validPassingGrades = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+"];
    
    const earnedCredits = courses.reduce((sum, course) => {
      const isPassing = validPassingGrades.includes(course.grade.toUpperCase());
      return isPassing ? sum + course.credits : sum;
    }, 0);

    const calculatedGPA = calculateGPA(courses);
    const latestSemester = courses[courses.length - 1].semester;
    const currentSemesterCourses = courses.filter(c => c.semester === latestSemester).length;
    const creditsLeft = Math.max(0, studentStats.totalCredits - earnedCredits);

    setStudentStats({
      ...studentStats,
      creditsCompleted: earnedCredits,
      gpa: calculatedGPA,
      semestersRemaining: Math.ceil(creditsLeft / 15),
      coursesThisSemester: currentSemesterCourses,
    });
  };

  const getNextSemesterName = (courses: ParsedCourse[]) => {
    if (!courses || courses.length === 0) return "Planned Next Semester";

    const termValues: Record<string, number> = {
      "spring": 1,
      "summer": 2,
      "fall": 3,
      "winter": 4
    };

    let maxScore = 0;
    let latestTerm = "";
    let latestYear = 0;

    courses.forEach(c => {
      const parts = c.semester.split(" ");
      if (parts.length < 2) return;
      
      const term = parts[0].toLowerCase();
      const year = parseInt(parts[1], 10);
      const termVal = termValues[term];

      if (year && termVal) {
        const score = year * 10 + termVal; 
        if (score > maxScore) {
          maxScore = score;
          latestTerm = term;
          latestYear = year;
        }
      }
    });

    if (maxScore === 0) return "Planned Next Semester";

    if (latestTerm === "spring" || latestTerm === "summer") {
      return `Fall ${latestYear}`;
    } else {
      return `Spring ${latestYear + 1}`;
    }
  };

  const exportPlanData = useMemo<PlanData | null>(() => {
    if (transcriptCourses.length === 0 && plannedCourses.length === 0) return null;

    const groupedSemesters = [];
    const targetSemesterName = getNextSemesterName(transcriptCourses);

    if (plannedCourses.length > 0) {
      groupedSemesters.push({
        name: targetSemesterName,
        courses: plannedCourses.map(c => ({ code: c.code, name: c.name, credits: c.credits }))
      });
    } else {
      groupedSemesters.push({
        name: targetSemesterName,
        courses: [{ code: "---", name: "Add classes to your schedule cart to export", credits: 0 }]
      });
    }

    return {
      student: "Current Student",
      major: "Computer Science",
      expectedGraduation: "Spring 2027", 
      totalCredits: 124,
      completedCredits: studentStats.creditsCompleted,
      semesters: groupedSemesters
    };
  }, [transcriptCourses, plannedCourses, studentStats.creditsCompleted]);

  const plannedCreditsTotal = plannedCourses.reduce((sum, c) => sum + c.credits, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">Dashboard</Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back, Student</h1>
            <p className="text-muted-foreground">Track your progress and manage your degree plan</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl"><GraduationCap className="h-6 w-6 text-primary" /></div>
                  <div><p className="text-2xl font-bold">{studentStats.creditsCompleted}/{studentStats.totalCredits}</p><p className="text-sm text-muted-foreground">Credits Completed</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-completed/10 rounded-xl"><TrendingUp className="h-6 w-6 text-completed" /></div>
                  <div><p className="text-2xl font-bold">{studentStats.gpa.toFixed(2)}</p><p className="text-sm text-muted-foreground">Current GPA</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl"><Clock className="h-6 w-6 text-accent-foreground" /></div>
                  <div><p className="text-2xl font-bold">{studentStats.semestersRemaining}</p><p className="text-sm text-muted-foreground">Semesters Remaining</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-minor-course/10 rounded-xl"><BookOpen className="h-6 w-6 text-minor-course" /></div>
                  <div><p className="text-2xl font-bold">{studentStats.coursesThisSemester}</p><p className="text-sm text-muted-foreground">Courses This Semester</p></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="lg:col-span-1 space-y-8">
              <TranscriptUpload onParsed={handleTranscriptParsed} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Schedule</CardTitle>
                  <CardDescription>Select classes from the map to build your next semester.</CardDescription>
                </CardHeader>
                <CardContent>
                  {plannedCourses.length === 0 ? (
                    <div className="p-4 bg-muted/50 rounded-lg text-center border-2 border-dashed border-muted-foreground/25">
                      <p className="text-sm text-muted-foreground">Your schedule is empty.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {plannedCourses.map(course => (
                        <div key={course.id} className="flex items-center justify-between p-3 bg-accent/5 border border-accent/20 rounded-lg">
                          <div>
                            <p className="font-semibold text-sm">{course.code}</p>
                            <p className="text-xs text-muted-foreground">{course.credits} credits</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveCourse(course.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="pt-3 border-t border-border flex justify-between items-center font-bold">
                        <span>Total Credits:</span>
                        <span className={plannedCreditsTotal > 18 ? "text-destructive" : ""}>{plannedCreditsTotal}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <ExportPlan planData={exportPlanData} />
            </div>

            <div className="lg:col-span-2">
              <PrerequisiteMap 
                parsedCourses={transcriptCourses} 
                plannedCourses={plannedCourses}
                onAddCourse={handleAddCourse}
                onRemoveCourse={handleRemoveCourse}
              />
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}