# Original GP29 ciphertext pairs do not encode printed word breaks by a static local rule

**15 November 2026, Agent3. Classification:** exact original-ciphertext necessary-condition exclusion and independently held-out predictive failure for a bounded space-generation architecture. **No newly recovered plaintext, author-selected key, cipher or continuation.**

## Question and competing mechanisms

The 2016 authenticated Cicada message says words are a map, while the long unknown LP2 pages have unusual ciphertext and printed-word statistics: 2,896 printed words and low prose-like word-length order; equality of GP runes five positions apart is enriched within printed words. One hypothesis is that the printed word separators themselves **are output from a local rule on ciphertext runes**, perhaps using a hidden lookup table with a different key at each illustrated chapter or physical page. An independently readable deterministic space code would make printed punctuation recoverable from ciphertext alone.

The rival is ordinary editorial word separation or a separate keyed/nonlocal boundary channel. Prior original work excludes a **five-echo-bit local delimiter rule** ([all-secret echo-mask obstruction](lp2-lag5-local-delimiter-allsecret-obstruction.md)) and finds first-difference values unremarkable at word gaps ([delta MI](lp2-word-boundary-delta-null.md)). This test instead grants arbitrary secret tables over actual original **GP29 glyph identities**, including every secret pair-lookup key without needing to guess it. It is a different class of possible local encoders.

## Exact original source and oracle theorem

Source: `resources/liber-primus/lp2-corpus.json` cross-checked **page by page** against `lp2-transcription.txt`. The independent parser reads all 56 physical unknown pages p0–55, including rune-free p50 and words carried over 32 physical page turns. It counts exactly **12,956 GP29 glyphs, 2,896 complete printed words and 2,895 true interword separators**. Exclude the first glyph of each physical page from same-page pair eligibility, obtaining **12,901 adjacent sites**, with **2,873 true word breaks and 10,028 nonbreak sites**. The other 22 word breaks occur across a physical page gap and are not fitted to a fictional within-page pair.

At a gap before rune `C[i]`, the three source-only possible lookup inputs are (1) the preceding rune `C[i−1]`, (2) the ordered **two-rune** pair `(C[i−1],C[i])`, and (3) the ordered **three-rune** window `(C[i−2],C[i−1],C[i])`, using an explicit local-start sentinel when the preceding-previous rune is outside the physical page. These are fully specified ciphertext observations, and no plaintext is assumed. Each context is tested with **one single secret Boolean table**, or an independent secret table for each of **nine original illustrated chapters**, or a distinct secret table on each of **55 rune-bearing physical pages**.

For any of these families, collect each context's observed `BREAK`/ `CONTINUE` counts `(n1,n0)`. **Every deterministic secret Boolean lookup** must produce one and the same label at every appearance of its input context; hence its algebraic all-secret minimum number of errors equals

`min_errors = Σ_context min(n0,n1)`.

This is an *exact lower bound*, simultaneously over every possible secret table, independent of English scoring, arbitrary phase tuning, or any cipher value transform. A zero result is necessary for an exact decoder.

| Allowed hidden table | One-rune context minimum errors | Pair minimum errors | Three-rune minimum errors |
| --- | ---: | ---: | ---: |
| One common whole-book table | **2,873** | **2,863** | **944** |
| Independently secret at each of nine printed chapters | 2,873 | **2,043** | **164** |
| Independently secret at each of 55 physical rune pages | 2,783 | **589** | **18** |

A pair rule has **at least 2,863 incorrect labels** even after optimizing all 841 possible pair keys independently for its output Boolean mapping (the source exhibits 840 distinct pairs). The global optimum improves on the naive never-break classifier by only **10 sites**. The 55 independently optimized per-page pair tables retain **589 impossible-to-reconcile gaps** across 11,158 observed page+pair contexts; at least 586 of those lookup entries have contradictory original labels.

The page-local three-rune model comes closer, with 18 minimum errors, but it uses **12,846 observed entries across 55 independent tables**. Its near-memorization is a huge secret specification rather than an intelligible small keyed rule or real plaintext recovery. Even that highly flexible class still cannot reproduce the exact original printed boundaries at all sites.

These are exact per-model constraints; a change of ciphertext register, unknown dynamic state, nonlocal context, a source-selected polyalphabetic cipher before gap decoding, and opaque punctuation steganography are different hypotheses.

## Forward-heldout decision rather than fitted coincidences

A second test trains only on original p0–39 (9,600 within-page sites; 2,141 breaks) and evaluates the original untouched p40–55 (3,301 sites; 732 breaks). A global lookup table trained on these original input contexts is given one fixed **64-observation Beta shrinkage prior** at the global training-wide break fraction 0.2230208333, even when context counts are small. No secret table can be inferred from the held-out word labels. The frozen binary Bernoulli log likelihood of the correct held-out break bit at each site gives:

| Source-only break predictor | Held-out log score (higher is better) | Gain vs stationary |
| --- | ---: | ---: |
| Training-only constant break rate | **−1746.624679** | 0 |
| Previous GP rune lookup | −1749.649321 | −3.024642 |
| Pair-of-runes lookup | −1753.549745 | **−6.925066** |
| Triple-rune lookup | −1748.557124 | −1.932445 |

The unselected global pair/triple context frequencies yield **no predictive information about original printed word breaks on new pages**. This held-out test is a comparison of one specific regularized Bayesian lookup estimator; the exact contradiction above is the stronger no-key impossibility result for deterministic tables.

## Constructive positive and scope

The [self-contained Windows Node22 CommonJS SFT](../sims/lp2_local_rune_pair_wordbreak_allsecret_sft.cjs) contains two independent synthetic positive controls built on **the same 12,956 original source runes and physical pages**. It generates a deliberate word break at any site whose original rune-pair labels satisfy a fixed modulo-5 rule; the all-secret **global** pair oracle then recovers the complete planted segmentation with zero errors. A second plant changes that rule with physical-page index; the page-specific pair oracle recovers zero errors while the global oracle fails, confirming that the scope distinction is functional. All source counts and empirical scores are asserted.

[Successfully executed on original source, Windows Node22, Actions run 43722741807](https://github.com/FlareZ123/liber-primus/actions/runs/43722741807). The workflow is manual-only, read-only and makes no periodic repository activity.

## Cryptanalytic decision

**Retire any direct stationary local GP-rune-pair → printed-space Boolean lookup**, including arbitrary hidden tables that rekey at the nine visible chapters or every page, as a complete word-boundary encoding on this original manuscript. Triple-rune lookups also cannot satisfy all source sites, even with per-page keys; they are impractically secret-heavy and fail held-out prediction under the stated model.

Printed word breaks may still be important as real cipher-state reset sites, and the independently established word-local five-step echoes still constrain encipherment. Their mechanism must explain **why particular symbol positions and delimiters align**, and supply an authentic key/reversible rune operation. Neither all-secret Boolean table nor this prospective diagnostic finds that missing operation.

This scoped result belongs in `im-results/`. It does not change the authoritative manuscript-level `results/README.md` assertion that all 56 unknown physical LP2 pages remain unsolved.
