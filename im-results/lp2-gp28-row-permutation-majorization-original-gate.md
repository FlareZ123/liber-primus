# GP28 predecessor-ciphertext row-permutation majorization gate

**Agent28, 23 November 2026. Classification: word-position-conditioned extension of an existing all-key row-majorization theorem; exact structural negative against the tested native-GP-English controls; no recovered plaintext or source-selected key.**

## Relationship to prior work

The general row-majorization principle is not new. Agent48's [original-chapter predecessor-S-box spectrum theorem](lp2-ninechapter-predecessor-spectrum-reset-majorization.md) already excludes a 29-way full-alphabet predecessor-ciphertext S-box with nine chapter tables, carrying across words, and up to three additional arbitrary page rekeys. Agent37's [nine-chapter predecessor-S-box capacity report](lp2-ninechapter-predecessor-sbox-original-capacity.md) gives the related E/O occupancy form.

The contribution here is the distinct **no-repeat GP28** specialization: each previous-ciphertext state selects a bijection from 28 active plaintext symbols to the 28 non-self ciphertext successors; the state may reset at every printed word; all 63 within-word repeats and every word start are granted freely; and the bound is conditioned separately on each word position. The prior full-29-way carry model does not directly test this 28-to-28 derangement receiver with word resets. This report extends, rather than replaces, the earlier theorem.

## Question and model

The unresolved GP28 branch allows each previous ciphertext rune to select a secret permutation of the 28 nonidentical successor runes. This is materially more general than a single shared successor ordering: it gives each of the 29 previous-rune states its own arbitrary 28! row.

I tested the strongest source-plausible fixed-table version:

- 28-symbol plaintext alphabet is GP29 with either **EO** or **OE** excluded. These are the two symbols absent from the known solved-native GP sample; the alternative GP28 selections are not silently assumed equivalent.
- Each visual chapter has its own arbitrary 29×28 row table. For chapter g and preceding ciphertext rune s, a bijection maps all 28 active plaintext symbols onto the 28 ciphertext runes y ≠ s.
- The table is shared across all words and word positions in that chapter. The state resets at each printed word start.
- Every within-word repeated ciphertext transition is treated as a free exception whose plaintext symbol is supplied by an ideal sidecar.
- Physical-page resets are tested both ways. When enabled, all 32 cross-page word transitions are also supplied freely.
- Every first rune of every printed word is supplied freely. Chapter-boundary transitions, if any, are likewise free.

This is deliberately more generous than one global table. It grants nine independent chapter tables, word resets, optional page resets, and perfect recovery of every repeat exception.

## Key-independent row-majorization invariant

For a fixed chapter g, word position j ≥ 1, previous ciphertext rune s, and non-self successor y, let

[
T_{g,j,s,y}=\#\{\text{mapped positions at }(g,j): C_{i-1}=s, C_i=y\}.
]

Sort the 28 counts in each row s in descending order. Define

[
U_{g,j,k}=\sum_{s=0}^{28}\sum_{r=1}^{k}T_{g,j,s,(r)}
]

where T with subscript (r) is the r-th largest non-self successor count in row s.

Because each row's unknown inverse is a bijection, any fixed set of k plaintext symbols can occupy at most the k most frequent successor slots in that row. Therefore, at each chapter/word-position cell, the number of occurrences of the k most frequent plaintext symbols cannot exceed U.

The test is intentionally over-relaxed: it lets the best k-symbol set and the row assignments vary independently at every (g,j), although the proposed cipher has one fixed row permutation per (g,s) across all positions. A violation therefore excludes every key in the stated family, not just a searched sample. This is **not a sidecar-capacity objection**: all 63 within-word repeat plaintext symbols are supplied without cost, so even an unlimited perfect exception oracle cannot rescue the fixed row table.

## Original source register

The original transcript parser recovers 2,896 complete words and 12,956 runes, with maximum word length 14 and 32 words crossing a physical page seam. Within complete words there are 63 adjacent-repeat events; the other 23 book-wide repeats occur across word boundaries and are not part of this word-reset model.

| State/reset convention | Mapped transitions | Free word starts | Free repeat exceptions | Free page cuts | Total free positions |
|---|---:|---:|---:|---:|---:|
| Word reset, carry across pages | 9,997 | 2,896 | 63 | 0 | 2,959 |
| Word and physical-page reset | 9,965 | 2,896 | 63 | 32 | 2,991 |

The nine chapter ranges are the original physical page intervals p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55.

## Native-GP-English control results

For each control, I built 256 deterministic 2,896-word plants by selecting a donor word of exactly the corresponding original word's GP28 rune length. The donor alphabets were separately encoded with EO unavailable and OE unavailable, expanding the excluded digraph into its component runes. Every plant therefore has exactly the original 2,896 word slots and 12,956-rune length.

The test compares every (g,j,k) cell. The table below reports the weakest sample for each source: even that sample's strongest single-cell violation remains positive. The same result holds with and without page resets.

| Excluded GP symbol | Control | Plants violating / 256 | Minimum maximum violation | Weakest witness at p40–53, word position 1 |
|---|---|---:|---:|---|
| EO | Gibran | 256/256 | +91 | k=7, bound 394, donor 485 |
| EO | Emerson | 256/256 | +71 | k=6, bound 356, donor 427 |
| EO | Shakespeare | 256/256 | +101 | k=4, bound 265, donor 366 |
| OE | Gibran | 256/256 | +83 | k=5, bound 314, donor 397 |
| OE | Emerson | 256/256 | +83 | k=7, bound 394, donor 477 |
| OE | Shakespeare | 256/256 | +94 | k=8, bound 426, donor 520 |

These are deterministic necessary-condition failures, not p-values. No choice of the 29×28 row permutations can turn any of these word-length-matched source-native controls into the original source's row histograms under the stated model.

## Positive control

A separate synthetic encoder uses genuinely random 28! row permutations for each (chapter, previous ciphertext rune), shared across all words and positions. It encrypts a 12,956-rune GP28 donor book with the original word lengths, supplies the same 63 repeat positions and optional 32 page cuts through an explicit sidecar, and then decrypts every symbol.

Both reset modes recover all 12,956 runes exactly. The positive also satisfies every row-majorization inequality. This validates the model and the invariant implementation; it does not make the original ciphertext a positive instance.

## F-output state-hold extension

The solved-page F-transparent/key-clock behavior motivates a distinct no-op state model. Here F remains an ordinary ciphertext output in the row bijection, but emitting F does **not** update the predecessor state: the state is the most recent non-F ciphertext rune. Each of the 28 non-F states has a 28-output row containing every rune except that state, including F. A plaintext F-to-ciphertext F mapping for every row is a special case of this larger family. This is **not** the authentic p56 prime-totient cipher itself: that distinct transfer has its own negative in [the p56 native-F-transparent nine-chapter report](lp2-p56-native-F-transparent-ninechapter-impossibility.md). Only the F no-consume/state-hold behavior is borrowed as a candidate rule for this different row-permutation receiver.

The model grants every printed word start, every reset at a visual chapter boundary, optional resets at all 32 physical page seams, all positions before the first non-F state after a reset, and every repeat of the last non-F state as free sidecar positions. In the original source this yields:

| State/reset convention | Mapped transitions | Word starts | State-start / leading-F positions | Repeat exceptions | Page cuts | Total free positions |
|---|---:|---:|---:|---:|---:|---:|
| F holds state, carry across pages | 9,875 | 2,896 | 117 | 68 | 0 | 3,081 |
| F holds state, reset at page seams | 9,844 | 2,896 | 117 | 67 | 32 | 3,112 |

The 117 additional state-initialization positions comprise 116 first non-F runes encountered while the state is unset and one further leading-F position; word starts and page cuts are counted separately. The same word-position-conditioned row-majorization inequality applies, now over the 28 non-F predecessor states and their 28 allowed outputs.

| Excluded GP symbol | Control | Plants violating / 256 | Minimum maximum violation | Weakest witness at p40–53, word position 1 |
|---|---|---:|---:|---|
| EO | Gibran | 256/256 | +89 | k=7, bound 375, donor 464 |
| EO | Emerson | 256/256 | +64 | k=6, bound 339, donor 403 |
| EO | Shakespeare | 256/256 | +92 | k=4, bound 252, donor 344 |
| OE | Gibran | 256/256 | +81 | k=5, bound 299, donor 380 |
| OE | Emerson | 256/256 | +78 | k=7, bound 375, donor 453 |
| OE | Shakespeare | 256/256 | +92 | k=8, bound 406, donor 498 |

All 256 exact-word-length plants violate for each control/alphabet, with and without page resets. A synthetic F-hold encoder with random per-chapter/state row permutations recovers all 12,956 symbols exactly, satisfies every inequality, and uses exactly 3,081 or 3,112 sidecar positions.

This excludes the simple F-output state-hold/transparent mapping family as well as the ordinary immediate-previous-ciphertext state family. It does not exclude an F escape that carries additional side information or changes the row/key schedule; those are different, untested mechanisms.

## Decision and limits

**Retire the fixed per-chapter GP28 predecessor-ciphertext row-permutation family for ordinary native-GP English with either EO or OE omitted.** This result is stronger than a failed key search: it is independent of every possible row key and still holds after granting all word starts, all within-word repeat exceptions, optional page resets, and nine independent visual-chapter tables.

It does not exclude:
- a row table changing independently by physical page or by word;
- an F escape/flag mechanism carrying additional side information or changing the row/key schedule;
- a different 28-symbol alphabet or non-English source register;
- a plaintext-dependent state, position-varying row map, variable-length code, moving word boundaries, or nonlocal block transform;
- a source-selected external key or sidecar not represented by this model.

No original unknown-page plaintext, key, intended cipher operation, or final Cicada destination is recovered. Do not continue arbitrary 29×28 key searches under this family. Any successor should first identify a period-visible instruction that selects the new state schedule or special F semantics.

## Reproduction

~~~sh
node sims/lp2_gp28_row_permutation_majorization_sft.cjs
~~~

The read-only Node 22 SFT uses only the committed original LP2 transcription/corpus and the repository's Gibran, Emerson, and Shakespeare control texts. The expanded ordinary-state plus F-hold test passed the existing Windows manual runner: [workflow run 45182061014](https://github.com/FlareZ123/liber-primus/actions/runs/45182061014). No new workflow was added.
