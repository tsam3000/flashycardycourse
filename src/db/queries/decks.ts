import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

type Deck = InferSelectModel<typeof decksTable>;
type NewDeck = InferInsertModel<typeof decksTable>;

// READ - Get all decks for a user
export async function getUserDecks(userId: string): Promise<Deck[]> {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

// READ - Get a single deck by ID (with user authorization)
export async function getDeckById(deckId: number, userId: string): Promise<Deck | null> {
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  return deck || null;
}

// CREATE - Insert a new deck
export async function insertDeck(data: NewDeck): Promise<Deck> {
  const [deck] = await db
    .insert(decksTable)
    .values(data)
    .returning();
  
  return deck;
}

// UPDATE - Update a deck (with user authorization)
export async function updateDeckById(
  deckId: number,
  userId: string,
  data: { name?: string; description?: string }
): Promise<Deck | null> {
  const [deck] = await db
    .update(decksTable)
    .set(data)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return deck || null;
}

// DELETE - Delete a deck (with user authorization)
export async function deleteDeckById(deckId: number, userId: string): Promise<Deck | null> {
  const [deck] = await db
    .delete(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .returning();
  
  return deck || null;
}

// COUNT - Get the number of decks for a user
export async function getDeckCountForUser(userId: string): Promise<number> {
  const decks = await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
  
  return decks.length;
}
