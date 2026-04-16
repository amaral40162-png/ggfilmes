const API_KEY = "b7e2935f050f20c89c33e23476136006";

export const searchMovies = async (query: string) => {
    const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}&language=pt-BR`
    );

    const data = await response.json();
    return data.results;
};