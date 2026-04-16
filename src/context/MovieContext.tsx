import React, { createContext, useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
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
        });

        return () => {
            unsubscribeWatched();
            unsubscribeWatchlist();
        };
    }, [coupleId]);

    const addMovieToWatchlist = async (movie: any) => {
        if (!coupleId) return;
        try {
            await addDoc(collection(db, "movies"), {
                ...movie,
                coupleId,
                status: "watchlist",
                createdAt: new Date().toISOString()
            });
        } catch (e) {
            console.error("Error adding to watchlist", e);
        }
    };

    const addMovieToWatched = async (movieWithReview: any) => {
        if (!coupleId) return;
        try {
            // Se o filme já tiver um docId (veio da watchlist), atualizamos
            if (movieWithReview.docId) {
                await updateDoc(doc(db, "movies", movieWithReview.docId), {
                    ...movieWithReview,
                    status: "watched",
                    updatedAt: new Date().toISOString()
                });
            } else {
                // Caso contrário, criamos um novo
                await addDoc(collection(db, "movies"), {
                    ...movieWithReview,
                    coupleId,
                    status: "watched",
                    createdAt: new Date().toISOString()
                });
            }
        } catch (e) {
            console.error("Error adding to watched", e);
        }
    };

    const removeMovie = async (docId: string) => {
        if (!docId) return;
        try {
            await deleteDoc(doc(db, "movies", docId));
        } catch (e) {
            console.error("Error removing movie", e);
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