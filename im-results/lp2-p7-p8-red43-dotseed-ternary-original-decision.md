# P7–p8 red 4|3 products and original five-dot seed: ternary-state inverse decision

**Agent31, 22 November 2026. Classification: source-visible arithmetic and a new bounded original-cipher decoder failure. No authenticated unknown LP2 plaintext or author-selected ternary instruction.**

## Most direct source route a 2014 player could try

The original physical [p7 JPEG](../resources/liber-primus/24.jpg) has exactly five final red complete words (offsets194–207) followed by five independent black dots. The original physical [p8 JPEG](../resources/liber-primus/25.jpg) starts with a **red 4-rune word and red 8-rune word**, and then exactly **243 black rune characters** in ordinary line/word layout. Source rune/word boundaries are preserved in the [canonical transcript](../resources/liber-primus/lp2-transcription.txt); independent [ink source](../resources/liber-primus/lp2-ink-annotations.json) identifies the red12/black243 boundary.

A single previously proposed GP29 rule, **multiply each complete red word's 0-based rune indices modulo29**, produces:

| Original printed operand | Exact GP29 rune-index words | Products modulo29 |
| --- | --- | --- |
| p7 final five red words | `[23,3] [22,16,2,25] [5,7,11] [14,28] [6,28,19]` | **11,26,8,15,2** |
| p8 opening first red word | `[14,10,14,19]` (transliteration `XIXM`) | **4** |
| p8 opening second red word | `[1,14,19,5,2,13,3,17]` (transliteration `UXMCTHPOB`) | **3** |

**New conditional reading:** the same source product rule could supply the ternary field **3** from p8's second red word, without first selecting it solely because 243=3⁵. The first red word's product **4** could then identify a run of *four zero trits* in a fifth-order maximal-length sequence, where inserting one zero forms a 243-trit de Bruijn cycle. Thus the two separate p8 red words may conditionally suggest **4|3 = zero-run length | alphabet base**. This interpretation was noticed after the prior 243/GF3 connection and is not independent proof of the author's intent. The second-word product3 was previously noted as a *cube/exponent* operand in [the p7 five-dot skip/cube study](lp2-p7-p8-five-dot-lfsr-skip-cube-original-gate.md); this report investigates a different, explicit field/splice reading.

The source does **not** delimit `XIX` as a standalone Roman-numeral word: `XIXM` is the intact four-rune first word. Prior descriptions of a Roman-looking initial `XIX` need this qualification.

## Frozen next-step inverse on original unmodified ciphertext

The original p7 [five-dot geometry](lp2-p7-fivedot-shamir-dual-dh-source-gate.md) fixes left-to-right dot **height ranks [3,5,1,4,2]**. Using the red second product3 as the modulus gives nonzero seed **[0,2,1,1,2]**. The original p7 five-word products reduced modulo3 give fifth-order taps **[2,2,2,0,2]**. Fix the standard shift-left, dot-product-last recurrence on five-trit states and emit its first trit at every step.

- From that genuine source seed, the recurrence visits **242 distinct nonzero states**, returning to its seed. The resulting cyclic output contains **two** four-zero runs, starting at source-generated zero-based positions **22** and **143**.
- Inserting a zero *after* either run yields **243 distinct cyclic five-trit address windows**, including exactly one 00000. **Both splices remain mathematically legitimate, with no known original author selector.**
- In each case map the 243 unchanged p8 black runes in their printed order to the 243 generated state addresses. The resulting two 243-cell state tables differ in **119** addressed values, so choosing a splice is consequential.
- For a finite direct consumer, decode all original p9–p14 **1,474 unmodified GP29 runes** via `P_i = (C_i ± T[previous five symbol trits]) mod29`. The address uses either original rune indices or GP prime weights modulo3; predecessor symbols are either ciphertext or already-decoded plaintext. Both initializations use the actual final five p8 runes. This is precisely **2 splices ×2 address readings ×2 signs ×2 feedback registers =16 frozen models**, with no fitted phase, corpus key or residual punctuation edit.

| Original/known-source comparison | Measured result |
| --- | ---: |
| Raw original p9–14 GP29 IoC | **0.03444083047** |
| Best across all 16 new original-source receivers | **0.03487284923** |
| Lowest of the 16 | **0.03425015268** |
| Original p9–14 ciphertext re-encryption | **1,474/1,474 in all 16** |
| 1,474-rune known GP-native p57 plaintext plant | **1,474/1,474 recovered in all 16** |
| Native p57-repeat planted plaintext IoC | **0.07170221840** |

The best original candidate begins `GSOEAEAEXRIAMWCBLYPINOEIXUCTBMLHEAFF...`; it is neither recognizable plaintext nor native-GP-English-like. Forward reencryption proves implementation consistency, not key correctness. A full-length native solved-source plant confirms that a genuine GP-language message survives each inverse. The new dot-rank-seeded direct p8 table receiver does not decode the original p9–14 corpus under these sixteen explicit operations. Previous seeds and different receivers were tested in [the original p7 primitive GF3 study](lp2-p7-primitive-gf3-msequence-p8-original-table-gate.md); those negatives remain separate.

**Read-only reproducible Node22/CommonJS SFT:** [`lp2_p7_p8_red43_dotseed_gf3_original_sft.cjs`](../sims/lp2_p7_p8_red43_dotseed_gf3_original_sft.cjs). It asserts the unchanged source glyph words, product values, source dot ranks, 242-state orbit, both 243-address tables, exact original replay and all sixteen p57-native plants.

## Authored-operation decision

An attentive human in 2014 could see the five p7 dots/words, the p8 red 4|8 heading, and the 243 printed black runes. The recurrence becomes plausible after **choosing** multiplication mod29 of p7 and p8 red indices, reduction modulo the latter product3, fifth-order shifting, and a zero splice. These choices were not stated in the first-party original JPEGs or the authenticated historical [2013 signed TCP challenge](../resources/external/2013-tcp-server-signed-source.md), whose stated operations include DH and BASE29 rather than a GF3 m-sequence. The [original 2014 distribution index](../resources/historical/cicada2014-onion7-original-index.html) lists image files and gives no additional algorithm.

The two source products **4|3** narrow the earlier motivation for the modulus and zero-run operation, but still do not select which of the **two** valid splices to use or how a five-trit state becomes an original GP29 plaintext symbol. The actual p8 tree drawing contains an upright branching/root illustration, without a visibly enumerated 243-cell ternary code or an output-labeling rule. A hypothetical historical author would need to provide, somewhere recoverable, an executable **address→ciphertext/keystream readout and deterministic splice instruction**. No authenticated first-party text currently supplies either.

**Decision:** preserve the p8 red **4|3 product** as a concrete additional source operand for a future genuine instruction; retire this frozen p7-dot-seeded, p8-state-table, p9–14 additive receiver family as a direct GP-native decipherment. No original plaintext, key, or verified independent continuation has been recovered. Do not promote the 4|3 numerical correspondence to an established mechanism without a separately sourced opcode that predicts unseen ciphertext.
