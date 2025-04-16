import { verifyUserFromToken } from "@/app/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EmailVerifiedPage({ searchParams }) {
  // Extract token and email from URL query parameters
  const token = searchParams?.token;
  const email = searchParams?.email;

  // Check that both token and email are provided
  if (!token || !email) return notFound();

  const success = await verifyUserFromToken(token, email);
  if (!success) return notFound();

  return (
    <div className="flex flex-col justify-center items-center h-screen p-6 text-center">
      <h1 className="text-2xl font-bold">Email Verified</h1>
      <p className="text-sm text-gray-600 mt-2">You're all set!</p>

      <div className="mt-6">
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
