import "../components/counter.js";
import "../components/youtube-search.js";
import "../components/youtube-summary.js";

export default () => /*html*/`
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h1 class="card-title">YouTube Tools</h1>
                    <p class="card-text">Search for YouTube videos and generate summaries using AI</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row">
        <div class="col-lg-6 mb-4">
            <youtube-search></youtube-search>
        </div>
        <div class="col-lg-6 mb-4">
            <youtube-summary></youtube-summary>
        </div>
    </div>
`;
