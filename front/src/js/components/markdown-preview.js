/**
 * Markdownプレビューコンポーネント
 * 
 * このコンポーネントはMarkdown形式のテキストをHTMLに変換して表示します。
 * marked.jsライブラリを使用してMarkdownをHTMLに変換します。
 */

// Markdownパーサーライブラリをインポート
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Markdownプレビューコンポーネント
class MarkdownPreview extends HTMLElement {
    constructor() {
        super();
        this._content = '';
        this._theme = 'light';
        this.render();
    }

    // コンポーネントがDOMに接続されたときに呼び出される
    connectedCallback() {
        this.setupEventListeners();
    }

    // Markdownコンテンツを設定するセッター
    set content(value) {
        this._content = value;
        this.updatePreview();
    }

    // 現在のMarkdownコンテンツを取得するゲッター
    get content() {
        return this._content;
    }

    // テーマを設定するセッター（light または dark）
    set theme(value) {
        if (value === 'light' || value === 'dark') {
            this._theme = value;
            this.updateTheme();
        }
    }

    // 現在のテーマを取得するゲッター
    get theme() {
        return this._theme;
    }

    // コンポーネントの初期レンダリング
    render() {
        this.innerHTML = /*html*/`
            <style>
                .markdown-preview {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    padding: 1rem;
                    border-radius: 0.25rem;
                    transition: all 0.3s ease;
                }
                
                .markdown-preview.light {
                    background-color: #ffffff;
                    color: #333333;
                    border: 1px solid #e0e0e0;
                }
                
                .markdown-preview.dark {
                    background-color: #2d2d2d;
                    color: #e0e0e0;
                    border: 1px solid #444444;
                }
                
                .markdown-preview h1 {
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 0.3rem;
                    margin-top: 1.5rem;
                }
                
                .markdown-preview h2 {
                    border-bottom: 1px solid #e0e0e0;
                    padding-bottom: 0.2rem;
                    margin-top: 1.2rem;
                }
                
                .markdown-preview code {
                    background-color: rgba(0, 0, 0, 0.05);
                    padding: 0.2rem 0.4rem;
                    border-radius: 3px;
                    font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 0.9em;
                }
                
                .markdown-preview pre {
                    background-color: rgba(0, 0, 0, 0.05);
                    padding: 1rem;
                    border-radius: 5px;
                    overflow-x: auto;
                }
                
                .markdown-preview pre code {
                    background-color: transparent;
                    padding: 0;
                }
                
                .markdown-preview blockquote {
                    border-left: 4px solid #e0e0e0;
                    padding-left: 1rem;
                    margin-left: 0;
                    color: #777777;
                }
                
                .markdown-preview img {
                    max-width: 100%;
                    height: auto;
                }
                
                .markdown-preview table {
                    border-collapse: collapse;
                    width: 100%;
                    margin: 1rem 0;
                }
                
                .markdown-preview th, .markdown-preview td {
                    border: 1px solid #e0e0e0;
                    padding: 0.5rem;
                }
                
                .markdown-preview th {
                    background-color: rgba(0, 0, 0, 0.05);
                }
                
                .markdown-preview.dark code {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .markdown-preview.dark pre {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .markdown-preview.dark blockquote {
                    border-left-color: #555555;
                    color: #aaaaaa;
                }
                
                .markdown-preview.dark th, .markdown-preview.dark td {
                    border-color: #555555;
                }
                
                .markdown-preview.dark th {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .markdown-toolbar {
                    display: flex;
                    justify-content: space-between;
                    padding: 0.5rem;
                    background-color: #f5f5f5;
                    border: 1px solid #e0e0e0;
                    border-bottom: none;
                    border-radius: 0.25rem 0.25rem 0 0;
                }
                
                .markdown-toolbar.dark {
                    background-color: #333333;
                    border-color: #444444;
                }
                
                .theme-toggle {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    transition: background-color 0.3s ease;
                }
                
                .theme-toggle:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .markdown-toolbar.dark .theme-toggle:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .markdown-container {
                    border-radius: 0.25rem;
                    overflow: hidden;
                    margin-bottom: 1rem;
                }
                
                .markdown-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .copy-btn, .export-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                    padding: 0.25rem 0.5rem;
                    border-radius: 0.25rem;
                    transition: background-color 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .copy-btn:hover, .export-btn:hover {
                    background-color: rgba(0, 0, 0, 0.1);
                }
                
                .markdown-toolbar.dark .copy-btn:hover, 
                .markdown-toolbar.dark .export-btn:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                }
                
                .copy-success {
                    color: #28a745;
                    font-size: 0.875rem;
                    margin-left: 0.5rem;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }
                
                .copy-success.show {
                    opacity: 1;
                }
            </style>
            
            <div class="markdown-container">
                <div class="markdown-toolbar">
                    <div class="markdown-actions">
                        <button class="copy-btn" title="コピー">
                            <i class="bi bi-clipboard"></i> コピー
                        </button>
                        <button class="export-btn" title="エクスポート">
                            <i class="bi bi-download"></i> エクスポート
                        </button>
                        <span class="copy-success">コピーしました！</span>
                    </div>
                    <button class="theme-toggle" title="テーマ切り替え">
                        <i class="bi bi-moon"></i>
                    </button>
                </div>
                <div class="markdown-preview light">
                    <p>Markdownコンテンツがここに表示されます。</p>
                </div>
            </div>
        `;
    }

    // イベントリスナーの設定
    setupEventListeners() {
        const themeToggle = this.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.theme = this.theme === 'light' ? 'dark' : 'light';
            });
        }
        
        const copyBtn = this.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard();
            });
        }
        
        const exportBtn = this.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportMarkdown();
            });
        }
    }
    
    // Markdownコンテンツをクリップボードにコピー
    copyToClipboard() {
        if (!this._content) return;
        
        navigator.clipboard.writeText(this._content)
            .then(() => {
                const copySuccess = this.querySelector('.copy-success');
                if (copySuccess) {
                    copySuccess.classList.add('show');
                    setTimeout(() => {
                        copySuccess.classList.remove('show');
                    }, 2000);
                }
            })
            .catch(err => {
                console.error('クリップボードへのコピーに失敗しました:', err);
            });
    }
    
    // Markdownコンテンツをファイルとしてエクスポート
    exportMarkdown() {
        if (!this._content) return;
        
        const blob = new Blob([this._content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // 現在の日時を取得してファイル名に使用
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10);
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        
        a.href = url;
        a.download = `youtube-summary-${dateStr}-${timeStr}.md`;
        document.body.appendChild(a);
        a.click();
        
        // クリーンアップ
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }

    // Markdownをレンダリングしてプレビューを更新
    updatePreview() {
        const previewElement = this.querySelector('.markdown-preview');
        if (previewElement && this._content) {
            // Markdownをパースしてサニタイズ
            const htmlContent = DOMPurify.sanitize(marked.parse(this._content));
            previewElement.innerHTML = htmlContent;
        }
    }

    // テーマの更新
    updateTheme() {
        const previewElement = this.querySelector('.markdown-preview');
        const toolbarElement = this.querySelector('.markdown-toolbar');
        const themeToggle = this.querySelector('.theme-toggle i');
        
        if (previewElement) {
            previewElement.classList.remove('light', 'dark');
            previewElement.classList.add(this._theme);
        }
        
        if (toolbarElement) {
            toolbarElement.classList.remove('light', 'dark');
            if (this._theme === 'dark') {
                toolbarElement.classList.add('dark');
            }
        }
        
        if (themeToggle) {
            themeToggle.className = this._theme === 'light' ? 'bi bi-moon' : 'bi bi-sun';
        }
    }
}

// カスタム要素を登録
customElements.define('markdown-preview', MarkdownPreview);

export default MarkdownPreview;
