# tunag-lite-render-ready

TUNAG風の社内ポータルMVPを、**GitHubにpush → RenderでBlueprint deploy** するだけで立ち上げやすい形にしたサンプルです。

## 入っているもの
- `frontend/`: Next.js 15 + App Router
- `backend/`: Spring Boot 3.3 + JPA + Flyway + PostgreSQL
- `render.yaml`: Render Blueprint

## できること
- 投稿一覧
- 投稿詳細
- 必読マーク付き投稿
- 既読カウント
- 管理用の新規投稿作成画面
- ダッシュボード要約

## Renderデプロイ手順
1. このフォルダをGitHubに新規リポジトリとしてpush
2. Renderで **New + > Blueprint** を選ぶ
3. GitHubリポジトリを接続
4. `render.yaml` を読み込ませてデプロイ
5. 数分待つと `tunag-lite-frontend` のURLが公開される

## ローカル起動の目安
### backend
```bash
cd backend
docker build -t tunag-lite-backend .
```

### frontend
```bash
cd frontend
docker build -t tunag-lite-frontend .
```

## 補足
- バックエンドは Render 上では private service です。
- フロントからバックエンドへは Render の private network 経由で接続します。
- 初回は Flyway がテーブルを作り、サンプル投稿も入ります。

## 次に足すとよいもの
- ログイン/権限管理
- コメント機能
- リアクション機能
- 通知
- 部署/公開範囲制御
- 既読者一覧
