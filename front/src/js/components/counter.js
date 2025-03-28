// New component
class Counter extends HTMLElement {
    constructor() {
        super();
        
        this.innerHTML = /*html*/`
            <button class="btn btn-primary">Clicks : ${count}</button>
        `;

        let btn = this.querySelector("button");

        // State
        btn.onclick = () => {
            btn.innerHTML = "Clicks : " + ++count;
            
            // Add a badge effect when count increases
            if (count > 0) {
                btn.classList.add('position-relative');
                const badge = document.createElement('span');
                badge.className = 'position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger';
                badge.innerHTML = '+1';
                badge.style.fontSize = '0.6rem';
                btn.appendChild(badge);
                
                // Remove the badge after animation
                setTimeout(() => {
                    if (badge.parentNode === btn) {
                        btn.removeChild(badge);
                    }
                }, 1000);
            }
        };
    }
}

var count = 0;

customElements.define("click-counter", Counter);
