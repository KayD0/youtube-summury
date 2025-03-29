import "../components/counter.js";
import "../components/youtube-search.js";

export default () => /*html*/`
    <div class="row mb-4">
        <div class="col-12">
            <div class="card">
                <div class="card-body">
                    <h1 class="card-title">YouTube Video Search</h1>
                    <p class="card-text">Search for YouTube videos and display them in a card layout</p>
                </div>
            </div>
        </div>
    </div>
    
    <youtube-search></youtube-search>
`;
