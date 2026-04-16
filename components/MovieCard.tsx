import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface MovieCardProps {
  movie: any;
  onPressAdd?: () => void;
  onPressWatch?: () => void;
  isWatched?: boolean;
}

export const MovieCard = ({ movie, onPressAdd, onPressWatch, isWatched }: MovieCardProps) => {
  const imageUrl = movie.poster_path 
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : 'https://via.placeholder.com/500x750?text=Sem+Poster';

  return (
    <View style={styles.card}>
      <ExpoImage
        source={{ uri: imageUrl }}
        style={styles.poster}
        contentFit="cover"
        transition={300}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.9)']}
        style={styles.gradient}
      />
      
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{movie.title}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.rating}>{movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</Text>
          <Text style={styles.year}> • {movie.release_date ? new Date(movie.release_date).getFullYear() : 'S/D'}</Text>
        </View>

        {movie.coupleReview && (
          <View style={styles.coupleReviewRow}>
            <View style={styles.coupleBadge}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.coupleRatingText}>
                {movie.coupleReview.averageRating !== undefined 
                  ? movie.coupleReview.averageRating.toFixed(1) 
                  : ((movie.coupleReview.userRating + movie.coupleReview.partnerRating) / 2).toFixed(1)} / 10
              </Text>
            </View>
            {movie.coupleReview.notes && (
              <Text style={styles.notesPreview} numberOfLines={1}>
                "{movie.coupleReview.notes}"
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          {!isWatched && onPressAdd && (
            <TouchableOpacity style={styles.button} onPress={onPressAdd}>
              <Ionicons name="bookmark-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Quero Ver</Text>
            </TouchableOpacity>
          )}
          {onPressWatch && (
            <TouchableOpacity style={[styles.button, styles.watchButton]} onPress={onPressWatch}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>{isWatched ? "Avaliar" : "Assisti!"}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    height: 240,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    // Sombra mais suave e profunda
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    top: '20%',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800', // Extra bold
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rating: {
    color: '#FFD700',
    marginLeft: 6,
    fontWeight: '700',
    fontSize: 14,
  },
  year: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
  },
  watchButton: {
    backgroundColor: '#ff4081',
    // Efeito de brilho no botão principal
    shadowColor: '#ff4081',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  coupleReviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  coupleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 64, 129, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 5,
  },
  coupleRatingText: {
    color: '#ff4081',
    fontSize: 13,
    fontWeight: '800',
  },
  notesPreview: {
    color: '#ccc',
    fontSize: 13,
    fontStyle: 'italic',
    flex: 1,
    opacity: 0.8,
  },
});
