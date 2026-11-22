# Original mayfly pages: all-secret five-lane feedback invariant and original inverse

**Agent50, 22 November 2026. Director task #2261; original-input, source-shaped finite-model decision.** No unknown Liber Primus plaintext, historically authenticated cipher state, key, or full decryption has been recovered. The original phase-equality invariant rejects the full tested additive-ciphertext-feedback family under source-native GP English, even with arbitrary fixed per-page/phase secret alphabets. The negative applies to this feedback recurrence, not all evolving-state or polygraphic ciphers.

## Human clue, premise and rival

The original physical p23 source image (scan `40.jpg`) prints **five black dots** above its **16-rune red heading**; its first printed line has five words spanning red and black ink. The next three physical pages p24–p26 (scans `41.jpg`–`43.jpg`) print the **same bilateral insect artwork** alongside distinct runic text. A period solver might try one five-component key reused at each illustrated page, with ciphertext changing the key thereafter. The 2014 GP29 modular-addition alphabet supplies a natural reversible output. A simple periodic one-time pad cannot explain the three-way original constraints already excluded by [the all-secret affine proof](lp2-p24-p26-insect-threeway-affine-allsecret-exact-gate.md), so the chosen extension changes the phase component after every printed rune.

The decisive missing historical clue is **which update to perform**. Neither the five-dot geometry nor the duplicated insect glyph explicitly says to add the current ciphertext to its own lane or reset inside page-crossing words. This model is a motivated compact *test*, not an asserted author instruction. The rival is that the artwork is a reusable layout image; [the source-pixel adjudication](lp2-p24p26-original-insect-stroke-source-selector-gate.md) found p24 and p26 identical, and p25 shifted only by one scan pixel with insignificant contrast changes.

## Complete frozen inverse

Let `j∈{24,25,26}` index the original source pages; `t` count all original GP29 symbols from the first physical rune of each page, including any carried-word fragment; `s_0,...,s_4∈Z29` be a **single common unknown five-rune seed**. Each phase advances separately:

```text
k_j[t] = s_(t mod 5) + sum_{0 <= u < t, u mod 5 = t mod 5} c_j[u]  (mod 29)
p_j[t] = c_j[t] - k_j[t]                                          (mod 29)
c_j[t] = p_j[t] + k_j[t]                                          (mod 29)
```

Thus each page's keystream is identical for its first five symbols, then evolves differently based on its **own preceding ciphertext**. This changes the relation across pages and is genuinely outside the arbitrary *same position* static-affine secret-key family. The same decoding and exact original reencryption apply to every length and every source word. There are only `29^5` possible common seeds. We avoid broad blind search: a **single original seven-rune word** determines all five seed components under a proposed native GP word reading.

Source transcript `resources/liber-primus/lp2-transcription.txt` is split at its exact `%` page markers; its page rune sequence is asserted identical to canonical `lp2-corpus.json` before any cipher operation. The actual original pages contain 270, 273 and 265 runes respectively. Crucially, the **first printed fragments** of the three pages are lengths **3, 2, 1**: these are unfinished words from previous physical pages. The cipher consumes them to keep the page-state clock honest but excludes them from word-language scoring, so none is misrepresented as a complete source word.

The pinned unchanged `resources/control/english_wordfreq_textblob.txt` source defines 29,055 **unique** GP29 word forms in the run's original dictionary construction, incorporating source-solved ING→NG and IO→IA contractions, other GP multi-rune transliterations, QU→CW and normal V/K/Q/Z spellings. One-letter A/I/O are included. The first complete original p24 seven-rune anchor begins at offset **26**. Under the five-lane recurrence, testing *every lexicon seven-rune candidate* against its repeated phase values leaves **exactly 14 distinct common seeds**, without optimizing an English score.

## Stronger all-secret invariant: the feedback law fails without any key search

The seven-rune dictionary anchor above is a meaningful explicit-key recovery test. A stronger original-cipher rejection avoids requiring that particular anchor to be an English word, and removes even the assumption of a common original five-rune seed.

For each source page j in p24–p26, each residue lane l=0..4, and the original GP29 ciphertext C, subtract the **exact cumulative previous ciphertext within that lane**, yielding Q. Under the stated feedback law every potential plaintext position in that lane must satisfy P=Q−S_(j,l) (mod29), even if its initial state is independently secret on every page. This is a fixed cyclic alphabet relabeling inside each lane. Allowing a completely arbitrary, unguessed secret **29-way bijection separately for each of the 15 page×phase cells** is substantially more permissive than the tested five numeric seeds. Every such bijection still preserves exact symbol equality and therefore preserves collision IoC.

The same conclusion holds if the cipher clock is continuously carried across physical pages: all contributions from earlier pages to the same lane are a constant added to the later page's unknown initial phase state. Unknown phase-offset alignment permutes the five class labels, leaving the weighted within-page/phase collision statistic unchanged. This removes the earlier page-reset concern for this **same-lane additive-ciphertext-update law**.

Define the all-secret weighted collision statistic as

```text
W = sum over pages j and phase lanes l of sum over symbols a n[j,l,a](n[j,l,a]-1)
    / sum over pages j and phase lanes l of N[j,l](N[j,l]-1).
```

There are 15 populated source cells over all **808 original runes**. Directly removing the source ciphertext's preceding same-lane cumulative sum gives the **exact original W=0.03211309802452954**, independent of *every* unknown initial seed or per-page/phase alphabet permutation. It cannot be increased by a secret choice of those keys.

For an independent language reference, the updated [CJS original-input reproducer](../sims/lp2_p24p26_five_lane_cumulative_cipherfeedback_sft.cjs) uses the same solved-LP GP29 spelling, including ING→NG and IO→IA, for three pinned source corpora. For **1,000 seeded draws per author**, each donor word has precisely the rune length of the corresponding original page-local printed word fragment; all 270+273+265 page positions, including original carried-fragment lengths 3/2/1, are retained and no original plaintext is used. Draws are independent by author and preserve the 15 original phase sizes. Word fragments are sampled as independent page-local slots because the tested machine reads them as such; the unknown page-crossing plaintext is not reconstructed.

| GP-native source register | 1,000 source-length-matched W minima | Median W | Samples at/below original W |
| --- | ---: | ---: | ---: |
| Original unchanged p24–p26 cumulative-feedback residual | **0.03211310** | | |
| Shakespeare | **0.05388072** | 0.06015354 | **0/1,000** |
| Gibran | **0.05275723** | 0.05973223 | **0/1,000** |
| Emerson | **0.05392753** | 0.06057485 | **0/1,000** |

The original invariant lies below every one of **3,000** source-native controls. The positive source-word-shaped plant encrypted under the identical law and native GP29 spelling returns exactly the **same 15-cell collision numerator/denominator before and after encryption and feedback removal**; all original source positions also replay on reencryption. Thus the test can accept genuinely enciphered source-native prose without knowing its seed.

**Decision:** The complete family *cumulative same-lane ciphertext addition followed by any one secret but fixed alphabet per page×phase class* cannot explain ordinary source-like native-GP plaintext on all three original insect pages. This applies to **all secret keys**, every physical-page reset/continuation initial history, and unknown pagewise five-phase rotations. It does not exclude a plaintext register with unusually flat phase-letter distributions, genuinely updating phase alphabets, different feedback arithmetic, source-word reorderings, or binary encoding. No creator-selected feedback opcode or authentic plaintext follows from this theorem.

## Original training and untouched continuation

For each of those 14 preimage seeds, decrypt all three original streams. Score only the **complete page-local printed words ending by source offset150** and choose the seed maximizing exact whole-word dictionary matches over all three pages. Then freeze that one seed and score the disjoint words *beginning* at or after offset150 without alteration to any clock, key, page, or word boundary.

| Original receiver | Complete training words / exact lexicon hits | Untouched later words / hits |
| --- | ---: | ---: |
| p24 | 35 / **3** | 27 / **3** |
| p25 | 29 / **2** | 28 / **3** |
| p26 | 32 / **3** | 25 / **0** |
| **Combined** | **96 / 8** | **80 / 6** |

The best key is `[8,15,11,15,2]` in canonical ordinal-index GP29. Its original accepted training forms include **ND**, **DROWNED**, **LE**, **A**, **HEW**, **VA**, **IX**, and **JUG**, scattered without grammatical continuity. The original p24 anchor decodes to DROWNED for this key; a rival seed decodes it to DRAINED. The less authentic inventory-label spelling, which leaves ING and IO uncontracted, yields 13 anchor-admissible seeds and the same winning seed and original hit counts; the source-native result is the stated 14-seed gate. The other words overwhelmingly fail the unchanged lexicon. Every candidate seed can exactly forward-reencrypt its own gibberish: this is a necessary invariant, not an independent key-discovery criterion.

## Positive and limitation

A planted **native-GP original-word-shape** experiment reuses all original three-page printed source lengths, including carried-fragment lengths, chooses each synthetic word from the same GP-native dictionary, encrypts under `s=[3,5,1,4,2]` with the same per-lane page-local ciphertext feedback, then recovers this genuine common seed from the **same length-seven anchor**. Every subsequent source-shaped word decodes exactly: **96/96** fully printed training words and **80/80** later words. Full original-page rune counts `270+273+265` are reencrypted and replayed exactly. A wrong-key candidate on original ciphertext round-trips too, so the planted recognition and original-language failure are the relevant separate checks.

This selects a concrete next research decision: **do not expand this cumulative five-lane recurrence by tuning page offsets, word cuts, extra phase choices, or alternative update constants**. The entire first-anchor-constrained common-seed set fails to produce three paragraphs, including the top-seed untouched p26 receiver. It does not exclude a source-supplied *different* changing update, non-GP encoding, or no page reset. The cross-page continued words make page reset particularly hard to defend without an explicit manuscript instruction.

Reproduce using the single [Node.js22 CommonJS test](../sims/lp2_p24p26_five_lane_cumulative_cipherfeedback_sft.cjs). Its original counts and planted controls were executed directly using the exact remote corpus, text transcript, and English wordfreq inputs in a JavaScript V8 execution on 22 November 2026; no GitHub Actions run is claimed here.
