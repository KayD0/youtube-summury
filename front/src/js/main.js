// Import Bootstrap JS
import './bootstrap.js';

// Import views
import home from "./views/home.js";
import about from "./views/about.js";
import contact from "./views/contact.js";
import login from "./views/login.js";
import register from "./views/register.js";
import profile from "./views/profile.js";
import authTest from "./views/auth-test.js";

// Import Firebase services
import { isAuthenticated } from "./services/firebase.js";

// ルート設定
const routes = {
    "/": { title: "ホーム", render: home },
    "/about": { title: "このサイトについて", render: about },
    "/contact": { title: "お問い合わせ", render: contact },
    "/login": { title: "ログイン", render: login, public: true },
    "/register": { title: "アカウント登録", render: register, public: true },
    "/profile": { title: "プロフィール", render: profile, protected: true },
    "/auth-test": { title: "認証テスト", render: authTest, protected: true },
};

// Router function
function router() {
    let view = routes[location.pathname];

    if (view) {
        // Check if route is protected and user is not authenticated
        if (view.protected && !isAuthenticated()) {
            history.replaceState("", "", "/login");
            view = routes["/login"];
        }
        
        // Check if route is for non-authenticated users only and user is authenticated
        if (view.public && isAuthenticated() && location.pathname !== "/") {
            history.replaceState("", "", "/");
            view = routes["/"];
        }
        
        document.title = view.title;
        app.innerHTML = view.render();
        
        // Update active navigation link
        updateActiveNavLink();
    } else {
        history.replaceState("", "", "/");
        router();
    }
};

// Update active navigation link
function updateActiveNavLink() {
    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("href") === location.pathname) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

// 認証UIの更新
function updateAuthUI() {
    const authenticated = isAuthenticated();
    const authNav = document.getElementById("authNav");
    
    if (authNav) {
        if (authenticated) {
            authNav.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/profile" data-link>プロフィール</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/auth-test" data-link>認証テスト</a>
                </li>
                <li class="nav-item">
                    <button class="btn btn-link nav-link" id="logoutBtn">ログアウト</button>
                </li>
            `;
            
            // Add logout functionality
            setTimeout(() => {
                const logoutBtn = document.getElementById("logoutBtn");
                if (logoutBtn) {
                    logoutBtn.addEventListener("click", async () => {
                        try {
                            // Show loading state
                            logoutBtn.disabled = true;
                            logoutBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                            
                            // Import signOut function dynamically to avoid circular dependencies
                            const { signOut } = await import("./services/firebase.js");
                            const { error } = await signOut();
                            
                            if (!error) {
                                // ログアウト成功時にホームページにリダイレクト
                                history.pushState("", "", "/");
                                router();
                            } else {
                                console.error("ログアウトエラー:", error);
                                // ボタンの状態をリセット
                                logoutBtn.disabled = false;
                                logoutBtn.textContent = "ログアウト";
                            }
                        } catch (err) {
                            console.error("ログアウトエラー:", err);
                            // ボタンの状態をリセット
                            logoutBtn.disabled = false;
                            logoutBtn.textContent = "ログアウト";
                        }
                    });
                }
            }, 0);
        } else {
            authNav.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="/login" data-link>ログイン</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/register" data-link>登録</a>
                </li>
            `;
        }
        
        updateActiveNavLink();
    }
}

// Handle navigation
window.addEventListener("click", e => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        history.pushState("", "", e.target.href);
        router();
    }
});

// Update router
window.addEventListener("popstate", router);
window.addEventListener("DOMContentLoaded", () => {
    router();
    updateAuthUI();
});

// Listen for authentication state changes
window.addEventListener("authStateChanged", () => {
    updateAuthUI();
    router();
});
