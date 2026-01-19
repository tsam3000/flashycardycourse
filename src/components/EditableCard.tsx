"use client";

import { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateCard } from "@/actions/cards";

interface EditableCardProps {
  card: {
    id: number;
    deckId: number;
    front: string;
    back: string;
  };
  cardNumber: number;
}

export function EditableCard({ card, cardNumber }: EditableCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [front, setFront] = useState(card.front);
  const [back, setBack] = useState(card.back);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await updateCard({
          id: card.id,
          deckId: card.deckId,
          front,
          back,
        });
        setIsOpen(false);
      } catch (error) {
        console.error("Failed to update card:", error);
        alert("Failed to update card. Please try again.");
      }
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-4">
        <div className="flex justify-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {cardNumber}
          </div>
        </div>
        <div className="space-y-2">
          <CardTitle className="text-base text-center">Front</CardTitle>
          <CardDescription className="text-center min-h-[60px]">
            {card.front}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-center">Back</h3>
          <p className="text-foreground text-sm text-center min-h-[60px]">
            {card.back}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              Edit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Card {cardNumber}</DialogTitle>
                <DialogDescription>
                  Make changes to your flashcard here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="front">Front</Label>
                  <Textarea
                    id="front"
                    value={front}
                    onChange={(e) => setFront(e.target.value)}
                    placeholder="Enter the front of the card..."
                    required
                    rows={3}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="back">Back</Label>
                  <Textarea
                    id="back"
                    value={back}
                    onChange={(e) => setBack(e.target.value)}
                    placeholder="Enter the back of the card..."
                    required
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
