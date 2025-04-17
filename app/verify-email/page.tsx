"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

// 1) Child: the only place that calls the hook
function VerifyEmailInner() {
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

// 2) Parent: wraps the hook‑using child in Suspense
export default function VerifyEmailStatusPage() {
  return (
    <Suspense fallback={<div>Loading…</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
