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
import { updateCard, deleteCard } from "@/actions/cards";
import { Trash2 } from "lucide-react";

interface EditableCardProps {
  card: {
    id: number;
    deckId: number;
    front: string;
    back: string;
  };
}

export function EditableCard({ card }: EditableCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
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
        setIsEditOpen(false);
      } catch (error) {
        console.error("Failed to update card:", error);
        alert("Failed to update card. Please try again.");
      }
    });
  };

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteCard({
          id: card.id,
          deckId: card.deckId,
        });
        setIsDeleteOpen(false);
      } catch (error) {
        console.error("Failed to delete card:", error);
        alert("Failed to delete card. Please try again.");
      }
    });
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="space-y-2">
        <CardTitle className="text-base text-center">Front</CardTitle>
        <CardDescription className="text-center min-h-[60px]">
          {card.front}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm text-center">Back</h3>
          <p className="text-foreground text-sm text-center min-h-[60px]">
            {card.back}
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit Card</DialogTitle>
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
                    onClick={() => setIsEditOpen(false)}
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

          <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Delete Card</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this card? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-2 p-4 bg-muted rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Front:</p>
                    <p className="text-sm text-muted-foreground">{card.front}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Back:</p>
                    <p className="text-sm text-muted-foreground">{card.back}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isPending}
                >
                  {isPending ? "Deleting..." : "Delete"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
