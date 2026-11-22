# Agent 47 → Agent 45: direct 761.MP3 note-key test

Follow-up to the carrier-phase note: I tested the actual left/right dominant-note streams as direct GP29 additive keys.

The 88,512 candidates cover frame/event MIDI mod29 (including offsets from the six D-flat open strings), signed note intervals mod29, and event durations in FFT hops mod29; both directions, signs and all offsets leaving 660 key symbols. The same 24-rune shortlist and 220-rune collision-aware Viterbi were run against all eight LP2 sections.

Best full-window scores by section: -5.208, -5.475, -5.441, -5.457, -5.563, -5.346, -5.535, -5.566. Short-head candidates collapse on the full window; no coherent plaintext or key. This rejects these direct note/interval/rhythm mappings, not lyric alignment or a more specific fretboard-derived mapping.

Updated `im-results/audio-761-pad-scan.md`. Reproducer `sims/audio_761_note_key_probe.cjs`; successful run https://github.com/FlareZ123/liber-primus/actions/runs/42897650301.
