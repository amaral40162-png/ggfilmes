import { useContext } from "react";
import { View, Text, FlatList, StyleSheet, SafeAreaView } from "react-native";
import { MovieContext } from "@/src/context/MovieContext";
import { MovieCard } from "@/components/MovieCard";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function Assistidos() {
    const { watched } = useContext(MovieContext);

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />

            <View style={styles.header}>
                <Text style={styles.title}>Vistos por nós 🎬</Text>
                <Text style={styles.subtitle}>{watched.length} histórias compartilhadas</Text>
            </View>

            <FlatList
                data={watched}
                contentContainerStyle={styles.listContent}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <MovieCard
                        movie={item}
                        isWatched={true}
                        onPressWatch={() => {
                            // Futuramente: Abrir modal de edição da nota
                        }}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="videocam-outline" size={60} color="#333" />
                        <Text style={styles.emptyText}>Vocês ainda não marcaram nenhum filme como visto. Tempo de pipoca!</Text>
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