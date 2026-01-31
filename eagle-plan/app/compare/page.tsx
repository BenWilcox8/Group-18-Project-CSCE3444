"use client";

import { Header } from "@/components/eagle-plan/header";
import { MajorComparison } from "@/components/eagle-plan/major-comparison";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Page Header */}
          <div className="mb-8">
            <Badge variant="outline" className="mb-2">
              Compare Majors
            </Badge>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Major Overlap Analysis
            </h1>
            <p className="text-muted-foreground">
              Compare different majors to find shared courses and plan for double majors
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* Feature 4: Major Comparison */}
            <MajorComparison />

            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Tips for Double Majoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Look for Overlap</h4>
                    <p className="text-sm text-muted-foreground">
                      Majors with high course overlap make double majoring more feasible within 4 years.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Plan Early</h4>
                    <p className="text-sm text-muted-foreground">
                      Start planning by sophomore year to ensure you can complete all requirements.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-1">Talk to Advisors</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your Eagle Plan export with advisors from both departments.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
