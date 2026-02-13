import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getUserDecks } from "@/db/queries/decks";
import { CreateDeckButton } from "@/components/CreateDeckButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Force dynamic rendering to prevent caching issues after authentication
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId, has } = await auth();

  if (!userId) {
    redirect("/");
  }

  const decks = await getUserDecks(userId);
  const hasUnlimitedDecks = has({ feature: 'unlimited_decks' });
  const hasProPlan = has({ plan: 'pro' });
  const deckCount = decks.length;
  const isAtLimit = !hasUnlimitedDecks && deckCount >= 3;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            {hasProPlan && (
              <Badge variant="default" className="text-sm px-3 py-1">
                Pro
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            {decks.length === 0 
              ? "You don't have any decks yet. Create your first deck to get started!"
              : `You have ${decks.length} ${decks.length === 1 ? 'deck' : 'decks'}.`
            }
          </p>
          {!hasUnlimitedDecks && (
            <p className="text-sm text-muted-foreground mt-1">
              Free plan: {deckCount}/3 decks used
            </p>
          )}
        </div>
        {isAtLimit ? (
          <div className="text-right">
            <Button disabled size="lg">
              Deck Limit Reached
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              <Link href="/pricing" className="text-primary hover:underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited decks
            </p>
          </div>
        ) : (
          <CreateDeckButton />
        )}
      </div>

      {!hasUnlimitedDecks && !isAtLimit && deckCount > 0 && (
        <div className="mb-6 p-4 bg-muted rounded-lg border">
          <p className="text-sm">
            You&apos;re using {deckCount} of 3 free decks.{" "}
            <Link href="/pricing" className="text-primary hover:underline font-medium">
              Upgrade to Pro
            </Link>{" "}
            for unlimited decks and AI flashcard generation.
          </p>
        </div>
      )}

      {isAtLimit && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-medium mb-1">Deck Limit Reached</p>
          <p className="text-sm text-muted-foreground">
            You&apos;ve reached the maximum of 3 decks on the free plan.{" "}
            <Link href="/pricing" className="text-primary hover:underline font-medium">
              Upgrade to Pro
            </Link>{" "}
            for unlimited decks and additional features.
          </p>
        </div>
      )}

      {decks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No decks found</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {decks.map((deck) => (
            <Link key={deck.id} href={`/decks/${deck.id}`} className="block">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle>{deck.name}</CardTitle>
                  <CardDescription>
                    {deck.description || "No description"}
                  </CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last updated: {new Date(deck.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric"
                    })}
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
