import { generateVideoSummary } from "../services/auth-api-service.js";
import { isAuthenticated } from "../services/firebase.js";
import '../components/markdown-preview.js';

// YouTube要約コンポーネント
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
        // コンポーネントがDOMに接続された後にイベントリスナーを追加
        setTimeout(() => {
            this.setupEventListeners();
        }, 0);
    }

    render() {
        this.innerHTML = /*html*/`
            <div class="youtube-summary">
                <div class="card mb-4">
                    <div class="card-header bg-success text-white">
                        <h5 class="mb-0">YouTubeビデオ要約</h5>
                    </div>
                    <div class="card-body">
                        <form id="youtube-summary-form">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <label for="video-id" class="form-label">YouTubeビデオIDまたはURL <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="video-id" required 
                                           placeholder="ビデオID（例：dQw4w9WgXcQ）または完全なURLを入力">
                                    <div class="form-text">
                                        例: dQw4w9WgXcQ または https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <button type="submit" class="btn btn-success" id="summary-button">
                                        <span id="summary-button-text">要約を生成</span>
                                        <span id="summary-spinner" class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true"></span>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div id="summary-result" class="mt-4 d-none">
                    <div class="card">
                        <div class="card-header bg-light d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">ビデオ要約</h5>
                            <div class="btn-group" role="group">
                                <button type="button" class="btn btn-sm btn-outline-secondary active" id="standard-view-btn">
                                    <i class="bi bi-list-ul"></i> 標準表示
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="markdown-view-btn">
                                    <i class="bi bi-markdown"></i> Markdown表示
                                </button>
                            </div>
                        </div>
                        
                        <!-- 簡単な要約（常に表示） -->
                        <div class="card-body pb-0">
                            <div class="alert alert-light">
                                <h6 class="card-subtitle mb-2 text-muted">簡単な要約</h6>
                                <p id="brief-summary" class="card-text"></p>
                            </div>
                            
                            <div class="d-flex justify-content-end mb-3">
                                <a id="video-link-top" href="#" target="_blank" class="btn btn-sm btn-outline-primary">
                                    <i class="bi bi-youtube"></i> YouTubeで視聴
                                </a>
                            </div>
                        </div>
                        
                        <!-- 標準表示 -->
                        <div class="card-body pt-0" id="standard-view">
                            <h6 class="card-subtitle mb-3 text-muted">重要ポイント</h6>
                            <ul id="key-points" class="list-group list-group-flush mb-3">
                                <!-- 重要ポイントがここに挿入されます -->
                            </ul>
                            
                            <h6 class="card-subtitle mb-3 text-muted">主要トピック</h6>
                            <div id="main-topics" class="mb-3">
                                <!-- 主要トピックがバッジとしてここに挿入されます -->
                            </div>
                        </div>
                        
                        <!-- Markdown表示 -->
                        <div class="card-body pt-0 d-none" id="markdown-view">
                            <markdown-preview></markdown-preview>
                        </div>
                    </div>
                </div>

                <div id="summary-error" class="alert alert-danger mt-4 d-none">
                    要約の生成中にエラーが発生しました。
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
        
        // 表示切り替えボタンのイベントリスナー
        const standardViewBtn = this.querySelector('#standard-view-btn');
        const markdownViewBtn = this.querySelector('#markdown-view-btn');
        
        if (standardViewBtn && markdownViewBtn) {
            standardViewBtn.addEventListener('click', () => {
                this.switchView('standard');
            });
            
            markdownViewBtn.addEventListener('click', () => {
                this.switchView('markdown');
            });
        }
    }
    
    // 表示モードを切り替える
    switchView(mode) {
        const standardView = this.querySelector('#standard-view');
        const markdownView = this.querySelector('#markdown-view');
        const standardViewBtn = this.querySelector('#standard-view-btn');
        const markdownViewBtn = this.querySelector('#markdown-view-btn');
        
        if (mode === 'standard') {
            standardView.classList.remove('d-none');
            markdownView.classList.add('d-none');
            standardViewBtn.classList.add('active');
            markdownViewBtn.classList.remove('active');
        } else {
            standardView.classList.add('d-none');
            markdownView.classList.remove('d-none');
            standardViewBtn.classList.remove('active');
            markdownViewBtn.classList.add('active');
        }
    }

    async generateSummary() {
        // ユーザーが認証されているかチェック
        if (!isAuthenticated()) {
            this.showError('要約を生成するにはログインが必要です');
            return;
        }

        const videoIdInput = this.querySelector('#video-id').value.trim();
        
        // 入力の検証
        if (!videoIdInput) {
            return;
        }
        
        // 入力からビデオIDを抽出（完全なURLまたは単なるIDの場合がある）
        this.videoId = this.extractVideoId(videoIdInput);
        
        if (!this.videoId) {
            this.showError('無効なYouTubeビデオIDまたはURL');
            return;
        }
        
        // ローディング状態を表示
        this.setLoadingState(true);
        
        try {
            // 標準形式の要約を取得
            this.summary = await generateVideoSummary(this.videoId);
            
            // Markdown形式の要約も取得
            this.markdownSummary = await generateVideoSummary(this.videoId, 'markdown');
            
            // 要約を表示
            this.displaySummary();
            this.displayMarkdownSummary();
        } catch (error) {
            console.error('要約生成エラー:', error);
            this.showError(error.message);
        } finally {
            this.setLoadingState(false);
        }
    }
    
    extractVideoId(input) {
        // 入力が既にビデオID（11文字）かどうかチェック
        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input;
        }
        
        // URLから抽出を試みる
        const urlRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
        const match = input.match(urlRegex);
        
        return match ? match[1] : null;
    }
    
    displaySummary() {
        if (!this.summary) return;
        
        const summaryResult = this.querySelector('#summary-result');
        const summaryError = this.querySelector('#summary-error');
        
        // エラーメッセージを非表示
        summaryError.classList.add('d-none');
        
        // 要約を表示
        const briefSummary = this.querySelector('#brief-summary');
        const keyPoints = this.querySelector('#key-points');
        const mainTopics = this.querySelector('#main-topics');
        const videoLinkTop = this.querySelector('#video-link-top');
        
        briefSummary.textContent = this.summary.brief_summary || '要約はありません';
        
        // 以前の重要ポイントをクリア
        keyPoints.innerHTML = '';
        
        // 重要ポイントを追加
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
            li.textContent = '重要ポイントはありません';
            keyPoints.appendChild(li);
        }
        
        // 以前の主要トピックをクリア
        mainTopics.innerHTML = '';
        
        // 主要トピックをバッジとして追加
        if (this.summary.main_topics && this.summary.main_topics.length > 0) {
            this.summary.main_topics.forEach(topic => {
                const badge = document.createElement('span');
                badge.className = 'badge bg-secondary me-2 mb-2';
                badge.textContent = topic;
                mainTopics.appendChild(badge);
            });
        } else {
            mainTopics.textContent = '主要トピックはありません';
        }
        
        // ビデオリンクを設定
        const videoUrl = this.summary.video_url || `https://www.youtube.com/watch?v=${this.videoId}`;
        videoLinkTop.href = videoUrl;
        
        // 動画タイトルがある場合はツールチップに設定
        if (this.summary.video_title) {
            videoLinkTop.title = this.summary.video_title;
        }
        
        // 要約結果を表示
        summaryResult.classList.remove('d-none');
    }
    
    displayMarkdownSummary() {
        if (!this.markdownSummary || !this.markdownSummary.markdown_content) return;
        
        // Markdownプレビューコンポーネントを取得
        const markdownPreview = this.querySelector('markdown-preview');
        if (markdownPreview) {
            // Markdownコンテンツを設定
            markdownPreview.content = this.markdownSummary.markdown_content;
        }
    }
    
    setLoadingState(isLoading) {
        this.isLoading = isLoading;
        
        const summaryButton = this.querySelector('#summary-button');
        const summaryButtonText = this.querySelector('#summary-button-text');
        const summarySpinner = this.querySelector('#summary-spinner');
        
        if (isLoading) {
            summaryButton.disabled = true;
            summaryButtonText.textContent = '生成中...';
            summarySpinner.classList.remove('d-none');
        } else {
            summaryButton.disabled = false;
            summaryButtonText.textContent = '要約を生成';
            summarySpinner.classList.add('d-none');
        }
    }
    
    showError(message) {
        const summaryResult = this.querySelector('#summary-result');
        const summaryError = this.querySelector('#summary-error');
        
        summaryResult.classList.add('d-none');
        summaryError.textContent = `エラー: ${message}`;
        summaryError.classList.remove('d-none');
    }
}

customElements.define("youtube-summary", YouTubeSummary);
