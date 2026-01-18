"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  insertCard,
  updateCardById,
  deleteCardById,
} from "@/db/queries/cards";

// CREATE
const createCardSchema = z.object({
  deckId: z.number(),
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
});

type CreateCardInput = z.infer<typeof createCardSchema>;

export async function createCard(input: CreateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = createCardSchema.parse(input);
  
  // Call query function
  const card = await insertCard(
    {
      deckId: validated.deckId,
      front: validated.front,
      back: validated.back,
    },
    userId
  );
  
  if (!card) throw new Error("Deck not found or unauthorized");
  
  revalidatePath(`/decks/${validated.deckId}`);
  return card;
}

// UPDATE
const updateCardSchema = z.object({
  id: z.number(),
  deckId: z.number(),
  front: z.string().min(1, "Front text is required"),
  back: z.string().min(1, "Back text is required"),
});

type UpdateCardInput = z.infer<typeof updateCardSchema>;

export async function updateCard(input: UpdateCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = updateCardSchema.parse(input);
  
  // Call query function
  const card = await updateCardById(
    validated.id,
    validated.deckId,
    userId,
    {
      front: validated.front,
      back: validated.back,
    }
  );
  
  if (!card) throw new Error("Card not found or unauthorized");
  
  revalidatePath(`/decks/${validated.deckId}`);
  return card;
}

// DELETE
const deleteCardSchema = z.object({
  id: z.number(),
  deckId: z.number(),
});

type DeleteCardInput = z.infer<typeof deleteCardSchema>;

export async function deleteCard(input: DeleteCardInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = deleteCardSchema.parse(input);
  
  // Call query function
  const card = await deleteCardById(validated.id, validated.deckId, userId);
  
  if (!card) throw new Error("Card not found or unauthorized");
  
  revalidatePath(`/decks/${validated.deckId}`);
  return card;
}
