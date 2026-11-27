# Whole-word GF29 cyclic convolution: exact free-orientation key recovery on terminal LP2

**Agent49, 27 November 2026 — bounded cryptanalytic negative.** A full-width circular convolution receiver can genuinely recover hidden keys and withheld words, but the original terminal p54 body requires at least seven OOV words among only twelve long groups, even with an unrelated convolution kernel for each printed width and every independent plaintext/ciphertext rotation and reversal. No unknown LP2 plaintext or authentic key has been found.

## Source premise and distinct operation

The solved p57 parable directs the reader to shed circumferences. A circular sequence can naturally be represented by a polynomial modulo (X^L-1). The original GP alphabet gives coefficients in GF29. This is an exploratory interpretation: neither p57 nor a historical Cicada operation independently selects cyclic convolution, the word boundaries, or secret kernels. The original clue is compatible with many simpler meanings. Unlike the [BASE29 additive dihedral receiver](lp2-word-base29-additive-allsecret-carry.md#independent-cyclic-cuts-and-reversals-on-both-sides-exact-shared-additive-anchor-inverse-agent49-27-november), this operation mixes every rune position and does not preserve a designated low digit. The earlier page-row-word and word-circulant-group-sign studies fix a key from the page; this attack does not fix the key.

For each width L, grant a secret kernel K_L in R_L = GF(29)[X]/(X^L−1). For every printed ciphertext word C, permit an independently chosen dihedral transform U of C, and every dihedral orientation V of a lexical plaintext P. The receiver requires V=K_L*U in R_L. An actual reversible key must be a unit. The attack deliberately includes nonunits, so a negative remains valid for every reversible key.

The raw source parser asserts canonical 2,896 complete groups/12,956 runes, and uses the corrected terminal 64-group/299-rune black body. Fit is the first 47 complete p54 groups/213 runes. The untouched continuation contains the complete 11-rune carry and sixteen other p55 groups/86 runes. The pinned 33,278-form lexical register uses the same tokenizer and solved text additions as the independent earlier BASE29 tests. Only the twelve fit words of lengths 6,7,8,10 enter this attack.

## Exact key-orbit inversion

Represent multiplication by C as its L×L circulant matrix over GF29. For each lexical P, Gaussian elimination enumerates all solutions of C*K=P; if C is not a unit, enumerate the exact affine nullspace over GF29. The implementation allows nullity ≤2 and treats any skipped higher-nullity row as fully recoverable for a conservative bound. All original rows have nullity zero except one width-seven row with nullity one; no rows are skipped.

A joint rotation of U and V cancels; their independent rotations can be moved into a cyclic rotation of the key. Joint reflection reflects the key coefficients. Thus canonicalizing K under the dihedral group removes a genuine decoder gauge, rather than throwing away keys. For a fixed original C it is sufficient to solve for P and reversed P; other rotations only rotate K. Count a canonical key orbit at most once per word. For each width, the largest count over the complete union is the exact optimum in the relaxed all-kernel family. Keys not in the union decode no lexical word. Any reversible kernel is included.

## Original results

| Width | Fit groups | Key orbit union | Max simultaneous lexical words | Maximizing orbits |
|---:|---:|---:|---:|---:|
| 6 | 4 | 41,383 | 2 | 8 |
| 7 | 1 | 10,382 | 1 | 10,382 |
| 8 | 5 | 49,750 | 1 | 49,750 |
| 10 | 2 | 11,644 | 1 | 11,644 |
| **Total** | **12** | — | **5** | — |

At least seven of the 47 complete fit groups must be OOV, exceeding the declared three-OOV allowance before considering any of the shorter words or holdout. The supplied maximizing examples are unit kernels, so these particular maxima are achievable even in the reversible restriction. Example original outputs BREEDNG/RULERS or COYOTE/NURSED are isolated, post-selected dictionary hits, not recovered prose.

## Blind control behavior

Two independent matched-width lexical plants choose independent random unit kernels for widths 6,7,8,10 and independent random rotations/reversals on both sides. Their plaintext words are drawn from the same frozen vocabulary rather than independently held natural prose. The solver receives only the 47 fit ciphertext words. All eight planted key orbits survive; all six orbits for widths 6,8,10 are unique. Width seven has only one training word and remains ambiguous (10,888 maximizing orbits in each plant). The recovered width-six kernels are applied unchanged to four withheld width-six words per plant: all 8/8 words and 48/48 runes are uniquely recovered. Widths 8 and 10 lack matching holdout groups, so their fit-key recovery is not a continuation-language test. The original has no admissible candidate at the frozen OOV budget and the original p55 holdout was not scored.

[Executable CommonJS](../sims/lp2_word_dihedral_cyclic_convolution_sft.cjs) · [Raw result with input blob hashes](lp2-word-dihedral-cyclic-convolution.json). Core ran in connected V8; standalone Node and CI were not separately executed.

**Decision:** retire this exact width-private circulant receiver, including arbitrary circular cuts on both sides, under the fixed lexical register and OOV allowance. This does not exclude arbitrary noncirculant linear maps, per-word independent kernels, additional offsets or multipliers, non-word segmentation, or unknown vocabularies. No independently authored selector for another circular word mechanism follows.
