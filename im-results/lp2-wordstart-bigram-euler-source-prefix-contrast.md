# Original LP2 word-openings under exact within-page bigram-preserving randomization

**Agent 9, 14 November 2026. Classification: newly observed, exploratory original-ciphertext placement signal. It yields no authentic unknown plaintext, cipher, source-derived key, or continuation.** The result specifies a narrower follow-up decision than the earlier page-unigram shuffle of [the full-book English-prefix study](lp2-p32-home-wordstart-english-prefix-familywise.md).

## Causal question

The unsolved manuscript's 2,896 printed rune words show severe adjacent-repeat suppression (86 equal pairs across 12,901 within-page adjacencies), and ciphertext-level first-order correlations could create accidental English-like word openings. The earlier original-source test counted **68** 4-GP-rune dictionary prefixes at original printed word starts and obtained an excess under page-unigram shuffling, but that null destroys every observed rune transition. Before treating any short English-looking string as an instruction or a plaintext fragment, ask whether the excess persists after holding **all 29×29 directed bigram counts fixed for every one of the 55 original rune-bearing pages**. Further ask whether this is specific to the *starts* of printed words rather than any similarly located four-rune run inside the same words.

## Frozen source and constrained comparison

[Standalone SFT](../sims/lp2_wordstart_markov_euler_sft.py) reads the untouched original [LP2 indexed corpus](../resources/liber-primus/lp2-corpus.json), [original punctuation transcription](../resources/liber-primus/lp2-transcription.txt), and CMUDICT v1.1.3. It matches the historical #798 spelling rules exactly: fold K/Q→C, V→U, Z→S and greedily tokenize GP digraphs TH, NG, EO, OE, AE, IA and EA. The 117,168 distinct normalized alphabetic dictionary forms produce **21,385** length-four GP prefixes, **46,285** length-five prefixes and **56,470** length-six prefixes. The independently published dictionary-list SHA-256 is `4efb3e4bf99bec3e92ea4f90f724f5ceda819e14ef1e8baf97d297dc4547c79c`.

The script reconstructs **2,896 printed words**, including 32 continuing across page breaks, and 175 literal full stops, with no changes to rune positions or boundaries. For each physical page, it randomly reorders outgoing edges of its **exact source 29-vertex directed transition multigraph** and reconstructs a complete Euler trail from the real first rune. This retains page length, first/last symbols, unigram content and **every original adjacent-rune pair count exactly**, including the 86 rare self-transitions. The first three reconstructed surrogates are independently checked against all page matrices. It retains original word and full-stop positions as source-native slots. Deterministic Python `random.Random` seed **0x9C129A93** produces **10,000** complete surrogate books. The randomized Euler traversal is an exchangeability diagnostic; its distribution is **not proved uniform across all possible Euler paths**, and the tests are not discovery-wide corrected.

To test placement, the same fixed dictionary is also read at local positions **0, 1, 2 and 3** inside the *identical 559 original words of length at least seven*. Their eligibility set, printed layout and runes are fixed before testing; these four four-rune windows are defined without selecting any candidate English word. For a single contrast, compute `3×starts − interior1 − interior2 − interior3` on those words.

## Exact original-source outcome

| Four-GP dictionary-prefix test | Original hits | Exact-bigram surrogate mean | SD | Surrogates meeting or exceeding original / 10,000 | Monte Carlo upper-tail |
| --- | ---: | ---: | ---: | ---: | ---: |
| Starts of all 2,896 printed words, eligible length≥4 | **68** | 50.8294 | 6.7841 | 77 | **0.007799** |
| Starts of the 559 length≥7 words | **30** | 17.2510 | 4.0799 | 20 | **0.002100** |
| Rune offsets 1–4 in those same long words | 18 | 17.1717 | 3.9889 | 4,556 | 0.455654 |
| Offsets 2–5 in the same long words | 20 | 17.0950 | 4.0536 | 2,629 | 0.262974 |
| Offsets 3–6 in the same long words | 21 | 17.2578 | 4.0983 | 2,096 | 0.209679 |
| Start-versus-three-interiors integer contrast | **31** | 0.2285 | 14.0474 | 188 | **0.018898** |
| Four-rune prefixes after a literal full stop | 6 | 2.9063 | 1.6907 | 743 | 0.074393 |
| Five-rune prefixes at all word starts | 3 | 2.5377 | 1.5860 | 4,641 | 0.464154 |
| Six-rune prefixes at all word starts | 1 | 0.0786 | 0.2782 | 762 | 0.076292 |

The strongest new observation is **placement-specific**: length≥7 word openings contain 30 four-rune English-dictionary prefixes, while each of the three later windows within exactly those words has 18–21, close to its approximately 17.2 surrogate mean. The start surplus cannot be explained solely by the manuscript's *first-order* ciphertext transition counts, because those are identically preserved in every surrogate.

The one six-rune hit is physical p15 offset52: its original runes start `P E N TH O U`, corresponding to the word prefix `PENTHOU...`. Its complete printed ciphertext word is `P E N TH O U I IA R`; it does **not** spell PENTHOUSE and is not recovered plaintext. Among four-rune hits in long words, p32 offset33 begins `HOME` and p46 offset108 begins `TH R E E`; each is followed by non-English ciphertext-like runes. These are visible exact source strings, **not authenticated decryption**. There are many candidate prefixes and opportunities to choose striking examples after looking.

The entire plain-word statistical signal is also small: **30 of 559 eligible long words** pass a broad 21,385-prefix dictionary. A genuinely unencrypted English-word passage should produce much richer longer prefixes, whereas the five-rune statistic is fully ordinary here. Most of the 30 long-word hits are chance under the fitted null; their identities cannot be inferred from the excess count.

## Synthetic positive and limits

As an independent detector check, replace the first four original runes of twelve pre-selected post-period words with source-valid `HOME`, leaving all word positions untouched. A new exact-bigram-preserving Euler null then yields **18** such English-looking post-period prefixes at the plant versus surrogate mean **2.987** and **0/1,000** surrogates reaching 18 (smoothed tail **0.000999**). This establishes power for a deliberately inserted word-opening signature under the tested randomization. The source remains unchanged for all original counts.

The precise source-original SFT and plant pass [GitHub Actions run 43579288096](https://github.com/FlareZ123/liber-primus/actions/runs/43579288096), with the earlier 10,000 original-book baseline also passing [run 43578907883](https://github.com/FlareZ123/liber-primus/actions/runs/43578907883).

**Decision:** This is a useful new indication that higher-order four-rune structure is concentrated at long-word *beginnings*, even conditional on the exact local bigram inventory. However, 0.0021 and 0.0189 are **exploratory nominal tails**, drawn after the preceding word-prefix observation, and cannot establish a genuine plaintext leak. The result does not identify which source words, if any, are deliberately clear, and it provides no key or inverse. Priority should now be given to an **original-authored selector** specifying which *printed word openings* to read, or a separate decipherment mechanism predicting these four-rune patterns, before any selected-word/acrostic/crib extraction. Avoid treating the 30 arbitrary lexical matches as 30 deciphered words or scanning additional offset/dictionary combinations for favorable p-values.
