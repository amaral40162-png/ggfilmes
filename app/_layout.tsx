import { useEffect } from "react";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { MovieProvider } from "../src/context/MovieContext";
import { AuthProvider, useAuth } from "../src/context/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    // Se ainda está carregando o estado do Firebase, não faz nada
    if (loading) return;

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      // Se não tem usuário e não está na tela de login, manda para o login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Se já logou e ainda está na tela de login, manda para as abas
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

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