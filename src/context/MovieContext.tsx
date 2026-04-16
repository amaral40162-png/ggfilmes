import React, { createContext, useState, useEffect } from "react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from "firebase/firestore";
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

    const addToWatchlist = async (movie: any) => {
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

    const addToWatched = async (movieWithReview: any) => {
        if (!coupleId) return;
        try {
            // Se o filme já estiver na watchlist, deletamos o antigo e criamos o novo "assistido"
            // Ou atualizamos se já tiver um docId
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
        } catch (e) {
            console.error("Error adding to watched", e);
        }
    };

    const removeFromWatchlist = async (docId: string) => {
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
                setWatched: addToWatched, 
                watchlist, 
                setWatchlist: addToWatchlist, 
                removeFromWatchlist,
                activeMovie, 
                setActiveMovie 
            }}
        >
            {children}
        </MovieContext.Provider>
    );
}