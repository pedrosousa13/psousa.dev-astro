import * as Deck from "@carouseldeck/react";
import "./demos.css";

// Each slide shrinks with its distance from the focal one, read from
// --deck-slide-progress in CSS. No React state is involved.
export default function CarouselProgress() {
  return (
    <div className="demo not-prose">
      <Deck.Root aria-label="Scaled by progress" className="demo-progress">
        <Deck.Viewport>
          <Deck.Slide>One</Deck.Slide>
          <Deck.Slide>Two</Deck.Slide>
          <Deck.Slide>Three</Deck.Slide>
          <Deck.Slide>Four</Deck.Slide>
          <Deck.Slide>Five</Deck.Slide>
        </Deck.Viewport>
        <Deck.Prev className="demo-button" />
        <Deck.Next className="demo-button" />
      </Deck.Root>
      <p className="demo-caption">
        The scale comes from one CSS rule on <code>--deck-slide-progress</code>.
      </p>
    </div>
  );
}
