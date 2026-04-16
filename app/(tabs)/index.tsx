import { useState, useContext, useEffect } from "react";
import { View, TextInput, FlatList, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator, ImageBackground } from "react-native";
import { searchMovies } from "@/services/api";
import { MovieContext } from "@/src/context/MovieContext";
import { MovieCard } from "@/components/MovieCard";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useDebounce } from "@/hooks/useDebounce";

export default function Home() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 500);

  const { watchlist, addMovieToWatchlist, setActiveMovie } = useContext(MovieContext);

  const handleAutoSearch = async () => {
    if (debouncedQuery.trim().length > 1) {
      setLoading(true);
      const results = await searchMovies(debouncedQuery);
      setMovies(results);
      setLoading(false);
    } else if (debouncedQuery.trim().length === 0) {
      setMovies([]);
    }
  };

  const handleAddToWatchlist = (movie: any) => {
    if (!watchlist.find((m: any) => m.id === movie.id)) {
      addMovieToWatchlist(movie);
    }
  };

  const openReviewModal = (movie: any) => {
    setActiveMovie(movie);
    router.push("/modal");
  };

  useEffect(() => {
    handleAutoSearch();
  }, [debouncedQuery]);

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          <ImageBackground 
            source={require('@/assets/images/casal.jpg')} 
            style={{ width: '100%', height: '100%' }}
            imageStyle={{ resizeMode: 'contain', transform: [{ scale: 0.75 }] }}
          />
        </View>
      </View>
      <SafeAreaView style={styles.safeAreaOverlay}>
        <LinearGradient colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.95)']} style={styles.background} />
        
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, Casal! ❤️</Text>
          <Text style={styles.subtitle}>O que vamos assistir hoje?</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar filme..."
              placeholderTextColor="#666"
              value={query}
              onChangeText={setQuery}
              style={styles.input}
            />
            {loading && (
              <ActivityIndicator size="small" color="#ff4081" style={styles.loader} />
            )}
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <FlatList
          data={movies}
          contentContainerStyle={styles.listContent}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard 
              movie={item} 
              onPressAdd={() => handleAddToWatchlist(item)}
              onPressWatch={() => openReviewModal(item)}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <Ionicons name="film-outline" size={60} color="rgba(255,255,255,0.4)" />
                <Text style={styles.emptyText}>
                  {query.length > 0 
                    ? "Nenhum filme encontrado para essa busca." 
                    : "Procure por filmes para adicionar à sua lista!"}
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeAreaOverlay: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#888',
    marginTop: 6,
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 25,
    paddingVertical: 15,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    height: 60,
    borderRadius: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#222',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
  },
  loader: {
    marginLeft: 10,
  },
  clearBtn: {
    marginLeft: 10,
    opacity: 0.6,
  },
  listContent: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 120, // Extra space for the transparent tab bar
  },
  empty: {
    alignItems: 'center',
    marginTop: 120,
  },
  emptyText: {
    color: '#444',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 50,
  }
});