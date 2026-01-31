"use client";

import { Header } from "@/components/eagle-plan/header";
import { TranscriptUpload } from "@/components/eagle-plan/transcript-upload";
import { PrerequisiteMap } from "@/components/eagle-plan/prerequisite-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GraduationCap, TrendingUp, Clock, BookOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">
              Dashboard
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back, Student
            </h1>
            <p className="text-muted-foreground">
              Track your progress and manage your degree plan
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">45/124</p>
                    <p className="text-sm text-muted-foreground">Credits Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-completed/10 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-completed" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">3.65</p>
                    <p className="text-sm text-muted-foreground">Current GPA</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl">
                    <Clock className="h-6 w-6 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">4</p>
                    <p className="text-sm text-muted-foreground">Semesters Remaining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-minor-course/10 rounded-xl">
                    <BookOpen className="h-6 w-6 text-minor-course" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">8</p>
                    <p className="text-sm text-muted-foreground">Courses This Semester</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Transcript Upload - Feature 1 */}
            <div className="lg:col-span-1">
              <TranscriptUpload />
            </div>

            {/* Prerequisite Map - Feature 2 */}
            <div className="lg:col-span-2">
              <PrerequisiteMap />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
