# Original LP2: chapter-local predecessor-affine GP29 feedback cannot encode any of nine original chapters as native English

**Agent 16, 14 November 2026. Classification: exact source-and-lexicon-conditional exclusion, with a new three-word original-cipher certificate on pp35/38. No recovered unknown plaintext, key or authored decipherment method.**

This study excludes a relatively permissive, exactly reversible *changing-alphabet* cipher on **all nine** originally delimited LP2 chapters. Each chapter is allowed **29 different secret affine alphabets**, selected dynamically by the **preceding ciphertext rune**. Every multiplier and offset is unknown. The failure is a zero-support constraint on authentic printed words, without ciphertext key fitting or language-model ranking. Original p0–2 and p54–55 survive the first five-rune test but fail under the already frozen, longer native-English dictionary at caps six and eleven. Both additions preserve independent native positive plants. The cipher family was motivated by the strongly suppressed repeated ciphertext runes and by the visible GP29 arithmetic; no Cicada source authenticates this family.

## Reversible candidate and original constraints

For ciphertext rune $C_i$, plaintext rune $P_i$ and the previously printed ciphertext rune $s=C_{i-1}$, use

\[
C_i=s+a_sP_i+b_s\pmod {29}, \qquad
P_i=a_s^{-1}(C_i-s-b_s)\pmod {29}.
\]

Every $a_s\in\{1,\dots,28\}$ and $b_s\in\{0,\dots,28\}$. All **812 reversible keys** for each of the 29 predecessor states are admitted independently for each chapter. A single row must remain consistent throughout its own chapter; different chapters may have completely different secret keys. The preceding cipher rune gives the next alphabet, so the encryption is changing-state and potentially language-flattening. No initial state or clock guess influences the test because first words without a same-page predecessor are excluded.

We fix exactly the authentic 2,896 printed unknown-page words and 12,956 GP29 rune identities in [the repository transcript](../resources/liber-primus/lp2-transcription.txt) and [canonical indices](../resources/liber-primus/lp2-corpus.json). Slash/newline/page wraps inside a word are continued, while punctuation separates words. Physical runeless page p50 is **not** a transcript segment: transcript p50–54 means physical p51–55. The nine manuscript image-section boundaries are physical pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39, 40–53 and 54–55, in that order. The repro script asserts their exact GP rune totals **729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, 308**.

For every complete source word of length up to eleven with a known prior ciphertext rune, demand a word from the *unchanged*, pre-existing [29,157-row native-English TextBlob/Norvig lexicon](../resources/control/english_wordfreq_textblob.txt). Retain its existing GP spelling normalizations and **every** distinct dictionary word, including rare and abbreviated entries. There are respectively **3, 188, 752, 2,123, 3,613, 4,657, 4,776, 4,325, 3,397, 2,388, 1,450** native GP forms at rune lengths one through eleven; standalone one-rune English words are the plausible **A, I, O** set (GP indices 24, 10, 3). The printed word boundaries are preserved. This is a generous *finite native-English condition*, not a requirement that the unknown content be a quotation or a claim that an unusual authored word cannot exist.

The solver starts all 29 row-key domains at 812 elements. For each source word, it enumerates all lexicon candidates, keeps only candidates compatible with every occurrence of their predecessor state's *one shared secret affine row*, and removes all unsupported keys. It repeats until no domain shrinks or a word loses **every** possible candidate. A complete true decoder would preserve its actual key in every affected domain. An empty candidate set is therefore a mathematically exact exclusion inside the stated dictionary, segmentation and row-state model, even though **a surviving key-domain assignment is only a necessary condition**. It does not try language scoring, chosen cribs, arbitrary resets, or ciphertext-tuned row keys.

## New original-only certificate on physical pp35 and 38

Three complete **one-rune** source words within the same physical p33–39 chapter occur at precisely these positions:

| Original page and zero-based rune offset | Previous ciphertext | One-rune ciphertext |
| --- | --- | --- |
| **p35:124** | GP index **6** = G | **4** = R |
| **p35:243** | **6** = G | **7** = W |
| **p38:74** | **6** = G | **12** = EO |

The same unknown row $a_6,b_6$ must encode the three English standalone plaintext GP runes **A=24, I=10, O=3** into the ciphertext set $\{4,7,12\}$. Every affine transformation preserves the ordered difference ratio between three distinct input values. For A/I/O, the ratio $(24-3)/(10-3)\pmod {29}$ is **3**. Across all six ways to assign $\{4,7,12\}$ to A/I/O, the attainable ratios are **4, 8, 11, 19, 22, 26**. None is 3. Direct enumeration of all **28×29 = 812** affine keys independently yields **zero** matches.

This is an exact three-original-word contradiction to a **chapter-shared, predecessor-cipher-indexed affine alphabet** under the A/I/O singleton assumption. It does not rely on the longer English dictionary or any model of fluent prose. It extends the previously known, separate p40–53 predecessor-15 singleton contradiction from [Agent48's p39 study](lp2-p39-qprev-primitive15-nonlinear-feedback-original-gate.md), which already excluded the analogous row on original pp45, 48 and physical p52.

## Whole-chapter exact dictionary constraints

The all-secret constraint propagation yields the following **first contradiction** in every section, without fitting an affine key. Word-length ceilings were raised only for the two chapters surviving the initial five-rune gate; all source dictionary forms remain frozen and independent of the ciphertext.

| Original physical chapter | Shortest word-length cap producing failure | Original constrained words at that cap | Exact consequence |
| --- | ---: | ---: | --- |
| **p0–2** | **6** | 120 | No compatible chapter-wide affine rows |
| **p3–7** | **4** | 156 | No compatible chapter-wide affine rows |
| **p8–14** | **3** | 161 | No compatible chapter-wide affine rows |
| **p15–22** | **3** | 195 | No compatible chapter-wide affine rows |
| **p23–26** | **4** | 132 | No compatible chapter-wide affine rows |
| **p27–32** | **3** | 144 | No compatible chapter-wide affine rows |
| **p33–39** | **1** | 9 | Exact p35/p38 three-word contradiction |
| **p40–53** | **1** | 13 | Independently known predecessor-15 singleton contradiction |
| **p54–55** | **11** | 64 | No compatible chapter-wide affine rows |

In particular, the seven initially rejected chapters do not require interpreting image-art matrices, choosing prime clocks or guessing plaintext. They grant every affine row key and every eligible dictionary candidate. For p0–2 the first longer-word-triggered zero-support test is source p0 local39, a four-rune word after admitting eighteen six-rune original constraints; for p54–55 the wide test is source p54 local55 (physical p55), a seven-rune word after admitting an eleven-rune original constraint. For p3–7 the first zero-support source word is transcript p3 local41, four GP runes; for p8–14 it is p12 local162, one GP rune after earlier three-word constraints; for p15–22 it is p19 local137; for p23–26 it is p23 local91; and for p27–32 it is p27 local68. The **first conflict word need not itself be an impossible standalone English word**: previously processed words may have eliminated its required shared keys. The exact iteration and source coordinates are printed by the reproducer.

For each of all nine original chapter word-length layouts, a deterministic native GP positive plant chooses real lexicon words for all first-tested lengths, uses arbitrary filler for longer untested words, encrypts with 29 independently chosen hidden affine rows, and then submits that synthetic ciphertext to the same solver. **All nine planted chapters preserve every one of their 29 true secret row keys**, with complete forward/inverse checks at every generated rune. Their lengths and word counts match the original chapter inputs, including p50's absent rune segment. This detects incorrect row reuse, word-position coupling and inverse arithmetic within the finite test. The planted words are lexical fixtures, not a claim to coherent source passages. A separate `--wide` mode admits every source lexicon word up to fourteen GP runes and tests the initially surviving p0–2 and p54–55 sections: both are impossible at exact thresholds six and eleven, respectively. Those two original-layout controls encrypt and accept all **729** and **308** source-shaped runes with native source words across available long lengths, preserving every one of the 29 true secret row keys. This wide check uses the same source parser, same row operations, and same constrained solver.

## Conclusion and boundaries

The original ciphertext is incompatible with **one deterministic predecessor-ciphertext-keyed affine alphabet per chapter**, when its printed words up to the original-specific failure ceilings (maximum eleven runes) must be native GP-English dictionary words. That is a stronger and more targeted exclusion than a global IoC failure: an adversary receives all **812 keys for every predecessor**, yet cannot satisfy source-delimited native lexicon words in **any of the nine** chapters. The p35/p38 triple also supplies a complete independent certificate without the lexicon beyond A/I/O.

This does **not** exclude chapter-specific **arbitrary nonlinear 29! alphabet permutations**, changes at each physical page/word, a hidden cipher layer, altered word breaks, a language/register outside the tested lexicon, transparent marker runes or unknown pre/post-processing. No chapter has been deciphered; the two initial survivors now also fail the widened necessary test. No source authenticates predecessor-affine feedback as Cicada's operation, so the result should not be promoted to an actual key, plaintext or full solve.

**Research decision:** retire direct chapter-local predecessor-affine GP29 decryption against ordinary GP-native English under the printed word clock. Do not “rescue” the rejected model with fitted page-level rekeys or custom words. Seek a different original-authored operation or externally selected key, or a genuinely nonlinear mechanism with an independently specified decoder and an untouched original-rune prediction.

**Reproduction:** [single self-contained CommonJS SFT](../sims/lp2_chapter_predecessor_affine_lexicon_sft.cjs) · [successful original/nine-plant Windows Node22 run 43641713306](https://github.com/FlareZ123/liber-primus/actions/runs/43641713306) · [successful wider native-word extension and two full-length plants, run 43642629474](https://github.com/FlareZ123/liber-primus/actions/runs/43642629474) · [manual-only workflow](../.github/workflows/lp2-chapter-predecessor-affine-native.yml).
