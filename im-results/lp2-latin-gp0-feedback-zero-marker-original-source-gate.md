# Latin-register zero-difference marker: source-passage test on original Liber Primus

**Agent 8, 23 November 2026. Conditional original-cipher hypothesis and finite literal-source exclusion. No new unknown plaintext, key or continuation.**

## Reversible hypothesis and independent motivation

The original pp0–55 corpus has **12,956 GP29 ciphertext runes** and **86 same-page adjacent-equal rune transitions**. The first-party GP alphabet gives Fehu/F index0. Under the explicit hypothetical reversible cipher `D[i]=(C[i]-C[i-1]) mod29`, where `D=0` if and only if plaintext is F and the other 28 plaintext symbols are a bijection onto nonzero deltas, these 86 original transitions would mark exactly 86 Fs. This *feedback/marker interpretation is not authenticated*. Source-visible words, punctuation and full page lengths remain unchanged. The 55 original physical page beginnings have no previous original-page rune for the experiment and are excluded from the equality comparison.

The **source-native Latin Vulgate** control contains **204,802** GP29 runes with F share **0.008344645**, whereas three independently checked native-GP English prose sources have F share **0.02037–0.02695**. In source windows matching the entire original 12,956-rune length and the exact original 55 page-start omissions, sampled every 32 runes, the counts of hypothetical F sites are:

| Native-GP source | Windows | Min | Max | Windows with F count ≤86 |
| --- | ---: | ---: | ---: | ---: |
| Latin Vulgate | 5,996 | **66** | 194 | **903** |
| Gibran | 1,549 | 253 | 389 | **0** |
| Shakespeare | 6,380 | 202 | 320 | **0** |
| Emerson | 9,637 | 291 | 432 | **0** |

Overlapping windows are descriptive controls, not independent statistical trials. This supports retaining **Latin as a conditional alternate plaintext register if, and only if, an independent manuscript clue selects the F-zero-delta feedback law**. English could be F-avoiding or encode a different zero sentinel, and the known solved LP pages are in English. The Latin title is no proof of Latin plaintext.

## Direct attempt to locate actual Vulgate plaintext

A key-independent necessary condition for *every bijective nonzero-delta feedback mapping* is that the positions of original ciphertext equalities exactly match positions of one reserved rune in a candidate plaintext, with all other positions unequal. The [read-only exact-source SFT](../sims/lp2_latin_wordfree_repeat_marker_source_sft.cjs) scans **all 204,802 authentic Vulgate GP rune positions and all 29 reserved-rune choices**. It assumes no plaintext word boundaries and leaves the manuscript's genuine physical page starts free.

| Original target | Runes | Same-page equalities | Exact full-mask Latin offsets |
| --- | ---: | ---: | ---: |
| Opening pp0–2 | 729 | 4 | **0** |
| Following pp3–7 | 1,145 | 6 | **0** |
| Tree chapter pp8–14 | 1,729 | 9 | **0** |
| Single p9 | 268 | 3 | **1** |
| Single p19 | 271 | 5 | **0** |
| Single p24 | 270 | 5 | **0** |

The sole short p9 coincidence is Vulgate Acts GP offset **147,972**, near the phrase *UNIVERSO ORBE TERRARUM*, with GP8 (=H) as its reserved symbol. It is a **post-selected chance-like mask fit, not readable decipherment**. A fixed 3-site random-mask null for p9, retaining the untouched 267 eligible source positions and Vulgate letter distribution, yields **0.0890648287 expected compatible offsets on that one page**; multiple pages were inspected.

The p9 candidate also fails a *much stronger all-secret mapping constraint*. Define the complete 267 original p9 ciphertext first-differences. For every constant-position phase period **1 through 60**, allow a completely unrelated secret **29! symbol→difference bijection at each phase**. The genuine Latin candidate would require equal Latin symbols in the same phase to give identical original differences and distinct Latin symbols to give distinct differences. **All 60 periods have contradictions**, including **238 forward / 220 inverse contradictions at period1** and **32 forward / seven inverse contradictions for the best period52**. This is a necessary condition independent of fitted private alphabet values. It excludes the literal p9 Vulgate passage for these stationary-phase feedback families, while genuine per-rune changing keys remain outside its scope.

A separate authentic-source positive plants a **729-rune Latin passage** from Vulgate GP offset10,000, transforms it with a wholly reversible fixed 28-nonzero-step alphabet and F→0 through the exact pp0–2 physical page lengths, and recovers the original real source offset **uniquely** from the same mask decoder. The fixed-alphabet forward/inverse equality constraint also passes on the first 262 planted source runes. The test runs from repository-frozen original sources with all counts and exact recoveries asserted.

## Stronger all-secret period-28 invariant against actual Latin Vulgate

The rare GP0 frequency alone does not make a Latin plaintext recoverable. A separately motivated, strictly reversible 28-phase cipher reserves zero ciphertext difference as one plaintext symbol and independently permutes the other 28 ciphertext differences at every phase. **Even granting an arbitrary unrelated private 28! alphabet in each source-visible page or major-ink-mark segment**, the observed original ciphertext determines the number of identical first differences inside every (physical segment, phase modulo28) bucket. An unknown bijection can rename those differences but **cannot change their within-bucket pair-equality count**. This is a stronger, key-independent necessary condition than the 86 F-site comparison.

The independently tested source-invariant construction uses actual original page starts, 31 source-authenticated major mark events, all 12,956 original ciphertext runes and **128 evenly spaced complete 12,956-rune literal Latin donor windows**, with no donor-dependent phase adjustment or alphabet tuning. It reproduces the original-source equality counts established by Agent4 for English controls, then applies exactly the same buckets to Latin:

| Secret phase28 reset condition | Independent source segments | Equal original source step pairs | Smallest Latin plaintext equal pairs (128 whole-length windows) | Latin donors no greater than original |
| --- | ---: | ---: | ---: | ---: |
| Global period28 | 1 | **104,918** | 216,715 | **0** |
| Major printed mark | 29 | **11,021** | 22,719 | **0** |
| Physical page | 55 | **1,775** | 3,593 | **0** |
| Page plus major printed mark | 74 | **1,648** | **3,346** | **0** |

The strongest 74-zone test permits **2,072 unrelated private 28-way alphabet tables**, of which 1,848 have occupied original input positions. Nevertheless all 128 authentic Vulgate windows exceed the original equality count by at least **1,698**; zero complete Latin windows survive any of four reset assumptions. The assertion-complete CJS SFT reproduces every exact original count and Latin result. This independently settles an important objection to the English-native no-go: **the low Latin frequency of F does not rescue a source-clocked 28-phase feedback cipher against an all-secret collision invariant**. The result excludes this precise family on these fixed literary donor windows, including all its private hidden alphabets. It does *not* exclude any plaintext with arbitrary changing per-rune state or unrelated unknown language registers.

## Decision

**Do not identify the original pp0–14 as verbatim Latin Vulgate under this zero-sentinel mechanism. Do not expand the isolated p9 Latin coincidence.** Retain the lower Latin F-frequency observation as a strictly conditional register alternative only; the entire authentic Latin donor set is also incompatible with every source-reset period28 all-secret nonzero-step cipher tested; an independent author-selected feedback law, complete long plaintext or authentic key is still required. A random/compressed binary plaintext, other source texts, altered word segmentation and more general feedback remain open.
