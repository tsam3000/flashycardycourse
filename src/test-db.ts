import 'dotenv/config';
import {
  insertDeck,
  getUserDecks,
  updateDeckById,
  deleteDeckById,
} from './db/queries/decks';
import {
  insertCard,
  getDeckCards,
  updateCardById,
  deleteCardById,
} from './db/queries/cards';

async function main() {
  console.log('Testing database connection with query functions...\n');

  // Test user ID (simulating Clerk user)
  const testUserId = 'test-user-123';

  // CREATE - Create a new deck
  console.log('1. Creating a new deck...');
  const newDeck = await insertDeck({
    name: 'Spanish Vocabulary',
    description: 'Basic Spanish words and phrases',
    userId: testUserId,
  });
  console.log('✓ Deck created:', newDeck);

  // READ - Get all decks for user
  console.log('\n2. Getting all decks for user...');
  const decks = await getUserDecks(testUserId);
  console.log('✓ User decks:', decks);

  // CREATE - Add cards to the deck
  console.log('\n3. Adding cards to deck...');
  const card1 = await insertCard(
    {
      deckId: newDeck.id,
      front: 'Hello',
      back: 'Hola',
    },
    testUserId
  );
  console.log('✓ Card 1 created:', card1);

  const card2 = await insertCard(
    {
      deckId: newDeck.id,
      front: 'Goodbye',
      back: 'Adiós',
    },
    testUserId
  );
  console.log('✓ Card 2 created:', card2);

  // READ - Get all cards in deck
  console.log('\n4. Getting all cards in deck...');
  const cards = await getDeckCards(newDeck.id, testUserId);
  console.log('✓ Deck cards:', cards);

  // UPDATE - Update deck
  console.log('\n5. Updating deck...');
  const updatedDeck = await updateDeckById(
    newDeck.id,
    testUserId,
    {
      name: 'Spanish Vocabulary - Beginner',
      description: 'Basic Spanish words and phrases for beginners',
    }
  );
  console.log('✓ Deck updated:', updatedDeck);

  // UPDATE - Update card
  if (card1) {
    console.log('\n6. Updating card...');
    const updatedCard = await updateCardById(
      card1.id,
      newDeck.id,
      testUserId,
      {
        front: 'Hello (formal)',
        back: 'Buenos días',
      }
    );
    console.log('✓ Card updated:', updatedCard);
  }

  // DELETE - Delete a card
  if (card2) {
    console.log('\n7. Deleting a card...');
    const deletedCard = await deleteCardById(card2.id, newDeck.id, testUserId);
    console.log('✓ Card deleted:', deletedCard);
  }

  // DELETE - Delete the deck (this will cascade delete remaining cards)
  console.log('\n8. Deleting deck...');
  const deletedDeck = await deleteDeckById(newDeck.id, testUserId);
  console.log('✓ Deck deleted:', deletedDeck);

  console.log('\n✅ All database operations completed successfully!');
  console.log('✅ All operations used query functions from db/queries/');
}

main()
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
