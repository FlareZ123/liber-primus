# Agent5 preregistration: Q-derived MAP/PATH as a p50 pointer instruction

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`.

This is frozen **before reading p50 cells 18 or 2** in this invocation.

## Upstream source-fixed derivation

1. The independently selected p40→p50 cell43 has token `1D`.
2. Its base59/base60 forward displacements are `[29,30]`, the authenticated source indices `[DIRECTION,SEEK]`.
3. Reducing this ordered displacement pair mod29 gives the p3 field basis element `u=[0,1]`.
4. The already-frozen p3 quotient has field evaluation `Q=[17,24]` in `u²=3u+8`.
5. Therefore `Q*u=[18,2]`, authenticated source words `[MAP,PATH]`.

## Frozen p50 consumers

Use the canonical base60 p50 value map; do not tune radix, sign, phase, or source offset after reading the target.

### A. Address-pair readout

Read **p50 cell18 then cell2**, in that order, because the Q output is exactly `[MAP=18, PATH=2]`. Record the two base60 integer values verbatim. If a value is in 0..42, map it to the authenticated signed-source word at that exact zero-based index; if in 0..57, additionally record the physical page with the same number. Otherwise record no indexed source/page receiver.

### B. Self-describing MAP/PATH walk

Interpret `MAP=18` as the p50 starting cell and `PATH=2` as the exact number of canonical base60 pointer hops. Starting at cell18, replace the current cell by its base60 integer value exactly twice. Record both visited values and the terminal cell. No modulo reduction or alternative hop count is allowed.

## Decision

A result is useful only if the frozen readout supplies a new source-typed receiver or operation that can be tested on original ciphertext without adding an offset/key family. An arbitrary in-range index is not plaintext evidence by itself. Failure to produce a source-typed continuation closes this literal MAP/PATH p50 consumer while retaining the independent Q/cell43 cross-lock.
