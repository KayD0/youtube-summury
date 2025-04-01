import { searchVideos } from "../services/auth-api-service.js";
import { isAuthenticated } from "../services/firebase.js";

// YouTube検索コンポーネント
class YouTubeSearch extends HTMLElement {
    constructor() {
        super();
        this.videos = [];
        this.render();
    }

    connectedCallback() {
        // コンポーネントがDOMに接続された後にイベントリスナーを追加
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    render() {
        this.innerHTML = /*html*/`
            <div class="youtube-search">
                <div class="card mb-4">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">YouTubeビデオ検索</h5>
                    </div>
                    <div class="card-body">
                        <form id="youtube-search-form">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="search-query" class="form-label">検索キーワード <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="search-query" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="published-after" class="form-label">公開日（以降） <span class="text-danger">*</span></label>
                                    <input type="date" class="form-control" id="published-after" required>
                                </div>
                                <div class="col-md-6">
                                    <label for="channel-id" class="form-label">チャンネルID（任意）</label>
                                    <input type="text" class="form-control" id="channel-id">
                                </div>
                                <div class="col-md-6">
                                    <label for="max-results" class="form-label">最大結果数</label>
                                    <select class="form-select" id="max-results">
                                        <option value="5">5</option>
                                        <option value="10" selected>10</option>
                                        <option value="15">15</option>
                                        <option value="20">20</option>
                                    </select>
                                </div>
                                <div class="col-md-12">
                                    <button type="submit" class="btn btn-primary" id="search-button">
                                        <span id="search-button-text">ビデオを検索</span>
                                        <span id="search-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="search-results" class="mt-4">
                    <div id="results-count" class="mb-3 d-none">
                        <h5>結果: <span id="video-count">0</span> 件のビデオが見つかりました</h5>
                    </div>
                    <div id="videos-container" class="row row-cols-1 row-cols-md-2 g-4">
                        <!-- ビデオカードがここに挿入されます -->
                    </div>
                    <div id="no-results" class="alert alert-info d-none">
                        ビデオが見つかりませんでした。別の検索キーワードをお試しください。
                    </div>
                    <div id="error-message" class="alert alert-danger d-none">
                        ビデオの検索中にエラーが発生しました。
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

        // 検索結果コンテナに対してイベント委任を設定
        const videosContainer = this.querySelector('#videos-container');
        if (videosContainer) {
            videosContainer.addEventListener('click', (e) => {
                // 要約生成ボタンがクリックされたかチェック
                if (e.target.classList.contains('generate-summary-btn')) {
                    const videoId = e.target.dataset.videoId;
                    if (videoId) {
                        this.generateSummaryForVideo(videoId);
                    }
                }
            });
        }
    }

    generateSummaryForVideo(videoId) {
        // YouTubeSummaryコンポーネントを取得
        const summaryComponent = document.querySelector('youtube-summary');
        if (summaryComponent) {
            // ビデオIDを入力フィールドに設定
            const videoIdInput = summaryComponent.querySelector('#video-id');
            if (videoIdInput) {
                videoIdInput.value = videoId;
                
                // 要約生成を実行
                const summaryForm = summaryComponent.querySelector('#youtube-summary-form');
                if (summaryForm) {
                    // フォームのsubmitイベントを発火
                    const submitEvent = new Event('submit', { cancelable: true });
                    summaryForm.dispatchEvent(submitEvent);
                    
                    // 要約コンポーネントまでスクロール
                    summaryComponent.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    }

    async searchVideos() {
        // ユーザーが認証されているかチェック
        if (!isAuthenticated()) {
            this.showError('ビデオを検索するにはログインが必要です');
            return;
        }

        const searchQuery = this.querySelector('#search-query').value;
        const publishedAfter = this.querySelector('#published-after').value;
        const channelId = this.querySelector('#channel-id').value;
        const maxResults = this.querySelector('#max-results').value;

        // 必須フィールドの検証
        if (!searchQuery || !publishedAfter) {
            return;
        }

        // 日付をISO 8601形式に変換
        const publishedAfterISO = new Date(publishedAfter).toISOString();

        // ローディング状態を表示
        this.setLoadingState(true);

        try {
            // リクエストデータの準備
            const requestData = {
                q: searchQuery,
                published_after: publishedAfterISO,
                max_results: parseInt(maxResults)
            };

            // channel_idが提供されている場合は追加
            if (channelId) {
                requestData.channel_id = channelId;
            }

            // サービスを使用してAPIリクエストを行う
            const data = await searchVideos(requestData);
            this.videos = data.videos || [];
            this.displayResults();
        } catch (error) {
            console.error('ビデオ検索エラー:', error);
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

        // エラーメッセージを非表示
        errorMessage.classList.add('d-none');

        // 以前の結果をクリア
        videosContainer.innerHTML = '';

        if (this.videos.length > 0) {
            // 結果数を表示
            resultsCount.classList.remove('d-none');
            videoCount.textContent = this.videos.length;
            
            // 結果なしメッセージを非表示
            noResults.classList.add('d-none');

            // ビデオカードを作成
            this.videos.forEach(video => {
                const videoCard = this.createVideoCard(video);
                videosContainer.appendChild(videoCard);
            });
        } else {
            // 結果数を非表示
            resultsCount.classList.add('d-none');
            
            // 結果なしメッセージを表示
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
                            <a href="${video.url}" target="_blank" class="btn btn-sm btn-outline-primary">YouTubeで視聴</a>
                            <button class="btn btn-sm btn-outline-success generate-summary-btn" data-video-id="${video.id}">要約生成</button>
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
            searchButtonText.textContent = '検索中...';
            searchSpinner.classList.remove('d-none');
        } else {
            searchButton.disabled = false;
            searchButtonText.textContent = 'ビデオを検索';
            searchSpinner.classList.add('d-none');
        }
    }

    showError(message) {
        const errorMessage = this.querySelector('#error-message');
        const resultsCount = this.querySelector('#results-count');
        const noResults = this.querySelector('#no-results');

        errorMessage.textContent = `エラー: ${message}`;
        errorMessage.classList.remove('d-none');
        resultsCount.classList.add('d-none');
        noResults.classList.add('d-none');
    }

    // ヘルパーメソッド
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
            return (num / 1000000).toFixed(1) + '万';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + '千';
        }
        return num.toString();
    }
}

customElements.define("youtube-search", YouTubeSearch);
