"use client";

import { useRouter } from "next/navigation";
import { WelcomeScreen } from "@/components/eagle-plan/welcome-screen";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = () => {
    router.push("/dashboard");
  };

  return <WelcomeScreen onComplete={handleComplete} />;
}
