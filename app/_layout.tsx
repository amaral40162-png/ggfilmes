import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { MovieProvider } from "../src/context/MovieContext";
import { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Só toma decisões de rota quando o Firebase terminar de carregar
    if (loading) return;

    const inAuthGroup = segments[0] === "login";

    if (!user && !inAuthGroup) {
      // Se não está logado e não está no login, vai para o login
      router.replace("/login");
    } else if (user && inAuthGroup) {
      // Se já logou e ainda está no login, vai para o app
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  // Enquanto carrega o estado inicial, mostramos um spinner centralizado
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff4081" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <MovieProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthGuard>
      </MovieProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  }
});