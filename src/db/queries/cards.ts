import { db } from "@/db";
import { cardsTable, decksTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

type Card = InferSelectModel<typeof cardsTable>;
type NewCard = InferInsertModel<typeof cardsTable>;

// READ - Get all cards for a deck (with user authorization)
export async function getDeckCards(deckId: number, userId: string): Promise<Card[]> {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) {
    return [];
  }
  
  // Get all cards for this deck
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}

// READ - Get a single card by ID (with user authorization)
export async function getCardById(
  cardId: number,
  deckId: number,
  userId: string
): Promise<Card | null> {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) {
    return null;
  }
  
  // Get the card
  const [card] = await db
    .select()
    .from(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .limit(1);
  
  return card || null;
}

// CREATE - Insert a new card
export async function insertCard(data: NewCard, userId: string): Promise<Card | null> {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, data.deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) {
    return null;
  }
  
  const [card] = await db
    .insert(cardsTable)
    .values(data)
    .returning();
  
  return card;
}

// UPDATE - Update a card (with user authorization)
export async function updateCardById(
  cardId: number,
  deckId: number,
  userId: string,
  data: { front?: string; back?: string }
): Promise<Card | null> {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) {
    return null;
  }
  
  // Update the card
  const [card] = await db
    .update(cardsTable)
    .set(data)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return card || null;
}

// DELETE - Delete a card (with user authorization)
export async function deleteCardById(
  cardId: number,
  deckId: number,
  userId: string
): Promise<Card | null> {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) {
    return null;
  }
  
  // Delete the card
  const [card] = await db
    .delete(cardsTable)
    .where(and(
      eq(cardsTable.id, cardId),
      eq(cardsTable.deckId, deckId)
    ))
    .returning();
  
  return card || null;
}
