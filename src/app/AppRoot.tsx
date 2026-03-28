import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppNavigator } from "../navigation/AppNavigator";

const queryClient = new QueryClient();

export const AppRoot = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <AppNavigator />
    </QueryClientProvider>
  );
};
