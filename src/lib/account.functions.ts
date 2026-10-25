import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const DELETE_CONFIRM_WORD = "DELETE";

/**
 * Permanently deletes the CALLER's own account and data. All data in this app is
 * owned by a single user (leads.user_id, profiles.id); nothing is shared between
 * accounts, so deleting by the verified caller id cannot touch anyone else's data.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ confirm: z.literal(DELETE_CONFIRM_WORD) }).parse(input))
  .handler(async ({ context }) => {
    const userId = context.userId;
    if (!userId) throw new Error("Unauthorized");

    // 1. Remove the caller's leads with their own RLS-scoped client.
    const { error: leadsErr } = await context.supabase.from("leads").delete().eq("user_id", userId);
    if (leadsErr) {
      console.error("delete leads failed", leadsErr.message);
      throw new Error("Could not delete your customer records. Nothing else was removed.");
    }

    // 2. Delete the sign-in account (profile row cascades via its foreign key).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authErr) {
      console.error("delete user failed", authErr.message);
      throw new Error(
        "Your customer records were deleted, but the account could not be removed. Please try again.",
      );
    }
    return { ok: true as const };
  });
