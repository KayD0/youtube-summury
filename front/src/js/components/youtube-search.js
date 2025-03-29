// YouTube Search Component
class YouTubeSearch extends HTMLElement {
    constructor() {
        super();
        this.videos = [];
        this.render();
    }

    connectedCallback() {
        // Add event listeners after the component is connected to the DOM
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    render() {
        this.innerHTML = /*html*/`
            <div class="youtube-search">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">YouTube Video Search</h5>
                    </div>
                    <div class="card-body">
                        <form id="youtube-search-form">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="search-query" class="form-label">Search Keyword <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="search-query" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="published-after" class="form-label">Published After <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="published-after" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="channel-id" class="form-label">Channel ID (Optional)</label>
                                    <input type="text" class="form-control" id="channel-id">
                                </div>
                                <div class="col-md-6">
                                    <label for="max-results" class="form-label">Max Results</label>
                                    <select class="form-select" id="max-results">
                                        <option value="5">5</option>
                                        <option value="10" selected>10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                    </select>
                                </div>
                                <div class="col-md-12">
                                    <button type="submit" class="btn btn-primary" id="search-button">
                                        <span id="search-button-text">Search Videos</span>
                                        <span id="search-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="search-results" class="mt-4">
                    <div id="results-count" class="mb-3 d-none">
                        <h5>Results: <span id="video-count">0</span> videos found</h5>
                    </div>
                    <div id="videos-container" class="row row-cols-1 row-cols-md-2 g-4">
                        <!-- Video cards will be inserted here -->
                    </div>
                    <div id="no-results" class="alert alert-info d-none">
                        No videos found. Try a different search query.
                    </div>
                    <div id="error-message" class="alert alert-danger d-none">
                        An error occurred while searching for videos.
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#youtube-search-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.searchVideos();
            });
        }

        // Set default date to 30 days ago
        const publishedAfterInput = this.querySelector('#published-after');
        if (publishedAfterInput) {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            publishedAfterInput.valueAsDate = thirtyDaysAgo;
        }
    }

    async searchVideos() {
        const searchQuery = this.querySelector('#search-query').value;
        const publishedAfter = this.querySelector('#published-after').value;
        const channelId = this.querySelector('#channel-id').value;
        const maxResults = this.querySelector('#max-results').value;

        // Validate required fields
        if (!searchQuery || !publishedAfter) {
            return;
        }

        // Convert date to ISO 8601 format
        const publishedAfterISO = new Date(publishedAfter).toISOString();

        // Show loading state
        this.setLoadingState(true);

        try {
            // Prepare request data
            const requestData = {
                q: searchQuery,
                published_after: publishedAfterISO,
                max_results: parseInt(maxResults)
            };

            // Add channel_id if provided
            if (channelId) {
                requestData.channel_id = channelId;
            }

            // Make API request
            const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            this.videos = data.videos || [];
            this.displayResults();
        } catch (error) {
            console.error('Error searching videos:', error);
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }

    displayResults() {
        const resultsCount = this.querySelector('#results-count');
        const videosContainer = this.querySelector('#videos-container');
        const noResults = this.querySelector('#no-results');
        const videoCount = this.querySelector('#video-count');
        const errorMessage = this.querySelector('#error-message');

        // Hide error message
        errorMessage.classList.add('d-none');

        // Clear previous results
        videosContainer.innerHTML = '';

        if (this.videos.length > 0) {
            // Show results count
            resultsCount.classList.remove('d-none');
            videoCount.textContent = this.videos.length;
            
            // Hide no results message
            noResults.classList.add('d-none');

            // Create video cards
            this.videos.forEach(video => {
                const videoCard = this.createVideoCard(video);
                videosContainer.appendChild(videoCard);
            });
        } else {
            // Hide results count
            resultsCount.classList.add('d-none');
            
            // Show no results message
            noResults.classList.remove('d-none');
        }
    }

    createVideoCard(video) {
        const col = document.createElement('div');
        col.className = 'col';

        col.innerHTML = /*html*/`
            <div class="card h-100 shadow-sm">
                <img src="${video.thumbnail}" class="card-img-top" alt="${video.title}">
                <div class="card-body">
                    <h5 class="card-title">${this.truncateText(video.title, 60)}</h5>
                    <p class="card-text text-muted small">
                        ${video.channel_title} • ${this.formatDate(video.published_at)}
                    </p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group">
                            <a href="${video.url}" target="_blank" class="btn btn-sm btn-outline-primary">Watch on YouTube</a>
                        </div>
                        <small class="text-muted">
                            <i class="bi bi-eye"></i> ${this.formatCount(video.view_count)}
                        </small>
                    </div>
                </div>
            </div>
        `;

        return col;
    }

    setLoadingState(isLoading) {
        const searchButton = this.querySelector('#search-button');
        const searchButtonText = this.querySelector('#search-button-text');
        const searchSpinner = this.querySelector('#search-spinner');

        if (isLoading) {
            searchButton.disabled = true;
            searchButtonText.textContent = 'Searching...';
            searchSpinner.classList.remove('d-none');
        } else {
            searchButton.disabled = false;
            searchButtonText.textContent = 'Search Videos';
            searchSpinner.classList.add('d-none');
        }
    }

    showError(message) {
        const errorMessage = this.querySelector('#error-message');
        const resultsCount = this.querySelector('#results-count');
        const noResults = this.querySelector('#no-results');

        errorMessage.textContent = `Error: ${message}`;
        errorMessage.classList.remove('d-none');
        resultsCount.classList.add('d-none');
        noResults.classList.add('d-none');
    }

    // Helper methods
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    formatCount(count) {
        if (count === 'N/A') return count;
        
        const num = parseInt(count);
        if (isNaN(num)) return count;
        
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }
}

customElements.define("youtube-search", YouTubeSearch);
