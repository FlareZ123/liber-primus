# p55 circumference exterior → interior direct-key gate

**Evidence classification (11 November 2026): bounded original-cipher negative, with exact reversible positive controls.** No unknown LP2 plaintext, authenticated key or decipherment method was recovered. A complementary source-selected receiver test also tried the 33-rune p55 exterior as a repeated key for the full 256-byte p50 table via the 2013 base29 byte transport and p56 C−K/F-bypass rule; no valid byte-stream path exists for any of 66 sign/phase combinations. This experiment tests a specific human-visible sequel to solved p57 and does not supersede the broader p55/43-unit research.

## Source premise and frozen input

Solved physical p57 says, “We must shed our own circumferences. Find the divinity within and emerge.” On the original physical p55, the 17 page-local printed rune segments have lengths `[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Their total is 76 runes. The initial one-rune segment completes a word started on p54. Keep it as one exterior rune; for each longer page-local segment, separate the first and last rune from the strict interior.

This source-preserving split yields **33 exterior and 43 interior GP29 runes** in printed order. The exterior candidate is concrete local key material, distinct from previously tested keys imported from signed-2016 words, the p50 43-byte bracket, the p32 compass path, or the literal known `FIRFUMFERENFE` / `DIVINITY` strings.

The exact GP-Latin serializations, containing multi-letter GP symbols such as `TH` and `NG`, are:

- Outside, 33 runes: `NGAEWSBXMSAEFUWRBEOMFBCEOEEASESTHOECXDUBI`.
- Inside, 43 runes: `MIEOGDTHIAABCEAFXIMUCPHNGLSDIAPHEOEIGXGSEOTHTHEEAIMCJE`.

The original interior IoC is **0.0343300111**. The source segmentation and rune assignments are asserted by the standalone reproduction program; no alternative boundary convention is searched.

## Fourteen source-fixed reversible inverses

All operations use zero-based GP indices in GF(29), retain original interior order, take no unknown key, and start at offset zero. For a rune `C_i` inside a page-local word with first `F_i` and last `L_i`, test precisely `P_i=C_i+aF_i+bL_i (mod29)`, with `a,b∈{-1,0,+1}` and not both zero: **eight masks**. Each repeated word endpoint is reused over that word's interior; words of length ≤2 have no interior.

The remaining **six** models treat the exterior stream `E` (33 symbols) as a key for the 43-symbol interior `C`: `P_i=C_i±E_{i mod33}` (cycling), `P_i=C_i±(E_i if i<33 else C_{i-33})` (ciphertext autokey), and `P_i=C_i±(E_i if i<33 else P_{i-33})` (plaintext autokey). The two 33-step feedback variants have unique explicit inverses; the cipher-autokey state is the recovered original interior ciphertext, and the plaintext-autokey state is its reconstructed plaintext. None involves fitted phases, arbitrary word rotations, or external guessed secrets.

The reproducer applies every original inverse, encrypts the candidate forward and asserts recovery of all 43 original ciphertext indices. It independently plants solved p57's first 43 body runes as plaintext under **each of the 14 modes**, then decrypts them exactly.

## Original result and source-native controls

The original 14 plaintext candidates are all nonlinguistic. The best by the frozen trigram model is **exterior cycling with positive sign**, mean GP-trigram log score **−11.0045671**, interior IoC **0.02768549**, literal output:

`JGMNGJTBIPCFWEIATHLCUPRNXNTEAICDAFSDAERIANRTANLWE`

For comparison, the raw 43-rune interior score is **−11.2602620**, and the first 43 body runes of authentic solved p57 score **−7.6858792**. The trigram model is trained solely on the repository's solved LP1 English-reference transliteration after omitting editorial headings and bracketed comments; with fixed pseudocount 0.05, **every** contiguous 43-rune window of that GP-encoded source is at least **−8.1509860**, its median **−7.1660106**. Thus even the best original self-key candidate falls below the complete finite native-source window range. Short length and a single reference register limit the generality of the language comparison.

The nearest endpoint-mask alternative `a=b=+1` scores **−11.0211738** and also lacks coherent language. All exact candidates, native-control distributions, forward reconstructions and planted passage assertions are emitted by the reproducible SFT. The original unrecognized output of a bijective cipher is compatible with a wrong key; these round-trip checks demonstrate implementation correctness only.

## Complementary receiver: p55 exterior33 as key for the p50 256-byte table

The 2013 CicadaOS statement that “the key is all around you,” together with p57's circumference instruction, makes the exact 33-rune p55 exterior a plausible key candidate. This is distinct from the 14 already-tested exterior→interior self-key inverses above. The receiver was frozen as the full 256-byte p50 table from resources/liber-primus/lp2-grid-256.json.

Use the published two-GP29-symbol byte transport for each p50 byte B: high=floor(B/29), low=B mod29. Repeat the source-ordered 33-rune exterior key across the resulting 512-symbol stream. The p56 solved-page operation supplies the candidate GP29 additive inverse C−K; the literal-F exception is tested permissively, allowing each ciphertext F either to bypass without consuming key or to be shifted to a non-F, while any non-F ciphertext that decodes to F is rejected. Each pair must reassemble to a valid byte in [0,255].

**Result:** no complete byte-valid stream exists for **any of 66** combinations (both signs × all 33 initial phases), even with the permissive F-bypass branch. Failures occur within the first seven GP29 digits. Without F bypass, the source-fixed phase-zero C−K direction yields only **71/256** valid byte pairs; the opposite sign yields 61/256, and the best of all 66 no-skip phase/sign combinations reaches only **78/256**. Thus the 33-rune exterior does not decode the p50 table under this specific base29/repeating-key receiver.

A second, size-matched control uses the **32 page-local word-boundary runes** (the 33rd exterior rune is the p54 carry and is excluded) as raw byte values 0–28 for an AES-256 key. The p50 table is exactly 256 bytes, so raw **AES-256-ECB** is the minimal no-IV receiver. With padding disabled, decryption returns 256 bytes but no recognizable header or plaintext: SHA-256 **b2dffb03fa2f45fc68e78958e46dd72322eb8f5804439b5f33a3747f588f2d21**, printable fraction **0.332**, alphabetic fraction **0.176**. No KDF, IV, key normalization or mode search was attempted. This rejects only the direct GP29-index-to-byte AES-256-ECB interpretation.

This is a bounded negative. It does not exclude a different original instruction, receiver, or non-Vigenere use of the exterior; it does not supply the missing full p55 decoder. The standalone original-input tests are [sims/lp2_p55_outer33_p50_base29_key_gate.cjs](../sims/lp2_p55_outer33_p50_base29_key_gate.cjs) and [sims/lp2_p55_outer32_p50_aes256_ecb_gate.cjs](../sims/lp2_p55_outer32_p50_aes256_ecb_gate.cjs).

## Decision

Retire **the 14 explicit direct GP29 endpoint/exterior self-key readings of p55's 43 strict interiors** under the original page-local segmentation and clocks, and the complementary p55-exterior33 → p50-256-byte base29 repeating-key receiver tested above. Retain the original 33/43 geometry and the solved p57 instruction as independent evidence for a potential more elaborate operation. These failures do not exclude a source-fixed fold, non-GP register, an external key, or a new lossless stateful mechanism. A subsequent experiment should first find an independently recognizable readout or historical instruction that chooses its operation, rather than search further arbitrary endpoint coefficients.

**Reproduction:** [14-mode p55 self-key CJS SFT](../sims/p55_exterior_interior_direct_key_sft.cjs), called by the existing [manual p57-word-circumference workflow](../.github/workflows/lp2-p57-word-circumference-manual.yml); complementary [outer33-to-p50 base29 receiver SFT](../sims/lp2_p55_outer33_p50_base29_key_gate.cjs). [Successful original-source and planted-control CI run 43107344241](https://github.com/FlareZ123/liber-primus/actions/runs/43107344241), job `130814010198`.
