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

// Event Listeners
addMovieForm.addEventListener('submit', addMovie);
movieList.addEventListener('click', handleMovieAction);
tabs.forEach(tab => tab.addEventListener('click', changeTab));
searchInput.addEventListener('input', filterMovies);
filterGenre.addEventListener('change', filterMovies);
filterYear.addEventListener('change', filterMovies);
filterRating.addEventListener('change', filterMovies);

// Functions
function addMovie(e) {
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
    addMovieForm.reset();
    displayMovies();
    updateFilters();
}

function handleMovieAction(e) {
    const movieId = e.target.closest('.movie-item').dataset.id;
    if (e.target.classList.contains('toggle-watched')) {
        toggleWatched(movieId);
    } else if (e.target.classList.contains('remove-movie')) {
        removeMovie(movieId);
    } else if (e.target.classList.contains('rate-movie')) {
        rateMovie(movieId);
    }
}

function toggleWatched(id) {
    const movie = movies.find(m => m.id === id);
    movie.watched = !movie.watched;
    saveMovies();
    displayMovies();
}

function removeMovie(id) {
    movies = movies.filter(m => m.id !== id);
    saveMovies();
    displayMovies();
    updateFilters();
}

function rateMovie(id) {
    const rating = prompt('Rate this movie (1-5):');
    if (rating && !isNaN(rating) && rating >= 1 && rating <= 5) {
        const movie = movies.find(m => m.id === id);
        movie.rating = parseInt(rating);
        saveMovies();
        displayMovies();
        updateFilters();
    }
}

function changeTab(e) {
    tabs.forEach(tab => tab.classList.remove('active'));
    e.target.classList.add('active');
    displayMovies();
}

function filterMovies() {
    displayMovies();
}

function displayMovies() {
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    const searchTerm = searchInput.value.toLowerCase();
    const genreFilter = filterGenre.value;
    const yearFilter = filterYear.value;
    const ratingFilter = filterRating.value;

    const filteredMovies = movies.filter(movie => {
        const matchesTab = (activeTab === 'all') || 
                           (activeTab === 'watched' && movie.watched) || 
                           (activeTab === 'to-watch' && !movie.watched);
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesGenre = !genreFilter || movie.genre === genreFilter;
        const matchesYear = !yearFilter || movie.releaseYear.toString() === yearFilter;
        const matchesRating = !ratingFilter || (movie.rating && movie.rating.toString() === ratingFilter);

        return matchesTab && matchesSearch && matchesGenre && matchesYear && matchesRating;
    });

    movieList.innerHTML = filteredMovies.map(movie => `
        <li class="movie-item" data-id="${movie.id}">
            <div>
                <h3>${movie.title} (${movie.releaseYear})</h3>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.rating ? `<p>Rating: ${movie.rating}/5</p>` : ''}
            </div>
            <div>
                <button class="toggle-watched">${movie.watched ? 'Mark Unwatched' : 'Mark Watched'}</button>
                ${movie.watched ? `<button class="rate-movie">Rate</button>` : ''}
                <button class="remove-movie">Remove</button>
            </div>
        </li>
    `).join('');
}

function saveMovies() {
    localStorage.setItem('movies', JSON.stringify(movies));
}

function updateFilters() {
    const genres = [...new Set(movies.map(m => m.genre))];
    const years = [...new Set(movies.map(m => m.releaseYear))];
    const ratings = [...new Set(movies.map(m => m.rating).filter(r => r !== null))];

    updateFilterOptions(filterGenre, genres);
    updateFilterOptions(filterYear, years);
    updateFilterOptions(filterRating, ratings);
}

function updateFilterOptions(selectElement, options) {
    const currentValue = selectElement.value;
    selectElement.innerHTML = `<option value="">All ${selectElement.id.split('-')[1]}s</option>`;
    options.forEach(option => {
        selectElement.innerHTML += `<option value="${option}">${option}</option>`;
    });
    selectElement.value = currentValue;
}

// Initial setup
displayMovies();
updateFilters();