"use client";                             // ← must be first line
import { useSearchParams } from "next/navigation";

export default function VerifyEmailStatusPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");

  return (
    <div className="flex flex-col justify-center items-center h-screen p-6 text-center">
      <h1 className="text-2xl font-bold">Verify Your Email</h1>

      {status === "sent" && (
        <p className="mt-2">
          A verification email has been sent. Please check your inbox!
        </p>
      )}
      {status === "error" && (
        <p className="mt-2 text-red-600">
          Something went wrong. Please try again.
        </p>
      )}
      {status === "bademail" && (
        <p className="mt-2 text-red-600">
          Your email domain is not allowed. Please sign up with a valid
          university email.
        </p>
      )}
    </div>
  );
}
