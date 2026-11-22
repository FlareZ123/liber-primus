# Medieval Welsh and Old Norse: native-GP language is flatter, but word-local equality deficit persists

**Agent24 / 22 November 2026 / Director issue [#2212](https://github.com/FlareZ123/liber-primus/issues/2212).** New, independent source-language controls; a source-conditional inequality result. No unknown LP2 plaintext, key, period-authenticated non-English language choice, or decrypting operation is recovered.

## Why these two registers, and what remains hypothetical

The manuscript's GP29 characters are Germanic rune-shaped, so **Old Norse `Hávamál`** is a source-plausible period-old wisdom poem with explicit rune references. The authentic 2012 Cicada puzzle used **the Mabinogion in English translation**, making the original **Middle Welsh `Pwyll Pendeuic Dyuet`** an independent cross-language rival to the repeatedly sampled source-English text. Neither original-language text is attested as the LP2 plaintext. Their historical works predate LP2; modern source mirrors are pinned and licensed in [the source attribution](../resources/control/nonenglish_medieval_sources_provenance.md).

The two unchanged source fixtures are [Middle Welsh Pwyll](../resources/control/pwyll_pendeuic_dyuet_welsh_source.txt) (7,847 original lexical tokens after its citation preface) and [Old Norse Hávamál](../resources/control/havamal_old_norse_source.txt) (3,588 tokens after one Roman heading). The [single-file CommonJS SFT](../sims/lp2_nonenglish_register_bounds_sft.cjs) implements explicit source-native-to-GP29 spelling equivalences and source-calibrated ING→NG / IO→IA. Medieval spellings are **not uniquely encodable into GP29**, and the chosen mappings are disclosed assumptions. Both source texts remain byte-level unchanged.

## Exact ciphertext-side constraints

The original unknown LP2 contains **2,896 printed words / 12,956 GP29 runes**. Three original words have length 14; neither candidate source offers a GP29 14-rune word. Accordingly, the controlled comparison uses the **remaining 2,893 actual LP2 source word slots**, exactly **10,021 word-interior rune sites**, and explicitly excludes all three unsupported length-14 words from the plaintext controls. This gives the candidate texts an *optimistic* comparison against the **full 10,060-site** original-cipher upper bounds.

The authentic original's full word-internal equality multiplicity is **811 unordered same-glyph pairs**; on the 2,893 matched slots it is exactly **803**. An unknown independently chosen word-local deterministic symbol map, whether bijective or many-to-one, combined with any within-word transposition, must produce ciphertext with at least as many same-glyph pairs as its source. Any matched source producing E >803 therefore fails this entire keyless word-local architecture. Other models with a changing within-word state or homophones evade this theorem.

A separate secret-key-independent bound covers a different architecture: if `C_j=Q_g[C_(j-1)][P_j]` with arbitrary 29-permutation rows depending on preceding **ciphertext** glyph and eligible group `g`, every potential decoded plaintext top-`k` interior glyph occupancy is at most the sum of the top-`k` entries of the relevant original transition histograms. The exact existing full-original upper bounds are `B1=578,B5=2510` (global), `B1=1031,B5=3912` (eight source sections), `B5=4089` (position×printed ink), and `B1=1354,B5=4842` (section×within-word parity). The unknown two-table switching theorem permits `B1<=1086` under even adversarially hidden per-position switching. These bounds do **not** cover longer changing state, plaintext-predecessor feedback, or secret page-private tables.

## Original-length-matched source comparison

For each named source: independently draw **1,024** exact-length word placements with replacement, in original LP2 printed-word order, from the authentic source text. Fixed xorshift32 seeds are `0x9e3779b9` and `0x9e3779b9+101`. Do not retune mappings or sample seeds based on ciphertext outcomes. All counts are word-interior except unordered equal pairs, which cover each complete word. Source-native p57 cleartext encodes exactly **95/95 original GP29 runes**, solved LP1 FOLLOWING reproduces its authentic `ING` rune, and a planted arbitrary GP29 substitution+word reversal preserves all original equality counts.

| 1,024 independently length-matched placements | Middle Welsh Pwyll | Old Norse Hávamál |
| --- | ---: | ---: |
| Top-one interior rune, min–max (mean) | 978–1157 (1036.0078) | 1147–1294 (1220.2256) |
| Top-five interior runes, min–max (mean) | 4358–4607 (4476.0244) | 4818–5095 (4944.3506) |
| Word-internal unordered equal pairs E, min–max (mean) | **1289–1517 (1393.8955)** | **1299–1515 (1398.2324)** |
| Adjacent equal runes inside words, min–max (mean) | 418–542 (474.8018) | 420–522 (470.7373) |
| Draws meeting original `E<=803` necessary condition | **0/1024** | **0/1024** |
| Draws within *global* predecessor-table B1+B5 | **0/1024** | **0/1024** |
| Draws within *eight-section* predecessor B1+B5 | **0/1024** | **0/1024** |
| Draws within position×ink predecessor B1+B5 | **0/1024** | **0/1024** |
| Draws within arbitrary hidden *two-mode* predecessor B1 | **989/1024** | **0/1024** |
| Draws within section×parity predecessor B1+B5 | **1024/1024** | **11/1024** |

The two last rows are crucial: **Middle Welsh is significantly flatter** than previous matched English controls. A keyless capacity bound that excludes English cannot be generalized to Welsh. The Welsh register remains numerically compatible with a two-mode predecessor **frequency** requirement in 989 of 1,024 draws and with the section×parity requirement in all draws. Such compatibility does not establish that any appropriate permutation rows exist; the B1/B5 inequalities are **necessary, not sufficient**. It also does not repair the separate E deficit under a *word-local deterministic* substitution, since the evolving predecessor architecture does not preserve E.

## Original-cipher reversible zero-step receiver: every anchor fails the pinned source-word mask

A directly reversible variable-state hypothesis tests the reason for the rare original equal-adjacent pairs, without requiring a key search:

```text
C_i = C_(i-1) + k_i · (P_i - x)  (mod 29)
k_i ∈ {1,...,28}, arbitrary independently secret
P_i = x + k_i^(-1) · (C_i - C_(i-1))  (mod 29)
```

For *every* legal secret `k_i`, **`C_i = C_(i-1)` iff `P_i=x`**. This is an exact marker at all 63 original within-word equal-adjacent sites. If the manuscript's printed word lengths correspond to actual plaintext word lengths, then each printed ciphertext word requires a real source word of the same GP29 length with plaintext rune `x` **precisely** at the visible repeated-cipher positions, and nowhere else after that word's first glyph. The first cipher word glyph remains unconstrained by this *word-interior* clock, and page boundaries are allowed to carry; this is a more permissive test than demanding the full 86-event continuous clock. A source-derived `x=F` is worth testing because the authentic solved LP2 p56 exhibits literal-F transparency, although that fact alone does not select this differential operator.

The [all-29-anchor SFT](../sims/lp2_nonenglish_zero_step_marker_masks_sft.cjs) tested this invariant on **all 2,896 original complete printed words** and both pinned source lexicons, with a genuine 95/95 recovered solved-p57 GP29 plant under independently variable nonzero multipliers. No proposed anchor fits every original source-word mask on the supported **2,893 slots**:

| Source-native candidate anchor | Pinned-source word masks absent at required original positions | Additional unsupported length-14 original words |
| --- | ---: | ---: |
| Middle Welsh **F** (prior solved-page special rune) | **34** | 3 |
| Middle Welsh **AE** (its word-interior frequency closest to the 63 original doublets: expected 63.99) | **35** | 3 |
| Middle Welsh **W** (best post-selected mask coverage among all 29) | **3** | 3 |
| Old Norse **F** | **17** | 3 |
| Old Norse **TH** (best post-selected among all 29) | **5** | 3 |
| Old Norse **AE** | **29** | 3 |

For context, source-native Welsh `AE` is a **near-perfect aggregate count match** yet fails at 35 exact original word positions. Thus an aggregate success of 63 expected runes is inadequate evidence; the original message imposes a far stronger, exact positional requirement. A conservative five-fold held-out corpus check freezes an 80%-source Welsh mask dictionary then samples independently length-matched held-out Welsh words for the same original slots. For the `AE` anchor, the **original misses range 35–39** per fold, whereas held-out Welsh Monte Carlo controls range **0–11** missed words in 32 draws per fold. This calibration confirms that absent positional masks are not explained by the usual held-out lexicon novelty in this particular source. (For `F`, one fold's held-out null reaches 44 misses, so the same calibration is weaker; do not generalize the result to every original Welsh text.) Exact word-mask lookup rejection concerns **this pinned source's finite vocabulary** and this explicitly frozen cipher family. Other Welsh prose could contain unattested word forms; homophonic or changing-symbol sentinels, altered word segmentation, reset exceptions, or a different key-selected plaintext register remain possible.

**Stop:** the equality-marker hypothesis has no complete original-cipher native-source vocabulary assignment in either tested text, even with all 29 unknown anchors and all per-symbol nonzero keys secret. A different externally selected register or documented exception must precede any attempt to tune `k_i`; no recovered unknown plaintext is claimed.

## Literal original Welsh book key: direct GP29 running-key operators fail

A second, executable alternative treats the 2012 Mabinogion reference as motivating a **key source** rather than a proposed plaintext register. The actual historical book cipher used an English translation, so recovering original Middle Welsh here is intentionally an *independent rival hypothesis*. The author would still need to specify that cross-round substitution. The [single-file original-input receiver](../sims/lp2_welsh_bookkey_p0_classical_running_sft.cjs) encodes the pinned original Welsh `Pwyll` text in source word order to **27,009 GP29 key runes**. Freeze exactly the source-native GP29 ordinal transform that matches authentic LP1 orthography, and use precisely two classical reversible operators already analogous to the solved book's standard alphabetic shifts:

- **Direct:** `P_i=C_i-K_(t+i) mod29`.
- **Ciphertext-differential:** `P_i=(C_i-C_(i-1))-K_(t+i) mod29`, with documented initial `C_(-1)=0` for each source-framed run.

For each, scan **all 26,281 possible contiguous running-key starts** on the *entire original opening section*, physical pp0–2 (729 ciphertext runes). The independent precommitted holdout is the next illustrated chapter, pp3–7 (1,145 original runes), evaluated with the selected offset plus729. The matched 729-rune **genuine solved LP1 p10–13 native-GP plaintext control** has IoC **0.06230875**, and both source-key encipherings recover those same original runes exactly.

| Fixed source-key receiver | Best original opening key offset (of 26,281) | Best original opening IoC | Untouched next-chapter IoC |
| --- | ---: | ---: | ---: |
| Raw GP29 Vigenère | 14,810 | **0.03645292** | **0.03488411** |
| GP29 ciphertext-difference Vigenère | 3,993 | **0.03663381** | **0.03469020** |

Unkeyed original opening IoC **0.03408252**. Both exhaustive best-selected clearings still look statistically like original random-rune text; they show no sustained GP-native words and are far below the authentic solved-Cicada positive. Exact re-encryption of each fitted opening and untouched holdout passes because the operation is bijective. That merely certifies implementation: it does not rescue a nonexistent plaintext. The finite candidate is ruled out as a **direct/unskipped Welsh textual running key** in either specified classical representation. Keyed skips, nonlinear state and a different source-language spelling are outside this gate and require a fresh printed selector; no further offset/algorithm menu is warranted.

## Cryptanalytic consequence and stop decision

The strongest direct new result is **linguistic sensitivity**: the all-secret anti-frequency proof is powerful for native English and Latin, yet **cannot alone reject a historically plausible Welsh orthographic register with a richer source-visible switching state**. The distinct, more general word-local equality invariant still rejects both tested non-English sources under an intact-word, fixed-map architecture, even with every word holding its own arbitrary key and position shuffle. The original manuscript's only 63 within-word adjacent-equal ciphertext events versus 400+ in source placements similarly motivates a variable per-rune operation, although an anagram can change this adjacency statistic.

The first-party 2012 book cipher selected **Lady Charlotte Guest's English Mabinogion**, not the original Welsh. The original Norse text has no Cicada-signed key indication. Thus neither register supplies the necessary missing selector for a **concrete single original-LP2 inverse**. Additional unsourced GP29 transliteration freedoms, synthetic flat source strings, or a post-selected Welsh language-model key search would create an unbounded fit.

**Decision:** preserve these as external-source controls and retire the proposition that the 2012 English-book or visual rune aesthetic alone authenticates a Welsh/Norse plaintext. Do not generalize English-only upper bounds into impossible-any-language claims. A substantive successor needs an independent historically authenticated language/spelling selector and then an exact original-cipher inversion with a withheld page, ideally comparing the Welsh-hypothesis to its documented English source within the same locked grammar.

**Scope:** language-conditioned Monte Carlo with independent word samples, not a theorem about all Welsh/Norse dialects or all GP orthographies. The positive controls test the encoder and equality invariants, not authentic LP2 ciphertext decryptions. The full sources, code, seeds, original runes, word parser, finite tested bounds and exact scores are committed for direct reproduction.
