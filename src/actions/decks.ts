"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  insertDeck,
  updateDeckById,
  deleteDeckById,
} from "@/db/queries/decks";

// CREATE
const createDeckSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = createDeckSchema.parse(input);
  
  // Call query function
  const deck = await insertDeck({
    name: validated.name,
    description: validated.description,
    userId,
  });
  
  revalidatePath("/decks");
  revalidatePath("/dashboard");
  return deck;
}

// UPDATE
const updateDeckSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

export async function updateDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = updateDeckSchema.parse(input);
  
  // Call query function
  const deck = await updateDeckById(
    validated.id,
    userId,
    {
      name: validated.name,
      description: validated.description,
    }
  );
  
  if (!deck) throw new Error("Deck not found or unauthorized");
  
  revalidatePath("/decks");
  revalidatePath(`/decks/${validated.id}`);
  revalidatePath("/dashboard");
  return deck;
}

// DELETE
const deleteDeckSchema = z.object({
  id: z.number(),
});

type DeleteDeckInput = z.infer<typeof deleteDeckSchema>;

export async function deleteDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = deleteDeckSchema.parse(input);
  
  // Call query function
  const deck = await deleteDeckById(validated.id, userId);
  
  if (!deck) throw new Error("Deck not found or unauthorized");
  
  revalidatePath("/decks");
  revalidatePath("/dashboard");
  return deck;
}
