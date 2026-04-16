import { Stack, router, useSegments } from "expo-router";
import { useEffect } from "react";
import { MovieProvider } from "../src/context/MovieContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      // Redireciona para o login se não estiver logado
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Redireciona para o início se já estiver logado e tentar acessar o login
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MovieProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" options={{ gestureEnabled: false }} />
            <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthGuard>
      </MovieProvider>
    </AuthProvider>
  );
}