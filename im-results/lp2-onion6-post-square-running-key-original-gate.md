# 2014 Onion6 post-square three-page running-key transfer to LP2

**Decision: negative for the one source-constrained transfer tested.** The three immediate post-square pages form a well-defined 408-rune GP29 source text, but using that text as one repeated Vigenère key does not recover LP2 plaintext.

## Hypothesis and historical path

After the 2014 square-submission stage, the Onion6 service returned three further pages, archived as 107, 167, and 229. Pages 107 and 167 are ciphertext; page 229 is clear. A human solver who had just completed the square submission could plausibly try these immediately returned pages as a single running key for the subsequent Liber Primus release. This is a bounded hypothesis, not an instruction preserved in the signed release.

The source transcription is [`2014-onion6-seven-rune-pages.json`](../resources/external/2014-onion6-seven-rune-pages.json). The historical source-page decryption is independently reproduced by [the colon-F source SFT](../sims/2014_onion6_explicit_colon_fskip_lp2_marker_census_sft.cjs) and consolidated in [the Onion5–Onion6 chain report](2014-onion5-geb-onion6-chain.md).

## Frozen serialization and operation

1. Decrypt page 107 and then page 167, carrying one key clock across the page boundary, with the 13-symbol key `FIRFUMFERENFE`, standard GP29 indices, and the historical subtraction `P=(C-K) mod 29`.
2. Hold the key clock only at the two literal colon-marked F runes on page 107 (rune offsets 49 and 58). Page 107 contains 226 runes; page 167 contains 93 and begins at key phase 3. The combined source decryption consumes 317 key positions.
3. Page 229 is already clear and contains 89 runes. Concatenate the exact rune streams from 107, 167, and 229 in delivery order. The resulting repeated key is exactly 408 GP29 runes. Preserve source punctuation in the reconstruction, but punctuation is not a key symbol.
4. Apply one continuous repeated key to the original LP2 p0–55 rune stream, beginning with key rune 0 at the first rune of p0:
   [
   P_i=(C_i-K_{i\bmod408})\bmod29.
   ]
   There are no LP2 page resets, offset searches, rotations, or key transformations. The original LP2 transcription contains no literal colon markers, so the archived colon-F hold rule authorizes no target-side F skips; every one of the 12,956 target runes advances the key, including all 458 F runes.

The original LP2 tape is 13,136 runes: 12,956 unknown runes on p0–55 and 180 known runes on p56–57. The transcription matches the page-mapped corpus rune-for-rune before the operation.

## Result

| Fixed window | Runes | Output GP29 IoC |
|---|---:|---:|
| p16–21 | 1,613 | 0.03436251 |
| p40–53 | 3,008 | 0.03449398 |
| All unknown p0–55 | 12,956 | 0.03447862 |
| Uniform 29-symbol baseline | — | 0.03448276 |

The output is essentially uniform at the 29-symbol level, not natural GP29 prose. The first 220 GP-labels in the two untouched windows are:

- p16–21: `THLGJOEORHMWYRFUEAENIAESBCTSMLRLSOEATHNGBCJFSEAWTECAAJDNGIAOEMEOAEEATHMFETHTMRPGOWUWCCBTHCTAETWAECCXXPGBIEAEOPBYOIASSAEXEEAAEWJCMAEMGRLYUOEYXLOENUNXEAHNXPBGWAEMAEEATATHPBOEHNGDFTJAEALTNGRPPCEOEOEPEPHIATFREHGAYXLNGIMREAUGGJRXLBTWJEOMLIAMJJWONGWETOTOEGWFIAEPTXFXOENGJNG`
- p40–53: `EADOJJPTHJNGEOGTHWDMFBPJDTHFWCYELYMFAUTHRAERFTHSEOOUFHJPMFSNGNRAEGYYCNIUNGIISNGEOTHAOXAEAEATEODGTHHTOEUMHUTEODMHNGOEGIIAOEEAEAXXJNGDTHUFMNGIUJRYLSXOLWXFSRWNGTAERSUIBITHOEJEYJDJHTYRRNGFTHIIAEOAEWFUSNNGEACNIAJSACPELYCHBITHAEEAEOAEHOERPUMXJSOEWOTHOEAIIATEUJEJAEUIFOGPAEAELJTWAEW`

The exact forward replay reproduces all 12,956 original ciphertext runes. Native solved p56 and p57 plaintexts, separately and together, pass encrypt-then-decrypt planted controls under the same key schedule. The p57 reference IoC is 0.062706, materially above the tested unknown windows. These controls validate the implementation; they do not make the candidate plaintext coherent.

**The acceptance threshold is not met:** there is no 150-rune coherent unknown plaintext segment or 200-rune disjoint holdout. The complete untouched p16–21 and p40–53 output, the exact reconstructed source pages, the 408-rune key, and the unchanged p49–51 numeric grid are preserved in [the complete output artifact](lp2-onion6-post-square-running-key-output.txt). Reproduce with [the Node SFT](../sims/lp2_onion6_post_square_running_key_original_sft.cjs).

## Interpretation

This rejects only the fixed, single-start, 408-rune post-square running-key transfer under the historical GP29 subtraction and literal-colon F-hold convention. It does not reject other uses of the three pages, other independently instructed operations, or unrelated LP2 mechanisms. No phases, crops, rotations, page resets, alternate alphabets, or scoring-selected variants were searched.

No unknown plaintext, authentic LP2 key, or intended continuation was recovered. Reopen only if an independent period instruction specifies a different operation/receiver, or new source material changes the three-page serialization.
