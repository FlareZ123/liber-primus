# Three Cicada source numbers converge on p55/p56 through the original p50 table

## Decision

Three previously identified original puzzle numbers, **1033**, **3299** and **3301**, select an identical terminal 256-cell-table address, **245**, using a source-grounded but still hypothetical base59 pointer rule. The first two numbers point directly to245; the canonical emblem 3301 reaches245 in **exactly eight** steps. The terminal literal token is **0u**, interpretable as **p55** in base59 or **p56** in base60: respectively the final encrypted LP2 page and the first solved continuation. Independently, **3301 = 55×59 + 56**. Both copies of literal 0u fall on the table's second ring, exposed by shedding a 76-cell outer perimeter, equal in size to the **76 original ciphertext runes of p55**. The solved p57 parable instructs: “WE MUST SHED OUR OWN CIRCUMFERENCES.”

These are **exact, independently reproducible structural observations**, a plausible source-to-page navigation route. They are **not** a decrypted LP2 passage, a cryptographic key, or proof of author intent. The two required conventions, pointer reading and eight-step stop, remain conditional.

## Original source and fixed operation

Original numeric sources: 1033 is the sum of the original Cicada 2014 5×5 magic-square rows/columns (resources/cicada2014-openpuff-magic-squares.txt); 3299 is the LP2 p15 highlighted red number; 3301 is the puzzle's canonical number and the other historical magic-square sum. The earlier [source-number comparison](../sims/lp2_source1033_3299_3301_grid_pointer_sft.cjs) established their three literal p50 cells; the present experiment follows their base59 successors.

The original p50 is 32 rows × 8 columns, 256 two-character cells (resources/liber-primus/base60-grid.json). Its printed alphabet has60 possible symbols but never uses f; removing that unused symbol gives a natural alternative 59-symbol alphabet. For a two-character token XY, base59(XY) = 59·index(X) + index(Y), always an integer from0 through255 for these original cells. Take each source number n modulo256 as a zero-based cell and repeatedly use its base59 numeric token value as the next cell address. This is an *explicit experimental interpretation*, not an author-issued cipher key schedule.

| Historical source | n mod256 | Literal token | First base59 destination |
|---|---:|---|---:|
| 1033 LP1 square | 9 | **49** | **245** |
| 3299 LP2 marked number | 227 | **49** | **245** |
| 3301 emblem | 229 | **00** | **0** |

The entire eight-step 3301 path is:

**229 → 0 → 200 → 108 → 14 → 180 → 142 → 158 → 245**

Its nine literal successive tokens are:

**00 → 3N → 1o → 0E → 33 → 2O → 2e → 49 → 0u**

The conditional eight-step depth corresponds numerically to the reconstructed 2013 worked-example server DH public share A=8. This DH example is **participant/session-specific** and must not be promoted to a unique manuscript key or independently author-selected pointer count. Nevertheless, all intermediate table cells and the convergence are fixed original-source values with no adjusted address.

The common cell245 contains **0u**: base59(0u)=55 and base60(0u)=56. Separately 3301 in base59 has quotient55 and remainder56. Three distinct source number types therefore meet a terminal page-pair selected two ways. The complete table has three literal 49 copies at addresses [9,158,227], two 00 copies at [192,229], and two 0u copies at [94,245], so none of those token strings is globally unique without the preceding path.

## Geometry of the solved p57 instruction

The p50 full 32×8 outer circumference has **76** cells, matching original unknown p55's **76** GP29 runes. Remove this perimeter and the second ring becomes visible. Both literal **0u** tokens lie precisely on that second ring: address94 has zero-based (row11,col6); address245 has (row30,col5). This supplies a concrete geometric reading of the authentic p57 instruction to shed circumferences, with the source-number path selecting one of those two second-ring 0u tokens.

A new source-fixed full-page pad check also used the unchanged clockwise p50 outer ring from the top-left corner, base59 cell values modulo29, and the authentic solved-p56 subtraction sign on all 76 original p55 runes. The initial two printed plaintext words would be **A UFUIA**. Although the one-rune A is superficially encouraging, the next four-rune word decodes to an unrecognizable string; overall inverse IoC is **0.04070175438596491**, compared with **0.037894736842105266** for the original ciphertext. There is no consecutive recovered English passage. The matching outer-ring length had already motivated a direct pad hypothesis, thoroughly tested in [the 192-perimeter-model gate](../sims/lp2_p50_rim76_p55_direct_pad_crib_sft.cjs), which found no exact six-symbol alignment to the conditional p55 tail OUR OWN; and [the independent 74-checksum test](../sims/lp2_p50_rim76_p55_r4_74check_source_sft.cjs) with at most10 of74 matching. Those earlier direct decryption proposals remain negative. A separate **full-original-page GP29 language receiver** now examines **96** non-keyfitted perimeter decoders: base59/base60 × four printed corners × both cyclic directions × three additive/Beaufort signs × ordinary continuous key or transparent-ciphertext-F skip. All 96 have complete synthetic forward/reverse plants, and the plaintext language model is independently trained on **217,106** source-native Shakespeare GP runes. **The best original p55 score is −3.78640147** (base60, top-right, reverse, C+K, F skip), whereas **all 735** held-out 76-rune Gibran English windows score **at least −3.15267986** (mean −2.37314308); authentic solved p57 gives −2.45056763. Matching 250 shuffled p55 ciphertexts, taking each shuffled text's maximum over all 96 models, beat or equal the original best **20/250** times. Thus optimizing the natural perimeter mode family yields only noise-like strings, **not** recovered source-native prose. [Full original-page native-language inverse SFT](../sims/lp2_p55_rim76_fullprose_96mode_native_sft.cjs). As an additional simple test in this invocation, repeating the eight original base59 pointer values modulo29 as an additive key over p55 produced no readable text; plaintext IoC was0.03825 versus ciphertext IoC0.03789. No original plaintext is recovered by this pointer route.

## Alternative explanations, evidence threshold and continuation

A 256-cell table admits many address permutations; most pointer paths eventually coalesce. The source numerals, modulo256 convention, removal of f, and DH step choice were identified in different historical investigations, with some choices made after observing attractive relationships. Their conjunction **has not been given an adequately charged pre-registration/null test** and cannot independently authenticate creator design. The extra 3301=55×59+56 and second-ring placement make this a targeted **navigation hypothesis** worth retaining, rather than an independently established cipher.

[Single-file Windows Node22 source reproduction](../sims/lp2_1033_3299_3301_base59_p55_p56_convergence_sft.cjs) asserts every original byte, the full 8-step trace, the three addresses, 0u's two-radix outputs and multiplicities, p55/p56 original rune lengths, and the exposed second-ring cell geometry.

**Next action required for actual decryption:** locate an independent manuscript or signed source clue that explicitly selects the base59 pointer clock and a *reversible* p55 ciphertext receiver. Fix the proposed operation and starting location before reading any candidate plaintext, then require a complete second printed word to decrypt without changing key, sign or phase. A recovered destination page alone cannot resolve the deep-web hash or the 56 unsolved pages.
