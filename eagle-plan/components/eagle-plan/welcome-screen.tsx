"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  Upload,
  Settings,
  ArrowRight,
  Check,
  BookOpen,
  Calculator,
} from "lucide-react";

interface WelcomeScreenProps {
  onComplete?: () => void;
}

const majors = [
  "Computer Science",
  "Computer Engineering",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Software Engineering",
];

const minors = [
  "Mathematics",
  "Business",
  "Psychology",
  "Communication",
  "Economics",
  "Physics",
];

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(1);
  const [selectedMajor, setSelectedMajor] = useState<string>("");
  const [selectedMinors, setSelectedMinors] = useState<string[]>([]);
  const [maxCredits, setMaxCredits] = useState("15");
  const [hasTranscript, setHasTranscript] = useState(false);

  const toggleMinor = (minor: string) => {
    setSelectedMinors((prev) =>
      prev.includes(minor)
        ? prev.filter((m) => m !== minor)
        : [...prev, minor]
    );
  };

  const handleComplete = () => {
    onComplete?.();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl mb-4">
            <GraduationCap className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Eagle Plan</h1>
          <p className="text-muted-foreground">
            Let&apos;s set up your degree pathway in just a few steps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                "w-3 h-3 rounded-full transition-all",
                s === step
                  ? "w-8 bg-primary"
                  : s < step
                  ? "bg-completed"
                  : "bg-border"
              )}
            />
          ))}
        </div>

        {/* Step 1: Select Major */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Step 1: Choose Your Major
              </CardTitle>
              <CardDescription>
                Select your primary major and any minors or certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Primary Major</Label>
                <Select value={selectedMajor} onValueChange={setSelectedMajor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((major) => (
                      <SelectItem key={major} value={major}>
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Minors (Optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {minors.map((minor) => (
                    <button
                      key={minor}
                      onClick={() => toggleMinor(minor)}
                      className={cn(
                        "px-3 py-1.5 rounded-full border transition-all text-sm",
                        selectedMinors.includes(minor)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      )}
                    >
                      {selectedMinors.includes(minor) && (
                        <Check className="h-3 w-3 inline mr-1" />
                      )}
                      {minor}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => setStep(2)}
                disabled={!selectedMajor}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Credit Preferences */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                Step 2: Credit Preferences
              </CardTitle>
              <CardDescription>
                Set your preferred course load per semester
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Maximum Credits per Semester</Label>
                <Input
                  type="number"
                  value={maxCredits}
                  onChange={(e) => setMaxCredits(e.target.value)}
                  min={12}
                  max={21}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Full-time is 12-18 credits. Maximum overload is 21 credits.
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-xl">
                <h4 className="font-semibold mb-2">Recommended Pace</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <button
                    onClick={() => setMaxCredits("12")}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      maxCredits === "12" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <p className="text-lg font-bold">12</p>
                    <p className="text-xs text-muted-foreground">Light</p>
                  </button>
                  <button
                    onClick={() => setMaxCredits("15")}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      maxCredits === "15" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <p className="text-lg font-bold">15</p>
                    <p className="text-xs text-muted-foreground">Standard</p>
                  </button>
                  <button
                    onClick={() => setMaxCredits("18")}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      maxCredits === "18" ? "border-primary bg-primary/5" : "border-border"
                    )}
                  >
                    <p className="text-lg font-bold">18</p>
                    <p className="text-xs text-muted-foreground">Intensive</p>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Upload Transcript */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Step 3: Import Your Progress
              </CardTitle>
              <CardDescription>
                Upload your transcript to automatically track completed courses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                  hasTranscript
                    ? "border-completed bg-completed/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setHasTranscript(true)}
              >
                {hasTranscript ? (
                  <>
                    <Check className="h-12 w-12 mx-auto text-completed mb-4" />
                    <p className="font-medium text-foreground">Transcript uploaded!</p>
                    <p className="text-sm text-muted-foreground">45 credits detected</p>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="font-medium text-foreground mb-1">
                      Drop your transcript here
                    </p>
                    <p className="text-sm text-muted-foreground mb-4">
                      PDF format from myUNT
                    </p>
                    <Badge variant="outline">Click to browse</Badge>
                  </>
                )}
              </div>

              <Button
                variant="link"
                className="w-full text-muted-foreground"
                onClick={handleComplete}
              >
                Skip for now
              </Button>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  <Settings className="h-4 w-4 mr-2" />
                  Start Planning
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Selected Summary */}
        {selectedMajor && (
          <div className="mt-6 p-4 bg-card rounded-xl border border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Your Selection</h4>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-primary text-primary-foreground">{selectedMajor}</Badge>
              {selectedMinors.map((minor) => (
                <Badge key={minor} variant="outline">
                  {minor}
                </Badge>
              ))}
              <Badge variant="secondary">{maxCredits} credits/semester</Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
