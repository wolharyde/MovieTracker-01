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
        this.renderMovies();
        this.setupEventListeners();
    }

    addMovie(title, releaseYear, genre) {
        const id = Date.now().toString();
        const movie = new Movie(id, title, releaseYear, genre);
        this.movies.push(movie);
        this.saveMovies();
        this.renderMovies();
    }

    removeMovie(id) {
        this.movies = this.movies.filter(movie => movie.id !== id);
        this.saveMovies();
        this.renderMovies();
    }

    toggleWatched(id) {
        const movie = this.movies.find(movie => movie.id === id);
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
        const movie = this.movies.find(movie => movie.id === id);
        if (movie && movie.watched) {
            movie.rating = rating;
            this.saveMovies();
            this.renderMovies();
        }
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    renderMovies() {
        const container = document.getElementById('movie-list-container');
        container.innerHTML = '';

        let moviesToRender = this.movies;

        if (this.currentView === 'watched') {
            moviesToRender = this.movies.filter(movie => movie.watched);
        } else if (this.currentView === 'to-watch') {
            moviesToRender = this.movies.filter(movie => !movie.watched);
        }

        moviesToRender.forEach(movie => {
            const movieElement = this.createMovieElement(movie);
            container.appendChild(movieElement);
        });
    }

    createMovieElement(movie) {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-card');
        movieElement.innerHTML = `
            <h3>${movie.title} (${movie.releaseYear})</h3>
            <p>Genre: ${movie.genre}</p>
            <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
            ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
            <button class="toggle-watched" data-id="${movie.id}">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
            ${movie.watched ? `<input type="number" min="1" max="5" value="${movie.rating || ''}" placeholder="Rate 1-5" class="rating-input" data-id="${movie.id}">` : ''}
            <button class="remove-movie" data-id="${movie.id}">Remove</button>
        `;
        return movieElement;
    }

    setupEventListeners() {
        // Add movie form submission
        document.getElementById('add-movie-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('movie-title').value;
            const releaseYear = document.getElementById('release-year').value;
            const genre = document.getElementById('genre').value;
            this.addMovie(title, releaseYear, genre);
            e.target.reset();
        });

        // Movie list container event delegation
        document.getElementById('movie-list-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('toggle-watched')) {
                this.toggleWatched(e.target.dataset.id);
            } else if (e.target.classList.contains('remove-movie')) {
                this.removeMovie(e.target.dataset.id);
            }
        });

        // Rating input event delegation
        document.getElementById('movie-list-container').addEventListener('change', (e) => {
            if (e.target.classList.contains('rating-input')) {
                this.updateRating(e.target.dataset.id, parseInt(e.target.value));
            }
        });

        // View buttons
        document.getElementById('all-movies').addEventListener('click', () => {
            this.currentView = 'all';
            this.renderMovies();
        });
        document.getElementById('watched-movies').addEventListener('click', () => {
            this.currentView = 'watched';
            this.renderMovies();
        });
        document.getElementById('to-watch-movies').addEventListener('click', () => {
            this.currentView = 'to-watch';
            this.renderMovies();
        });
    }
}

// Initialize the app
const movieTracker = new MovieTracker();