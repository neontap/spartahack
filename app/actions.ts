"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const signUpAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    const supabase = await createClient();

    if (!email || !password) {
        return encodedRedirect(
            "error",
            "/sign-up",
            "Email and password are required",
        );
    }

    // Sign up the user without email verification
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: undefined, // Remove email verification
        },
    });

    if (signUpError) {
        console.error(signUpError.code + " " + signUpError.message);
        return encodedRedirect("error", "/sign-up", signUpError.message);
    }

    const { error: profileError } = await supabase
        .from("profiles")
        .insert([{
            id: signUpData.user?.id,
            email: signUpData.user?.email,
            verified_at: null
        }]);


    if (profileError) {
        console.error("Profile insert error:", profileError.message);
        return encodedRedirect("error", "/sign-up", "Failed to create user profile.");
    }

    // Immediately sign in the user
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (signInError) {
        return encodedRedirect("error", "/sign-up", signInError.message);
    }

    // Redirect to home page on success
    return redirect("/");
};

export const signInAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return encodedRedirect("error", "/sign-in", error.message);
    }

    return redirect("/");
};

export const forgotPasswordAction = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const supabase = await createClient();
    const origin = (await headers()).get("origin");
    const callbackUrl = formData.get("callbackUrl")?.toString();

    if (!email) {
        return encodedRedirect("error", "/forgot-password", "Email is required");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?redirect_to=/reset-password`,
    });

    if (error) {
        console.error(error.message);
        return encodedRedirect(
            "error",
            "/forgot-password",
            "Could not reset password",
        );
    }

    if (callbackUrl) {
        return redirect(callbackUrl);
    }

    return encodedRedirect(
        "success",
        "/forgot-password",
        "Check your email for a link to reset your password.",
    );
};

export const resetPasswordAction = async (formData: FormData) => {
    const supabase = await createClient();

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
        encodedRedirect(
            "error",
            "/reset-password",
            "Password and confirm password are required",
        );
    }

    if (password !== confirmPassword) {
        encodedRedirect(
            "error",
            "/reset-password",
            "Passwords do not match",
        );
    }

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return encodedRedirect(
            "error",
            "/reset-password",
            "No active session found. Please try the reset password link again.",
        );
    }

    const { error: updateError } = await supabase.auth.updateUser({
        password: password,
    });

    if (updateError) {
        // pass through the exact error message from Supabase
        return encodedRedirect(
            "error",
            "/reset-password",
            updateError.message
        );
    }

    // sign out after successful password update
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
        console.error("Sign out error:", signOutError);
        // redirect to sign in even if sign out fails
    }

    return encodedRedirect("success", "/sign-in", "Password updated");
};

export const signOutAction = async () => {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Signout error:', error.message);
        return redirect('/'); // or wherever you want to redirect on error
    }

    return redirect("/sign-in");
};

export const sendCustomVerificationAction = async () => {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return redirect("/verify-email?status=error");
    }

    // Extract the email domain
    const emailParts = user.email.split("@");
    if (emailParts.length < 2) {
        return redirect("/verify-email?status=error");
    }
    const emailDomain = emailParts[1].toLowerCase();

    // Fetch allowed domains from the universities table
    const { data: universities, error: uniError } = await supabase
        .from("universities")
        .select("domain");

    if (uniError || !universities || universities.length === 0) {
        console.error("Error fetching university domains:", uniError);
        return redirect("/verify-email?status=error");
    }

    // Check if the user's email domain matches an allowed domain
    const isAllowedDomain = universities.some((uni) => {
        if (uni.domain) {
            return emailDomain.endsWith(uni.domain.toLowerCase());
        }
        return false;
    });

    // If the domain is not allowed, redirect with a query parameter indicating the issue
    if (!isAllowedDomain) {
        return redirect("/verify-email?status=bademail");
    }


    const origin = (await headers()).get("origin");

    const verifyLink = `${origin}/email-verified?token=${user.id}&email=${encodeURIComponent(user.email)}`;

    const { error } = await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Verify your email",
        html: `<p>Click the link below to verify your email:</p>
             <a href="${verifyLink}">${verifyLink}</a>`,
    });

    if (error) {
        console.error("Email error:", error.message);
        return redirect("/verify-email?status=error");
    }

    return redirect("/verify-email?status=sent");
};

export const verifyUserFromToken = async (userId: string, userEmail: string) => {
    const supabase = await createClient();

    const { error } = await supabase
        .from("profiles")
        .upsert(
            { id: userId, email: userEmail, verified_at: new Date().toISOString() },
            { onConflict: "id" }
        );

    if (error) {
        console.error("Upsert error:", error.message);
    }

    return !error;
};

