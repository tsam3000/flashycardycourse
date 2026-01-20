import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getDeckById } from "@/db/queries/decks";
import { getDeckCards } from "@/db/queries/cards";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EditableCard } from "@/components/EditableCard";
import { AddCardButton } from "@/components/AddCardButton";
import { EditDeckButton } from "@/components/EditDeckButton";
import { DeleteDeckButton } from "@/components/DeleteDeckButton";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function DeckPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/");
  }

  const { deckId } = await params;
  const deckIdNumber = parseInt(deckId, 10);

  if (isNaN(deckIdNumber)) {
    notFound();
  }

  // Fetch deck and cards using query functions
  const deck = await getDeckById(deckIdNumber, userId);
  
  if (!deck) {
    notFound();
  }

  const cards = await getDeckCards(deckIdNumber, userId);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl">{deck.name}</CardTitle>
              {deck.description && (
                <CardDescription className="text-lg mt-2">
                  {deck.description}
                </CardDescription>
              )}
            </div>
            <div className="flex gap-2">
              <EditDeckButton 
                deckId={deckIdNumber} 
                currentName={deck.name}
                currentDescription={deck.description}
              />
              <DeleteDeckButton 
                deckId={deckIdNumber}
                deckName={deck.name}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {cards.length} {cards.length === 1 ? "card" : "cards"}
          </p>
          <div className="flex gap-3">
            <Link href={`/decks/${deckIdNumber}/study`}>
              <Button variant="default">
                <BookOpen className="h-4 w-4 mr-2" />
                Study Deck
              </Button>
            </Link>
            <AddCardButton deckId={deckIdNumber} />
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Cards</h2>
        {cards.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                No cards yet. Create your first card to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <EditableCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
