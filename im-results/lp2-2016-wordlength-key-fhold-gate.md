# 2016 29-word core as a direct word-length key: F-hold rejection

**26 November 2026. Independent bounded test; no plaintext or key recovered.**

## Human-solve hypothesis

The signed 2016 message's central 29-word core ends with “direction” and says: “Its words are the map, their meaning is the road, and their numbers are the direction.” A natural, source-constrained numerical reading is to use each word's length as one key value. Because the alphabet is GP29, both ordinary Latin-letter length and length in GP29 rune tokens are reasonable interpretations. The solved p56 receiver independently supplies the literal transparent-F rule.

This is not an authored cipher instruction. It is a cheap, discriminating test of the direct 29-period additive interpretation before any more elaborate semantic/navigation theory.

## Frozen receiver

For each original ciphertext symbol \(C_i\), test:

\[
P_i = C_i - s\,L_{(j+r)\bmod 29}\pmod {29},
\]

where \(s\in\{-1,+1\}\), \(r\in\{0,\ldots,28\}\), and \(j\) advances only when \(C_i\ne0\). Ciphertext F/index0 is transparent and holds the key clock, matching the p56 convention. The stream is continuous over original p0–p55; no page/chapter resets, extra translations, fitted key values, or altered boundaries are introduced.

The exact 29-word core is:

\`The path lies empty epiphany seeks the devoted Liber Primus is the way Its words are the map their meaning is the road and their numbers are the direction\`

The two source-derived length keys are:

- Latin-letter lengths: \`[3,4,4,5,8,5,3,7,5,6,2,3,3,3,5,3,3,3,5,7,2,3,4,3,5,7,3,3,9]\`
- GP29 rune-token lengths (greedy TH/EO/NG/OE/AE/IA/EA): \`[2,3,4,5,8,5,2,7,5,6,2,2,3,3,5,3,2,3,4,5,2,2,4,3,4,7,3,2,9]\`

## Exact result

The original physical p0–p55 transcription contains 12,956 runes and 2,896 complete groups. Dictionary scoring uses 12,244 distinct word forms from the pinned Shakespeare, Emerson and Gibran English control texts.

| Receiver | All 58 sign/phase trials: min / median / mean | Best sign, phase | Best dictionary hits |
|---|---:|---:|---:|
| Unkeyed ciphertext | — | — | 88/2,896 (3.04%) |
| Latin-letter length key | 71 / 93 / 93.47 | \(+1,\ r=18\) | **117/2,896 (4.04%)** |
| GP29 rune-length key | 78 / 94 / 94.41 | \(-1,\ r=10\) | **115/2,896 (3.97%)** |

The best Latin-length output begins:

\`iutfthtoef hdseoth iawub fgm aerae wsrxmeomncxea gngoca cxfa\`

The best GP29-length output begins:

\`binggjoeff euddw gxio fxa eojc pdsoeyoeiaeeodr eouneoc eooejf\`

## Cross-source 5×23 register hypothesis

The same 29-word core tokenizes to **115 GP29 symbols**. The signed 2013 TCP/DH example independently supplies generator (g=5) and modulus (p=23), so (115=5\times23) suggests a 5×23 register. The locked, source-motivated interpretation tested here fills a 5×23 matrix row-major, orders its 23 columns by the multiplicative powers of 5 modulo23 (the 22 nonzero residues), appends the zero column, then reads each ordered column top-to-bottom. This produces a 115-symbol repeating key. The DH shared value 2 was not applied as an additional shift in this locked test; using it as a Caesar offset or other parameter would be a separate, unselected hypothesis.

| 115-symbol receiver | All 230 sign/phase trials: min / median / mean | Best sign, phase | Best dictionary hits |
|---|---:|---:|---:|
| Raw GP29 core sequence | 73 / 93 / 94.23 | (+1, r=49) | **118/2,896 (4.07%)** |
| DH23-ordered 5×23 sequence | 75 / 94 / 93.67 | (-1, r=82) | **119/2,896 (4.11%)** |

Neither output is English. The DH example's explicit shared/public values also fail as phase selectors: offsets 0, 2 (shared), 8 (server public) and 19 (client public) give, for the DH-ordered key, 98/90, 84/90, 99/96 and 90/104 dictionary hits for the two signs respectively. The 5×23 count is a real cross-source alignment, but the signed DH example does not explicitly instruct this tokenization or matrix reading; the locked candidate fails as a repeating additive key. Do not promote the factorization itself to a decryption claim or search arbitrary zero-column positions/readouts without new evidence.


Neither is lexical English. Even the best phase leaves more than 95% of original groups outside the broad control lexicon. The slight lift over the unkeyed 3.04% baseline is not plaintext evidence; the mean across the 58 trials is only 3.23% (Latin) or 3.26% (GP29).

## Decision and scope

Reject the direct 29-word-length additive key under the continuous transparent-F receiver. Both natural length conventions, both signs and every cyclic phase were exhausted. No original language scoring beyond this bounded word-dictionary screen is warranted.

This does **not** reject semantic navigation by the 2016 words, a different independently sourced numerical representation, or a different cipher family. It rejects only the direct word-length-as-additive-key interpretation. Do not rescue it with page resets, per-word phase changes, arbitrary offsets beyond the 29 cyclic phases, or additional key transformations without a new source clue.

## Reproduction

Run from the repository root:

\`node sims/lp2_2016_wordlength_29key_fhold_gate_sft.cjs\`

The script asserts the exact signed-message core, both length vectors, the raw 115-symbol GP29 sequence, the DH23 power-order 5×23 permutation, the original 2,896-group framing, the 12,244-word control lexicon, all 58 length-key trials and 230 trials for each 115-symbol key, and the best/unkeyed hit counts.
