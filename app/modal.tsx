import { useState, useContext } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native";
import { MovieContext } from "@/src/context/MovieContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";

export default function ReviewModal() {
  const { activeMovie, setActiveMovie, watchlist, addMovieToWatched, removeMovie } = useContext(MovieContext);

  const [userRating, setUserRating] = useState(5);
  const [partnerRating, setPartnerRating] = useState(5);
  const [notes, setNotes] = useState("");

  if (!activeMovie) return null;

  const handleSave = async () => {
    try {
      // Tenta encontrar o docId se o filme estiver na watchlist
      const watchlistItem = watchlist.find((m: any) => m.id === activeMovie.id);
      
      const movieWithReview = {
        ...activeMovie,
        docId: watchlistItem?.docId, // Passa o docId se existir para o context decidir se cria ou atualiza
        coupleReview: {
          userRating,
          partnerRating,
          notes,
          date: new Date().toLocaleDateString('pt-BR')
        }
      };

      // Adiciona aos assistidos (o context vai gerenciar o status)
      await addMovieToWatched(movieWithReview);

      // Limpa o filme ativo e volta
      setActiveMovie(null);
      router.back();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    }
  };

  const RatingStars = ({ rating, onRatingChange, label }: any) => (
    <View style={styles.ratingSection}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onRatingChange(star)}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#FFD700" : "#444"}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Avaliação do Casal</Text>
        </View>

        <View style={styles.movieHeader}>
          <ExpoImage
            source={{ uri: `https://image.tmdb.org/t/p/w500${activeMovie.poster_path}` }}
            style={styles.miniPoster}
          />
          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{activeMovie.title}</Text>
            <Text style={styles.movieYear}>{activeMovie.release_date ? new Date(activeMovie.release_date).getFullYear() : 'S/D'}</Text>
          </View>
        </View>

        <RatingStars
          label="Sua Nota (Ele)"
          rating={userRating}
          onRatingChange={setUserRating}
        />

        <RatingStars
          label="Nota Dela (Geovanna)"
          rating={partnerRating}
          onRatingChange={setPartnerRating}
        />

        <View style={styles.inputSection}>
          <Text style={styles.label}>O que acharam do filme?</Text>
          <TextInput
            placeholder="Escreva algo sobre o filme..."
            placeholderTextColor="#666"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
            style={styles.textInput}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Salvar na Biblioteca</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scroll: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  movieHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 16,
    marginBottom: 30,
    alignItems: 'center',
  },
  miniPoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
  },
  movieInfo: {
    marginLeft: 15,
    flex: 1,
  },
  movieTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  movieYear: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
  },
  ratingSection: {
    marginBottom: 30,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  inputSection: {
    marginBottom: 40,
  },
  textInput: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 15,
    color: '#fff',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  saveBtn: {
    backgroundColor: '#ff4081',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
