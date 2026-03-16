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
        movieList.innerHTML = '';
        let filteredMovies = this.filterMovies();
        filteredMovies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'movie-item';
            li.innerHTML = `
                <div>
                    <h3>${movie.title} (${movie.releaseYear})</h3>
                    <p>Genre: ${movie.genre}</p>
                    <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                    ${movie.watched ? `<p>Rating: ${movie.rating || 'Not rated'}</p>` : ''}
                </div>
                <div>
                    <button onclick="movieTracker.toggleWatched('${movie.id}')">${movie.watched ? 'Mark Unwatched' : 'Mark Watched'}</button>
                    ${movie.watched ? `<input type="number" min="1" max="5" value="${movie.rating || ''}" onchange="movieTracker.updateRating('${movie.id}', this.value)" placeholder="Rate 1-5">` : ''}
                    <button onclick="movieTracker.removeMovie('${movie.id}')">Remove</button>
                </div>
            `;
            movieList.appendChild(li);
        });
    }

    filterMovies() {
        let filteredMovies = this.movies;
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const genreFilter = document.getElementById('filter-genre').value;
        const yearFilter = document.getElementById('filter-year').value;
        const ratingFilter = document.getElementById('filter-rating').value;

        filteredMovies = filteredMovies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) &&
            (genreFilter === '' || movie.genre === genreFilter) &&
            (yearFilter === '' || movie.releaseYear.toString() === yearFilter) &&
            (ratingFilter === '' || (movie.watched && movie.rating && movie.rating.toString() === ratingFilter))
        );

        if (this.currentView === 'watched') {
            filteredMovies = filteredMovies.filter(movie => movie.watched);
        } else if (this.currentView === 'to-watch') {
            filteredMovies = filteredMovies.filter(movie => !movie.watched);
        }

        return filteredMovies;
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
        this.updateYearFilter();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    updateGenreFilter() {
        const genreFilter = document.getElementById('filter-genre');
        const genres = [...new Set(this.movies.map(m => m.genre))];
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        genres.forEach(genre => {
            genreFilter.innerHTML += `<option value="${genre}">${genre}</option>`;
        });
    }

    updateYearFilter() {
        const yearFilter = document.getElementById('filter-year');
        const years = [...new Set(this.movies.map(m => m.releaseYear))].sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="">All Years</option>';
        years.forEach(year => {
            yearFilter.innerHTML += `<option value="${year}">${year}</option>`;
        });
    }
}

const movieTracker = new MovieTracker();