import "../components/counter.js";

export default () => /*html*/`
    <div class="row">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h1 class="card-title">Home</h1>
                    <p class="card-text">Simple click counter with Bootstrap styling</p>
                    <click-counter></click-counter>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card bg-light">
                <div class="card-header">
                    <h5 class="card-title mb-0">Bootstrap Features</h5>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Responsive Grid System</li>
                    <li class="list-group-item">Pre-styled Components</li>
                    <li class="list-group-item">Interactive Elements</li>
                    <li class="list-group-item">Utility Classes</li>
                </ul>
            </div>
        </div>
    </div>
`;
