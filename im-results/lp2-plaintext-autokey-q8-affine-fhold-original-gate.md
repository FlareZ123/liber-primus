# Eight-rune plaintext autokey with arbitrary invertible affine feedback

**Decision, 24 November 2026 (Agent4):** The direct native-GP/intact-printed-group model with continuous consuming-rune q8 plaintext feedback is excluded for original p0–2, independently coded black body, and p54–55 even when the feedback map is any of the 812 invertible affine maps over GF(29). Three separate planted native controls recover the full unknown affine map, unknown eight-symbol primer and 984/984 untouched continuation runes. No original unknown plaintext or key recovered.

## Mechanism and exact recovery

Extend [the existing fixed identity-feedback q8 inverse](lp2-plaintext-autokey-q8-fhold-primer-exact.md), without rerunning that single model as the research objective. For state queue K of length 8, a nonzero plaintext rune p emits c=p+K[0] (mod29), consumes that queue entry, and appends a*p+b (mod29), for unknown a in 1..28 and b in 0..28. Native plaintext F=0 emits literal c=0 without advancing. A ciphertext F can alternatively be a consuming non-F output. A q8 primer may contain any of 29 values per slot; the feedback map must remain fixed in a tested segment.

Use the same 38,920 distinct GP spellings and canonical original word segmentation as the preceding attack. Freeze each training prefix at the first whole group crossing 200 runes (188 for the independent black-body prefix). Select the training group's maximum observed nonzero count, then length, then earliest offset, among groups with at least eight nonzero outputs preceded by at least eight nonzero outputs. This is a ciphertext-only selector. No source instruction authenticates the affine extension; it is a constructive test of a distinct broader classical autokey family, motivated by authentic q8 DIUINITY and native F transparency.

For every same-length dictionary word, discard impossible plaintext-F placements and let p_j be the remaining consuming plaintext values, d_j=c_j-p_j the implied consumed shift. For j>=8, d_j=a*p_(j-8)+b. If one such equality exists, derive b for each a; otherwise enumerate every a,b. Check every remaining equality. The anchor determines the incoming queue as d_0..d_7 and the outgoing queue as the last eight transformed plaintexts. Since the preceding physical prefix necessarily consumed at least eight symbols, no anchor incoming shift may equal b=f(0). From the last queue value k, a reverse consuming step has p=a^-1(k-b), recovers the previous shift c-p and reinserts it. Disallow p=0 on consuming steps; disallow recovered shift b only after eight guaranteed earlier consumptions. Explore both legitimate zero interpretations, with exact native word-trie filtering, forwards and backwards. Every surviving training solution replays the prefix; freeze it before scoring the continuation. A 10M visit cap is declared but no case reached it.

This grants all 812 affine feedback maps and all 29^8 primers, not merely a chosen slope, offset or known key. It is conditional on intact groups, native vocabulary, nonzero slope, q8, fixed affine feedback and continuous clock. It does not eliminate arbitrary nonlinear maps, alternative registers, variable clocks, or spacing-free paths.

## Actual executed results

| Planted native source | Feedback (a,b) | Train / holdout | Exact recovered map/primer | Withheld exact |
|---|---|---|---|---|
| second KOAN (jpg107-167) | (3,7) | 200 / 119 | unique | 119/119 |
| LOSS OF DIVINITY | (28,5) | 203 / 552 | unique | 552/552 |
| WELCOME | (17,11) | 202 / 313 | unique | 313/313 |

All 984 withheld runes and entire planted ciphertexts replay exactly. The vocabulary contains the control word types, not their order or true parameters. These are synthetic encryptions of authentic solved rune spellings, not evidence the historic ciphertext used this mechanism.

| Original target | Train / withheld | Anchor offset / length | Compatible (word,a,b) anchors | Distinct affine maps at anchor | Forward training survivors |
|---|---|---|---:|---:|---:|
| p0–2 | 201 / 528 | 23 / 11 | 41 | 41 | 0 |
| p0–2 black body only | 188 / 528 | 10 / 11 | 41 | 41 | 0 |
| p54–55 | 205 / 103 | 60 / 10 | 3519 | 771 | 0 |

All three searches finish uncapped (90,90,7726 trie visits). No original prefix survivor exists, so no original held-out plaintext is claimed. All 812 maps were admitted; maps excluded at the anchor violate exact anchor constraints. On WELCOME the algorithm processed 91,650 compatible anchors spanning all 812 maps and selected a unique complete solution.

## Reproduction

[Single-file Node/CommonJS SFT](../sims/lp2_plaintext_autokey_q8_affine_fhold_sft.cjs), commit [9043712](https://github.com/FlareZ123/liber-primus/commit/904371241498cf200ad958067c505394ee3b219b). Execute from repository root with `node sims/lp2_plaintext_autokey_q8_affine_fhold_sft.cjs`. The code executed on the actual connector-fetched inputs in isolated JavaScript; no Windows CI run is claimed. Source blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; transcription 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7; solved native controls 1b064ef6d85819b7d96adaff31a82d1ec551598f; word frequency 140e1d22b5f8c45deddd2e8b25549d9d6307d938.

**Research consequence:** Do not retune fixed affine feedback coefficients or primers for these native intact-group q8 targets. A nonlinear feedback or a different independently motivated receiver would be genuinely different. No new authentic plaintext.
