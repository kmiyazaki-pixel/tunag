import { supabase } from "@/lib/supabase";

type AuditLogInput = {
  action: string;
  targetType: string;
  targetId?: string | number | null;
  detail?: Record<string, unknown> | null;
};

export async function writeAuditLog({
  action,
  targetType,
  targetId,
  detail,
}: AuditLogInput) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const userName =
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "ユーザー";

  await supabase.from("audit_logs").insert([
    {
      user_id: user.id,
      user_name: userName,
      action,
      target_type: targetType,
      target_id: targetId == null ? null : String(targetId),
      detail: detail ?? null,
    },
  ]);
}
