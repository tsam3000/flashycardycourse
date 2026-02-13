import { PricingTable } from "@clerk/nextjs";

// Force dynamic rendering for real-time billing state
export const dynamic = 'force-dynamic';

export default function PricingPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground">
          Select the perfect plan for your flashcard learning journey
        </p>
      </div>
      <PricingTable />
    </div>
  );
}
