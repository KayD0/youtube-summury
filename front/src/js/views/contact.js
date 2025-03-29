export default () => /*html*/`
    <div class="card">
        <div class="card-body">
            <h1 class="card-title">お問い合わせ</h1>
            <p class="card-text mb-4">ご質問やフィードバックがございましたら、以下のフォームからお気軽にお問い合わせください。</p>
            
            <form>
                <div class="mb-3">
                    <label for="name" class="form-label">お名前</label>
                    <input type="text" class="form-control" id="name" placeholder="あなたのお名前">
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">メールアドレス</label>
                    <input type="email" class="form-control" id="email" placeholder="name@example.com">
                </div>
                <div class="mb-3">
                    <label for="message" class="form-label">メッセージ</label>
                    <textarea class="form-control" id="message" rows="4" placeholder="お問い合わせ内容"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">送信</button>
            </form>
        </div>
    </div>
`;
