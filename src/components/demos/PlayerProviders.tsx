import { useState } from "react";
import * as Player from "@playdeck/react";
import "@playdeck/react/theme.css";
import "./demos.css";

// Sprite Fright (Blender Studio, 2021, CC BY 4.0), from Blender Studio's own
// uploads. loading="interaction" means nothing reaches YouTube or Vimeo until
// someone presses play.
const SOURCES = {
  youtube: "https://www.youtube.com/watch?v=_cMxraX_5RE",
  vimeo: "https://vimeo.com/640499893",
} as const;

type Provider = keyof typeof SOURCES;

const CAPABILITIES = [
  "seek",
  "setVolume",
  "setPlaybackRate",
  "selectQuality",
  "selectTextTrack",
  "fullscreen",
  "pictureInPicture",
] as const;

function Controls() {
  const { ready, playing, muted, fullscreen } = Player.usePlayerState(
    state => ({
      ready: state.activation === "ready" && state.error === null,
      playing: state.playback === "playing",
      muted: state.muted,
      fullscreen: state.fullscreen,
    })
  );
  if (!ready) return null;
  return (
    <Player.Controls>
      <Player.PlayButton>
        {playing ? <Player.PauseIcon /> : <Player.PlayIcon />}
      </Player.PlayButton>
      <Player.SeekSlider />
      <Player.Time type="current" />
      <Player.MuteButton>
        {muted ? <Player.MutedIcon /> : <Player.VolumeHighIcon />}
      </Player.MuteButton>
      <Player.QualityMenu />
      <Player.PlaybackRateMenu />
      <Player.PipButton>
        <Player.PipEnterIcon />
      </Player.PipButton>
      <Player.FullscreenButton>
        {fullscreen ? (
          <Player.FullscreenExitIcon />
        ) : (
          <Player.FullscreenEnterIcon />
        )}
      </Player.FullscreenButton>
    </Player.Controls>
  );
}

function Capabilities() {
  const capabilities = Player.usePlayerState(state => state.capabilities);
  return (
    <ul className="demo-capabilities" aria-label="Capabilities">
      {CAPABILITIES.map(name => {
        const availability = capabilities[name];
        const reason =
          "reason" in availability ? ` (${availability.reason})` : "";
        return (
          <li key={name}>
            <span>{name}</span>
            <span data-status={availability.status}>
              {availability.status}
              {reason}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default function PlayerProviders() {
  const [provider, setProvider] = useState<Provider>("youtube");

  return (
    <div className="demo not-prose">
      <div className="demo-picker" role="group" aria-label="Provider">
        {(Object.keys(SOURCES) as Provider[]).map(option => (
          <button
            key={option}
            type="button"
            className="demo-button"
            aria-pressed={option === provider}
            onClick={() => setProvider(option)}
          >
            {option === "youtube" ? "YouTube" : "Vimeo"}
          </button>
        ))}
      </div>
      <div className="demo-player">
        <Player.Root
          key={provider}
          loading="interaction"
          source={SOURCES[provider]}
        >
          <Player.Viewport>
            <Player.Media />
            <Player.ActivationButton />
            <Player.LoadingIndicator />
            <Player.ErrorDisplay />
            <Controls />
          </Player.Viewport>
          <Capabilities />
        </Player.Root>
      </div>
      <p className="demo-caption">
        The same controls on both. Press play, then compare the capability list
        and the control bar. Nothing loads from either host until you press
        play.
      </p>
    </div>
  );
}
