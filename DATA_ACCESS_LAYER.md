# Data Access Layer Implementation

This document explains the data access layer pattern implemented in this codebase.

## Overview

All database operations now follow a **centralized data access layer pattern** with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Components                       │
│                     ("use client")                          │
└────────────────────────┬────────────────────────────────────┘
                         │ Call Server Actions
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Server Actions                          │
│              (src/actions/*.ts)                             │
│                                                              │
│  • Authenticate user (Clerk)                                │
│  • Validate input (Zod)                                     │
│  • Call query functions                                     │
│  • Revalidate cache                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ Call Query Functions
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Query Functions                         │
│              (src/db/queries/*.ts)                          │
│                                                              │
│  • Execute database operations                              │
│  • Include authorization checks                             │
│  • Return typed results                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ Direct database access
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Database                              │
│                   (PostgreSQL + Drizzle)                    │
└─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── actions/              # Server Actions (validation + orchestration)
│   ├── README.md
│   ├── decks.ts
│   └── cards.ts
├── db/
│   ├── index.ts         # Database connection
│   ├── schema.ts        # Database schema
│   └── queries/         # Query functions (data access layer)
│       ├── README.md
│       ├── decks.ts
│       └── cards.ts
├── app/                 # Next.js app directory
│   └── */page.tsx      # Server Components (call query functions)
└── components/          # React components
    └── */              # Client Components
```

## Implementation Details

### 1. Query Functions (`src/db/queries/`)

**Purpose**: Centralized database operations with built-in authorization.

**Example**: `src/db/queries/decks.ts`

```typescript
import { db } from "@/db";
import { decksTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

type Deck = InferSelectModel<typeof decksTable>;
type NewDeck = InferInsertModel<typeof decksTable>;

// Get all decks for a user
export async function getUserDecks(userId: string): Promise<Deck[]> {
  return await db
    .select()
    .from(decksTable)
    .where(eq(decksTable.userId, userId));
}

// Insert a new deck
export async function insertDeck(data: NewDeck): Promise<Deck> {
  const [deck] = await db
    .insert(decksTable)
    .values(data)
    .returning();
  
  return deck;
}
```

### 2. Server Actions (`src/actions/`)

**Purpose**: Handle authentication, validation, and orchestrate query functions.

**Example**: `src/actions/decks.ts`

```typescript
"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { insertDeck } from "@/db/queries/decks";

const createDeckSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
});

type CreateDeckInput = z.infer<typeof createDeckSchema>;

export async function createDeck(input: CreateDeckInput) {
  // 1. Authenticate
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  
  // 2. Validate
  const validated = createDeckSchema.parse(input);
  
  // 3. Execute via query function
  const deck = await insertDeck({
    name: validated.name,
    description: validated.description,
    userId,
  });
  
  // 4. Revalidate cache
  revalidatePath("/decks");
  
  return deck;
}
```

### 3. Server Components (`src/app/*/page.tsx`)

**Purpose**: Fetch data using query functions and render UI.

**Example**:

```typescript
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserDecks } from "@/db/queries/decks";

export default async function DecksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");
  
  // Fetch data using query function
  const decks = await getUserDecks(userId);
  
  return (
    <div>
      {decks.map(deck => (
        <div key={deck.id}>{deck.name}</div>
      ))}
    </div>
  );
}
```

### 4. Client Components

**Purpose**: Handle interactivity and call Server Actions.

**Example**:

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

## Benefits

### 1. **Reusability**
Query functions can be used in multiple Server Components and Actions without duplicating database logic.

### 2. **Type Safety**
All query functions are fully typed with TypeScript, reducing runtime errors.

### 3. **Security**
Authorization is built into query functions, ensuring users can only access their own data.

### 4. **Maintainability**
Changes to database operations only need to be made in one place.

### 5. **Testability**
Query functions can be tested independently from Server Actions and Components.

### 6. **Separation of Concerns**
- **Query Functions**: Database operations
- **Server Actions**: Validation, authentication, orchestration
- **Server Components**: Data fetching and rendering
- **Client Components**: Interactivity

## Testing

A comprehensive test file demonstrates all query functions:

```bash
# Run the test
npm run test:db
# or
tsx src/test-db.ts
```

The test covers:
- ✅ Creating decks
- ✅ Reading decks
- ✅ Updating decks
- ✅ Deleting decks
- ✅ Creating cards
- ✅ Reading cards
- ✅ Updating cards
- ✅ Deleting cards
- ✅ Authorization checks

## Migration Summary

### What Was Done

1. ✅ Created `src/db/queries/` directory with query functions for:
   - Decks (CRUD operations)
   - Cards (CRUD operations with deck ownership verification)

2. ✅ Created `src/actions/` directory with Server Actions for:
   - Deck operations (create, update, delete)
   - Card operations (create, update, delete)

3. ✅ Updated `src/test-db.ts` to demonstrate proper usage of query functions

4. ✅ Created documentation:
   - `src/db/queries/README.md` - Query functions documentation
   - `src/actions/README.md` - Server Actions documentation
   - This file - Complete implementation guide

### What Needs to Be Done

When you add new features:

1. **Database Schema**: Define tables in `src/db/schema.ts`
2. **Query Functions**: Create query file in `src/db/queries/[resource].ts`
3. **Server Actions**: Create actions file in `src/actions/[resource].ts`
4. **Server Components**: Use query functions to fetch data
5. **Client Components**: Call Server Actions for mutations

## Rules Enforcement

This pattern is enforced by `.cursor/rules/data-handling.mdc`:

### ✅ MUST DO:
- Use query functions from `src/db/queries/` for all database operations
- Validate input with Zod in Server Actions
- Include `userId` checks in all query functions
- Call `revalidatePath()` after mutations

### ❌ MUST NOT DO:
- Import `db` directly in Server Components or Actions
- Skip validation in Server Actions
- Use FormData as a type
- Perform database operations in Client Components

## Related Documentation

- `.cursor/rules/data-handling.mdc` - Complete data handling rules
- `.cursor/rules/auth-and-authorization.mdc` - Authorization patterns
- `.cursor/rules/database-interactions.mdc` - Drizzle ORM usage
- `src/db/queries/README.md` - Query functions guide
- `src/actions/README.md` - Server Actions guide

## Questions?

For any questions about this pattern, refer to:
1. The rule files in `.cursor/rules/`
2. The README files in `src/db/queries/` and `src/actions/`
3. The example implementations in `src/test-db.ts`
