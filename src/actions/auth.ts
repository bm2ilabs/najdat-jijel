"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function loginAsDemoAdmin(formData?: FormData) {
  const cookieStore = await cookies();
  cookieStore.set("jijel_demo_admin", "true", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  redirect("/admin");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("jijel_demo_admin");

  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore Supabase connection error in demo mode
  }

  redirect("/admin/login");
}
