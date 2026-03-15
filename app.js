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
        this.updateYearFilter();
    }

    addEventListeners() {
        document.getElementById('add-movie-form').addEventListener('submit', this.handleAddMovie.bind(this));
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', this.handleTabClick.bind(this));
        });
        document.getElementById('search').addEventListener('input', this.handleSearch.bind(this));
        document.getElementById('filter-genre').addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('filter-year').addEventListener('change', this.handleFilter.bind(this));
        document.getElementById('filter-rating').addEventListener('change', this.handleFilter.bind(this));
    }

    handleAddMovie(e) {
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
        this.updateYearFilter();
        e.target.reset();
    }

    handleTabClick(e) {
        this.currentView = e.target.dataset.tab;
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        this.renderMovies();
    }

    handleSearch(e) {
        this.renderMovies();
    }

    handleFilter() {
        this.renderMovies();
    }

    toggleWatched(id) {
        const movie = this.movies.find(m => m.id === id);
        movie.watched = !movie.watched;
        if (!movie.watched) movie.rating = null;
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
        this.updateGenreFilter();
        this.updateYearFilter();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    renderMovies() {
        const movieList = document.getElementById('movie-list');
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const genreFilter = document.getElementById('filter-genre').value;
        const yearFilter = document.getElementById('filter-year').value;
        const ratingFilter = document.getElementById('filter-rating').value;

        let filteredMovies = this.movies.filter(movie => {
            return (
                (this.currentView === 'all' ||
                (this.currentView === 'watched' && movie.watched) ||
                (this.currentView === 'to-watch' && !movie.watched)) &&
                movie.title.toLowerCase().includes(searchTerm) &&
                (genreFilter === '' || movie.genre === genreFilter) &&
                (yearFilter === '' || movie.releaseYear.toString() === yearFilter) &&
                (ratingFilter === '' || (movie.rating && movie.rating.toString() === ratingFilter))
            );
        });

        movieList.innerHTML = filteredMovies.map(movie => `
            <li class="movie-item">
                <h3>${movie.title} (${movie.releaseYear})</h3>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.watched ? `
                    <label>
                        Rating: 
                        <select class="rating" data-id="${movie.id}">
                            ${[1, 2, 3, 4, 5].map(r => `
                                <option value="${r}" ${movie.rating === r ? 'selected' : ''}>${r}</option>
                            `).join('')}
                        </select>
                    </label>
                ` : ''}
                <button class="toggle-watched" data-id="${movie.id}">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
                <button class="remove-movie" data-id="${movie.id}">Remove</button>
            </li>
        `).join('');

        movieList.querySelectorAll('.toggle-watched').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleWatched(e.target.dataset.id));
        });

        movieList.querySelectorAll('.rating').forEach(select => {
            select.addEventListener('change', (e) => this.updateRating(e.target.dataset.id, e.target.value));
        });

        movieList.querySelectorAll('.remove-movie').forEach(btn => {
            btn.addEventListener('click', (e) => this.removeMovie(e.target.dataset.id));
        });
    }

    updateGenreFilter() {
        const genreFilter = document.getElementById('filter-genre');
        const genres = [...new Set(this.movies.map(m => m.genre))];
        genreFilter.innerHTML = '<option value="">All Genres</option>' + 
            genres.map(genre => `<option value="${genre}">${genre}</option>`).join('');
    }

    updateYearFilter() {
        const yearFilter = document.getElementById('filter-year');
        const years = [...new Set(this.movies.map(m => m.releaseYear))].sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="">All Years</option>' + 
            years.map(year => `<option value="${year}">${year}</option>`).join('');
    }
}

// Initialize the app
const movieTracker = new MovieTracker();