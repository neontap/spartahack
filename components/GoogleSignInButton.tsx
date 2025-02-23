"use client";

import GoogleButton from 'react-google-button'
import { Button } from "@/components/ui/button";
// import { createClient } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/client";
export function GoogleSignInButton() {
  async function signInWithGoogle() {
    // const supabase = createClient(
    //   process.env.NEXT_PUBLIC_SUPABASE_URL!,
    //   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    // );

    const supabase = createClient()
    // const { error } = await supabase.auth.signInWithOAuth({
    //   provider: "google",
    //   options: {
    //     redirectTo: `${window.location.origin}/auth/callback`,
    //     flow: "pkce"  // Force the auth code flow
    //   }
    // });
    // 
    // const {error} = await supabase.auth.signInWithOAuth({provider: "google" })
    // provider: 'google',
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `https://coursechecker.xyz/auth/callback`,
      },
    })
  if (error) {
      console.error("Error signing in with Google:", error.message);
    }
  }
  return (
    <GoogleButton onClick={signInWithGoogle}>
    </GoogleButton>
  );
}

