import { sendCustomVerificationAction, signOutAction } from "@/app/actions";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, BookOpen } from "lucide-react";

export default async function HeaderAuth() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    console.log('user', user)
    if (!user) {
        return (
            <div className="flex gap-2">
                <Button asChild size="sm" variant="default">
                    <Link href="/sign-in">Log in</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                    <Link href="/sign-up">Sign up</Link>
                </Button>
            </div>
        );
    }

    // Fetch the user's profile (e.g. for the verified_at field)
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("verified_at")
        .eq("id", user.id)
        .maybeSingle();

    // If fetching the profile failed or no profile exists, assume unverified.
    const verified = profile && profile.verified_at ? true : false;

    const avatarUrl = user?.user_metadata?.avatar_url;
    const email = user?.email;
    const initials = email ? email.substring(0, 2).toUpperCase() : "?";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        {/* <AvatarImage src={avatarUrl} alt={email} />*/}
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    {/* Verification Indicator: */}
                    <span
                        className={`absolute bottom-0 right-0 translate-x-1 translate-y-0 block h-3 w-3 rounded-full border-2 border-white
              ${verified ? "bg-green-500" : "bg-red-500"}`}
                    ></span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{email}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/my-reviews" className="flex items-center gap-2 w-full">
                        <BookOpen className="h-4 w-4" />
                        <span>My Reviews</span>
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                    <form className="w-full" action={sendCustomVerificationAction}>
                        <button className="w-full text-left flex items-center gap-2">
                            <span>Verify Email</span>
                            <span
                                className={`h-3 w-3 rounded-full ${
                                    verified ? "bg-green-500" : "bg-red-500"
                                }`}
                            ></span>
                        </button>
                    </form>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <form action={signOutAction} className="w-full">
                        <button className="w-full text-left">Sign out</button>
                    </form>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}