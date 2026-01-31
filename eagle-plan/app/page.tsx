"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/eagle-plan/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  FileText,
  GitBranch,
  Calendar,
  RefreshCw,
  Download,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Transcript Parser",
    description:
      "Upload your UNT transcript and automatically detect completed courses, credits, and grades.",
    href: "/dashboard",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: GitBranch,
    title: "Prerequisite Visualization",
    description:
      "Color-coded course map showing dependencies, completion status, and available courses.",
    href: "/dashboard",
    color: "text-completed",
    bg: "bg-completed/10",
  },
  {
    icon: Calendar,
    title: "Drag-and-Drop Scheduling",
    description:
      "Plan your semesters by dragging courses. Lock courses in place to keep your preferred schedule.",
    href: "/planner",
    color: "text-accent-foreground",
    bg: "bg-accent/10",
  },
  {
    icon: RefreshCw,
    title: "Major Overlap Analysis",
    description:
      "Compare majors to see overlapping credits and requirements for switching or double majoring.",
    href: "/compare",
    color: "text-minor-course",
    bg: "bg-minor-course/10",
  },
  {
    icon: Download,
    title: "Smart Export",
    description:
      "Export your degree plan to Google Sheets, CSV, or iCal for easy sharing with advisors.",
    href: "/planner",
    color: "text-foreground",
    bg: "bg-muted",
  },
];

const stats = [
  { value: "10,000+", label: "UNT Students" },
  { value: "50+", label: "Majors Supported" },
  { value: "4.8", label: "Average Rating" },
  { value: "30min", label: "Time Saved/Week" },
];

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              For UNT Students
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
              Plan Your Degree.
              <br />
              <span className="text-primary">Graduate On Time</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
              Eagle Plan is the intelligent degree planner for UNT students. Upload your
              transcript, visualize prerequisites, and create a personalized path to graduation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/onboarding">
                <Button size="lg" className="text-lg px-8">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="p-6 bg-card rounded-xl border border-border text-center"
              >
                <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features for Student Success
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our 5 core features help you take control of your academic journey without
              waiting for advisor appointments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  href={feature.href}
                  onMouseEnter={() => setHoveredFeature(index)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  className="group p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all"
                >
                  <div
                    className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it now
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground">
              Three simple steps to your personalized degree plan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Transcript",
                description:
                  "Import your UNT transcript PDF. Our parser automatically detects completed courses and credits.",
              },
              {
                step: "02",
                title: "Select Your Path",
                description:
                  "Choose your major, minors, and credit preferences. See all prerequisites visualized clearly.",
              },
              {
                step: "03",
                title: "Plan & Export",
                description:
                  "Drag courses into semesters, lock your preferences, and export to share with your advisor.",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-primary/10 mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.description}</p>
                {index < 2 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 h-8 w-8 text-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary">
        <div className="container mx-auto max-w-4xl text-center">
          <GraduationCap className="h-16 w-16 mx-auto text-primary-foreground mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Plan Your Future?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of UNT students who are taking control of their degree planning.
            No more waiting for advisor appointments.
          </p>
          <Link href="/onboarding">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              Start Planning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-card border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Eagle Plan</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Made for UNT Students • Not affiliated with UNT
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <a href="https://unt.benwilcox.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                Course Database
              </a>
              <span>•</span>
              <span>© 2025 Eagle Plan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
