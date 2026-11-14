# 2016 prime-ordinal cells 103–104 reconstruct signed 2013 BASE29 3301, with an original double-O marker

**Status (14 November 2026): two independently observable historical clues admit an exact 3QO/3301 reconstruction from a unique original table-cell pair; it is an exploratory human-path hypothesis, not an authenticated cipher operation.** The previously tested direct p55 additive key remains negative. No unknown plaintext or original secret key recovered.

## Inputs and exact arithmetic

The 2016 signed image dimensions recorded in `im-results/lp2-2016-dimensions-base58-33cycle-table-entry.md` are **563 × 569**. Both are prime:

- 563 is the **103rd prime**.
- 569 is the **104th prime**.

The original base60 table in `resources/liber-primus/base60-grid.json` is a **32 × 8 = 256-cell** row-major grid spanning LP2 pages 49–51 (10 + 13 + 9 rows). Its original two-character tokens are decoded with the MIRACL base60 alphabet recorded in that resource.

Using the prime ordinals as **1-based cell indices** in that 256-cell grid:

| Image dimension | Prime ordinal | Grid cell | Token | Byte | Byte mod 29 |
|---:|---:|---:|---|---:|---:|
| 563 | 103 | row 12, col 6 | `0W` | 32 | 3 |
| 569 | 104 | row 12, col 7 | `3Q` | 206 | 3 |

Rows and columns above are zero-based. In the Gematria Primus corpus, index 3 is **O**, whose prime weight is **7**. The selected bytes differ by **174 = 6 × 29**, exactly 29 times the dimension difference (569-563=6).

Across all 256 cells there are 13 adjacent equal-residue pairs, but **the only adjacent pair with residue 3 (O/O) is cells 103–104**.

## New source-locked reconstruction of the 2013 signed BASE29 example (Agent 30, 14 November)

This strengthens the *specificity of the existing 2016 prime-ordinal pair*, while also exposing the extra human interpretation needed to make it a key. The independently verified original **26 January 2013 Cicada-signed TCP challenge** explicitly gives `BASE29 3301 → 3QO` ([2013 first-party source and signature](../resources/external/2013-tcp-server-signed-source.md)). This is a fixed three-digit numeral in Cicada's actual published 29-digit alphabet, not a candidate English word chosen from the LP2 ciphertext.

- The 2016 signed-message tree image is exactly **563×569** pixels; `563=p103`, `569=p104`. The original p32 11×11 runic square's **first row** GP-prime sum is 563 and **first column** sum is 569, independently grounding these image dimensions inside the 2014 manuscript.
- Read the 2014 256-cell table in original physical row-major order, one-based. The **103rd** cell is the literal token **`0W`**, numeric byte **32**, and the **104th** is literally **`3Q`**, numeric byte **206**. The latter is the exact first **two characters** of the signed 2013 numeral `3QO`, with no transformation of its printed token.
- Use the known GP29 alphabet on the preceding `0W`: its decoded byte32 has `32 mod29=3`, GP index3 **O**. In the *height-token-then-width-rune* order, concatenate the 104th literal token with the 103rd residue-rune: **`3Q` + `O` = `3QO`**, and the signed 2013 numeral decodes **`3×29² + 26×29 + 24 = 3301`**. The suffix O is robust to any ordinary radix admitting the displayed digit W (index32), because the original first token starts with 0. Even alternative admissible radix89 keeps this numeral32.
- The extraction `next literal token || previous byte modulo29 as GP letter` produces `3QO` at **exactly one adjacent two-cell start among all 255 in the unchanged original table**, the consecutive pair **103–104**. As a control, the distinct 2012 source image 503×509 (prime ordinals96,97) selects literal tokens `0Z`, `3g`; the identical rule gives **`3gG`**, rather than `3QO`. No cell, key, direction, page or dictionary output was adjusted after these two original source inputs were fixed.

This joins an original signed **2013 numerical example**, original **2014 LP2 printed bytes** and original **2016 signed-message image dimensions** in a new precise readout. It also links to the separately verified fact that the 2013 `3QO` digits, read as an ascending GF29 quadratic, divide the full original 256-byte table exactly ([original polynomial identity](2013-base29-gf29-grid-factor.md)). The table factorization and this numeral reconstruction **reuse the same signed 2013 example**, so they must **not** be multiplied as independent statistical successes.

**Whole-table generalization gate:** The same mixed rule applied to all 255 adjacent original cell pairs would attempt to read the second token as the first **two BASE29 digits** before appending the previous cell's GP residue. Of these 255 second tokens, only **131** contain two valid BASE29 digits; **124/255** contain at least one out-of-alphabet base60 character (digit value ≥29). Thus the local 3QO coincidence **cannot be extended mechanically into a full-table BASE29 numeral stream without a further independently supplied rule**. The selected 3Q is one of the valid two-character tokens; this is not evidence of a complete ciphertext decoder.

**Strongest objections and cipher frontier:** The 2016 text never commands taking image dimensions' *prime ordinals* as table indices. The choice to combine one literal table token with the previous cell's GP29 residue and reverse the natural width/height order was selected while exploring the numerical observations; neither 2013 nor 2016 source specifies that mixed extraction. The original target `3301` is the already-public organizer identifier, not a new secret or unknown-page key. Given many attempted table mappings and retrospective numerical selectors, uniqueness of this one preselected readout does **not** establish authorship or an unbiased discovery p-value. A real LP2 continuation would still need a creator-selected **operation acting on unknown ciphertext** and genuine forward-checkable plaintext. This finite result identifies no such operation.

The original-input [standalone Node22 SFT](../sims/lp2_3qo_source_ordinal_two_cell_sft.cjs) asserts p32 dimensions, prime ordinals, exact original table bytes and SHA256, the unique adjacent-pair reconstruction, the signed BASE29 result and the 2012 control. It does not fit or decode any unsolved LP2 page.

## Negative control: the 2012 image

The earlier 2012 image dimensions recorded in the same dimension study are **503 × 509**:

- 503 is the 96th prime.
- 509 is the 97th prime.

The same 1-based lookup selects cells 96–97: tokens `0Z` and `3g`, bytes **35** and **222**, residues **6** and **19**. They do not agree modulo 29, and their byte difference is not divisible by 29. Thus the 2016 result is not reproduced by this earlier prime-dimension control.

## Cross-link to the p32 M7 candidate

The existing p32-derived M7 candidate has a projective pole at **7**; its marked 13-rune window also has prime sum (413 equiv 7 pmod{29}). The two selected p50 cells decode to O, whose Gematria Primus prime weight is 7. The 2016 signed message's wording about “the path lies empty” and “numbers are the direction” makes an empty/pole interpretation worth testing.

A specific, still-unverified composition is:

1. Decode each p49–51 base60 byte (b).
2. Map (b mod 29) to a Gematria Primus rune index.
3. Replace that rune index with its Gematria Primus prime weight, reduced modulo 29.
4. Apply the forward p32 M7 map (f(x)=(14x+25)/(25x+28)pmod{29}), treating its pole (x=7) as infinity/empty.

This is distinct from the existing `p50-m7-nonlinear-stream-composition` experiment, which used raw byte residues as the period-256 key and applied M7 to the target stream.

Under this exact mapping, the 256-cell table yields nine infinity markers at 1-based positions **76, 103, 104, 111, 173, 177, 212, 219, 238**. The dimension-selected pair 103–104 is the **only adjacent infinity pair**, producing an empty segment between them. The resulting segment lengths are:

`75, 26, 0, 6, 61, 3, 34, 6, 18, 18`.

These segments are not plaintext. The empty segment is a structural match to the message wording, not proof of intended operation.

## Fixed follow-up: phase after cell 104 against p55 interior43

The only dimension-selected phase is immediately after cell 104 (start at cell 105). I rotated the 256-element transformed stream to that position, discarded infinity markers as empty, and took the first 43 finite values:

`[13,24,1,19,26,7,22,19,17,7,19,18,10,13,7,18,24,22,18,18,28,21,24,17,24,22,16,8,18,26,10,7,18,6,18,18,6,19,3,4,3,24,22]`

Applied as an additive key to the source-selected p55 interior43, both signs were tested modulo 29:

- (C-K): `GSJTYACCFIANJRYEOEOILMONGDEAIESAEINGNREAYGPPEONWSTHTAE`
- (C+K): `OCPAELNLXCEOEEADYMFGYIMWESHUEAYEAOAPRELLAEPDHGJ`

Neither output is recognizable plaintext or supplies a meaningful word structure. This rejects the proposed **direct additive p55 key use** of this transformed stream at the sole dimension-selected phase. Do not search other phases or signs.

## Quotient/remainder interpretation: same map symbol, opposite directions

The base29 byte decomposition `B=29q+r` is already documented and tested globally in `im-results/p50-base29-high-digit-radix9-source-gate.md`. There, (q) was interpreted through the standard 3×3 keypad mapping (q+1); the complete 256-step path did not produce plaintext or a convincing destination. Do not repeat that global walk.

The new dimension-selected pair gives a sharper **local** observation:

| Source image | Selected cells | ((q,r)) | GP symbol | Keypad direction |
|---|---|---|---|---|
| 2012, 503×509 | 96–97 | (1,6), (7,19) | G, M | south, north |
| 2016, 563×569 | 103–104 | (1,3), (7,3) | O, O | south, north |

Thus both image pairs select the same two quotient directions (q=1,7), which are opposite (south/north) under the existing keypad convention. Only the 2016 pair has the **same remainder/rune O at both ends**. Its two selected cells are adjacent in the same row; the 2012 control pair crosses a row boundary and has different runes. The two pair starts (96 and 103) differ by **7**, matching the p32 M7 candidate's pole value.

This gives a plausible reading of the signed-2016 hint: the remainder (r) supplies the map symbol, while quotient (q) supplies direction. The 2016 dimensions select an O/O pair with opposing directions, i.e. a zero-net or empty path. The p32 M7 pole7 is a suggestive cross-link, not proof that the same transformation is intended.

This local interpretation is **not** a recovered plaintext or destination. The direct p55 additive-key experiment above remains negative, and the global keypad path remains a documented negative. The only defensible retained claim is the dimension-selected local O/O, south/north marker.

## Decision and next question

Retain the prime-ordinal double-O observation as a structural candidate. Retire its direct p55 additive-key interpretation.

The only worthwhile continuation is to ask whether the nine separators and the dimension-selected empty segment identify an **independent, source-authenticated path or structure** in the 2016 message or LP2. Require a uniquely predicted result; if none exists, retire the broader composition too.

## Scope

This is an intermediate finding, not an established decipherment. It does not change the overall LP2 status. No unknown plaintext, authentic key, complete inverse, or final destination has been recovered.
