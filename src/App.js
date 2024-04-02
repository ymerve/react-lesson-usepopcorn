import { useEffect, useState } from "react";
import StarRating from "./StarRating"

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "b4feddf8";

export default function App() {
	const [query, setQuery] = useState("inception");
	const [movies, setMovies] = useState([]);
	const [watched, setWatched] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [selectedId, setSelectedId] = useState(null);
	const tempQuery = "interstellar";

	const handleSelectMove = (id) => {
		setSelectedId((prevId) => (id === prevId ? null : id)); // aynisi secilir ise toggle butonu gibi calis ve kapat.
	}

	const handleCloseMovie = () => {
		setSelectedId(null);
	}

	useEffect(function () {
		async function fetchMovies() {
			try {
				setIsLoading(true);
				setError("") // reset error
				const res = await fetch(
					`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`
				);

				if (!res.ok) throw new Error("Somthing went wrong with fetching movies");

				const data = await res.json();
				if (data.Response === "False") throw new Error("Movie not found");

				setMovies(data.Search);
				setSelectedId(data?.Search[0]?.imdbID)
				// console.log(data) // double output beacuse of strict mode because safer
			} catch (err) {
				console.log(err.message);
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		}

		if (query.length < 3) {
			setMovies([]);
			setError("") // reset error
			return;
		}

		fetchMovies()
	}, [query]);

	return (
		<>
			<Navbar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</Navbar>
			<Main>
				<Box>
					{/* {isLoading ? <Loader />
						:
						<MovieList movies={movies} />
					} */}
					{isLoading && <Loader />}
					{!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMove} />}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ?
						<MovieDetails selectedId={selectedId} onCloseMovie={handleCloseMovie} /> :
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList watched={watched} />
						</>
					}
				</Box>

			</Main>
		</>
	);
}

function Loader() {
	return <p className="loader">Loading..... :)</p>
}

function ErrorMessage({ message }) {
	return (
		<p className="error">
			<span>⛔️</span>{message}
		</p>
	)
}

function Navbar({ children }) {
	return (
		<nav className="nav-bar">
			<Logo />
			{children}</nav>
	)
}
function Logo() {
	return (
		<div className="logo">
			<span role="img">🍿</span>
			<h1>usePopcorn</h1>
		</div>
	);
}

function NumResults({ movies }) {
	return (
		<p className="num-results">
			Found <strong>{movies.length}</strong> results
		</p>
	);
}
function Search({ query, setQuery }) {
	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
		/>
	);
}

function Main({ children }) {
	return (
		<main className="main">
			{children}
		</main>
	);
}
function WatchedMoviesList({ watched }) {
	return (
		<ul className="list">
			{watched.map((movie, i) => (
				<WatchedMovie key={i} movie={movie} />
			))}
		</ul>
	);
}

function WatchedMovie({ movie }) {
	return (
		<li key={movie.imdbID}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>⭐️</span>
					<span>{movie.imdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{movie.userRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{movie.runtime} min</span>
				</p>
			</div>
		</li>
	);
}

function MovieDetails({ selectedId, onCloseMovie }) {
	const [movie, setMovies] = useState({});
	const [isLoading, setIsLoading] = useState(false);

	const {
		Title: title,
		Year: year,
		Poster: poster,
		Runtime: runtime,
		imdbRating,
		Plot: plot,
		Released: released,
		Actors: actors,
		Director: director,
		Genre: genre
	} = movie;

	useEffect(function () {
		async function getMovieDetails() {
			setIsLoading(true);
			const res = await fetch(
				`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
			);
			const data = await res.json();
			setMovies(data);
			setIsLoading(false);
		}
		getMovieDetails();
	}, [selectedId]);
	// NOTE : selectedId guncellendikce render et.

	return (
		<div className="details">
			{isLoading ?
				<Loader />
				:
				<>
					<header>
						<button className="btn-back" onClick={onCloseMovie}>&larr;</button>
						<img src={poster} alt={`Poster of ${movie}`} />
						<div className="details-overview">
							<h2>{title}</h2>
							<p>{released} &bull; {runtime}</p>
							<p>{genre}</p>
							<p>
								<span>⭐️</span>
								{imdbRating} IMDb Raiting
							</p>
						</div>
					</header>
					<section>
						<div className="rating">
							<StarRating maxRating={10} size={24} />
						</div>

						<p>
							<em>{plot}</em>
						</p>
						<p>Staring {actors}</p>
						<p>Directed by {director}</p>
					</section>
					{selectedId}
				</>
			}

		</div>
	);
}

function WatchedSummary({ watched }) {
	const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
	const avgUserRating = average(watched.map((movie) => movie.userRating));
	const avgRuntime = average(watched.map((movie) => movie.runtime));

	return (
		<div className="summary">
			<h2>Movies you watched</h2>
			<div>
				<p>
					<span>#️⃣</span>
					<span>{watched.length} movies</span>
				</p>
				<p>
					<span>⭐️</span>
					<span>{avgImdbRating}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime} min</span>
				</p>
			</div>
		</div>
	);
}

function Box({ children }) {
	const [isOpen, setIsOpen] = useState(true);
	return (
		<div className="box">
			<button
				className="btn-toggle"
				onClick={() => setIsOpen((open) => !open)}
			>
				{isOpen ? "–" : "+"}
			</button>
			{isOpen && children}
		</div>
	);
}
function MovieList({ movies, onSelectMovie }) {
	return (
		<ul className="list list-movies">
			{movies?.map((movie, i) => <Movie key={i} movie={movie} onSelectMovie={onSelectMovie} />)}
		</ul>
	);
}

function Movie({ movie, onSelectMovie }) {
	return (
		<li key={movie.imdbID} onClick={() => { onSelectMovie(movie.imdbID) }}>
			<img src={movie.Poster} alt={`${movie.Title} poster`} />
			<h3>{movie.Title}</h3>
			<div>
				<p>
					<span>🗓</span>
					<span>{movie.Year}</span>
				</p>
			</div>
		</li>
	)
}