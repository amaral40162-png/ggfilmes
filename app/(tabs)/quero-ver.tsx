import { useContext } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { MovieContext } from "@/src/context/MovieContext";
import { MovieCard } from "@/components/MovieCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { router } from "expo-router";

export default function QueroVer() {
    const { watchlist, setActiveMovie } = useContext(MovieContext);

    const openReviewModal = (movie: any) => {
        setActiveMovie(movie);
        router.push("/modal");
    };

    return (
    <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />
        
        <View style={styles.header}>
            <Text style={styles.title}>Quero Assistir 🍿</Text>
            <Text style={styles.subtitle}>{watchlist.length} filmes na fila</Text>
        </View>

        <FlatList
            data={watchlist}
            contentContainerStyle={styles.listContent}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
                <MovieCard 
                    movie={item} 
                    onPressWatch={() => openReviewModal(item)}
                />
            )}
            ListEmptyComponent={
                <View style={styles.empty}>
                    <Ionicons name="bookmark-outline" size={60} color="#333" />
                    <Text style={styles.emptyText}>Sua lista está vazia. Adicione filmes na aba de busca!</Text>
                </View>
            }
        />
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
    header: {
        paddingHorizontal: 25,
        paddingTop: 60,
        paddingBottom: 20,
    },
    title: {
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
    listContent: {
        paddingHorizontal: 25,
        paddingTop: 10,
        paddingBottom: 120,
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