# LP1 Some Wisdom: original 1033-square mirror eigensectors and LP2 eigenbasis test

**Agent17, 22 November 2026. New work is limited to the mirror eigensector ordering candidate and bounded original-cipher change-of-basis test. The original JPEG's exact mirrored/hex encoding was already established and decoded by other agents; see [prior-art image report](jpeg05-palindromic-magic-square.md) and [2014 Onion3 historical prior art](lp1-05-reversed-jpeg-trailer.md). No unknown LP2 plaintext.**

## Original source input, previously established

The repository's original first-release image `resources/liber-primus/05.jpg` (the solved **Some Wisdom** 5×5 square, **not** LP2 physical p05) is exactly **673,066 bytes**. Unlike an ordinary single-JPEG object, its full byte tape has this deterministic structure:

- Bytes `[0,336353)`: a valid 336,353-byte JPEG, terminating at its first `FF D9`.
- Bytes `[336353,336713)`: an exactly **360-byte** central record, beginning `0A 0A`.
- Bytes `[336713,673066)`: the entire first JPEG **reversed byte-for-byte**.

Dropping the two leading LF bytes from the center, **reversing the remaining 358 ASCII hexadecimal characters**, and hex-decoding them yields precisely 179 ASCII bytes. They display this complete original square, which includes numbers rendered as runes in the image:

```text
272     138     341     131     151
366     199     130     320     18
226     245     91      245     226
18      320     130     199     366
151     131     341     138     272
```

Every row and column sums to **1033**. As separately documented in existing source reports, this is a **previously solved LP1 source example** of byte reversal and reversed hex serialization. The present work reuses it as an immutable input, with no new source extraction claim. The resulting 25 integers are already visually recoverable from the solved LP1 illustration and present in the historical 2014 square corpus, so no new external key or unknown plaintext has been found. The unusual mirrored JPEG packaging is observed source behavior; whether its creator meant to hint at LP2 operations is unproven.

## Independent, finite GP29 ordering candidate

Let `B` be the complete recovered integer 5×5 square reduced modulo 29, with its original printed row/column order. The known exact characteristic polynomial factors into five distinct GP29 eigenvalues `[5,8,18,21,24]`, the unordered letters of **CHANGE**, printed in the solved LP1 warning. The square is centrosymmetric and its GP29 row sum is `1033 mod29 = 18` = E.

The *actual eigenvectors* determine more than just an unordered bag of letters: the reversal involution `J` splits the eigenvalues into two **antisymmetric** mirror modes `[5,24]` (C,A), two **symmetric nonuniform** modes `[8,21]` (H,NG), and one **uniform** mode `[18]` (E). Each sector listed is sorted by the existing GP29 rune index, without inspecting unknown ciphertext. Alternating the first two sectors in their sorted order and then taking the unique uniform mode yields

```text
anti[0], sym[0], anti[1], sym[1], mean
    5       8      24      21      18
    C       H       A      NG       E
```

This supplies an interpretable candidate for the previously unresolved **ordering** of the CHANGE eigenspectrum. However, a choice to alternate *anti before symmetric* is an additional **reading rule**, not a written Cicada instruction. Other interleavings and orderings are possible. It is best classified as an exploratory source-local relation, not an authenticated key.

Normalize each of the five corresponding right eigenvectors so its first nonzero GP29 component equals 1. The exact resulting candidate change-of-basis matrix is

```text
 1  1  1  1  1
 0 24 11 18  1
 0  8  0 20  1
 0 24 18 18  1
28  1 28  1  1
```

It is invertible over GF29 and entirely specified by the historical square plus the stated reading convention.

## Original-cipher receiver and decision

The explicit source-derived **change-of-basis** hypothesis is separate from the previously completed direct `B^k` and Hill-square sweeps. Freeze the ordered eigenvectors, five-rune original source block phase zero, and identity on incomplete trailing blocks. Test `P`, `P⁻¹`, `Pᵀ`, and `(Pᵀ)⁻¹`, applying all four to every original LP2 physical page p0–p55. Each can be inverted exactly, including all 12,956 source runes and the unmodified incomplete page tails. The solved native p57 95-rune source control planted through the corresponding inverse is recovered 95/95.

| Original GP29 source | Whole-book index of coincidence |
| --- | ---: |
| Untouched LP2 p0–p55 | 0.034478398 |
| Ordered eigenbasis `P` | 0.034459547 |
| Inverse basis `P⁻¹` | 0.034487954 |
| Transposed basis `Pᵀ` | 0.034476968 |
| Inverse transposed basis | 0.034455996 |
| Actual solved p57 cleartext | 0.062709966 |

Independent full original pages p0, p8, p33, and p55 were also checked for each model. None produced a language-like full-page IoC or actual coherent plaintext. The original p55 is only 76 runes; its occasional higher short-sample IoC is not evidence of decryption. Every inverse exactly reencrypts, as expected for any invertible transform, including wrong keys.

**Decision:** The previously documented original-image bytes provide a genuine historical **reverse-hex/1033-square example**, and this new eigensector test adds a finite exclusion. They do **not** select a complete unknown-page decipherment. The appealing sector-interleaved CHANGE basis supplies a frozen testable operator but its four direct original LP2 consumers fail. A productive successor requires a *different source-authored instruction* selecting the component order, changing five-symbol block alignment/receiver, or supplying an independent key. Do not widen arbitrary basis normalizations or add fitted language rescue phases to these negative results.

**Reproducer:** [read-only Windows Node22 CommonJS SFT](../sims/lp1_p05_jpeg_mirror_spectral_changebasis_original_sft.cjs) is source byte-exact, checks reverse-JPEG identity, 179-byte recovered payload and all25 matrix entries, derives the GP29 eigenvectors without hardcoding the ordered basis, verifies 56 physical pages and complete original forward replay, and tests the four consumers with a positive p57 plant. [Successful independent Windows CI run 45069811249](https://github.com/FlareZ123/liber-primus/actions/runs/45069811249).

**Scope:** This report makes no claim to have solved one of the 56 unknown pages, selected the creator's cipher, or identified the final destination.
