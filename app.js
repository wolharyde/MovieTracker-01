// DOM Elements
const addMovieForm = document.getElementById('add-movie-form');
const movieList = document.getElementById('movie-list');
const tabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('search');
const filterGenre = document.getElementById('filter-genre');
const filterYear = document.getElementById('filter-year');
const filterRating = document.getElementById('filter-rating');

// Movie array
let movies = JSON.parse(localStorage.getItem('movies')) || [];

// Add movie
addMovieForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const releaseYear = document.getElementById('releaseYear').value;
    const genre = document.getElementById('genre').value;

    const movie = {
        id: Date.now().toString(),
        title,
        releaseYear: parseInt(releaseYear),
        genre,
        watched: false,
        rating: null
    };

    movies.push(movie);
    saveMovies();
    renderMovies();
    addMovieForm.reset();
});

// Save movies to localStorage
function saveMovies() {
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Render movies
function renderMovies(filteredMovies = movies) {
    movieList.innerHTML = '';
    filteredMovies.forEach(movie => {
        const li = document.createElement('li');
        li.className = 'movie-item';
        li.innerHTML = `
            <div>
                <h3>${movie.title} (${movie.releaseYear})</h3>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.watched ? `<p>Rating: ${movie.rating}/5</p>` : ''}
            </div>
            <div>
                <button onclick="toggleWatched('${movie.id}')">${movie.watched ? 'Mark Unwatched' : 'Mark Watched'}</button>
                ${movie.watched ? `<input type="number" min="1" max="5" value="${movie.rating || ''}" onchange="updateRating('${movie.id}', this.value)">` : ''}
                <button onclick="removeMovie('${movie.id}')">Remove</button>
            </div>
        `;
        movieList.appendChild(li);
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
    movie.rating = parseInt(rating);
    saveMovies();
    renderMovies();
}

// Remove movie
function removeMovie(id) {
    movies = movies.filter(m => m.id !== id);
    saveMovies();
    renderMovies();
}

// Tab functionality
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        let filteredMovies = movies;
        if (tabName === 'watched') {
            filteredMovies = movies.filter(m => m.watched);
        } else if (tabName === 'to-watch') {
            filteredMovies = movies.filter(m => !m.watched);
        }
        renderMovies(filteredMovies);
    });
});

// Search and filter functionality
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const genreFilter = filterGenre.value;
    const yearFilter = filterYear.value;
    const ratingFilter = filterRating.value;

    const filteredMovies = movies.filter(movie => {
        return movie.title.toLowerCase().includes(searchTerm) &&
               (genreFilter === '' || movie.genre === genreFilter) &&
               (yearFilter === '' || movie.releaseYear.toString() === yearFilter) &&
               (ratingFilter === '' || (movie.rating && movie.rating.toString() === ratingFilter));
    });

    renderMovies(filteredMovies);
}

searchInput.addEventListener('input', applyFilters);
filterGenre.addEventListener('change', applyFilters);
filterYear.addEventListener('change', applyFilters);
filterRating.addEventListener('change', applyFilters);

// Initial render
renderMovies();

// Populate filter options
function populateFilterOptions() {
    const genres = [...new Set(movies.map(m => m.genre))];
    const years = [...new Set(movies.map(m => m.releaseYear))];
    const ratings = [1, 2, 3, 4, 5];

    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre;
        option.textContent = genre;
        filterGenre.appendChild(option);
    });

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        filterYear.appendChild(option);
    });

    ratings.forEach(rating => {
        const option = document.createElement('option');
        option.value = rating;
        option.textContent = rating;
        filterRating.appendChild(option);
    });
}

populateFilterOptions();