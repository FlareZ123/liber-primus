# Fixed-block-only repeated-rune leakage fails on two coprime original LP2 gaps

**Agent 5, 22 November 2026. Evidence classification:** exact, source-input, key-independent obstruction for one proposed anti-repeat *output clock*. This identifies **no authentic plaintext, cipher, key or Cicada destination**. It narrows the interpretations of the 86 same-page adjacent-repeat events without language scoring or a large family of fitted keys.

## Why this architecture was plausible, and its precise rival

Original LP2 pp0–55 contain **12,956 GP29 runes**, with only **86** identical adjacent rune pairs on physical pages. The manuscript also depicts five-dot stamps, and the authenticated solution of p56 allows plaintext F to remain literal without advancing its cryptographic keystream. A motivated finite hypothesis is that an output process suppresses equal neighbors *within* each block of **B** consumed runes but permits them when the next block starts, and that literal-F output runes may skip the block clock. With B=5, this gives an intuitive route to a low overall doublet rate while leaving lag-two-to-four equality largely unaffected.

The strong rival is a changing-state or probabilistic exception encoder: duplicate output runes may be allowed according to ciphertext state, plaintext markers or a nonuniform clock even within blocks. Nothing in the source instructs a fixed B-block repeat-exception rule, so the test is a bounded rejection of this explicit architecture rather than a claim about every anti-repeat cipher.

**Declared family and generous reset/skip rules:**

- Every **non-F ciphertext glyph** consumes exactly one clock step. Ciphertext F (GP index0) may *arbitrarily* consume one step **or** be a literal plaintext F that consumes none, without needing to guess which it was.
- A same-glyph adjacent pair may appear only if the *current* output is the first consumed symbol of a fresh fixed-length B block. Every block has the same integer length B at least 2.
- Each physical page may start at any phase. Every recorded punctuation event, including the editorial punctuation in the derivative inventory, may restart at an entirely arbitrary phase. The proof below permits a reset at all these locations simultaneously.
- There is no additional invisible clock skip or unprinted reset inside an uninterrupted stretch of non-F runes and punctuation-free original text. The mechanism is a strict repeat-only-at-block-boundary rule; it is a necessary output constraint independent of the input alphabet and secret substitution.

## Two untouched original-page witnesses

All offsets below are **zero-based positions within an original physical page**, using the source GP29 alphabet. The two images are [36.jpg](../resources/liber-primus/36.jpg) for p19 and [41.jpg](../resources/liber-primus/41.jpg) for p24. Both pairs fall inside original intervals containing **no intervening ciphertext F and no recorded punctuation event of any type**; the source punctuation inventory is [here](../resources/liber-primus/lp2-punctuation-identity.json).

| Original physical page | Adjacent-equal event A | Adjacent-equal event B | Uninterrupted distance |
| --- | --- | --- | ---: |
| **p19** (original 36.jpg) | rune 17→18: `O O` (index3) | rune 44→45: `M M` (index19) | **27** |
| **p24** (original 41.jpg) | rune 51→52: `G G` (index6) | rune 58→59: `IA IA` (index27) | **7** |

For either event the current ciphertext rune is non-F, so it must consume a block-clock step. A strict block-repeat emitter therefore requires the clock phase to be zero at both event positions. Between each pair of events all ciphertext runes must consume exactly one step, since none is F and there is no punctuation to reset the clock. Thus **B divides 27** from p19 and **B divides 7** from p24. Their greatest common divisor is 1, so **no fixed B≥2 is possible**, for *any key, any block alphabet, any starting phase and any permitted literal-F choices elsewhere in the book*. This is an exact obstruction, with no probability model or GP-English assumption.

A separate original **word-reset clock** also has a minimal witness when each printed word starts a new block at phase zero. Complete printed word #1476 (zero-based) begins at p27:79 and has the exact GP-index sequence

`[12, 4, 9, 15, 3, 3, 5, 24, 18, 26, 18, 18]`.

It has no F, with adjacent doublets at **within-word positions 5 and 11**. The strict word-reset version would require B to divide both 5 and 11, again forcing B=1. Granting every *word* a freely chosen nonzero starting phase would be a **different model**, not excluded by this second witness. Granting additional resets at every word or line similarly falls outside the p19/p24 continuous-span proof.

## Reproducibility and positive model control

[Single-file original-input Windows Node22 test](../sims/lp2_strict_repeat_block_clock_coprime_sft.cjs) reads only the unchanged canonical original rune indices, the published punctuation identity inventory and the printed source transcription. It checks the book's **55 rune-bearing pages, 12,956 runes, 86 within-page adjacent duplicates, 2,896 complete printed words**, every witness rune, the F/punctuation-free interiors, both coprime distances and the word-reset witness. A planted **B=5** output stream with an authentic syntactic boundary doublet and one skipped F confirms that the optional-skip phase automaton accepts at least one valid model output. The automaton independently checks B=2 through B=50 on all original pages with all punctuation sites allowed to reset to **any phase**: every period fails somewhere. The two coprime witnesses already establish the stronger conclusion for **all integer B≥2**, without this finite sweep.

A full plaintext encoder is intentionally not claimed: a strict no-repeat output constraint can require an additional alphabet, variable-length escape or side channel to represent all 29 GP plaintext values. The test is a **necessary output-only gate** and therefore cannot authenticate or reject arbitrary full-rank cipher constructions outside that constraint.

## Decision for the decipherment frontier

**Retire “rare repeats occur exclusively at boundaries of otherwise strict fixed-length no-repeat blocks” as an explanation of LP2's adjacent-repeat deficit.** Period five and source-visible F skips cannot rescue this static architecture, even with arbitrary phase resets at the original page and punctuation boundaries. The source strongly suggests looking for a **ciphertext-recoverable changing state or a source-selected escape/exception operation** if pursuing anti-repeat mechanisms. A genuinely variable block clock, separate non-F skips, word-specific phases, or stochastic exceptions remain possible only with an independent original-source reason to use them.

This is a decision about a viable decryption architecture. It does **not** recover any of the 56 unknown pages. Do not escalate it into a claim that Cicada used a block emitter, or restart the same static model with a newly fitted phase.