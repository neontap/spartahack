import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// fix searchParams type to be Message instead of Promise<Message>
export default function ResetPassword({
                                          searchParams
                                      }: {
    searchParams: Message
}) {
    return (
        <form
            className="flex-1 flex flex-col w-full gap-2 text-foreground min-w-64 max-w-64 mx-auto"
            aria-label="Reset password form"
        >
            <div>
                <h1 className="text-2xl font-medium">Reset Password</h1>
                <p className="text-sm text-secondary-foreground">
                    Already have an account?{" "}
                    <Link className="text-primary underline" href="/sign-in">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="flex flex-col gap-2 mt-2">
                <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        required
                        minLength={8}
                        // add basic password requirements
                        pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$"
                        aria-describedby="password-requirements"
                    />
                    <p id="password-requirements" className="text-xs text-secondary-foreground">
                        Password must be at least 8 characters with letters and numbers
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        required
                    />
                </div>

                <SubmitButton formAction={resetPasswordAction}>
                    Reset Password
                </SubmitButton>

                <FormMessage message={searchParams} />
            </div>
        </form>
    );
}