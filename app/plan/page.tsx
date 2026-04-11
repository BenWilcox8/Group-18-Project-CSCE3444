"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap, BookOpen, TrendingUp, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Course {
  code: string;
  name: string;
  credits: number;
}

interface Semester {
  name: string;
  courses: Course[];
}

function PlanView() {
  const searchParams = useSearchParams();

  const student = searchParams.get("student") || "Student";
  const major = searchParams.get("major") || "Unknown Major";
  const grad = searchParams.get("grad") || "TBD";
  const total = parseInt(searchParams.get("total") || "124", 10);
  const completed = parseInt(searchParams.get("completed") || "0", 10);

  // Reconstruct semesters from params
  const semesters: Semester[] = [];
  let i = 0;
  while (searchParams.get(`sem${i}`)) {
    const semName = searchParams.get(`sem${i}`)!;
    const courses: Course[] = [];
    let j = 0;
    while (searchParams.get(`s${i}c${j}`)) {
      const raw = searchParams.get(`s${i}c${j}`)!;
      const [code, name, creditsStr] = raw.split("|");
      courses.push({ code, name, credits: parseFloat(creditsStr) || 0 });
      j++;
    }
    semesters.push({ name: semName, courses });
    i++;
  }

  const totalPlannedCredits = semesters.reduce(
    (sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0),
    0
  );

  const progressPercent = Math.min(100, Math.round((completed / total) * 100));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border py-4 px-4">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">Eagle Plan</span>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-10 space-y-8">
        {/* Student Info */}
        <div>
          <Badge variant="outline" className="mb-2">Shared Plan</Badge>
          <h1 className="text-3xl font-bold text-foreground mb-1">{student}&apos;s Degree Plan</h1>
          <p className="text-muted-foreground">{major} · Expected Graduation: {grad}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl" aria-hidden="true">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{completed}/{total}</p>
                <p className="text-sm text-muted-foreground">Credits Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl" aria-hidden="true">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{progressPercent}%</p>
                <p className="text-sm text-muted-foreground">Degree Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl" aria-hidden="true">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold">{totalPlannedCredits}</p>
                <p className="text-sm text-muted-foreground">Planned Credits</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Degree Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progressPercent}% of degree completed`}
            />
          </div>
        </div>

        {/* Semesters */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Planned Schedule</h2>
          {semesters.length === 0 ? (
            <p className="text-muted-foreground">No semesters found in this plan.</p>
          ) : (
            semesters.map((sem, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle className="text-base">{sem.name}</CardTitle>
                  <CardDescription>
                    {sem.courses.reduce((s, c) => s + c.credits, 0)} credit hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {sem.courses.map((course, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between p-3 bg-muted/40 rounded-lg"
                      >
                        <div>
                          <p className="font-semibold text-sm">{course.code}</p>
                          <p className="text-xs text-muted-foreground">{course.name}</p>
                        </div>
                        <Badge variant="outline">{course.credits} cr</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading plan...</div>}>
      <PlanView />
    </Suspense>
  );
}
