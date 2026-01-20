"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, RotateCcw, BookOpen, Shuffle, CheckCircle, XCircle } from "lucide-react";
import type { InferSelectModel } from "drizzle-orm";
import type { decksTable, cardsTable } from "@/db/schema";

type Deck = InferSelectModel<typeof decksTable>;
type Card = InferSelectModel<typeof cardsTable>;

interface FlashcardStudyProps {
  deck: Deck;
  cards: Card[];
}

export function FlashcardStudy({ deck, cards }: FlashcardStudyProps) {
  const [studyCards, setStudyCards] = useState(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent default behavior for space bar to avoid page scroll
      if (event.code === "Space") {
        event.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        if (currentIndex > 0) {
          setCurrentIndex(currentIndex - 1);
          setIsFlipped(false);
        }
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        if (currentIndex < studyCards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setIsFlipped(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex, studyCards.length]);

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Deck
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{deck.name}</CardTitle>
            {deck.description && (
              <CardDescription className="text-base">{deck.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              This deck has no cards to study. Add some cards to get started!
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/decks/${deck.id}`} className="w-full">
              <Button className="w-full">
                <BookOpen className="h-4 w-4 mr-2" />
                Go to Deck
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];
  const progress = `${currentIndex + 1} / ${studyCards.length}`;
  const progressPercentage = ((currentIndex + 1) / studyCards.length) * 100;

  const handleNext = () => {
    if (currentIndex < studyCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const handleShuffle = () => {
    // Fisher-Yates shuffle algorithm
    const shuffled = [...studyCards];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectCount(0);
    setIncorrectCount(0);
  };

  const handleCorrect = () => {
    setCorrectCount(correctCount + 1);
    handleNext();
  };

  const handleIncorrect = () => {
    setIncorrectCount(incorrectCount + 1);
    handleNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/decks/${deck.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deck
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShuffle}>
            <Shuffle className="h-4 w-4 mr-2" />
            Shuffle
          </Button>
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">{deck.name}</CardTitle>
          {deck.description && (
            <CardDescription className="text-base">{deck.description}</CardDescription>
          )}
        </CardHeader>
      </Card>

      <div className="mb-6 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Progress</span>
            <span className="text-sm font-medium text-muted-foreground">{progress}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
        
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-lg font-semibold text-green-500">{correctCount}</span>
            <span className="text-sm text-muted-foreground">Correct</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-lg font-semibold text-red-500">{incorrectCount}</span>
            <span className="text-sm text-muted-foreground">Incorrect</span>
          </div>
        </div>
      </div>

      <Card 
        className="mb-6 cursor-pointer hover:shadow-lg transition-shadow min-h-[300px] flex flex-col"
        onClick={handleFlip}
      >
        <CardHeader>
          <CardTitle className="text-center text-muted-foreground">
            {isFlipped ? "Back" : "Front"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <p className="text-2xl text-center whitespace-pre-wrap wrap-break-word">
            {isFlipped ? currentCard.back : currentCard.front}
          </p>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">Click to flip</p>
        </CardFooter>
      </Card>

      {isFlipped ? (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleIncorrect}
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <XCircle className="h-5 w-5 mr-2" />
              Incorrect
            </Button>
            <Button
              variant="outline"
              onClick={handleCorrect}
              className="flex-1 border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Correct
            </Button>
          </div>
          <div className="flex gap-4 justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === studyCards.length - 1}
              variant="ghost"
              size="sm"
            >
              Skip
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleFlip}
            variant="secondary"
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Flip Card
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === studyCards.length - 1}
            className="flex-1"
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {currentIndex === studyCards.length - 1 && isFlipped && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground mb-4">
              You&apos;ve reached the end of this deck!
            </p>
            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <span className="text-3xl font-bold text-green-500">{correctCount}</span>
                </div>
                <span className="text-sm text-muted-foreground">Correct</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="h-6 w-6 text-red-500" />
                  <span className="text-3xl font-bold text-red-500">{incorrectCount}</span>
                </div>
                <span className="text-sm text-muted-foreground">Incorrect</span>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="default">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Link href={`/decks/${deck.id}`}>
                <Button variant="outline">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Back to Deck
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
