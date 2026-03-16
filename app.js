// Movie class
class Movie {
    constructor(title, releaseYear, genre) {
        this.id = Date.now().toString();
        this.title = title;
        this.releaseYear = releaseYear;
        this.genre = genre;
        this.watched = false;
        this.rating = null;
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
        const releaseYear = document.getElementById('releaseYear').value;
        const genre = document.getElementById('genre').value;
        const movie = new Movie(title, releaseYear, genre);
        this.movies.push(movie);
        this.saveMovies();
        this.renderMovies();
        this.updateGenreFilter();
        this.updateYearFilter();
        e.target.reset();
    }

    changeView(e) {
        this.currentView = e.target.dataset.tab;
        document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        this.renderMovies();
    }

    renderMovies() {
        const movieList = document.getElementById('movie-list');
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const genreFilter = document.getElementById('filter-genre').value;
        const yearFilter = document.getElementById('filter-year').value;
        const ratingFilter = document.getElementById('filter-rating').value;

        const filteredMovies = this.movies.filter(movie => {
            const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
            const matchesGenre = genreFilter === '' || movie.genre === genreFilter;
            const matchesYear = yearFilter === '' || movie.releaseYear.toString() === yearFilter;
            const matchesRating = ratingFilter === '' || (movie.rating && movie.rating.toString() === ratingFilter);
            const matchesView = this.currentView === 'all' || 
                                (this.currentView === 'watched' && movie.watched) || 
                                (this.currentView === 'to-watch' && !movie.watched);
            return matchesSearch && matchesGenre && matchesYear && matchesRating && matchesView;
        });

        movieList.innerHTML = filteredMovies.map(movie => `
            <li class="movie-item">
                <h3>${movie.title}</h3>
                <p>Release Year: ${movie.releaseYear}</p>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
                <button onclick="movieTracker.toggleWatched('${movie.id}')">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
                ${movie.watched ? `<input type="number" min="1" max="5" value="${movie.rating || ''}" onchange="movieTracker.updateRating('${movie.id}', this.value)" placeholder="Rate 1-5">` : ''}
                <button onclick="movieTracker.removeMovie('${movie.id}')">Remove</button>
            </li>
        `).join('');
    }

    toggleWatched(id) {
        const movie = this.movies.find(m => m.id === id);
        if (movie) {
            movie.watched = !movie.watched;
            if (!movie.watched) movie.rating = null;
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

const movieTracker = new MovieTracker();