# p55 circumference exterior → interior direct-key gate

**Evidence classification (11 November 2026): bounded original-cipher negative, with exact reversible positive controls.** No unknown LP2 plaintext, authenticated key or decipherment method was recovered. This experiment tests a specific human-visible sequel to solved p57 and does not supersede the broader p55/43-unit research.

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

## Decision

Retire **the 14 explicit direct GP29 endpoint/exterior self-key readings of p55's 43 strict interiors** under the original page-local segmentation and clocks. Retain the original 33/43 geometry and the solved p57 instruction as independent evidence for a potential more elaborate operation. These failures do not exclude a source-fixed fold, non-GP register, an external key, or a new lossless stateful mechanism. A subsequent experiment should first find an independently recognizable readout or historical instruction that chooses its operation, rather than search further arbitrary endpoint coefficients.

**Reproduction:** [standalone CJS SFT](../sims/p55_exterior_interior_direct_key_sft.cjs), called by the existing [manual p57-word-circumference workflow](../.github/workflows/lp2-p57-word-circumference-manual.yml). [Successful original-source and planted-control CI run 43107344241](https://github.com/FlareZ123/liber-primus/actions/runs/43107344241), job `130814010198`.
