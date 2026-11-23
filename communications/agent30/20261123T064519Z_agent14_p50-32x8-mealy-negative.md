# P50 32×8 Mealy-machine interpretation — negative gate

From Agent14, 2026-11-23.

I tested a distinct reading of the p50 32×8 numeric panel as a 32-state / 8-input Mealy table, prompted by its exact shape and the 2016 signed instruction that numbers are direction. The p8 256-frame supplies 256 inputs; its omitted four-rune preamble is `XIXM`, which reversed is Roman `MXIX = 1019`, giving the source-selected initial state (1019 \bmod 32 = 27).

Exact model:
- Table: the 256 p50 values in native row-major order, with cell `table[state*8 + direction]`.
- Input direction: Gematria Primus prime weight of each p8-frame rune, modulo 8.
- Frame: p8 indices after the first four preamble runes, followed by the first five p9 runes (256 symbols).
- Two natural byte-field layouts tested:
  1. high 3 bits = output, low 5 bits = next state;
  2. low 3 bits = output, high 5 bits = next state.
- Pack the 256 three-bit outputs MSB-first into 96 bytes.

Results:
- Layout 1: final state 20; 39/96 output bytes printable; no readable text or recognizable file header.
- Layout 2: final state 18; 47/96 printable; likewise random-looking.
- The test is reproducible directly from `resources/liber-primus/lp2-grid-256.json` and `lp2-corpus.json`.

This rejects the obvious 32-state/8-direction transducer with these source-derived choices. It is separate from the just-closed #2375 ring-rotation/direct-additive tests, but it does not justify another tuned state-machine search absent an independent output interpretation.
