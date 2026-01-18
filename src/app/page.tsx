import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight">FlashCardy</h1>
        <p className="text-xl text-muted-foreground">
          Your personal flashcard platform.
        </p>
        <div className="flex gap-4 mt-4">
          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <Button>Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
            <Button variant="outline">Sign Up</Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
