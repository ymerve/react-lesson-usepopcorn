import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating"
import { useMovies } from "./useMovies";

const average = (arr) =>
	arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = "b4feddf8";

export default function App() {
	const [query, setQuery] = useState("");
	const [selectedId, setSelectedId] = useState(null);

	const [watched, setWatched] = useState(function () {
		const storagedValue = localStorage.getItem("watched");
		return JSON.parse(storagedValue);
	});

	const handleSelectMove = (id) => {
		setSelectedId((prevId) => (id === prevId ? null : id));
	}

	const handleCloseMovie = () => {
		setSelectedId(null);
	}

	const handleAddWatched = (movie) => {
		setWatched((watched) => [...watched, movie]);
	}

	const handleDeleteWatched = (id) => {
		setWatched((watched) => watched.filter(movie => movie.imdbID !== id));
	}

	useEffect(function () {
		localStorage.setItem("watched", JSON.stringify(watched));
	}, [watched]);

	const { movies, isLoading, error } = useMovies(query);

	return (
		<>
			<Navbar>
				<Search query={query} setQuery={setQuery} />
				<NumResults movies={movies} />
			</Navbar>
			<Main>
				<Box>
					{isLoading && <Loader />}
					{!isLoading && !error && <MovieList movies={movies} onSelectMovie={handleSelectMove} />}
					{error && <ErrorMessage message={error} />}
				</Box>
				<Box>
					{selectedId ? (
						<MovieDetails
							selectedId={selectedId}
							onCloseMovie={handleCloseMovie}
							onAddWatched={handleAddWatched}
							watchedMovies={watched}
						/>
					) : (
						<>
							<WatchedSummary watched={watched} />
							<WatchedMoviesList watched={watched} onDeleteWatched={handleDeleteWatched} />
						</>
					)
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
	const inputEl = useRef(null);

	useEffect(function () {
		// console.log(inputEl.current, "input el");
		// inputEl.current.focus();
		function callback(e) {
			if (document.activeElement == inputEl) return;
			if (e.code === "Enter") {
				inputEl.current.focus();
				setQuery("");
			}
		}
		document.addEventListener("keydown", callback);
		return () => document.addEventListener("keydown", callback);
	}, [setQuery]);

	// useEffect(function () {
	// 	const el = document.querySelector('.search');
	// 	console.log(el)
	// 	el.focus();
	// }, [])

	return (
		<input
			className="search"
			type="text"
			placeholder="Search movies..."
			value={query}
			onChange={(e) => setQuery(e.target.value)}
			ref={inputEl}
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
function WatchedMoviesList({ watched, onDeleteWatched }) {
	return (
		<ul className="list">
			{watched.map((movie, i) => (
				<WatchedMovie key={movie.imdbID} movie={movie} onDeleteWatched={onDeleteWatched} />
			))}
		</ul>
	);
}

function WatchedMovie({ movie, onDeleteWatched }) {
	return (
		<li key={movie.imdbID}>
			<img src={movie.poster} alt={`${movie.title} poster`} />
			<h3>{movie.title}</h3>
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
				<button onClick={() => {
					onDeleteWatched(movie.imdbID)
				}} className="btn-delete">X</button>
			</div>
		</li>
	);
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watchedMovies }) {
	const [movie, setMovies] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const [userRating, setUserRating] = useState("");

	const countRef = useRef(0);

	useEffect(function () {
		if (userRating) countRef.current++;
	}, [userRating]);

	const isWatched = watchedMovies.map((movie) => movie.imdbID).includes(selectedId);
	const watchedUserRating = watchedMovies.find(movie => movie.imdbID === selectedId)?.userRating;

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
		Genre: genre,
	} = movie;

	// const [isTop, setIsTop] = useState(imdbRating > 8);  // initial state forever false
	// console.log(isTop)
	// useEffect(function () {
	// 	setIsTop(imdbRating > 8);
	// }, [imdbRating]);

	const isTop = imdbRating > 8;

	const [avgRating, setAvgRating] = useState(0);

	const handleAdd = () => {
		const newWatchedMovie = {
			imdbID: selectedId,
			title,
			year,
			poster,
			imdbRating: Number(imdbRating),
			runtime: Number(runtime.split(" ").at(0)),
			userRating,
			countRatingDecisions: countRef.current,
		}


		onAddWatched(newWatchedMovie);
		onCloseMovie();
		// setAvgRating(Number(imdbRating));
		// setAvgRating((avgRating) => (avgRating + userRating) / 2);
	}

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

	useEffect(function () {
		const callback = (e) => {
			if (e.code === "Escape") {
				onCloseMovie();
				console.log("CLOSING");
			}
		}
		document.addEventListener("keydown", callback);
		return () => {
			document.removeEventListener("keydown", callback); // clean up yapmazsak her escape de yeniden cagirilir callback.
		}
	}, [onCloseMovie]);

	useEffect(function () {
		if (!title) return;
		document.title = `Movie | ${title}`;
		return () => {
			document.title = "usePopcorn"; // cleanup useEffect
			console.log(`Clean up effect for movie ${title}`);
		}
	}, [title]);

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

					<p>{avgRating}</p>

					<section>
						<div className="rating">
							{!isWatched ?
								<>
									<StarRating maxRating={10} size={24} onSetRating={setUserRating} />
									{userRating > 0 &&
										<button className="btn-add" onClick={handleAdd}>++Add to List</button>
									}
								</>
								:
								<p> You rated with movie <span>⭐️ {watchedUserRating}</span></p>
							}
						</div>
						<p>
							<em>{plot}</em>
						</p>
						<p>Staring {actors}</p>
						<p>Directed by {director}</p>
					</section>
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
					<span>{avgImdbRating.toFixed(2)}</span>
				</p>
				<p>
					<span>🌟</span>
					<span>{avgUserRating.toFixed(2)}</span>
				</p>
				<p>
					<span>⏳</span>
					<span>{avgRuntime.toFixed(2)} min</span>
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