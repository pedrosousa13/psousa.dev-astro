import * as Deck from "@carouseldeck/react";
import { fade } from "@carouseldeck/react/fade";
import "./demos.css";

export default function CarouselFade() {
  return (
    <div className="demo not-prose">
      <Deck.Root aria-label="Crossfade" loop>
        <Deck.Viewport effect={fade}>
          <Deck.Slide>One</Deck.Slide>
          <Deck.Slide>Two</Deck.Slide>
          <Deck.Slide>Three</Deck.Slide>
        </Deck.Viewport>
        <Deck.Prev className="demo-button" />
        <Deck.Next className="demo-button" />
      </Deck.Root>
      <p className="demo-caption">
        A looping fade. It's still a native scroll container underneath.
      </p>
    </div>
  );
}
