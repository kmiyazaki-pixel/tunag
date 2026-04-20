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
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("audit log user fetch error:", userError);
    return;
  }

  if (!user) {
    console.warn("audit log skipped: no authenticated user");
    return;
  }

  const userName =
    (user.user_metadata?.name as string | undefined)?.trim() ||
    user.email?.split("@")[0] ||
    "ユーザー";

  const payload = {
    user_id: user.id,
    user_name: userName,
    action,
    target_type: targetType,
    target_id: targetId == null ? null : String(targetId),
    detail: detail ?? null,
  };

  const { error } = await supabase.from("audit_logs").insert([payload]);

  if (error) {
    console.error("audit log insert error:", error, payload);
    return;
  }

  console.info("audit log inserted:", payload);
}
