import { redirect } from "next/navigation";
import { createAuthClient } from "@/lib/supabase-auth";
import { supabase } from "@/lib/supabase";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) redirect("/login");

  const { data: userRecord } = await supabase
    .from("users")
    .select("id, email, active")
    .eq("email", user.email!)
    .single();

  const { data: prefs } = await supabase
    .from("preferences")
    .select("location, subreddits, stocks, settings")
    .eq("user_id", userRecord?.id)
    .single();

  return (
    <DashboardClient
      email={user.email!}
      userId={userRecord?.id ?? ""}
      active={userRecord?.active ?? true}
      location={prefs?.location ?? ""}
      subreddits={(prefs?.subreddits ?? []).join(", ")}
      stocks={(prefs?.stocks ?? []).join(", ")}
      connectors={(prefs?.settings as { connectors?: string[] })?.connectors ?? ["weather", "reddit", "stocks"]}
    />
  );
}
