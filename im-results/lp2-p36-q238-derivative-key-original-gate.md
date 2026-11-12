# Physical p36 versus the degree-238 table factor: exact derivative key, strong model fit, failed plaintext

**Status (12 November 2026, Agent 9): additional controls for an already tested direct derivative pad, with an unusual language-model score improvement but no authenticated plaintext, new key, or identified author instruction.** All computations passed in the [manual Node.js 22 workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43269030621). The complete, read-only [CommonJS reproducer](../sims/lp2_p36_q238_derivative_key_sft.cjs) reconstructs the GF(29) factor, the original ciphertext, all decoders, the independent language controls, and the null.

## Why try this particular original-cipher alignment?

The six physically repeated Babylonian/cuneiform headings appear on LP2 pp34–39; p36 among them has **exactly 238 original GP29 runes** (50 printed words). The independent original **pp49–51 numeral table** has 256 base60 bytes. Its already established polynomial factorization over GF(29) has an irreducible **degree-238** residual; see [the exact factorization](lp2-grid-complete-gf29-factorization.md) and [the independently explored GF(29²) extension](lp2-grid-q238-gf841-conjugate-split.md). Both the cuneiform headings and base60 table make numeral operations plausible to a historical solver. **The direct source-order/reverse formal-derivative additive inverse was already tested without plaintext by Agent 43** in the [16+238 original-source alignment report](lp2-grid-complete-gf29-factorization.md#direct-original-source-16238-factor-coefficient-alignment-exact-all-secret-obstruction) and its [existing implementation](../sims/lp2_grid_16plus238_source_alignment_sft.cjs). This new note changes its evidence classification only by measuring finite language-model, page and permutation controls; it claims no new cryptographic mechanism. The choice of field, factor division, **formal derivative**, and alignment to p36 are analyst hypotheses. Nothing in the manuscript explicitly says to use a polynomial derivative as a key.

With the source's 256 numerical bytes `b[0..255]` in original forward reading order, form `P(X)` with decreasing coefficients `-b_i mod29`, dropping its leading zero, so `P` is monic of degree254. Divide exactly by

```text
(X+5)^2 (X^2+18X+11) (X^3+14X^2+16X+24)
(X^9+12X^8+20X^7+10X^6+5X^5+X^4+9X^3+15X+11)
```

to obtain the source-derived monic `Q238(X)`; all polynomial operations are mod29 and the remainder is **exactly zero**. Two source-length 238-symbol keys now exist without guessing any secret: the **238 nonleading coefficients** `[X^0..X^237]Q238`, and all **238 coefficients of its formal derivative** `K_i=(i+1)[X^{i+1}]Q238 mod29`, each in ascending polynomial degree. A direct left-to-right additive candidate is `D_i=(C_i-K_i) mod29`, with `C_i` the original p36 rune index.

## Original-cipher test

For a new calibration of the previously negative derivative gate, only 16 finite variants were admitted: nonleading factor coefficients versus derivative coefficients, forward versus reversed key, addition versus subtraction, and ciphertext-F transparent versus all positions consuming the key. None alters original word breaks, fits a secret shift, rotates a phase, searches a key, or allows page-specific parameter tuning. Each variant reconstructs all **238/238** original ciphertext runes under its exact inverse. A separately selected GP-native English 238-rune positive plant survives direct derivative encryption/decryption **238/238**.

The strongest variant is the formal-derivative key in forward degree order, **subtractive, without F skipping**. Its full output is printed below in the *50 authentic source word boundaries*. This is not a grammatical plaintext:

```text
BTH / SCIF / XME / IEO / NGOEL / IAEAEA / OECEAEAE / AEFIFAM / NO /
EOTGAI / EAGMCTP / OIYGDYCHTHE / LCW / OESJTBAENGSE /
LEYWJLEAIAYTH / XJ / RCFITNS / XUCEAI / MIAYHO / WDTHEAAECA /
FFTHH / AEFX / JIAIMFBAED / EAX / YOEJAH / AOEEO / SIG / BPPCTXP /
THCA / NYLDI / GHST / AN / ENGFEO / XDWTENGHE / AEOIXT / PTHO /
EEOREL / XNAEGOB / CEFXTP / LNEA / TI / EAFDANOMEAEOEOTH /
BYAECBSPS / HOM / ITIAEASBCR / JEAL / WEO / EGO / WPNI / IAGSEOE
```

The complete output IoC is **0.03517356** versus raw p36 **0.03598908**, both near the uniformly random GF29 reference 1/29. Against 12,230 distinct GP-normalized words pooled from Shakespeare, Gibran and Emerson, **only two of the 50 whole original words match**: `NO` and `AN`. A separate 1,500-key-shuffle dictionary check gives mean **1.0813 matches** and **445/1,500 shuffles obtaining at least two**. The output cannot be promoted to unknown original plaintext on this evidence.

## What is interesting about the negative?

The source-derived derivative still has an unusually strong **relative** effect under three independently trained GP trigram models. Scores are mean log conditional trigram likelihood per GP rune; higher is better:

| GP29 model | Original p36 | Fixed derivative inverse | Worst native 238-rune heldout window |
|---|---:|---:|---:|
| Shakespeare | −5.712018 | **−5.216817** | −2.970402 |
| Gibran | −5.565872 | **−5.167922** | −3.279458 |
| Emerson | −5.989221 | **−5.500181** | −2.874447 |

Both halves of the 238-rune original page independently improve under the same *frozen whole-page* derivative rule: first119 **−5.557259 → −5.099795**, second119 **−5.902874 → −5.336798** with the Shakespeare model. Among **all 36 original unsolved physical pages of length ≥238**, applying the identical 238-key prefix to each page's first238 runes places p36 at **rank 1/36** in output score and in change from its own raw score. The runner-up p34 scores −5.524977 and improves +0.420270; p36 improves +0.495200.

In **1,000 deterministic independent within-key shuffles** of both source-derived full-length keys, reoptimizing over all 16 originally tested direction/sign/F cases for every shuffle, **1** reaches or exceeds p36's observed best score (add-one conditional tail **0.001998**). This is evidence of a conditional language-model alignment, **not** a global design probability: the selection of p36, table factor, formal derivative, GF29 arithmetic and hypothesis family occurred after inspecting the artifact and previous investigations. Neither independent source model yields anywhere near readable original language. The raw IoC and dictionary failures are counterevidence to a completed direct additive decipherment.

## Research decision

**The earlier rejection of direct Q238 derivative subtraction as a complete p36 English decoder stands.** Its repeatable, page-specific model gain is worth preserving as an exploratory clue to possible contact between the base60 table and numeral-header pages. A successor must provide either an *independently observable source instruction* selecting the factor/derivative combination and a reversible second step, or an *unambiguous held-out original-cipher prediction* such as source-grammatical words or a readable segment not fitted on p36. Merely shifting, rotating, reversing more times, applying unmotivated language corrections, or layering free keys would not resolve the failed original-word grammar.

The experiment is **distinct** from the already completed p36-seeded GF(841)^119 relative-trace stream test: here the base-field derivative itself is the fixed 238-token full-length key, and p36 is the output target. It recovers no unknown LP2 plaintext, hash preimage, endpoint, or new historical key.

**Reproduce:** `node sims/lp2_p36_q238_derivative_key_sft.cjs` from the repository root with Node.js 22. The run uses only bundled input files, emits the complete raw/derived word output, 16 variants, page controls and conditional shuffle results, and makes no network requests or file writes. Its [successful GitHub Actions execution](https://github.com/FlareZ123/liber-primus/actions/runs/43269030621) independently ran all assertions against a checked-out repository commit.
