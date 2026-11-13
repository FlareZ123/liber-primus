# p15/p39 rank-two masked half-rate decoder: all-codebook source gate

**Status: distinct bounded original-cipher negative, no plaintext recovery (13 November 2026).** The original signed Fibonacci-prime matrix on physical p15 (JPEG 32) and the red quadratic on p39 define an exact rank-two projection. A plausible interpretation is that **four transmitted runes conceal two plaintext GP runes** with a different arbitrary two-dimensional random pad on every block. That half-rate channel was not covered by the preceding same-length `C=P+K` kernel-pad gate. There is no original instruction selecting this interpretation.

## Mathematical extraction and key-independent invariant

The source-derived signed matrix is
```text
M = [10  3 20 22; 1 22 21 25; 11 17 19 7; 8 12 12 22] mod 29.
```
The independently printed p39 red triad `[27,5,15]` defines `Q(X)=27+5X+15X²=15(X−24)²`, and
```text
Q(M) = [22 17 17  4; 19 13 14 20; 19 28 24 19; 8 3 19 21].
rank(Q(M)) = 2; determinant of its leading 2×2 minor = 21 mod 29.
```
For each successive original four-rune ciphertext block `C`, form the two-rune output `Y=(Q(M) C)[0:2]`. **Every** block-varying additive mask `K∈ker Q(M)` vanishes from this output. Any additional **fixed deterministic two-source-rune → two-output-rune codebook**, even a secret nonlinear or non-injective one, must map identical plaintext pairs to identical projected ciphertext pairs. Consequently, the number of collisions between distinct output positions **cannot be below** the source plaintext pair-collision count. An arbitrary invertible change of output basis preserves the exact pair equality relation.

This necessary condition is key-independent: it dispenses with guessed GP alphabets, secret per-block kernel values, scalar projection choice and any particular four-rune Hill encryption matrix. It is limited to stationary deterministic codebooks and a physically contiguous four-rune reading, not evolving or nonlocal channels.

## Exact original and source-native comparisons

| Original physical section | Runes | Projected pairs | Colliding output-pair counts at phases 0,1,2,3 | Minimum matched English controls: Shakespeare / Gibran / Emerson |
|---|---:|---:|---|---|
| pp16–22, following the printed matrix | 1,744 | 436 | **111, 133, 113, 104** | **421 / 504 / 456** |
| pp40–53, an independent visual chapter | 3,008 | 752 | **365, 348, 339, 330** | **1,365 / 1,619 / 1,434** |

Each control set consists of **600 deterministic, evenly distributed native-GP source windows** matching the exact two-rune-plaintext count (872 or 1,504 runes), respectively. They use the same solved-LP1-calibrated `ING`/`IO` GP encoding as existing original-input gates. At 436 pairs, Shakespeare/Gibran/Emerson median collision counts are 579/701/604; at 752 pairs, 1,698/2,054/1,786. All four tested contiguous-block phases fail against every finite native-English control.

**Authentic printed-source control:** In `resources/transcriptions/lp1_wulfic_canonical.txt`, the original clear GP passage from LP1 physical p10–13 contains 755 actual runes (not an English-to-GP approximation). The first 377 adjacent two-rune pairs have **451 colliding pairs**, while the corresponding first 377 projected original ciphertext pairs have **79–104** (pp16–22) and fewer than 451 (pp40–53). Both authentic solved orthography and two independent original sections thus support the same decision.

**Exact changing-kernel positive plant:** A fixed-seed source-native construction embeds 377 of those original clear GP pairs into 1,508 synthetic four-rune ciphertext symbols while selecting the other two coordinates afresh per block. The source Q(M) operation recovers **754/754 plaintext runes exactly**, reproducing all 451 authentic GP pair collisions. This checks that completely arbitrary changing secret kernel values alone cannot hide an ordinary half-rate GP-English message from the proposed original-source test.

Reproduce all calculations on Windows 11 with Node.js 22 using [the standalone SFT](../sims/lp2_p15_rank2_half_rate_codebook_sft.cjs). Existing upstream source matrix and red-triad evidence is in [the signed-matrix report](lp2-p15-p39-signed-matrix-eigen-crosslink.md). The previous additive full-rate exclusion in that report tested 4 plain runes per 4 cipher runes, a distinct premise.

## Research decision

The proposed **stationary four-to-two source-matrix masked alphabet channel** has no native-GP-English reading under any fixed deterministic secret pair codebook on the tested original regions. The unusually small number of projected pair collisions is a structural obstruction to all such codebooks, including non-injective ones, under the stated finite English controls.

Potential surviving architectures require **state-dependent output codebooks, nonlocal transposition, an additional compression/encryption layer, a different cipher-clock selection, or a different plaintext register**. No new unknown LP2 rune was deciphered, no authenticated key was recovered, and the author has not been shown to select Q(M) as an LP2 cipher. A future p15/p39 proposal should bring an independently printed state/transport instruction before another expensive variant of this projection.
