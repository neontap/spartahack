import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  // Use the "next" parameter if available; otherwise, default to "/"
  const nextUrl = requestUrl.searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        // No load balancer in development, so we can use the origin directly
        return NextResponse.redirect(`${origin}${nextUrl}`);
      } else if (forwardedHost) {
        // In production, use the forwarded host if available
        return NextResponse.redirect(`https://${forwardedHost}${nextUrl}`);
      } else {
        return NextResponse.redirect(`${origin}${nextUrl}`);
      }
    } else {
      console.error("Error exchanging code for session:", error);
    }
  }

  // If there's no code or if the exchange fails, redirect to an error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}

