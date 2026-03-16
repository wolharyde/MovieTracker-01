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
        this.updateYearFilter();
        e.target.reset();
    }

    removeMovie(id) {
        this.movies = this.movies.filter(movie => movie.id !== id);
        this.saveMovies();
        this.renderMovies();
        this.updateGenreFilter();
        this.updateYearFilter();
    }

    toggleWatched(id) {
        const movie = this.movies.find(movie => movie.id === id);
        movie.watched = !movie.watched;
        if (!movie.watched) movie.rating = null;
        this.saveMovies();
        this.renderMovies();
    }

    updateRating(id, rating) {
        const movie = this.movies.find(movie => movie.id === id);
        movie.rating = parseInt(rating);
        this.saveMovies();
        this.renderMovies();
    }

    saveMovies() {
        localStorage.setItem('movies', JSON.stringify(this.movies));
    }

    setView(view) {
        this.currentView = view;
        this.renderMovies();
    }

    renderMovies() {
        const movieList = document.getElementById('movie-list');
        movieList.innerHTML = '';
        let filteredMovies = this.movies;

        // Apply view filter
        if (this.currentView === 'watched') {
            filteredMovies = filteredMovies.filter(movie => movie.watched);
        } else if (this.currentView === 'to-watch') {
            filteredMovies = filteredMovies.filter(movie => !movie.watched);
        }

        // Apply search filter
        const searchTerm = document.getElementById('search').value.toLowerCase();
        if (searchTerm) {
            filteredMovies = filteredMovies.filter(movie => movie.title.toLowerCase().includes(searchTerm));
        }

        // Apply genre filter
        const genreFilter = document.getElementById('filter-genre').value;
        if (genreFilter) {
            filteredMovies = filteredMovies.filter(movie => movie.genre === genreFilter);
        }

        // Apply year filter
        const yearFilter = document.getElementById('filter-year').value;
        if (yearFilter) {
            filteredMovies = filteredMovies.filter(movie => movie.releaseYear === parseInt(yearFilter));
        }

        // Apply rating filter
        const ratingFilter = document.getElementById('filter-rating').value;
        if (ratingFilter) {
            filteredMovies = filteredMovies.filter(movie => movie.rating === parseInt(ratingFilter));
        }

        filteredMovies.forEach(movie => {
            const li = document.createElement('li');
            li.className = 'movie-item';
            li.innerHTML = `
                <h3>${movie.title} (${movie.releaseYear})</h3>
                <p>Genre: ${movie.genre}</p>
                <p>Status: ${movie.watched ? 'Watched' : 'To Watch'}</p>
                ${movie.watched ? `
                    <label>Rating: 
                        <select class="rating-select" data-id="${movie.id}">
                            ${[1, 2, 3, 4, 5].map(num => `
                                <option value="${num}" ${movie.rating === num ? 'selected' : ''}>${num}</option>
                            `).join('')}
                        </select>
                    </label>
                ` : ''}
                <button class="toggle-watched" data-id="${movie.id}">${movie.watched ? 'Mark as Unwatched' : 'Mark as Watched'}</button>
                <button class="remove-movie" data-id="${movie.id}">Remove</button>
            `;
            movieList.appendChild(li);
        });

        // Add event listeners to new elements
        document.querySelectorAll('.toggle-watched').forEach(button => {
            button.addEventListener('click', (e) => this.toggleWatched(e.target.dataset.id));
        });
        document.querySelectorAll('.remove-movie').forEach(button => {
            button.addEventListener('click', (e) => this.removeMovie(e.target.dataset.id));
        });
        document.querySelectorAll('.rating-select').forEach(select => {
            select.addEventListener('change', (e) => this.updateRating(e.target.dataset.id, e.target.value));
        });
    }

    updateGenreFilter() {
        const genreFilter = document.getElementById('filter-genre');
        const genres = [...new Set(this.movies.map(movie => movie.genre))];
        genreFilter.innerHTML = '<option value="">All Genres</option>';
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    updateYearFilter() {
        const yearFilter = document.getElementById('filter-year');
        const years = [...new Set(this.movies.map(movie => movie.releaseYear))].sort((a, b) => b - a);
        yearFilter.innerHTML = '<option value="">All Years</option>';
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }
}

// Initialize the app
const movieTracker = new MovieTracker();