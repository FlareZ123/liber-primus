# Evolving p50-driven rank-28 state gate against conditional p0 phrase islands

**Agent 1, 18 November 2026. Classification: bounded conditional exclusion. No unknown LP2 plaintext, key or complete inverse recovered.**

## Why this family was tested

Across the 55 rune-bearing unknown pages, the immediate modular predecessor difference has an unusually sharp shape: only **86/12,901** same-page transitions have difference zero, while each of the 28 nonzero residues occurs roughly uniformly. Existing repository work already excludes static per-page differential alphabets, direct repeating p50 rank-28 keys, several RC4/AES/ChaCha consumers and a number of fixed feedback families. A natural missing architecture is an **evolving 256-state machine** driven by the published nonzero ciphertext step itself, with p50 as the state-transition table.

Separately, the signed-2016 GP0→p50→p0 navigation work has produced three **conditional** p0 phrase placements:
- p0 offsets 0..12: `EPIPHANY SEEKS`
- p0 offsets 103..108: `THE ROAD`
- p0 offsets 235..243: `THE DEVOTED`

These phrases are not established plaintext. This experiment uses them only as a strong finite gate: a correct compact state family would need to explain all separated islands with one unchanged rule.

## Frozen family

The first physical p0 rune is treated as the page IV, leaving **27** known-symbol constraints in the three islands. None of those 27 ciphertext transitions is an exact repeat.

Two source-simple encodings of the 28 nonzero GF(29) steps are tested:

1. cyclic rank `d-1`;
2. discrete-log rank in the multiplicative group modulo29 using the already source-relevant primitive root15.

Two reversible plaintext-register conventions are included:

1. `EA` as the repeat sentinel, with native plaintext indices0..27 as the nonrepeat rank;
2. `F` as the repeat sentinel, with native indices1..28 shifted to ranks0..27.

The p50 table supplies a byte state. Nine compact state updates cover direct table lookup, lookup after adding the current difference or rank, and lookup followed by adding the current difference or rank. The key emission is either the pre- or post-update state where that distinction is meaningful. Each emitted byte is projected to rank28 by either `byte % 28` or `floor(byte*28/256)`. Both additive signs are tested.

This produces **144 frozen operation families**. Every one is exhaustively evaluated under **all 256 initial states**, for **36,864 complete seeded models**. Seeds0,80 and229 are additionally reported because those values have independent source/navigation motivation elsewhere in the repository; they are not privileged in model selection.

## Result

No model satisfies the 27 constraints.

The strongest result is:

- ciphertext rank: cyclic `d-1`
- plaintext register: EA sentinel
- state update: `s := T[(s + rank) mod256]`
- emitted key: updated state modulo28
- plaintext rank: `rank - key mod28`
- best seeds: **151** and **197**
- matches: **8/27**
- matching offsets: **1, 2, 10, 12, 108, 236, 238, 241**

The hits are scattered across the conditional islands rather than forming a complete word or phrase. The independently motivated seed229 gives only **4/27** matches in this best family. No other family exceeds eight matches.

The result therefore rejects this compact p50-driven evolving-rank family as the common mechanism behind all three candidate p0 placements. It does **not** disprove differential/rank-28 encryption in general, nor does it falsify the navigation geometry itself. A successful differential model still needs an independently supplied evolving schedule outside these direct 256-state table recurrences.

## Reproduction

Run:

`node sims/lp2_p50_evolving_rank28_p0_crib_gate_sft.cjs`

The CommonJS SFT reads the canonical p0 ciphertext and original p50 bytes, reconstructs the three phrase constraints from the GP alphabet, verifies that all 27 differential constraints are nonrepeat transitions, constructs the base15 discrete logarithm over GF(29)*, exhausts all 36,864 seeded models, and asserts the exact best score, configuration, seeds and hit offsets.
