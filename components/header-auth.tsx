import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
// import { createClient } from "@/utils/supabase/server";
import {createClient} from "@supabase/supabase-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";

export default async function HeaderAuth() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;
  const initials = email ? email.substring(0, 2).toUpperCase() : "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={email} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>{email}</span>
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
