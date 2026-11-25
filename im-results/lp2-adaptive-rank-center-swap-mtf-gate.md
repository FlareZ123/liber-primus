# Adaptive rank transport: exact fixed-center swap and move-to-edge decision

## Decision

Neither an adaptive fixed-slot swap nor move-to-front/back rank encoding explains the original LP2 manuscript under the finite native-GP prose comparison register. The source-visible prompt for the center branch is the solved p57 PARABLE's “find your center”; changing a mutable alphabet is an exploratory implementation of that language, **not an authenticated opcode**. This is independent of periodic additive-key and stationary ciphertext-row attacks: the complete alphabet is a mutable state, updated on every consuming rune. No unknown plaintext, authentic key, or continuation was recovered.

The important contribution is a key-independent exact reduction. There is no need to search 29! alphabets or rank-label permutations for these direct architectures.

## Models and proofs

Let A be a permutation of the 29 plaintext glyphs, L a permutation naming its slots by ciphertext glyphs, and j the position of the current plaintext glyph in A. Emit L[j]. Update after consuming:

* Fixed-slot swap: exchange A[j] and A[d], where d is any fixed slot. The proposed center is d=14 under the GP29 order.
* Move-to-front (MTF): remove A[j] and prepend it. Move-to-back is conjugate under reversal of the slot list and rank labels.
* Ordinary mode consumes all runes. Transparent F mode emits literal zero for plaintext F and leaves A unchanged; a ciphertext zero may also be a consuming rank label. All zero masks are granted in the necessary bounds.
* Traversals: continuous p0–55, the nine chapters p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, p54–55, or 55 nonempty physical pages; both directions within each frame. Independent initial permutations and rank labels per frame are allowed for the exclusion.

**Swap lemma.** In the active sequence, after step i−2 the selected plaintext token is at d. Step i−1 swaps its selected slot j_(i−1) with d, so the token from i−2 moves to j_(i−1), even when j_(i−1)=d. At i the selected token equals that from i−2 exactly when j_i=j_(i−1). Since labels are bijective,

    P_i = P_(i−2)  iff  C_i = C_(i−1)      (active sequence, i>=2).

This holds for any initial alphabet, any fixed destination, any label permutation, and any frame length; it requires neither known word boundaries nor a guessed key. Moreover, relabeling slots by ciphertext symbols reduces all fixed-slot swap decoders to 29 abstract equality-pattern decoders (one per destination label), followed by arbitrary plaintext substitution. The direct source-order center inverse and all 29 ordinary destination choices replay exactly but produce near-uniform, nonprose output. Continuous forward GP29 center IoC = 0.0344912192; all 29 destination IoCs = [0.0344541970, 0.0345332461]. Canonical head: S H E O G M IA F X Y H NG C TH J O AE IA TH OE ... . Exact replay alone cannot establish the key.

For literal-F holds, a two-count-capped DP tracking the last retained ciphertext symbol finds the exact maximum of active adjacent repeats after deleting any subset of visible zeros, excluding the first adjacent pair. It is a relaxation that may include illegal holds, so it gives a sound upper bound on required plaintext active lag-two repeats.

**MTF lemma.** At every recurrent occurrence of x, its rank is exactly the number of distinct other active symbols since its preceding occurrence. This is independent of the initial alphabet. Count those recurrent ranks, ignoring first occurrences. Under an arbitrary fixed rank relabeling, each such count must be no greater than the corresponding observed ciphertext glyph count (even with optional zero holds). Sort both count vectors descending; componentwise dominance is necessary. Apply independently per frame to grant private rank-label permutations. Recurrent-rank multisets are invariant under reversal of the traversal because the intervals between consecutive equal symbols are the same intervals. MTF's literal-F version uses the plaintext tape with F removed; F is never moved, so the same lemma holds.

## Original-input test

Original corpus has 12,956 runes across 55 nonempty pages; largest glyph count is 492. Comparison uses 349 fixed manuscript-length windows (stride floor(12956/8)=1619) from the existing repository's Gibran, Shakespeare, and Emerson controls, tokenized by its existing GP29 spelling conversion. Their chapter/page frames have the exact original lengths. These are finite literary witnesses; they are not a theorem about all possible plaintext registers.

| Frame reset | Swap ordinary exact lag2 | Swap transparent-F relaxed lag2 ceiling | Native minimum ordinary lag2 | Native minimum active lag2 |
|---|---:|---:|---:|---:|
| continuous | 86 | 99 | 448 | 473 |
| chapter | 86 | 99 | 446 | 472 |
| physical page | 85 | 97 | 442 | 469 |

All 349 windows fail each swap comparison, each direction and both clocks. All 349 also fail MTF's componentwise recurrent-rank gate, even granting a new independent rank-label permutation per chapter or page. The continuous native minimum recurrent rank maximum is 757 (ordinary) / 774 (F-hold), versus ciphertext maximum 492. Canonical continuous forward MTF inverse IoC 0.0344454508; no readable text. Move-to-back need not be searched separately because it is a reversal of slot naming.

## Exact transparent-F swap state

The necessary bound can be tightened without guessing masks or an alphabet. Let f be the current slot of plaintext F, and name slots by their ciphertext labels. For observed y, a literal hold is possible iff y=0, with f unchanged. A consuming step is legal iff y≠f; when f=d it moves to y, otherwise f remains fixed. This projection is exact for any initial permutation with the stated F position, since the other identities cannot affect F legality.

All 29×29 destination-label/F-slot pairs were exhaustively processed on the full continuous original tape in either direction. Exactly 28 pairs are feasible, each with one mask: destination label nonzero, initial F slot zero, **all 458 visible zeros are holds**. The active lag-two count is consequently exactly 95. In the finite register, the largest donor F count is 428. This demonstrates mathematical feasibility of the fixed-slot model but not plausible native plaintext. The 28 projected paths are not 28 full keys; other alphabet identities are unconstrained by this projection.

## Reproduction and scope

[Executed standalone CJS SFT](../sims/lp2_adaptive_rank_center_swap_mtf_sft.cjs), commit a399c813e48ee391ce5de8869c45d94682b0da7d. The same experiment function was executed against the connected repository sources before committing. 9,841 exhaustive ternary repeat-DP cases (all strings through length eight), 3,276 small F-position projections checked against explicit permutation/mask replay, and 36 planted controls from all nine solved GP29 records passed. Fifteen transparent-F controls exercise consuming ciphertext zero; their true masks are supplied only for known-key replay. No CI was required. Original ordinary inverses re-encrypt exactly, as they must for every bijective key.

Input blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; solved native 1b064ef6d85819b7d96adaff31a82d1ec551598f; Gibran df260a07d56bf5998d40a6360b6132c35c252d10; Shakespeare 94c677ad9dd50771c6670e0c4e4dad9052b46d85; Emerson a92be8ba5b3511a003a22ba31523c14397aaa83a.

Retire direct MTF/MTB and fixed-slot swaps at these scopes rather than optimizing hidden alphabet keys. This does not exclude move-to-interior (a different operation from swapping), a time-varying destination, an extra independent cipher layer, non-native registers, or unknown transposition. No source-selected rule for these remaining variants is supplied by this experiment. The p57 wording has not been shown to uniquely nominate an adaptive rank operation.
