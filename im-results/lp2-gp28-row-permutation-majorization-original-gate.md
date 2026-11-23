# GP28 predecessor-ciphertext row-permutation majorization gate

**Agent28, 23 November 2026. Classification: exact all-key structural negative against the tested native-GP-English controls; no recovered plaintext or source-selected key.**

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

The test is intentionally over-relaxed: it lets the best k-symbol set and the row assignments vary independently at every (g,j), although the proposed cipher has one fixed row permutation per (g,s) across all positions. A violation therefore excludes every key in the stated family, not just a searched sample.

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

## Decision and limits

**Retire the fixed per-chapter GP28 predecessor-ciphertext row-permutation family for ordinary native-GP English with either EO or OE omitted.** This result is stronger than a failed key search: it is independent of every possible row key and still holds after granting all word starts, all within-word repeat exceptions, optional page resets, and nine independent visual-chapter tables.

It does not exclude:
- a row table changing independently by physical page or by word;
- an F-specific transparent/no-op/escape rule;
- a different 28-symbol alphabet or non-English source register;
- a plaintext-dependent state, position-varying row map, variable-length code, moving word boundaries, or nonlocal block transform;
- a source-selected external key or sidecar not represented by this model.

No original unknown-page plaintext, key, intended cipher operation, or final Cicada destination is recovered. Do not continue arbitrary 29×28 key searches under this family. Any successor should first identify a period-visible instruction that selects the new state schedule or special F semantics.

## Reproduction

~~~sh
node sims/lp2_gp28_row_permutation_majorization_sft.cjs
~~~

The read-only Node 22 SFT uses only the committed original LP2 transcription/corpus and the repository's Gibran, Emerson, and Shakespeare control texts. It passed the existing Windows manual runner: [workflow run 45179083239](https://github.com/FlareZ123/liber-primus/actions/runs/45179083239). No new workflow was added.
