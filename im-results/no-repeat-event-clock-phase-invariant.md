# Key-free event-driven clocks for a 28-symbol no-repeat cipher

**Classification:** finite phase-equality constraint under explicit observable key-pointer models; exploratory 288-family exclusion with independent positive controls and null rotations. Agent 25, 2026-11-10. **No new decrypted LP2 rune, authentic key or source text.**

## Cryptanalytic question

The existing [key-free 28-rank phase test](no-repeat-periodic-key-phase-invariant.md) rules strongly against ordinary GP28 English-like plaintext protected by synchronized, fixed-phase short keys. That leaves a concrete possibility: perhaps the manuscript uses a repeated rank key, but its pointer **does not consume a new draw** at visibly anomalous rune positions. This experiment tests that mechanism without guessing key digits or choosing event sites to match a desired plaintext.

There are four source-selected classes of ciphertext events, using the canonical 2,896 whole words and 55 rune-bearing original LP2 pages:

| Event | Exact source definition | Original events |
|---|---|---:|
| D | Same published rune as immediately previous *within the same physical page* | 86 |
| T | Current word-local rune equals T(rune six positions back), T(x) = 24 − 2x mod 29 | 80 |
| E | Same rune five word-local positions back | 104 |
| S | Both current and five-back runes are S (GP index 15); subset of E | 11 |

For twelve literal clock rules, a rune matching one or more named events is treated as a possible *source rewrite* or non-consuming output. It is erased from the phase-equality statistic, and the key pointer advances only after unflagged runes. The rules are none, D, T, S, E, DT, DS, DE, TS, TE, DTS, DTE. No extra event flags or recovery sites are learned from a language model.

The rank decoder uses either the sorted previous-rune-exclusion inverse or the cyclic previous-rune-exclusion inverse described in the [parent experiment](no-repeat-periodic-key-phase-invariant.md). Both give exactly one 28-way code at each non-doublet ciphertext position. For positions with a common resulting key-pointer phase, an unknown **deterministic bijective symbol mapping** preserves underlying symbol equality, even if all symbols are permuted. An additive 28-way key is an example; no key guesses are needed.

The pointer can run continuously across physical pages or reset for each physical page. Candidate key periods are **8, 16, 32, 64, 128, 256**. This gives **12 × 2 × 2 × 6 = 288** explicitly enumerated possibilities. This is one finite, partially hypothesis-selected family, not 288 independent discoveries.

## Executed original-manuscript test

The program cross-checks the original numeric LP2 corpus against the actual rune-word transcript before deriving event flags. Printed wraps and page boundaries preserve true word-local lag indices; the runeless LP2 page 50 and solved closing pages are excluded. It uses **12,956 original unsolved runes**, removes the physical page-first runes and all adjacent doublets from rank analysis, and erases additional flagged sites according to each model.

| Original family maximum | Result |
|---|---|
| Largest nominal standardized score | **+4.4235** |
| Winning nominal configuration | **T only**, sorted exclusion, page reset, period **8** |
| Its equal-rank rate | **0.0358966408**, or **727,446 / 20,265,016** ordered pairs |
| Largest raw equal-rank rate | **0.0366760920** |
| Winning raw configuration | **D only**, cyclic exclusion, continuous key, period **256** |
| Uniform 28-code reference | 1/28 = **0.0357142857** |

A **300-replicate deterministic matched null** independently circularly rotates the ciphertext runes of each physical page, retaining their word-local T/E/S event labels with each glyph. This retains page rune inventories, most adjacent transitions, all original word-local event counts and their association with source glyphs, while changing the phase alignments. The D events are recalculated at the new physical-page seams. **Each null book reruns the entire 288-model maximum selection.**

The observed 4.4235 nominal maximum was equalled or exceeded by **120/300 nulls**, full-family add-one p = **121/301 = 0.4019934**. The maximum raw rate was equalled or exceeded by **26/300 nulls**, p = **27/301 = 0.0897010**. The corresponding null means of family maxima were nominal z **4.3470** and raw rate **0.0364517**.

The apparent four-standard-deviation nominal winner demonstrates why a single selected setting must not be promoted without accounting for model search and manuscript-conditioned structure. The higher raw rate also fails to clear a full-family threshold.

## Genuine English-positive encryption controls

The code independently transliterates the pinned Shakespeare source into GP28, encrypts its 12,956 rune-length-matched code symbols using genuine secret periodic mod-28 additive pads, and advances the pointer according to *dynamically detected events in the emitted ciphertext*. It imposes the original LP2 86 doublet positions as explicit output exceptions. The key-free decoder sees only published rune values and the declared clock rule.

| Planted mechanism | Same-phase rank equality |
|---|---:|
| D only, continuous cyclic, 256-position key | **0.06097309** |
| T only, page-reset sorted, 8-position key | **0.06113059** |
| DTS, continuous cyclic, 64-position key | **0.06124005** |

All three genuine keyed source controls are far above the observed original phase-collision rates. Thus the test is sensitive to the declared source/key mechanisms in the particular English register.

## Exact boundary and next action

The test gives **no support for a short repeated 28-symbol bijective key phase clock synchronized by any of these visible doublet, five-lag or six-lag events**, assuming ordinary English-like GP28 source text. It does not exclude irregular hidden key skips, per-word independent key tables, a different segmentation or exclusion ordering, an unknown ciphertext-side outer alphabet, non-English intermediate codes, or an entirely different cipher. Some marked events might overwrite an original plaintext-bearing rune, so the proposed clock family is not itself a complete reversible cipher.

Next research should require an independently defined pad/state with a genuine original-source inverse and exact forward ciphertext reproduction. Further post-selected clock scores are not independently recovered plaintext.

[Source code and reproducible controls](../sims/no_repeat_event_clock_invariant.cjs) · [Successful manually dispatched GitHub Actions 42773744311](https://github.com/FlareZ123/liber-primus/actions/runs/42773744311) · [Original corpus](../resources/liber-primus/lp2-corpus.json). Existing workflow reused, no added dependency or new workflow.
