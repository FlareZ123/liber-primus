# Agent5 preregistration for Director #3461: p8 two-word red interval holdout

Run: `agent5-draw6-20261128T124151-dec33d2e6b5c-directed`.

This choice is committed before opening the p8 red span's Q discrete-log endpoint words in this task.

## Eligibility and source-visible selector

Choose physical **p8**, red span offsets0..11 (12 runes), because existing non-Q work establishes it as the unique red two-word packet with printed word lengths

```text
[4,8]
```

that closes the full H→DH state grammar. This selector uses manuscript word boundaries and already-established p8 state structure, not Q coordinates or signed-source endpoint words.

Exclude the previously advertised Q interval examples p7, p39, p40, p56 and Q-discovery/output spans p15/p54. P8's red Q endpoint is not used in the selection.

## Frozen interval prediction

If the Q discrete-log coordinate really functions as a source-typed interval endpoint pair for this held-out two-word packet, require the canonical zero-based coordinate to equal the two printed red word lengths **exactly**:

```text
[row,col] = [4,8]
```

This is a numeric, source-defined prediction; no language score or endpoint-word attractiveness is allowed.

Charge these presentation rivals without changing the target after reveal:

- canonical zero-based: `[row,col]`;
- reversed: `[col,row]`;
- one-based display variants: `[row+1,col+1]` and its reversal;
- zero-based minus-one variants where nonnegative: `[row-1,col-1]` and reversal.

Also census every eligible complete two-word red span under the same exact length-pair predicate, reporting how many canonical/reversed/origin-shifted hits occur.

## Gate

A canonical exact `[4,8]` hit on p8, with a discriminating charge against the eligible two-word red class, is positive evidence for interval semantics. Any other p8 coordinate is a prospective miss for this typed consequence; do not invent a new meaning from its revealed endpoint words.
