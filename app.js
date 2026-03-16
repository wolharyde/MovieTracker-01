// DOM Elements
const addMovieForm = document.getElementById('add-movie-form');
const movieList = document.getElementById('movie-list');
const allMoviesBtn = document.getElementById('all-movies');
const watchedMoviesBtn = document.getElementById('watched-movies');
const toWatchMoviesBtn = document.getElementById('to-watch-movies');
const searchInput = document.getElementById('search');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterRating = document.getElementById('filter-rating');

// Movie array
let movies = JSON.parse(localStorage.getItem('movies')) || [];

// Add movie
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('movie-title').value;
    const releaseYear = document.getElementById('release-year').value;
    const genre = document.getElementById('genre').value;

    const movie = {
        id: Date.now().toString(),
        title,
        releaseYear: Number(releaseYear),
        genre,
        watched: false,
        rating: null
    };

    movies.push(movie);
    saveMovies();
    renderMovies();
    addMovieForm.reset();
});

// Render movies
function renderMovies(filteredMovies = movies) {
    movieList.innerHTML = '';
    filteredMovies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        movieCard.innerHTML = `
            <h3>${movie.title}</h3>
            <p>Year: ${movie.releaseYear}</p>
            <p>Genre: ${movie.genre}</p>
            <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
            ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
            <button onclick="toggleWatched('${movie.id}')">${movie.watched ? 'Mark Unwatched' : 'Mark Watched'}</button>
            ${movie.watched ? `<input type="number" min="1" max="5" value="${movie.rating || ''}" onchange="updateRating('${movie.id}', this.value)" placeholder="Rate 1-5">` : ''}
            <button onclick="removeMovie('${movie.id}')">Remove</button>
        `;
        movieList.appendChild(movieCard);
    });
}

// Toggle watched status
function toggleWatched(id) {
    const movie = movies.find(m => m.id === id);
    movie.watched = !movie.watched;
    if (!movie.watched) movie.rating = null;
    saveMovies();
    renderMovies();
}

// Update rating
function updateRating(id, rating) {
    const movie = movies.find(m => m.id === id);
    movie.rating = Number(rating);
    saveMovies();
    renderMovies();
}

// Remove movie
function removeMovie(id) {
    movies = movies.filter(m => m.id !== id);
    saveMovies();
    renderMovies();
}

// Save movies to localStorage
function saveMovies() {
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Filter movies
function filterMovies() {
    const searchTerm = searchInput.value.toLowerCase();
    const genreFilter = filterGenre.value.toLowerCase();
    const yearFilter = filterYear.value;
    const ratingFilter = filterRating.value;

    return movies.filter(movie => {
        return movie.title.toLowerCase().includes(searchTerm) &&
               (genreFilter === '' || movie.genre.toLowerCase() === genreFilter) &&
               (yearFilter === '' || movie.releaseYear === Number(yearFilter)) &&
               (ratingFilter === '' || movie.rating === Number(ratingFilter));
    });
}

// Event listeners for filters
searchInput.addEventListener('input', () => renderMovies(filterMovies()));
filterGenre.addEventListener('change', () => renderMovies(filterMovies()));
filterYear.addEventListener('input', () => renderMovies(filterMovies()));
filterRating.addEventListener('input', () => renderMovies(filterMovies()));

// Event listeners for list views
allMoviesBtn.addEventListener('click', () => renderMovies());
watchedMoviesBtn.addEventListener('click', () => renderMovies(movies.filter(m => m.watched)));
toWatchMoviesBtn.addEventListener('click', () => renderMovies(movies.filter(m => !m.watched)));

// Initial render
renderMovies();