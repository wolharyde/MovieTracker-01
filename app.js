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
        this.updateFilterOptions();
    }

    addEventListeners() {
        document.getElementById('add-movie-form').addEventListener('submit', this.addMovie.bind(this));
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', this.changeView.bind(this));
        });
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
        this.updateFilterOptions();
        e.target.reset();
    }

    changeView(e) {
        this.currentView = e.target.dataset.tab;
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        this.renderMovies();
    }

    renderMovies() {
        const container = document.getElementById('movie-container');
        container.innerHTML = '';
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const genreFilter = document.getElementById('filter-genre').value;
        const yearFilter = document.getElementById('filter-year').value;
        const ratingFilter = document.getElementById('filter-rating').value;

        this.movies
            .filter(movie => {
                const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
                const matchesGenre = !genreFilter || movie.genre === genreFilter;
                const matchesYear = !yearFilter || movie.releaseYear.toString() === yearFilter;
                const matchesRating = !ratingFilter || (movie.rating && movie.rating.toString() === ratingFilter);
                const matchesView = this.currentView === 'all' || 
                                    (this.currentView === 'watched' && movie.watched) || 
                                    (this.currentView === 'to-watch' && !movie.watched);
                return matchesSearch && matchesGenre && matchesYear && matchesRating && matchesView;
            })
            .forEach(movie => {
                const movieElement = this.createMovieElement(movie);
                container.appendChild(movieElement);
            });
    }

    createMovieElement(movie) {
        const movieElement = document.createElement('div');
        movieElement.classList.add('movie-card');
        movieElement.innerHTML = `
            <h3>${movie.title}</h3>
            <p>Year: ${movie.releaseYear}</p>
            <p>Genre: ${movie.genre}</p>
            <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
            ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
            <button class="toggle-watched">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
            ${movie.watched ? `<input type="number" class="rating" min="1" max="5" value="${movie.rating || ''}" placeholder="Rate 1-5">` : ''}
            <button class="remove-movie">Remove</button>
        `;

        movieElement.querySelector('.toggle-watched').addEventListener('click', () => this.toggleWatched(movie.id));
        movieElement.querySelector('.remove-movie').addEventListener('click', () => this.removeMovie(movie.id));
        if (movie.watched) {
            movieElement.querySelector('.rating').addEventListener('change', (e) => this.updateRating(movie.id, e.target.value));
        }

        return movieElement;
    }

    toggleWatched(id) {
        const movie = this.movies.find(m => m.id === id);
        movie.watched = !movie.watched;
        if (!movie.watched) {
            movie.rating = null;
        }
        this.saveMovies();
        this.renderMovies();
    }

    updateRating(id, rating) {
        const movie = this.movies.find(m => m.id === id);
        movie.rating = parseInt(rating);
        this.saveMovies();
        this.renderMovies();
    }

    removeMovie(id) {
        this.movies = this.movies.filter(m => m.id !== id);
        this.saveMovies();
        this.renderMovies();
        this.updateFilterOptions();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    updateFilterOptions() {
        const genres = [...new Set(this.movies.map(m => m.genre))];
        const years = [...new Set(this.movies.map(m => m.releaseYear))];
        const ratings = [...new Set(this.movies.map(m => m.rating).filter(r => r !== null))];

        this.updateSelectOptions('filter-genre', genres);
        this.updateSelectOptions('filter-year', years);
        this.updateSelectOptions('filter-rating', ratings);
    }

    updateSelectOptions(selectId, options) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        select.innerHTML = `<option value="">All ${selectId.split('-')[1].charAt(0).toUpperCase() + selectId.split('-')[1].slice(1)}s</option>`;
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        select.value = currentValue;
    }
}

// Initialize the app
const movieTracker = new MovieTracker();