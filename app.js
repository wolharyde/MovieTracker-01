// Movie class
class Movie {
    constructor(id, title, releaseYear, genre, watched = false, rating = null) {
        this.id = id;
        this.title = title;
        this.releaseYear = releaseYear;
        this.genre = genre;
        this.watched = watched;
        this.rating = rating;
    }
}

// MovieTracker class
class MovieTracker {
    constructor() {
        this.movies = JSON.parse(localStorage.getItem('movies')) || [];
        this.currentView = 'all';
        this.init();
    }

    init() {
        this.addEventListeners();
        this.renderMovies();
        this.updateGenreFilter();
    }

    addEventListeners() {
        document.getElementById('add-movie-form').addEventListener('submit', this.addMovie.bind(this));
        document.getElementById('all-movies').addEventListener('click', () => this.setView('all'));
        document.getElementById('watched-movies').addEventListener('click', () => this.setView('watched'));
        document.getElementById('to-watch-movies').addEventListener('click', () => this.setView('to-watch'));
        document.getElementById('search').addEventListener('input', this.renderMovies.bind(this));
        document.getElementById('filter-genre').addEventListener('change', this.renderMovies.bind(this));
        document.getElementById('filter-year').addEventListener('change', this.renderMovies.bind(this));
        document.getElementById('filter-rating').addEventListener('change', this.renderMovies.bind(this));
    }

    addMovie(e) {
        e.preventDefault();
        const title = document.getElementById('title').value;
        const releaseYear = parseInt(document.getElementById('releaseYear').value);
        const genre = document.getElementById('genre').value;
        const id = Date.now().toString();
        const movie = new Movie(id, title, releaseYear, genre);
        this.movies.push(movie);
        this.saveMovies();
        this.renderMovies();
        this.updateGenreFilter();
        e.target.reset();
    }

    setView(view) {
        this.currentView = view;
        this.renderMovies();
    }

    renderMovies() {
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';
        const filteredMovies = this.getFilteredMovies();
        filteredMovies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'movie-item';
            li.innerHTML = `
                <h3>${movie.title} (${movie.releaseYear})</h3>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
                <button onclick="movieTracker.toggleWatched('${movie.id}')">
                    ${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}
                </button>
                ${movie.watched ? `
                    <input type="number" min="1" max="5" value="${movie.rating || ''}" 
                    onchange="movieTracker.updateRating('${movie.id}', this.value)">
                ` : ''}
                <button onclick="movieTracker.removeMovie('${movie.id}')">Remove</button>
            `;
            movieList.appendChild(li);
        });
    }

    getFilteredMovies() {
        let filteredMovies = this.movies;
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const genreFilter = document.getElementById('filter-genre').value;
        const yearFilter = document.getElementById('filter-year').value;
        const ratingFilter = document.getElementById('filter-rating').value;

        if (this.currentView === 'watched') {
            filteredMovies = filteredMovies.filter(movie => movie.watched);
        } else if (this.currentView === 'to-watch') {
            filteredMovies = filteredMovies.filter(movie => !movie.watched);
        }

        return filteredMovies.filter(movie =>
            movie.title.toLowerCase().includes(searchTerm) &&
            (genreFilter === '' || movie.genre === genreFilter) &&
            (yearFilter === '' || movie.releaseYear.toString() === yearFilter) &&
            (ratingFilter === '' || movie.rating === parseInt(ratingFilter))
        );
    }

    toggleWatched(id) {
        const movie = this.movies.find(m => m.id === id);
        if (movie) {
            movie.watched = !movie.watched;
            if (!movie.watched) {
                movie.rating = null;
            }
            this.saveMovies();
            this.renderMovies();
        }
    }

    updateRating(id, rating) {
        const movie = this.movies.find(m => m.id === id);
        if (movie) {
            movie.rating = parseInt(rating);
            this.saveMovies();
            this.renderMovies();
        }
    }

    removeMovie(id) {
        this.movies = this.movies.filter(m => m.id !== id);
        this.saveMovies();
        this.renderMovies();
        this.updateGenreFilter();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    updateGenreFilter() {
        const genreFilter = document.getElementById('filter-genre');
        const genres = [...new Set(this.movies.map(m => m.genre))];
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }
}

const movieTracker = new MovieTracker();