# Reused GP29 additive pad under the p8–14 identical tree stencils

**Decision (12 November 2026, Agent 20; Director #650):** The exact source-aligned, page-local-position **common additive GP29 keystream** hypothesis is strongly incompatible with ordinary native-GP English on **both** original stencil-matched triads. Every possible pair of printed-word-preserving GP29 plaintexts under the proposed unknown common pad requires **5–17 words absent** from the generous 29,061-form native-GP word lexicon. In the two long within-stencil comparisons, at least **17** and **11** out-of-lexicon complete words are unavoidable; matched Gibran-word positive controls require **2** and **4**, while independent-pad controls require **17** and **10**. No key or unknown plaintext is recovered. This retires only the fixed **same-page-offset, identical additive pad** model, not moving key states, other ciphers, different alphabets, or non-English/plaintext domains.

## Original-image cue and inverse

The original physical LP2 pages **p9, p11, p13** repeat an identical right-margin tree stencil; **p10, p12, p14** repeat an identical left-margin tree stencil. Original JPEG archive names are `26.jpg`, `28.jpg`, `30.jpg` for the right tree and `27.jpg`, `29.jpg`, `31.jpg` for the left. The 3600×460 pixel-identical margin evidence, tree orientation and independent source picture comparison are recorded in [the image-source audit](lp2-p8-14-tree-stencil-source-gate.md). Physical p8 has a similar but not pixel-identical left tree, so the test conservatively excludes it.

If a shared arbitrary nonperiodic key `K[t]` were reused for pages with the **same stencil**, every page-local rune would satisfy `C_page[t] = P_page[t] + K[t] (mod 29)`. Consequently for every within-stencil pair `a,b` and shared offset `t`,

`D_ab[t] = (C_a[t] - C_b[t]) mod 29 = (P_a[t] - P_b[t]) mod 29`.

Thus a candidate plaintext pair must satisfy an exact original-cipher equation at **every** overlapping rune, even without recovering a single key digit. The original 2014 text-guided Vigenère cipher supplies a real GP29 additive precedent; the manuscript does **not** independently say that the trees reuse a pad. The experiment freezes source page-start at rune0, no Caesar additions, F omissions, phase shifts, reversal, red exceptions or selective editing.

## Exact word-feasibility result

The input is unmodified `resources/liber-primus/lp2-corpus.json`, checked against `lp2-transcription.txt`, with physical-page rune lengths `p9=268, p11=273, p13=272, p10=263, p12=261, p14=137`. The original `-` and `.` delimiters fix word endings, even where a printed word crosses a page break. The initial page-fragment word and a word unfinished at the overlap endpoint are **uncharged and unconstrained**, making the bound conservative. Each complete printed word may be any native-GP entry in the unchanged historical `english_wordfreq_textblob.txt` dictionary, normalized by the project's GP29 transliteration convention (29,157 source rows; **29,061 distinct GP forms, 74,946 trie nodes**).

An **exact dynamic program** tracks the two dictionary-prefix states. At each original position it tries all **29** possible first-page plaintext rune values; the other page's plaintext rune is forced by `D_ab[t]`. Leaving the dictionary costs **one** for that entire word, after which all remaining letters of that word may be anything. At a complete word end, a nonterminal dictionary prefix also costs one. Minimize total nonlexicon complete words, with page-fragment words unpenalized and no beam pruning or language scoring.

| Identical-stencil pair | Original aligned runes | Complete words (a+b) in overlap | Exact minimum out-of-lexicon words | First forced violation (zero-based rune offset) |
| --- | ---: | ---: | ---: | ---: |
| right p9/p11 | 268 | 56+53 | **17** | 18 |
| right p9/p13 | 268 | 56+60 | **16** | 12 |
| right p11/p13 | 272 | 54+61 | **15** | 12 |
| left p10/p12 | 261 | 63+65 | **11** | 33 |
| left p10/p14 | 137 | 36+31 | **5** | 20 |
| left p12/p14 | 137 | 35+31 | **7** | 25 |

Each pair is a *necessary* condition for the corresponding **three-page** shared-pad hypothesis. Since even a pair cannot yield lexicon-consistent original native plaintext without numerous exceptional words, requiring a common pad for all three pages only makes feasibility harder. The fixed positive-control language comparator covers **15,441/15,733** original Gibran native text words (**292** unknown lexemes, 1.856%); the independently solved LP1 reference covered **724/740** words (2.162%) in the previously established [source-lexicon gate](lp2-natural-section-pad-reuse-gate.md). The six original 5–17-word *minimums* apply to only 66–128 counted complete words, so their forced exception rates are far higher than those natural-text comparators.

## Independently generated native-text controls

Using the unmodified **Gibran** text, choose actual source words of **exactly the original printed GP29 word lengths**. Preserve partial page-edge words with arbitrary GP29 values that the DP correctly does not charge. The original page-local alignment and all delimiters remain unchanged. Produce two distinct native plaintexts for each pair, encrypt both under a single pseudorandom GP29 pad, verify 29-modular encryption/decryption and the cancellation identity at every position, and repeat under independently generated pads. All are frozen by seed `0x3301650`; no key or corpus was fitted to the original.

| Control | p9/p11 (268 runes) | p10/p12 (261 runes) |
| --- | ---: | ---: |
| Known Gibran words on the two pages (total OOV upper bound for correct pairing) | 1+2 | 3+4 |
| Exact DP minimum with **shared secret pad** | **2** | **4** |
| Exact DP minimum with **independent secret pads** | **17** | **10** |
| Exact DP minimum on original LP2 ciphertext | **17** | **11** |

The additive model succeeds on a matched native original-layout plant and fails on the actual manuscript even with **arbitrary per-position unknown keys**. The independent-pad negatives demonstrate that observed high exceptional-word counts are attainable without shared-key structure.

## Interpretation and boundary

A compatible shared-pad route would require coherent complete plaintext word sequences with a much smaller exception budget, allowing reconstruction of one source's key and withheld-page prediction. The exact source-aligned model instead fails its necessary pairwise dictionary test **independently for both separate same-stencil triads**. Decorative stencil reuse remains a simpler explanation than repeated plaintext-aligned pad encryption. The dictionary gives a **conditional native-English feasibility comparison**, not a universal impossibility theorem: engineered non-dictionary word streams, foreign languages, transformed plaintext, changing secret state, per-page key reuse with a shifted pointer, or another encipherment may behave differently. There is no reason to search fitted relative offsets under this original-art premise absent a new independent key-clock clue.

**Reproduce:** [standalone CommonJS SFT](../sims/lp2_p8_14_stencil_reused_additive_pad_sft.cjs), which independently reconstructs exact printed-word boundaries from the original transcript, asserts all six minima and their first forced offsets, and checks two native same-pad + independent-pad original-format plants. It reads only committed resources; no network, new workflow or file writes. This is intermediate evidence, not an established decryption.
