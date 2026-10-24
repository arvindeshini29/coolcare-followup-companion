import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Lead, Profile } from "@/lib/crm";

// RLS restricts every query to the signed-in user's own rows.
export const leadsQuery = queryOptions({
  queryKey: ["leads"],
  queryFn: async (): Promise<Lead[]> => {
    const all: Lead[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .range(from, from + 999);
      if (error) throw error;
      all.push(...((data ?? []) as unknown as Lead[]));
      if (!data || data.length < 1000) break;
    }
    return all;
  },
});

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<Profile | null> => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("technician_name, business_name")
      .eq("id", u.user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
});

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
