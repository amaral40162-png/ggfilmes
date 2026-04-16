import React, { createContext, useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Alert } from "react-native";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";

export const MovieContext = createContext<any>(null);

export function MovieProvider({ children }: any) {
    const { coupleId } = useAuth();
    const [watched, setWatched] = useState<any[]>([]);
    const [watchlist, setWatchlist] = useState<any[]>([]);
    const [activeMovie, setActiveMovie] = useState<any>(null);

    useEffect(() => {
        if (!coupleId) {
            setWatched([]);
            setWatchlist([]);
            return;
        }

        // Listener para filmes assistidos
        const qWatched = query(
            collection(db, "movies"), 
            where("coupleId", "==", coupleId),
            where("status", "==", "watched")
        );
        
        const unsubscribeWatched = onSnapshot(qWatched, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            setWatched(data);
        }, (error) => {
            console.error("Erro no listener de assistidos:", error);
            // Não alertamos aqui para não saturar o usuário com popups de permissão 
            // no carregamento inicial, mas o log ajudará se precisarmos.
        });

        // Listener para lista de desejos
        const qWatchlist = query(
            collection(db, "movies"), 
            where("coupleId", "==", coupleId),
            where("status", "==", "watchlist")
        );

        const unsubscribeWatchlist = onSnapshot(qWatchlist, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            setWatchlist(data);
        }, (error) => {
            console.error("Erro no listener de desejos:", error);
        });

        return () => {
            unsubscribeWatched();
            unsubscribeWatchlist();
        };
    }, [coupleId]);

    const addMovieToWatchlist = async (movie: any) => {
        if (!coupleId) {
            Alert.alert("Erro", "Você precisa estar logado e vinculado para salvar filmes.");
            return;
        }
        try {
            await addDoc(collection(db, "movies"), {
                ...movie,
                coupleId,
                status: "watchlist",
                createdAt: new Date().toISOString()
            });
            Alert.alert("Sucesso", "Adicionado à lista de desejos!");
        } catch (e: any) {
            console.error("Error adding to watchlist", e);
            Alert.alert("Erro ao Salvar", `O Firebase respondeu: ${e.message}`);
        }
    };

    const addMovieToWatched = async (movieWithReview: any) => {
        if (!coupleId) {
            Alert.alert("Erro", "Você precisa estar logado para salvar avaliações.");
            return;
        }
        try {
            if (movieWithReview.docId) {
                await updateDoc(doc(db, "movies", movieWithReview.docId), {
                    ...movieWithReview,
                    status: "watched",
                    updatedAt: new Date().toISOString()
                });
            } else {
                await addDoc(collection(db, "movies"), {
                    ...movieWithReview,
                    coupleId,
                    status: "watched",
                    createdAt: new Date().toISOString()
                });
            }
            Alert.alert("Sucesso", "Filme avaliado e salvo na biblioteca!");
        } catch (e: any) {
            console.error("Error adding to watched", e);
            Alert.alert("Erro ao Salvar", `O Firebase respondeu: ${e.message}`);
        }
    };

    const removeMovie = async (docId: string) => {
        if (!docId) return;
        try {
            await deleteDoc(doc(db, "movies", docId));
        } catch (e: any) {
            console.error("Error removing movie", e);
            Alert.alert("Erro ao Remover", e.message);
        }
    };

    return (
        <MovieContext.Provider
            value={{ 
                watched, 
                addMovieToWatched, 
                watchlist, 
                addMovieToWatchlist, 
                removeMovie,
                activeMovie, 
                setActiveMovie 
            }}
        >
            {children}
        </MovieContext.Provider>
    );
}