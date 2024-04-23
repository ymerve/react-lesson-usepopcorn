import { useState, useEffect } from "react";

const KEY = "b4feddf8";

export function useMovies(query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    useEffect(function () {
        const controller = new AbortController();
        async function fetchMovies() {
            // callback?.();
            try {
                setIsLoading(true);
                setError("") // reset error
                const res = await fetch(
                    `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error("Somthing went wrong with fetching movies");

                const data = await res.json();
                if (data.Response === "False") throw new Error("Movie not found");

                setMovies(data.Search);
                // setSelectedId(data?.Search[0]?.imdbID)
                setError("");
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.log(err.message);
                    setError(err.message);
                }
            } finally {
                setIsLoading(false);
            }
        }

        if (query.length < 3) {
            setMovies([]);
            setError("") // reset error
            return;
        }
        fetchMovies();

        return () => {
            controller.abort(); // cleanup controller
        }
    }, [query]);
    return { movies, isLoading, error };
}