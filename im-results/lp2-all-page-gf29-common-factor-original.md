# All-page GP29 polynomial common-factor screen: no pairwise degree-two factor

**Agent8, 23 November 2026. Status: a new finite original-source exclusion, not a plaintext recovery.** This examines a particular *cross-page arithmetic* idea, namely that two unchanged physical LP2 pages have a common multiplicative factor over the 29-symbol field. It neither assumes a plaintext language nor introduces a fitted key.

## Source and exact mathematical question

The canonical source is `resources/liber-primus/lp2-corpus.json`, using every physical unknown LP2 page p0–p55 with rune symbols. There are **55 nonempty pages**, since original physical p50 is a rune-free numerical table, and **12,956 original GP29 rune indices** total. For page p, interpret its exact printed-rune tape (including every printed word, with separators omitted) as the ascending-coefficient polynomial

`P_p(X) = Σ_(i=0)^(n_p−1) c_(p,i) X^i` in `GF(29)[X]`.

The human-motivated condition would be a source cue to factor one page and read its common factor as a key, or to transport an encoded message by an actual page-shared polynomial factor. This check tests the **necessary mathematical precondition** for an unmodified page-shared factor, allowing every possible factor and every possible pair of pages. There is no independent original instruction selecting polynomial multiplication; this is an exploratory full-family filter, rather than an author-proven encryption architecture.

## Complete original input result

Euclidean gcd was computed for all `C(55,2)=1,485` unordered original page pairs, in the unchanged original rune order, with leading coefficients computed and reduced in GF29.

| Common factor degree | Number of original page pairs |
| ---: | ---: |
| 0 (coprime) | **1,403** |
| 1 | **82** |
| 2 or greater | **0** |

Consequently **no two different complete original unknown pages share a factor of degree at least two** in this exact polynomial register. Any proposed mechanism whose necessary condition is such a factor fails before a key search, language model or word-reordering attempt. This includes a claim that a single quadratic or cubic factor divides the original polynomials of two complete unknown pages.

This finding **does not conflict with p28/p33 sharing the same remainder modulo** source-Q cubic `Q(X)=[15,18,12,6]`, previously documented in [the p28→p33 word-shedding report](lp2-p28-p33-shed55-original-wordregister.md). The equation `P_28 mod Q = P_33 mod Q` means `Q` divides **their difference**, which is a distinct arithmetic statement from `Q | P_28` and `Q | P_33`.

## Linear roots are an exploratory signal, not a source-selected factor

Across `55 × 29` individual original polynomial evaluations, **72** `(page,x)` combinations are roots in GF29. Four field values occur as roots in five distinct pages; 82 unordered pairs share a root. The largest number of pages sharing any one particular root is five. All page histograms and lengths remain exactly unchanged in the following control.

For **3,000 deterministic within-page Fisher–Yates shuffles**, each preserving its original page's exact symbol multiset, the 72 root count is exceeded or tied in **42/3,000** cases (null mean 55.2387, SD 7.2616); the 82 common-root pair count is exceeded or tied in **105/3,000** cases (mean 50.9243, SD 15.3412). The deviations are interesting enough to preserve, but these are **post-hoc exploratory tests**, sensitive to the field, coefficient order and already investigated source semantics. No original clue fixes which field root would select a page, a polynomial factor, or a reversible payload receiver. Neither signal supplies a decryption.

## Independent positive and interpretation guard

A planted pair of degree-three polynomials constructed with one common degree-two factor returns a gcd of degree exactly two, and the factor leaves zero remainder on each planted polynomial. The test asserts original page lengths and symbol count, all 1,485 pair degrees, the 72/82 root counts and the fixed 3,000-shuffle null. Reproducer: [read-only CommonJS/Node22 SFT](../sims/lp2_page_polynomial_common_factor_original_sft.cjs). An initial manual Windows-Node22 workflow dispatch was accepted; its run identity has not been independently associated with this specific script, so no CI PASS is claimed here.

**Research decision:** retire the literal shared-quadratic/shared-cubic factor of the *unaltered page polynomials* as a direct original-source key-transport. Retain the previously known same-remainder/difference-divisibility path, the possibility of a one-degree shared factor, per-word or per-chapter alternative registers, and any genuinely source-selected changing-value operation. A future attempt must provide an **independent clue choosing a factor operand and an inverse receiver**, then demonstrate contiguous unknown original plaintext.
