import { generateVideoSummary } from "../services/auth-api-service.js";
import { isAuthenticated } from "../services/firebase.js";

// YouTube Summary Component
class YouTubeSummary extends HTMLElement {
    constructor() {
        super();
        this.videoId = '';
        this.summary = null;
        this.isLoading = false;
        this.error = null;
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
            <div class="youtube-summary">
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">YouTube Video Summary</h5>
                    </div>
                    <div class="card-body">
                        <form id="youtube-summary-form">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="video-id" class="form-label">YouTube Video ID or URL <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="video-id" required 
                                           placeholder="Enter video ID (e.g., dQw4w9WgXcQ) or full URL">
                                    <div class="form-text">
                                        Example: dQw4w9WgXcQ or https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <button type="submit" class="btn btn-success" id="summary-button">
                                        <span id="summary-button-text">Generate Summary</span>
                                        <span id="summary-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="summary-result" class="mt-4 d-none">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h5 class="mb-0">Video Summary</h5>
                        </div>
                        <div class="card-body">
                            <h6 class="card-subtitle mb-3 text-muted">Brief Summary</h6>
                            <p id="brief-summary" class="card-text"></p>
                            
                            <h6 class="card-subtitle mb-3 text-muted">Key Points</h6>
                            <ul id="key-points" class="list-group list-group-flush mb-3">
                                <!-- Key points will be inserted here -->
                            </ul>
                            
                            <h6 class="card-subtitle mb-3 text-muted">Main Topics</h6>
                            <div id="main-topics" class="mb-3">
                                <!-- Main topics will be inserted here as badges -->
                            </div>
                            
                            <a id="video-link" href="#" target="_blank" class="btn btn-outline-primary">
                                <i class="bi bi-youtube"></i> Watch on YouTube
                            </a>
                        </div>
                    </div>
                </div>

                <div id="summary-error" class="alert alert-danger mt-4 d-none">
                    An error occurred while generating the summary.
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const form = this.querySelector('#youtube-summary-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateSummary();
            });
        }
    }

    async generateSummary() {
        // Check if user is authenticated
        if (!isAuthenticated()) {
            this.showError('You must be logged in to generate a summary');
            return;
        }

        const videoIdInput = this.querySelector('#video-id').value.trim();
        
        // Validate input
        if (!videoIdInput) {
            return;
        }
        
        // Extract video ID from input (which could be a full URL or just the ID)
        this.videoId = this.extractVideoId(videoIdInput);
        
        if (!this.videoId) {
            this.showError('Invalid YouTube video ID or URL');
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            // Make API request using the service
            this.summary = await generateVideoSummary(this.videoId);
            this.displaySummary();
        } catch (error) {
            console.error('Error generating summary:', error);
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    extractVideoId(input) {
        // Check if input is already a video ID (11 characters)
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input;
        }
        
        // Try to extract from URL
        const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = input.match(urlRegex);
        
        return match ? match[1] : null;
    }
    
    displaySummary() {
        if (!this.summary) return;
        
        const summaryResult = this.querySelector('#summary-result');
        const summaryError = this.querySelector('#summary-error');
        
        // Hide error message
        summaryError.classList.add('d-none');
        
        // Display summary
        const briefSummary = this.querySelector('#brief-summary');
        const keyPoints = this.querySelector('#key-points');
        const mainTopics = this.querySelector('#main-topics');
        const videoLink = this.querySelector('#video-link');
        
        briefSummary.textContent = this.summary.brief_summary || 'No summary available';
        
        // Clear previous key points
        keyPoints.innerHTML = '';
        
        // Add key points
        if (this.summary.key_points && this.summary.key_points.length > 0) {
            this.summary.key_points.forEach(point => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.textContent = point;
                keyPoints.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = 'No key points available';
            keyPoints.appendChild(li);
        }
        
        // Clear previous main topics
        mainTopics.innerHTML = '';
        
        // Add main topics as badges
        if (this.summary.main_topics && this.summary.main_topics.length > 0) {
            this.summary.main_topics.forEach(topic => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-2 mb-2';
                badge.textContent = topic;
                mainTopics.appendChild(badge);
            });
        } else {
            mainTopics.textContent = 'No main topics available';
        }
        
        // Set video link
        videoLink.href = this.summary.video_url || `https://www.youtube.com/watch?v=${this.videoId}`;
        
        // Show summary result
        summaryResult.classList.remove('d-none');
    }
    
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        
        const summaryButton = this.querySelector('#summary-button');
        const summaryButtonText = this.querySelector('#summary-button-text');
        const summarySpinner = this.querySelector('#summary-spinner');
        
        if (isLoading) {
            summaryButton.disabled = true;
            summaryButtonText.textContent = 'Generating...';
            summarySpinner.classList.remove('d-none');
        } else {
            summaryButton.disabled = false;
            summaryButtonText.textContent = 'Generate Summary';
            summarySpinner.classList.add('d-none');
        }
    }
    
    showError(message) {
        const summaryResult = this.querySelector('#summary-result');
        const summaryError = this.querySelector('#summary-error');
        
        summaryResult.classList.add('d-none');
        summaryError.textContent = `Error: ${message}`;
        summaryError.classList.remove('d-none');
    }
}

customElements.define("youtube-summary", YouTubeSummary);
