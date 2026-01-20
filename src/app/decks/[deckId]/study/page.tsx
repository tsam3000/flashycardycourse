import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { getDeckById } from "@/db/queries/decks";
import { getDeckCards } from "@/db/queries/cards";
import { FlashcardStudy } from "@/components/FlashcardStudy";

export default async function StudyPage({
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
    <div className="container mx-auto py-8 px-4">
      <FlashcardStudy 
        deck={deck} 
        cards={cards} 
      />
    </div>
  );
}
