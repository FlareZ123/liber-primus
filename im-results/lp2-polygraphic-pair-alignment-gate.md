# Source-constrained polygraphic / digraphic architecture gate

**Status:** bounded original-input negative for standard hard no-repeat digraphic pairings; no plaintext, key, or complete LP2 cipher recovered.

## Decision

The most recognizable classical cipher whose standard operation guarantees that the two ciphertext symbols inside each block differ is Playfair-style digraphic substitution. Its defining property predicts that every equal adjacent ciphertext pair must occur **between** digraphs, never inside one.

| Pairing convention | Observed equal adjacent pairs | Minimum inside a digraph |
|---|---:|---:|
| One continuous pair phase across the unknown stream | 86 | **37** |
| Independent pair phase on each physical page | 86 | **17** |
| Pairing restarted at each printed word, first rune begins a pair | 63 within-word | **27** |

The page-reset test is deliberately more permissive than a single global stream: each physical page may choose whichever of its two phases minimizes contradictions. Even then, 14 pages contain repeat events in both parities and at least 17 events remain inside nominal digraphs.

The canonical parser yields 2,896 words and 32 words crossing physical page boundaries. Of the 63 within-word repeated pairs, 27 have their second rune at an odd word offset and therefore lie inside a pair when each word begins at pair position zero. Playfair cannot emit those pairs. The other 36 are at digraph boundaries.

There is one apparent escape: **all 62 words containing repeats happen to have their repeated pairs at only one parity within that word**. If a separate phase is freely selected for every word, zero events are forced inside pairs. This is not an independent solution: the phase is selected from the ciphertext being explained, no original clue specifies 2,896 word phases, and the standard word-start convention is abandoned. It is a post-selected accommodation, not a source-derived mechanism.

## Why the visible squares do not select Playfair

A human solver could reasonably notice the numeric square imagery and consider a square-based cipher. The actual candidate artifacts do not provide a keyed 29-symbol digraphic square:

- LP2 p15 visibly prints a **4×4 numerical Fibonacci-prime array** above an infinity-like ornament. The existing source-fixed 4×4 Hill test has already evaluated its printed, spiral-repacked, prime-value and prime-rank forms, both matrix directions, vector conventions, phases and page clocks, with no language-like plaintext. See [the p15 Hill report](p15-hill-block-test.md).
- The historical Cicada 2014 5×5 and 7×7 magic squares are genuine earlier-stage artifacts, but neither is a 29-symbol keyed square. The existing [clue-matrix Hill study](clue-matrix-hill.md) also tests the 5×5 LP1 matrix and p15 4×4 matrix as direct block inverses and finds no LP2 plaintext.
- Gematria Primus has 29 symbols. A conventional 5×5 Playfair square accommodates 25; a 5×6 rectangle would require an extra rule for its unused cell and a mapping for all 29 runes. No examined source artifact selects that mapping, the filler convention, or a key square.

The source clue therefore motivates at most a broad thought about matrix or square operations. It does not select Playfair, Two-square, Four-square, a 29-symbol rectangular adaptation, or their key material.

## Why a linear digraph Hill map is not a no-repeat explanation

An invertible affine 2×2 Hill map over F29 cannot guarantee distinct output symbols for every input pair. If its two output rows differ, their difference is a nonzero linear form and equals zero for 29 input pairs. If the rows are equal, the matrix is singular (regardless of affine offset). Thus an invertible affine pair map always admits equal adjacent output symbols; the observed depletion would have to be explained by a particular plaintext distribution and key, neither independently known here.

The p15 4×4 and LP1 5×5 direct matrix inversions are already negative in their stated scopes. Re-running them or scanning arbitrary keyed squares would not supply the missing source selector.

## Human solve-path and weakest assumption

The low repeat rate could retrospectively prompt a solver to investigate digraphic ciphers. A source-visible square might then make a square cipher feel natural. But there is no authentic 29-symbol square, no instruction for pairing or reset, and no independently recoverable key. The weakest assumption is that the repeat deficit is caused by a hard no-repeat polygraphic operation at all; a different stateful or non-GP transport remains possible.

Reproduce with:

```sh
node sims/lp2_polygraphic_pair_alignment_gate.cjs
```

The script reads the canonical `resources/liber-primus/lp2-corpus.json` and shared `resources/lp2-transcription.txt` parser. It verifies the 12,956-rune stream, 86 repeated pairs, 2,896 words, 32 cross-page words, all alignment counts above, and a synthetic positive control. The word-level result is conditional on the repository's canonical transcription/parser; it is not a new independent visual transcription of all original JPEGs.

## Completion and next decision

**Retire the standard hard no-repeat Playfair-like digraphic route under continuous, physical-page-reset, and printed-word-start pairings.** Do not launch generic Playfair/Two-square/Playfair-rectangle key sweeps or further direct Hill matrix scans.

A successor would first need an independent source instruction that fixes the 29-symbol mapping, digraph phase/reset, key square or key-generation rule, and treatment of repeated plaintext letters/fillers. It must then make a frozen rune-level prediction on original LP2 ciphertext. Without that input, the polygraphic route is an architecture gap, not an actionable decryption candidate.

No change to `results/README.md` is warranted: this is a bounded intermediate negative, not an established plaintext or cipher mechanism.
