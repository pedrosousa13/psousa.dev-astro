import * as Deck from "@carouseldeck/react";
import "./demos.css";

export default function CarouselQuickstart() {
  return (
    <div className="demo not-prose">
      <Deck.Root aria-label="Quickstart demo">
        <Deck.Viewport>
          <Deck.Slide>Slide one</Deck.Slide>
          <Deck.Slide>Slide two</Deck.Slide>
          <Deck.Slide>Slide three</Deck.Slide>
        </Deck.Viewport>
        <Deck.Prev className="demo-button" />
        <Deck.Next className="demo-button" />
        <Deck.Dots />
        <Deck.Counter />
      </Deck.Root>
      <p className="demo-caption">
        Swipe, drag, use a trackpad, or focus the slides and use the arrow keys.
      </p>
    </div>
  );
}
