"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import OnboardingForm from "./OnboardingForm";

export default function ProfileManager() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkProfile = () => {
      const profile = localStorage.getItem("userProfile");
      // Skip onboarding on landing page, but require it for simulation/dashboard
      const gatedPaths = ["/simulate", "/live-agents", "/dashboard", "/report"];
      const isGated = gatedPaths.some(path => pathname.startsWith(path));
      
      if (!profile && isGated) {
        setShowOnboarding(true);
        setInitialData(null);
      }
    };

    checkProfile();
    
    // Listen for custom edit profile events
    const handleEdit = (e: any) => {
      setInitialData(e.detail);
      setShowOnboarding(true);
    };
    
    window.addEventListener("editProfile", handleEdit);
    return () => window.removeEventListener("editProfile", handleEdit);
  }, [pathname]);

  if (!showOnboarding) return null;

  const hasProfile = !!localStorage.getItem("userProfile");

  const handleClose = () => {
    if (hasProfile) {
      // Existing profile — just close the modal
      setShowOnboarding(false);
    } else {
      // No profile — safely escape to landing page
      setShowOnboarding(false);
      router.push("/");
    }
  };

  return (
    <OnboardingForm 
      onComplete={() => setShowOnboarding(false)} 
      initialData={initialData}
      onClose={handleClose}
    />
  );
}
