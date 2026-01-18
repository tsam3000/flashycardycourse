# Server Actions

This directory contains all Server Actions following the data access layer pattern outlined in `.cursor/rules/data-handling.mdc`.

## Structure

Each resource has its own actions file:
- `decks.ts` - Server Actions for deck operations
- `cards.ts` - Server Actions for card operations

## Purpose

Server Actions handle:
- ✅ **Authentication** - Verify user is logged in
- ✅ **Validation** - Validate input with Zod schemas
- ✅ **Authorization** - Check user permissions
- ✅ **Database Operations** - Call query functions from `db/queries/`
- ✅ **Cache Management** - Revalidate paths after mutations

## Important: Separation of Concerns

**Server Actions should NOT contain direct database operations.**

### ✅ CORRECT Pattern:

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { insertDeck } from "@/db/queries/decks";
import { revalidatePath } from "next/cache";

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

export async function createDeck(input: z.infer<typeof createDeckSchema>) {
  // 1. Authentication
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // 2. Validation
  const validated = createDeckSchema.parse(input);
  
  // 3. Database operation via query function
  const deck = await insertDeck({
    name: validated.name,
    description: validated.description,
    userId,
  });
  
  // 4. Cache management
  revalidatePath("/decks");
  
  return deck;
}
```

### ❌ WRONG Pattern:

```typescript
"use server";

import { db } from "@/db"; // ❌ Don't import db directly
import { decksTable } from "@/db/schema";

export async function createDeck(input: any) {
  // ❌ No validation
  // ❌ Direct database access
  const [deck] = await db.insert(decksTable).values(input).returning();
  return deck;
}
```

## Usage in Client Components

```typescript
"use client";

import { createDeck } from "@/actions/decks";
import { useTransition } from "react";

export function CreateDeckForm() {
  const [isPending, startTransition] = useTransition();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      await createDeck({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
      });
    });
  };
  
  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

## Validation with Zod

All Server Actions **must** validate input using Zod schemas:

```typescript
// Define schema
const updateDeckSchema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
});

// Infer TypeScript type
type UpdateDeckInput = z.infer<typeof updateDeckSchema>;

// Use in Server Action
export async function updateDeck(input: UpdateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Validate
  const validated = updateDeckSchema.parse(input);
  
  // Call query function with validated data
  const deck = await updateDeckById(validated.id, userId, {
    name: validated.name,
    description: validated.description,
  });
  
  if (!deck) throw new Error("Deck not found");
  
  revalidatePath("/decks");
  return deck;
}
```

## Error Handling

Server Actions should throw errors that can be caught by the client:

```typescript
export async function deleteDeck(input: DeleteDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  const validated = deleteDeckSchema.parse(input);
  
  const deck = await deleteDeckById(validated.id, userId);
  
  // Throw error if operation failed
  if (!deck) throw new Error("Deck not found or unauthorized");
  
  revalidatePath("/decks");
  return deck;
}
```

## Cache Revalidation

Always revalidate affected paths after mutations:

```typescript
// After creating a deck
revalidatePath("/decks");
revalidatePath("/dashboard");

// After updating a deck
revalidatePath("/decks");
revalidatePath(`/decks/${deckId}`);

// After deleting a deck
revalidatePath("/decks");
```

## Key Takeaways

1. ✅ Server Actions handle **authentication, validation, and cache management**
2. ✅ Database operations are **delegated to query functions**
3. ✅ All input is **validated with Zod schemas**
4. ✅ Paths are **revalidated after mutations**
5. ❌ **Never** import `db` directly in Server Actions
6. ❌ **Never** skip validation
