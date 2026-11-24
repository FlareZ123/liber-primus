# Literal word-circumference shedding: exact GP29 partition and decision

**Agent40 · 16 November 2026 · Director Issue #1266.** This is a bounded original-cipher negative. The clear physical p57 PARABLE instructs readers to “shed our own circumferences” and “find the divinity within.” A human-visible application is to each **printed word**: discard its exterior first/last GP29 runes and read the interior. That operation is exact and unparameterized. No independently authored rule here says how the discarded shell transforms the interior or how a plaintext key is to be reconstructed.

## Source and reversible accounting

The original ciphertext input is `resources/liber-primus/lp2-transcription.txt`, independently checked rune-for-rune against `resources/liber-primus/lp2-corpus.json` for all 55 rune-bearing unknown physical pages p0–p55 (p50 contains no runes). A word continues across a printed line or page and ends only at source word/punctuation separators `-`, `.`, `&`, `$`; the 32 carried words are retained as **single words**. Every one of the 29 GP symbols is preserved, including `ᚠ` (F). The verified **138 small four-dot stops** remain untouched in the original punctuation source; the transcription's 175 period characters must not be misidentified as 175 physical small stops.

For one word `w` of length `n`: if `n=1`, its shell is `w` and the interior is empty. For `n≥2`, its shell is `w[0] + w[n−1]` and its interior is `w[1..n−2]`. The exact inverse is `shell[0] + interior + shell[1]` for length-two shells, and `shell` for length-one shells. Applying the inverse to all source words, and then retaining the original punctuation/page/line boundaries, reconstructs **all 12,956 original GP29 rune indices exactly**. This is a positional identity, not evidence for a historical cipher.

The [exact 2,896-slot ordered tapes](lp2-word-circumference-tapes.json) include one shell and one interior for every authentic word, **531 explicitly empty interior slots**, and the 32 carried-word indices/page memberships. The [read-only source-native CommonJS SFT](../sims/lp2_word_circumference_sft.cjs) asserts page/count parity, complete reconstruction, synthetic one-letter/two-letter/F/carry restoration, literal readout statistics, and the p57 cleartext control. It requires only Node's built-in modules and the pinned source corpus.

| Source partition | Word slots | GP29 runes | Index of coincidence |
| --- | ---: | ---: | ---: |
| All unknown original words | 2,896 | 12,956 | 0.03447840 |
| All exterior shells, retaining one-letter words | 2,896 | 5,709 | 0.03448286 |
| All interiors, including 531 empty slots | 2,896 | 7,247 | **0.03447346** |
| p0–2 literal interiors | 158 | 418 | **0.03413537** |
| p40–53 literal interiors, disjoint test | 669 | 1,683 | **0.03456259** |
| Genuine clear p57 before shedding | 20 | 95 | 0.06270997 |
| Genuine clear p57 after shedding, interiors | 20 | 55 | **0.07138047** |

The section counts include any original word whose source page membership intersects that section; carried words are not cut and a boundary word can contribute from an adjoining page. The p0–2 section has 729 total rune positions and 311 shell positions; p40–53 has 3,008 original positions and 1,325 shell positions. The source rune alphabet's uniform baseline is 1/29 = **0.03448276**.

## Actual readout and causal decision

The first p0–2 interior words transliterate `HEOGMIA-YENG-JG-J-N-EWBASOEEOING-AEGI-BN-B-J-NGY`; the p40–53 control starts `N-GDAE-PXY-EAO-NG-ITTH-AC-ROEGEANAEBUEB-F-S`. These are literal source-derived runes after one peel, before any cipher search. Neither readout yields a contiguous recovered GP-native plaintext. Their large-sample IoCs remain essentially uniform, whereas even the 55 interior runes extracted by the identical procedure from the independently **clear** p57 remain distinctly nonuniform.

**Rejected in this bounded decision:** the direct assertion that p57's shedding instruction exposes ordinary GP29 prose by deleting the first and last original rune of each printed ciphertext word, with existing word order and word divisions preserved. The exterior channel itself is likewise uniform in its pooled symbol frequencies. For 83 one-rune and 448 two-rune original words, literal shedding leaves **no interior word whatsoever**; those 531 slots cannot directly supply the corresponding plaintext words under a one-for-one word-boundary-preserving inverse.

### The authentic DIVINITY key applied inside each original word (Agent48, 17 November 2026)

A new, narrowly source-selected candidate combines both original solved p57 instructions: “shed our own circumferences” selects each printed GP29 word's strict interior, while “find the divinity within” supplies the authenticated **DIVINITY** keyword from solved LP1. The test preserves the first/last original runes, all **2,896** actual printed words, the **32 page-carried words** and all **7,247** interiors. The GP29 key restarts at the first interior rune of every word; both additive directions are frozen. No per-word fitted key, variable phase, reordering or extra layer is introduced.

The exact source gives these GP29 Shakespeare bigram scores across **4,882 adjacent pairs within the printed-word interiors**:

| Receiver | Interior bigram log-score per pair | Overall interior IoC |
| --- | ---: | ---: |
| Original minus DIVINITY | **−4.580545** | **0.03443552** |
| Original plus DIVINITY | **−4.539053** | **0.03445876** |
| Matched native-GP Gibran control | **−2.628306** | **0.07296240** |

An independently sampled English GP29 plant preserving **all 2,896 exact original word lengths** reencrypts and recovers every one of its **7,247** interiors using this key-reset program, leaving outer shells unchanged. The untouched original **p0–2** interior (418 runes, 293 internal bigrams) scores **−4.608639** in the subtractive direction. The disjoint original **p40–53** interior (1,818 runes, 1,221 internal bigrams) scores **−4.544330**. The source interior remains near-uniform and nonprose in both orientations.

**Decision:** Retire this *specific word-shell-preserving, local-restart DIVINITY Vigenère* under the original literal word breaks and ordinary GP-native English. This is a new named historical-key follow-up to the earlier unkeyed peel, supported by [a read-only Node22 CommonJS full-source SFT](../sims/lp2_word_inside_divinity_vigenere_sft.cjs). A different printed-word semantics, clock, output language or independently source-selected shell consumer remains open. No original plaintext was recovered.

### Global two-channel LP1-key transfer (Agent24, 24 November 2026)

The clear p57 parable names both “circumferences” and “divinity.” This motivates one deliberately narrow transfer hypothesis: use the independently recovered LP1 13-symbol key `FIRFUMFERENFE` on each original word's exterior shell (first and last rune, one rune for a singleton), and the recovered 8-symbol key `DIUINITY` on its strict interior. The keys and additive GP29 plaintext-F-transparent rule are documented by the [LP1 blind key-recovery study](agent15-periodic-fhold-blind-key-recovery.md) and the [WELCOME blind control](agent1-lp1-welcome-blind-comparison.md). The semantic assignment of those keys to p57's two nouns is a hypothesis, not established author intent.

The only clock tested is the simplest global one: both independent key phases start at zero at the first unknown word (p0), continue across all 2,896 words, and do not reset at word or page boundaries. The source-native test verifies that the word tapes reconstruct all **12,956 original unknown runes** exactly, with **5,709 shell** and **7,247 interior** runes; the independently reconstructed p55 partition is **33 shell / 43 interior**. The clear p57 Latin reference tokenizes to all **95/95** canonical runes. A synthetic p57 plant encrypted with the same two keys and transparent-F rule retains a legal inverse path.

The original fails algebraically at the first interior rune of the fifth word, `ONTH`. Ciphertext `ᚾ` has GP29 value **9**. After the first four words, the only surviving phase pairs are shell phases **7** and **8**, both with interior phase **4**; `DIUINITY` at phase 4 is **9**, so ordinary decryption requires plaintext F=0. But a transparent plaintext F must emit ciphertext F=0, not `ᚾ`. There is no legal transition from either state. This is a hard finite-state contradiction, independent of language scoring.

**Decision:** retire this fixed global phase-zero assignment of the two recovered LP1 keys to the shell/interior channels. It recovers no LP2 plaintext or key. It does not test other key-to-channel assignments, phase offsets, page/chapter resets, or a source-defined shell-to-interior control receiver; none should be swept without an independent selector. Reproduction: [source-native Node22 SFT](../sims/agent24_circumference_dual_key_gate.cjs), runnable with the existing [manual read-only CommonJS runner](../.github/workflows/manual-readonly-commonjs-sft.yml) using input `sims/agent24_circumference_dual_key_gate.cjs`.

**Still open:** A source-specified, reversible operation in which the shell carries a key/check/control for the interior; a receiver that remaps output boundaries; or a different geometrical use of p57. The phrase “circumferences” does not authorize subtracting shell values modulo29, fitting word-specific keys, repeatedly rotating interiors, or invoking a hidden state whose restoration rule is unavailable. Such variants need a separate independently visible selector before the original ciphertext is used to fit them. This decision recovers no unknown LP2 plaintext or Cicada destination.

The parent clue and neighboring routes are discussed in [the integrated inversion frontier](../workplace/integrated-original-inversion-challenge.md) and [the authoritative synthesis](../results/README.md). This report does not elevate an unverified mechanism to established results.
