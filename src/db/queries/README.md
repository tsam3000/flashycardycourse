# Database Query Functions

This directory contains all database query functions following the data access layer pattern outlined in `.cursor/rules/data-handling.mdc`.

## Structure

Each resource has its own query file:
- `decks.ts` - Query functions for deck operations
- `cards.ts` - Query functions for card operations

## Purpose

Query functions provide a **centralized data access layer** with these benefits:
- ✅ **Reusability** - Use the same query logic across Server Components and Actions
- ✅ **Type Safety** - Properly typed inputs and outputs
- ✅ **Authorization** - Built-in userId checks for security
- ✅ **Maintainability** - All database logic in one place
- ✅ **Testability** - Can be tested independently

## Usage

### In Server Components (Data Retrieval)

```typescript
// app/decks/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/decks";

export default async function DecksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  
  // Call query function - NO direct database access
  const decks = await getUserDecks(userId);
  
  return <div>{/* render decks */}</div>;
}
```

### In Server Actions (Mutations)

```typescript
// actions/decks.ts
"use server";

import { auth } from "@clerk/nextjs/server";
import { insertDeck } from "@/db/queries/decks";

export async function createDeck(input: CreateDeckInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // Validate input with Zod first
  const validated = createDeckSchema.parse(input);
  
  // Call query function
  return await insertDeck({
    name: validated.name,
    description: validated.description,
    userId,
  });
}
```

## Important Rules

### ✅ DO:
- Import query functions in Server Components and Server Actions
- Include `userId` parameters for authorization
- Return typed values (`Deck`, `Deck[]`, `Deck | null`)
- Keep query logic simple and focused

### ❌ DON'T:
- Import `db` directly in Server Components or Actions
- Skip `userId` checks in query functions
- Put validation logic in query functions (validation goes in Server Actions)
- Mix query functions with business logic

## Query Function Patterns

### Standard CRUD Operations

Each resource typically includes these query functions:

```typescript
// READ - List all resources for a user
export async function get[Resources](userId: string): Promise<Resource[]>

// READ - Get single resource by ID with authorization
export async function get[Resource]ById(id: number, userId: string): Promise<Resource | null>

// CREATE - Insert new resource
export async function insert[Resource](data: NewResource): Promise<Resource>

// UPDATE - Update resource with authorization
export async function update[Resource]ById(id: number, userId: string, data: Partial<Resource>): Promise<Resource | null>

// DELETE - Delete resource with authorization
export async function delete[Resource]ById(id: number, userId: string): Promise<Resource | null>
```

### Authorization Pattern

For resources directly owned by users (like decks):
```typescript
export async function getUserDecks(userId: string) {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}
```

For nested resources (like cards within decks):
```typescript
export async function getDeckCards(deckId: number, userId: string) {
  // First verify deck ownership
  const [deck] = await db
    .select()
    .from(decksTable)
    .where(and(
      eq(decksTable.id, deckId),
      eq(decksTable.userId, userId)
    ))
    .limit(1);
  
  if (!deck) return [];
  
  // Then get cards
  return await db
    .select()
    .from(cardsTable)
    .where(eq(cardsTable.deckId, deckId));
}
```

## Testing

Run the test file to verify all query functions work correctly:

```bash
npm run test:db
# or
tsx src/test-db.ts
```

The test file demonstrates proper usage of all query functions.
