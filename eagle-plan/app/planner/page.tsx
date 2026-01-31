"use client";

import { Header } from "@/components/eagle-plan/header";
import { SemesterPlanner } from "@/components/eagle-plan/semester-planner";
import { ExportPlan } from "@/components/eagle-plan/export-plan";
import { Badge } from "@/components/ui/badge";

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">
              Course Planner
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Semester Planning
            </h1>
            <p className="text-muted-foreground">
              Drag and drop courses to build your perfect schedule
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Feature 3: Drag-and-Drop Scheduler */}
            <SemesterPlanner />

            {/* Feature 5: Export Plan */}
            <ExportPlan />
          </div>
        </div>
      </main>
    </div>
  );
}
