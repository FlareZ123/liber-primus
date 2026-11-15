# C/13 word-boundary radix28 code: exact original-cipher rejection

**Decision, 15 November 2026.** A complete, invertible word-delimited GP29-to-28 coding mechanism admits every source-length GP29 plaintext word and allows the manuscript's rare repeated runes. However, the original fixed-rule decoder rejects **93 of the 95 C-initial ciphertext words**. This terminates the exact model without retuning an arbitrary rank order. No unknown LP2 plaintext, historical key or destination was recovered.

[Complete Node22 source and planted-positive implementation](../sims/lp2_c13_wordlength_28radix_enumerative_sft.cjs) · [passing original-input Windows Actions run 43747794511](https://github.com/FlareZ123/liber-primus/actions/runs/43747794511).

## Source cue and lossless construction

The original 55 rune-bearing LP2 pages have 12,956 GP29 ciphertext runes, 2,896 complete printed words, and 86 adjacent same-rune events. A strict 28-successor output stream by itself has insufficient capacity to encode all 29 possible plaintext symbols at the same length. Source word-length changes might supply the missing capacity. The original pp0–2 have a distinctive 13-dot red mark; GP rune **C** is assigned prime **13** and index **5**. Original one-rune printed words cover 28 of the 29 GP symbols, with **only C absent** across all 83 singleton words. A candidate C-initial sentinel is therefore a source-plausible exploratory choice, although no signed instruction establishes its use.

Choose no more than **two adjacent equal-rune pairs per emitted word**, a generous cap that admits the full unchanged source: 2,834 words have zero, 61 have one and one has two. For a ciphertext suffix of length \(t\), with at most \(b\) remaining repeats, its exact completion count is:

\[
W(t,b)=\sum_{j=0}^{\min(t,b)}{t\choose j}\,28^{t-j}.
\]

For a source plaintext word of \(n\) GP29 runes, represent its symbols as one big-endian base29 integer \(V\). There are two disjoint printable output modes:

- **Short mode:** emit \(n\) runes, first rune distinct from C, with at most two repeats. Capacity \(A_n=28W(n-1,2)\). The decoded plaintext length equals the printed word length.
- **Extended mode:** emit \(n+1\) runes, first rune exactly C, with at most two repeats. Capacity \(B_n=W(n,2)\). The first rune unambiguously indicates a one-rune extension and the decoder removes that length increment.

The explicit encoder emits the lexicographically \(V\)th short-mode word when \(V<A_n\); otherwise it emits the lexicographically \((V-A_n)\)th extended-mode word. The decoder reads the first rune to identify the mode, computes the exact lexicographic constrained rank, adds \(A_n\) for extended mode, checks the rank is less than \(29^n\), and extracts exactly \(n\) base29 plaintext digits. No cipher key, fitted phase, or alternate alphabet order is used.

For **all source plaintext word lengths 1–14**, \(A_n+B_n \ge 29^n\), so this method is an actual injective encoder for arbitrary GP29 input. At length14, the source cardinality is 297,558,232,675,799,463,481; the short mode has 284,699,592,999,374,422,016 codewords and the extended mode has 294,220,541,868,032,131,072. The unused high-rank output codewords are necessarily rejected. The at-most-two-repeat bound was chosen after seeing the source and has no independent creator authentication.

## Actual original ciphertext gate

The unchanged original complete words were read with the repository's cross-page-aware word parser; the symbolic rune stream exactly matches the canonical source. **95 original words begin with C**. Every one of the 2,801 non-C-initial words is a valid short-mode codeword under this generous cap. Only **2 of 95** original C-initial words fall within the extended rank space of the proposed code. **93 fall outside it** and cannot be decoded as GP29 plaintext under the frozen grammar.

The first contradiction is original whole-word index **61**, ciphertext GP symbols **C R TH IA**, length4. Independent examples occur at indices87, 101, 109 and176. The model accepts a continuous original prefix of **61 words / 282 GP29 runes** before its first rank contradiction at word61. Its fully specified inverse on that uninterrupted stretch has normalized GP29 index of coincidence **0.999091390929**, nearly uniform rather than resembling ordinary source-native English. The second [passing Windows Node22 run 43748674239](https://github.com/FlareZ123/liber-primus/actions/runs/43748674239) directly asserts this original-plaintext candidate and the 93 rank contradictions. Thus accepting 2,803/2,896 isolated words under the reversible mapping does not constitute an authentic paragraph or genuine plaintext. There is no universal original inverse for the source's complete 12,956 symbols.

The independent **positive controls** prove that the complete algorithm is operational. One newly sampled native-GP Gibran book preserves all **2,896 original plaintext word-length slots** and 12,956 source-native plaintext runes. Encoding produces 12,970 ciphertext runes and **14** legitimate C-initial extended words. The decoder recovers **12,956/12,956** plaintext runes exactly. A separate 7,000-word uniform GP29 suite spanning lengths1–14 also round-trips, including **254** extended words. The identical original-data and positive-control SFT passed on [Windows Node22](https://github.com/FlareZ123/liber-primus/actions/runs/43747794511).

## Causal scope

This work establishes that **one extra rune at a printed word boundary can in principle carry the cardinality deficit** of a 29-to-28 anti-repeat channel while keeping the code invertible. The exact C/13 canonical word-rank instantiation nevertheless contradicts 93 original marked words. A completely secret alternative rank ordering could move the unused output codewords; without a visible selection rule such a rescue would merely fit the target ciphertext.

The model also supplies no source-selected explanation for the original 104/2,105 within-word lag-five equalities. The prime13/13-dot connection and lone missing singleton C may be coincidental; neither encodes a complete rank permutation, exception state, punctuation rule or holdout key. Do not extend this failed menu by changing markers, rotations or side-channel bits without a new original instruction.

**Status:** bounded negative under an explicit, human-reproducible 2014-era arithmetic operation, with full native planted controls. No newly authenticated LP2 plaintext, source-derived key, inverse or final destination.
