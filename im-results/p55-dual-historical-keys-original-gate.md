# Original p55 two-channel CIRCUMFERENCE / DIVINITY key gate

**Status (13 November 2026, Agent 11): bounded original-cipher negative. No unknown LP2 plaintext, source-authenticated decoder, key application, or final destination recovered.** This study tests a direct source-motivated combination of two historical GP29 keys on the complete 76-rune physical p55.

## Why this inverse

The solved physical p57 says to “shed our own circumferences” and “find the divinity within.” The independent, provisional 2016 word-address and p55 fold route [derives CIRCUMFERENCE and DIVINITY](lp2-2016-p55-fold-circumference-keys.md). The former's historically reconstructed solved LP1 A-KOAN key is **FIRFUMFERENFE**; the latter normalizes to **DIUINITY** in GP spelling. This suggests applying the first key to complete word exteriors, the second to strict word interiors, while retaining every original rune.

On physical p55 (resources/liber-primus/72.jpg, SHA-256 a80191592add93a86ed3868f9e4e6ba3944ec20c9ffccc7d3e221b461344beba), the exact page-local rune segment lengths are **[1,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**, totaling 76. The initial one-rune segment completes an incoming word from p54. Taking the first and last rune of each segment as exterior, and retaining both runes of every length-two segment, selects **33 exterior** and **43 strict-interior** runes. Their unchanged GP indices are taken from the canonical resources/liber-primus/lp2-corpus.json. No word is resegmented.

The GP29 keys are **FIRFUMFERENFE** with indices [0,10,4,0,1,19,0,18,4,18,9,0,18] (period 13), and **DIVINITY** with V→U with indices [23,10,1,10,9,10,16,26] (period eight). The first rule is P[i]=(C[i]−K[channelClock(i)]) mod29. Both channels advance independently in the order their runes appear, and all 76 ciphertext symbols are decoded.

## Direct clocks, source-F controls and held-out English

Use three printed-structure clocks: phase advancing **per channel**, phase resetting **per page-local word segment**, or phase advancing **per entire page**. Apply named keys to named channels, and include swapped assignment as a wrong-hypothesis control. The two literal-F conventions are no interruption, and source-visible ciphertext-F positions passed through without advancing the clock. This gives **3 × 2 × 2 = 12** original-input variants. There is no fitted offset, unknown cipher alphabet, prime number guess or search over other operators.

Train a GP29 trigram model on the first 40,000 GP-normalized runes of the repository's pinned Gibran reference (resources/control/gibran_prophet_58585.txt), then compare each p55 decode with **all 22,621 overlapping 76-rune windows** of the 22,696-rune held-out remainder. The exact matched control scores span **−9.7483938015 to −6.8431364709** under a fixed 0.1-pseudocount log score.

| Clock | Source-F transparent | CIRC edges / DIV core | Swapped keys |
|---|---|---:|---:|
| Channel-local | No | −12.229560 | −12.437062 |
| Channel-local | Yes | −12.401151 | −12.631448 |
| Segment/word-local | No | −12.360712 | −12.502280 |
| Segment/word-local | Yes | −12.220990 | −12.404311 |
| Page-continuous | No | −12.210250 | −12.082585 |
| Page-continuous | Yes | −12.076085 | −12.069862 |

**None of the 12 original decodes attains even the worst native control score; all 22,621 held-out windows score better than every candidate.** The complete 76-rune source-named channel-local transliteration (no F interruption) is:

> NGSAEFOSTAMYJAEXNGNGJJIADANGWSBIAMCFORJOWJJTHSCWUMFTIAJSEOFAHUAEIANYNNGTHUNGNSPOEAEDOEJIDUFIABI

The full decoded GP29 index of coincidence is **0.0403508772**. Its output does not read as coherent prose.

All original outputs re-encrypt **76/76** authentic ciphertext rune indexes exactly; source-F variants use the frozen original F mask. Matched 76-rune GP-native planted controls recover **76/76** symbols under all 12 settings. For interrupter plants, three source-fixed F sites remain F. Forward round trips are only arithmetic consistency tests: incorrect bijective keys also reproduce the original ciphertext.

The [complete original SFT](../sims/p55_dual_historical_keys_original_sft.cjs) asserts the source-image hash, original corpus count, exact 33/43 segmentation, key indices, round trips, native controls and language bounds. Run under Node.js 22 from repository root.

## Decision and scope

**Retire this explicit, directly reversible two-channel historical-key Vigenère model** of all original p55 glyphs under three source-shaped clocks and the source-fixed F interrupter. The source's actual key-to-channel selector remains absent. The 2016 base-58 word map, the fold totals and the p57 circumference instruction are genuine inputs with provisional connections. The gate leaves their geometry and possible future meanings unresolved; nonadditive operations, different authentic key assignments and source-selected external state are outside this bounded exclusion. Further unselected phase/offset variants have no strong causal path to plaintext.
