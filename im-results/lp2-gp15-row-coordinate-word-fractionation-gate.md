# The literal GP chart vertical-row coordinate rejects word-preserving row fractionation

**Agent20, 28 November 2026. Classification: source-native architecture exclusion on original p0–55. No unknown plaintext or key recovered.**

## Decision

The authenticated Gematria Primus chart is printed as two rune tables: GP indices **0–14** on the left and **15–28** on the right. Pair the entries by their literal vertical position:

```text
vertical_row(i) = i       for i < 15
                = i - 15  for i >= 15
```

Rows 0–13 have a left/right pair; row14 has only the left-table rune `X`.

This source-visible 15-row coordinate makes a natural family of manual fractionation hypotheses possible: keep the chart row and change or move only the left/right table choice. A broader word-local variant may also reorder row coordinates inside each printed word.

The original ciphertext rejects both families before any key search.

Across the exact **2,896 complete printed words / 12,956 runes** of unknown p0–55, compare the literal 15-row invariant with independently encoded native English:

- **Exact row sequence preserved:** among **1,132** original words of GP length at least5, only **1** shares its literal vertical-row sequence with any word in the combined 149,072-word Shakespeare/Gibran/Emerson controls; among **559** words of length at least7, **0** do.
- **Arbitrary within-word row reordering allowed:** keep only the 15-row count multiset. Just **69/1,132** original words of length at least5 have any control match and **5/559** at length at least7. For the **343 original words of length at least8, zero** row-count vectors occur anywhere in those 149,072 native-control words.
- A separate 29,157-word TextBlob-derived English lexicon gives the same qualitative obstruction: exact-row sequence matches are **3/1,132** at length at least5 and **0/559** at length at least7; row-multiset matches are **100/1,132**, **9/559**, and only **2/343** at length at least8.

Therefore a cipher cannot explain ordinary GP-native English while preserving the chart's literal vertical-row coordinate inside each printed word, even if it is allowed to change every left/right table bit and arbitrarily permute the row positions within each word.

This is a stronger, distinct result from the earlier #3172 **left/right table-bit projection**. That earlier test preserved only which printed table a rune occupied and explicitly did not exclude unknown row-preserving prose. Here the invariant is the orthogonal **vertical 15-row coordinate** and is charged across the entire unknown book.

## Why this is key independent

Write each rune as:

```text
(row, side)
```

where `row in 0..14` is its printed vertical chart position and `side` is left/right when the right mate exists.

Two nested architecture families are tested.

### Family A — exact row-sequence preserving

Any keyed operation may change the side bit at each position, including a different secret map per word or per position, while the literal chart row stays fixed.

Then for every printed word:

```text
plaintext vertical-row sequence
= ciphertext vertical-row sequence.
```

The key cannot change this equality. No secret alphabet enumeration is required.

### Family B — word-local row-multiset preserving

Grant an even wider fractionation layer: inside every printed word the cipher may arbitrarily permute the row coordinates and arbitrarily alter/reorder the left/right side information.

Then only:

```text
multiset(plaintext vertical rows)
= multiset(ciphertext vertical rows)
```

is required.

This admits every position permutation of the 15-valued row tape inside each word. The original still fails overwhelmingly on long words.

The result does **not** cover a cipher that moves row coordinates across printed word boundaries, changes the 15-row alphabet itself under a separately selected key, or uses an external/non-GP plaintext register.

## Native-English calibration

The control text is not a naïve one-letter Romanization. It uses the repository's solved-source calibration:

- `ING -> NG` rune,
- `IO -> IA` rune,
- `QU -> CW`,
- `V -> U`,
- `K/Q -> C`,
- `Z -> S`,

the same encoding convention that exactly reconstructs the solved p57 source.

The combined controls contain:

| control | encoded words |
|---|---:|
| Shakespeare | 55,407 |
| Gibran | 15,733 |
| Emerson | 77,932 |
| **total** | **149,072** |

For the broader row-multiset invariant, leave-one-corpus-out coverage remains ordinary:

| held-out control | GP length >=5 | matched | rate | GP length >=7 | matched | rate |
|---|---:|---:|---:|---:|---:|---:|
| Shakespeare | 16,822 | 12,713 | 75.57% | 6,958 | 3,936 | 56.57% |
| Gibran | 4,735 | 4,335 | 91.55% | 1,983 | 1,711 | 86.28% |
| Emerson | 26,450 | 18,641 | 70.48% | 12,501 | 6,474 | 51.79% |

Against the same invariant, unknown LP2 is only:

```text
length >=5: 69 / 1,132 = 6.10%
length >=7:  5 /   559 = 0.89%
length >=8:  0 /   343 = 0%
```

So the negative is not caused by a generally sparse row-multiset vocabulary in ordinary GP-native English.

## Exact length breakdown against the 149,072-word controls

For the broader row-multiset family:

| GP word length | original words | any native-control match |
|---:|---:|---:|
| 5 | 317 | 48 |
| 6 | 256 | 16 |
| 7 | 216 | 5 |
| 8 | 156 | 0 |
| 9 | 78 | 0 |
| 10 | 52 | 0 |
| 11 | 32 | 0 |
| 12 | 18 | 0 |
| 13 | 4 | 0 |
| 14 | 3 | 0 |

For the narrower exact-row-sequence family, only one length6 original word survives at length at least5; every length5 and every length7–14 word has no control match.

## Reversible positives

The SFT includes actual nontrivial GP29 transforms, rather than checking only a negative corpus statistic.

For each chart row0–13, swapping the left/right paired runes and fixing the unpaired row14 rune is an involution. It changes GP symbols while preserving the exact vertical-row sequence.

A second involution reverses each word and applies the same left/right mate swap. It changes symbol values and positions while preserving only the vertical-row multiset.

Both transforms are applied to the genuinely solved p57 GP source. Each transform round-trips exactly and satisfies the corresponding invariant on every p57 word. This verifies that the gate accepts genuine members of the architecture family.

## Relationship to prior chart work

The existing [GP contextual/grapheme report](lp2-gp-contextual-grapheme-source-original-gate.md) already establishes that the literal GP spelling chart is not a unique Latin serializer and that #3172's left/right-table projection has no donor or key.

That #3172 branch used the binary predicate:

```text
left table (indices 0..14) vs right table (15..28)
```

on p54–55.

This report instead uses the literal **vertical pairing between the two printed tables** and tests every p0–55 complete word. The two invariants are orthogonal. The new result closes a concrete source-native fractionation escape hatch left open by the earlier projection: retaining the printed vertical row while moving table-side information does not produce ordinary word-preserving GP English.

## Evidence boundary and next decision

Established computational result:

> Under the published 15-row GP chart, any word-preserving decoder whose plaintext retains each ciphertext word's literal vertical-row multiset is incompatible with the native-English controls at essentially every long original word; all 343 original words of length at least8 miss the 149,072-word control corpus.

This materially narrows chart-coordinate cryptanalysis. It removes a large key-independent class including arbitrary per-position left/right substitutions, word-local side-bit fractionation, and arbitrary within-word permutations of the fixed vertical-row tape.

Do **not** infer that the chart is irrelevant. A viable coordinate cipher can still move row coordinates across printed word boundaries, introduce a separately selected row permutation/state, or use a different plaintext register. Those mechanisms now need an original clue selecting that additional freedom; otherwise the literal chart coordinate is contradicted by the long-word invariants.

## Reproduction

Run:

```text
node sims/lp2_gp15_row_coordinate_word_fractionation_sft.cjs
```

The SFT reads only committed source/control files, asserts the exact 2,896-word / 12,956-rune original corpus, reconstructs the source-calibrated English controls, reproduces the full-book sequence/multiset counts and leave-one-out calibration, checks the independent TextBlob lexicon sensitivity, and round-trips two nontrivial solved-p57 positive transforms.
