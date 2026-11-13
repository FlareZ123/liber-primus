# Source-authenticated GP spelling of English in solved Liber Primus

**Established input-calibration result, 13 November 2026 (Agent 41).** The original solved Liber Primus pages use Gematria Primus rune **ᛝ** for both **NG** and **ING** and rune **ᛡ** for **IO**, despite the repository's GP rune inventory romanizing the latter **IA** and the former **NG**. A simple English encoder that uses only those inventory labels misses printed spellings. This affects native-English language controls used to decide whether a candidate LP2 decryption produces meaningful text.

This is an exact observation about **solved LP1 words**, plus a source-calibrated *candidate encoder* for other English prose. It is not recovered LP2 plaintext, an LP2 cipher key, or proof that every word in an unknown page follows one unambiguous transliteration convention.

## The exact 181-word source calibration

The [raw corrected LP1 rune transcription](../resources/transcriptions/lp1_wulfic_canonical.txt) preserves solved **physical p10–p13** rune sequences. The independent [LP1 plaintext reference](../resources/liber-primus/lp1-plaintext-reference.txt) preserves their English reading, including the printed typo **BELEIVE**. Strip layout-only line breaks and join the printed **ADHERENCE** word carried from p12 to p13. There are **181 English word positions and 181 original runic word positions**, with identical word order.

For the baseline encoder, normalize English **QU→CW, V→U, K/Q→C, Z→S** and greedily replace the literal canonical GP labels, including **NG** and **IA**, with rune indices. This reproduces exactly **165/181** original runic word positions. For the source-calibrated encoder, additionally choose **ING→ᛝ** before **NG→ᛝ**, and **IO→ᛡ** before other GP tokens. The same deterministic mapping reproduces **181/181** original runic word positions, with **no replacement, padding, data correction or manually adjusted plaintext**.

| Original plaintext word | Original printed runes | Naive canonical-label encoder | Source-calibrated |
| --- | --- | --- | --- |
| FOLLOWING | ᚠᚩᛚᛚᚩᚹᛝ | ᚠᚩᛚᛚᚩᚹᛁᛝ | Exact |
| THINGS | ᚦᛝᛋ | ᚦᛁᛝᛋ | Exact |
| STRONG | ᛋᛏᚱᚩᛝ | Exact, via NG | Exact |
| FUNCTION | ᚠᚢᚾᚳᛏᛡᚾ | ᚠᚢᚾᚳᛏᛁᚩᚾ | Exact |
| CONSUMPTION | ᚳᚩᚾᛋᚢᛗᛈᛏᛡᚾ | ᚳᚩᚾᛋᚢᛗᛈᛏᛁᚩᚾ | Exact |
| BEHAVIORS | ᛒᛖᚻᚪᚢᛡᚱᛋ | ᛒᛖᚻᚪᚢᛁᚩᚱᛋ | Exact |
| QUESTION | ᚳᚹᛖᛋᛏᛡᚾ | ᚳᚹᛖᛋᛏᛁᚩᚾ | Exact |

The **16** extra exact matches arise from a small set of repeated ING/IO-bearing words: BEHAVIORS, CONSUMPTION, FOLLOWING, DECEPTION, THINGS, CONSUMING, PRESERVATION, PRESERVING, NOTHING, INSTRUCTION and their repetitions. The additional substitutions do not corrupt any of the baseline's 165 exact matches on this sequence.

This directly supports the existence of the spelling choices on solved LP1 p10–p13. A deterministic **ING before NG, IO before IA** encoder is one demonstrated consistent implementation for that passage. It is a hypothesis for new English texts, which may have genuinely ambiguous ING/NG/IA/IO pronunciation or historical author spelling variants.

## Independent solved LP2 page-57 positive control

The same deterministic source-calibrated encoder also reconstructs the separately solved **LP2 physical page 57** in full. Its source-authentic [95 original GP rune indices](../resources/liber-primus/lp2-corpus.json) correspond, in exact order, to the **20 words** of its published *PARABLE* plaintext in [the independent solved-page reference](../resources/liber-primus/lp1-plaintext-reference.txt): “LIKE THE INSTAR TUNNELING TO THE SURFACE …”. The naive longest-inventory-label encoder produces **96** runes, because **TUNNELING** becomes I+NG, whereas the printed original has a single **ᛝ** for ING. The source-calibrated encoder produces **exactly 95/95**, in the original order, without position corrections.

This is an out-of-sample, cross-release positive control independent of the 181-word solved LP1 p10–p13 reconstruction. Only LP2 p57 is used as source plaintext here. The original p56 has 85 encrypted runes and its decoded English must not be confused with untransformed p56 source rune indices.

## Consequence for computational plaintext controls

The legacy 29-token GP labels use **IA** for ordinal 27. Therefore a naive token-based conversion normally represents common English **IO** as two separate runes. The original solved LP1 instead clearly uses the single **ᛡ** rune in many IO-bearing words. The same baseline represents **ING** with **I+ᛝ**, adding an extra rune relative to the solved LP1 spelling.

The resulting rune27 (IOR) frequencies differ materially on checked-in plain-English training material:

| Native-English control text | Legacy ᛡ frequency | Source-calibrated ᛡ frequency |
| --- | ---: | ---: |
| Shakespeare | 0.00094607 | 0.00343150 |
| Gibran | 0.00058624 | 0.00385649 |
| Emerson | 0.00112436 | 0.00660075 |

Rune-count contraction also changes page-aligned control windows. The original 89-window suite becomes **88** source-calibrated windows at the same 12,956-rune length and 6,478-rune stride: 32 Shakespeare, eight Gibran and 48 Emerson.

One important cipher conclusion is **robust** to this correction. The original LP2 predecessor-difference eight-phase equal-symbol fraction is **0.03527034** against a **0.05779345** minimum from the new 88 source-calibrated controls. Even granting a different secret bijection for every page and phase leaves source **0.03559659** against a corrected control minimum **0.05837965**. The Fibonacci-page-only eight-lag equality source **43/2186=0.01967063** also remains below the corrected control minimum **0.02607502**. See the [integrated cipher-family decision](../im-results/lp2-fibonacci-page-delta-spectrum.md#all-secret-eight-phase-cipher-family-decision-agent-41-13-november-2026).

## Reuse and evidence

The [source-calibrated encoder and full 181-word SFT](../sims/lp2_native_gp_source_orthography_sft.cjs) exports CommonJS **encodeSourceNativeGP** and independently asserts all 181 p10–p13 word pairs, all 95 source LP2 p57 runes, both spellings, source counts, all 88 corrected native controls and a known-key positive encryption plant. The complete source-checked test passes on [GitHub Actions run 43392652828](https://github.com/FlareZ123/liber-primus/actions/runs/43392652828).

**Research decision:** require both the conventional inventory-label GP encoder and the empirically source-calibrated GP encoder wherever an exclusion depends on native-English corpus frequencies, rune lengths, word shapes or cross-word alignments. A claimed text recovery should be checked against the **actual original runes** under an explicitly stated spelling convention. Existing historical results that used the naive encoder remain reproducible within their stated model; they cannot automatically be recast as having tested every source-attested GP spelling.

**Current limit:** no source clue has yet fixed a general LP2 cipher operation or key, and the corrected spelling model has not produced decrypted unknown-page text.
