# Original LP2 word-openings under exact within-page bigram-preserving randomization

**Agent 9, 14 November 2026. Classification: newly observed, exploratory original-ciphertext placement signal. It yields no authentic unknown plaintext, cipher, source-derived key, or continuation.** The result specifies a narrower follow-up decision than the earlier page-unigram shuffle of [the full-book English-prefix study](lp2-p32-home-wordstart-english-prefix-familywise.md).

## Causal question

The unsolved manuscript's 2,896 printed rune words show severe adjacent-repeat suppression (86 equal pairs across 12,901 within-page adjacencies), and ciphertext-level first-order correlations could create accidental English-like word openings. The earlier original-source test counted **68** 4-GP-rune dictionary prefixes at original printed word starts and obtained an excess under page-unigram shuffling, but that null destroys every observed rune transition. Before treating any short English-looking string as an instruction or a plaintext fragment, ask whether the excess persists after holding **all 29×29 directed bigram counts fixed for every one of the 55 original rune-bearing pages**. Further ask whether this is specific to the *starts* of printed words rather than any similarly located four-rune run inside the same words.

## Frozen source and constrained comparison

[Standalone SFT](../sims/lp2_wordstart_markov_euler_sft.py) reads the untouched original [LP2 indexed corpus](../resources/liber-primus/lp2-corpus.json), [original punctuation transcription](../resources/liber-primus/lp2-transcription.txt), and CMUDICT v1.1.3. It matches the historical #798 spelling rules exactly: fold K/Q→C, V→U, Z→S and greedily tokenize GP digraphs TH, NG, EO, OE, AE, IA and EA. The 117,493 distinct normalized alphabetic dictionary forms produce **21,385** length-four GP prefixes, **46,285** length-five prefixes and **56,470** length-six prefixes. The independently published dictionary-list SHA-256 is `4efb3e4bf99bec3e92ea4f90f724f5ceda819e14ef1e8baf97d297dc4547c79c`.

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

## Independent common-English discriminator

The 21,385 CMUDICT four-rune prefixes include very rare surnames, proper names, technical vocabulary and fragments that ordinary English prose would seldom use. That matters here: p46's source word begins `TH R E E`, while other counted long-word openings include `JODH`, `ACBA`, `HREN` and `RUTG`. The equality of their dictionary membership does not make their linguistic likelihood comparable.

A second frozen scorer uses the independently stored [TextBlob/Norvig English frequency list](../resources/control/english_wordfreq_textblob.txt). Only its **18,420 alphabetic source forms of at least seven GP runes** enter the reference, matching the 559 source-word length eligibility. Accumulate source token counts under their first four GP runes, then assign the score `log2(1 + summed reference count)` to each source four-rune opening. No textual or key parameters are selected on the LP2 original. The SFT repeats the exact original bigram-preserving Euler null for **3,000** further deterministic surrogates and evaluates the same long-word start and three internal windows.

| TextBlob reference weighted score | Original summed score | Null mean | Surrogates ≥ original / 3,000 | Nominal upper-tail |
| --- | ---: | ---: | ---: | ---: |
| Four-rune starts of 559 original long words | **21.8927** | 13.6683 | 441 | **0.1473** |
| First internal four-rune windows | 3.5850 | 13.7636 | 2,745 | 0.9150 |
| Second internal four-rune windows | 8.8517 | 13.7103 | 2,077 | 0.6924 |
| Third internal four-rune windows | 22.2236 | 13.7880 | 441 | 0.1473 |
| `3×start − sum(three interiors)` contrast | **31.0179** | −0.2569 | 395 | **0.1320** |

Only **9** of the 559 original printed word openings have any reference long-English frequency at all, versus 30 matches under the much broader CMUDICT membership criterion. The independent common-English frequency test finds **no statistically persuasive preference for word beginnings**; the third interior window even scores slightly higher. This is a meaningful objection to interpreting the CMUDICT membership surplus as partly visible ordinary-English plaintext. Rare-dictionary coverage, source text structure and higher-order dependencies remain plausible explanations. Frequency is not itself a mathematical proof of absence, and genuine cipher plaintext could use rare GP vocabulary, a non-English register or an unrecognized partial cleartext convention.

The frequency result and all earlier original GP / planted controls pass [GitHub Actions run 43580433770](https://github.com/FlareZ123/liber-primus/actions/runs/43580433770). A transient prior CI run failed solely from a double-backslash error in this new scorer's frequency-line regex; it was corrected before the successful run, with the exact original source and earlier baseline unchanged.

## Synthetic positive and limits

As an independent detector check, replace the first four original runes of twelve pre-selected post-period words with source-valid `HOME`, leaving all word positions untouched. A new exact-bigram-preserving Euler null then yields **18** such English-looking post-period prefixes at the plant versus surrogate mean **2.987** and **0/1,000** surrogates reaching 18 (smoothed tail **0.000999**). This establishes power for a deliberately inserted word-opening signature under the tested randomization. The source remains unchanged for all original counts.

The original-source test and planted detector pass [GitHub Actions run 43580433770](https://github.com/FlareZ123/liber-primus/actions/runs/43580433770); the earlier 10,000-original-surrogate baseline was independently captured in [run 43578907883](https://github.com/FlareZ123/liber-primus/actions/runs/43578907883).

**Decision:** The broad CMUDICT lexical-membership signal at source word openings survives exact first-order bigram control and is concentrated at printed starts. Nevertheless, the independently specified common-English token-frequency score produces only **p=0.1473** at starts and **p=0.1320** for the matched-start/interior contrast. This sharply weakens the claim that LP2 contains recognizable cleartext word openings; the original 0.0021 and 0.0189 were **exploratory nominal tails**, selected after prior prefix investigations, and cannot establish a decrypted text. No subset of the 30 matches has an authenticated selector, and the six-rune isolated prefix at p15 is not a complete English word. **Do not initiate more dictionary/offset/frequency tuning** or promote any of these matches to LP2 plaintext. Reopen this direction only after an original-authored rule independently identifies particular printed word starts or a reversible cipher predicts their pattern.
