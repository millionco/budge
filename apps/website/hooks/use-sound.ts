import { useCallback } from "react";
import { defineSound, ensureReady } from "@web-kits/audio";

// "hover" from the mechanical patch at audio.raphaelsalaja.com/library/mechanical.
const hover = defineSound({
  source: { type: "noise", color: "white" },
  filter: { type: "highpass", frequency: 6000 },
  envelope: { attack: 0, decay: 0.008, sustain: 0, release: 0.003 },
  gain: 0.05,
});

type SoundOptions = { volume?: number };

// Signature preserved for call-site compatibility — every sound is now the
// mechanical "hover" tick. The `src` and `volume` args are ignored; swap in a
// different `defineSound(...)` above (or per-call) when you want variety.
export function useSound(
  _src?: unknown,
  _options: SoundOptions = {},
): [() => void, { stop: () => void }] {
  const play = useCallback(() => {
    ensureReady();
    hover();
  }, []);

  const stop = useCallback(() => {}, []);

  return [play, { stop }];
}
