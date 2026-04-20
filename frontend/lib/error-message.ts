export function toJapaneseErrorMessage(message: string | null | undefined) {
  const raw = (message ?? "").trim();

  if (!raw) return "エラーが発生しました。";

  const lower = raw.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "メールアドレスまたはパスワードが正しくありません。";
  }

  if (lower.includes("email not confirmed")) {
    return "メールアドレスの確認が完了していません。確認メールをご確認ください。";
  }

  if (lower.includes("user already registered")) {
    return "このメールアドレスはすでに登録されています。";
  }

  if (lower.includes("password should be at least")) {
    return "パスワードは6文字以上で入力してください。";
  }

  if (lower.includes("database error saving new user")) {
    return "ユーザー登録に失敗しました。管理者にお問い合わせください。";
  }

  if (lower.includes("new row violates row-level security policy")) {
    return "保存権限がありません。ログイン状態をご確認ください。";
  }

  if (lower.includes("duplicate key value violates unique constraint")) {
    return "同じデータがすでに登録されています。";
  }

  if (lower.includes("permission denied")) {
    return "権限がありません。";
  }

  if (lower.includes("jwt expired")) {
    return "ログインの有効期限が切れました。もう一度ログインしてください。";
  }

  if (lower.includes("invalid api key")) {
    return "接続設定に問題があります。環境変数をご確認ください。";
  }

  if (lower.includes("failed to fetch")) {
    return "通信に失敗しました。ネットワーク状態をご確認ください。";
  }

  return raw;
}
