import { useState } from "react";
import { useAuthStore } from "../features/auth/auth.store";
import { AuthScreen } from "../screens/AuthScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { LandingScreen } from "../screens/LandingScreen";

export const AppNavigator = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [showAuth, setShowAuth] = useState(false);

  if (accessToken) {
    return <DashboardScreen />;
  }

  if (!showAuth) {
    return (
      <LandingScreen
        onGetStarted={() => setShowAuth(true)}
        onSignIn={() => setShowAuth(true)}
      />
    );
  }

  if (!accessToken) {
    return <AuthScreen />;
  }

  return <DashboardScreen />;
};
