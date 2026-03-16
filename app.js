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
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        this.currentView = e.target.dataset.tab;
        this.renderMovies();
    }

    handleSearch(e) {
        this.renderMovies();
    }

    handleFilter() {
        this.renderMovies();
    }

    renderMovies() {
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';
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
                const li = document.createElement('li');
                li.className = 'movie-item';
                li.innerHTML = `
                    <h3>${movie.title} (${movie.releaseYear})</h3>
                    <p>Genre: ${movie.genre}</p>
                    <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                    ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
                    <button class="toggle-watched">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
                    ${movie.watched ? '<input type="number" class="rating" min="1" max="5" placeholder="Rate 1-5">' : ''}
                    <button class="remove-movie">Remove</button>
                `;
                li.querySelector('.toggle-watched').addEventListener('click', () => this.toggleWatched(movie.id));
                li.querySelector('.remove-movie').addEventListener('click', () => this.removeMovie(movie.id));
                if (movie.watched) {
                    li.querySelector('.rating').addEventListener('change', (e) => this.updateRating(movie.id, e.target.value));
                }
                movieList.appendChild(li);
            });
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
        this.updateGenreFilter();
        this.updateYearFilter();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
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
document.addEventListener('DOMContentLoaded', () => {
    new MovieTracker();
});