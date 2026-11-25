# LP2 no-repeat escape-channel capacity: source-visible carrier audit

**Status:** the page-reset, physical-line, joint-spacing, histogram, variable-length and fixed global-boundary compression receivers have been tested; their exact frozen readouts fail. A distinct conditional H-shuffle printed-group-reset enumerative receiver (2,896 groups; 63 within-group repeats) has a 264.489-bit deficit and a 323.144-bit red/mark/apostrophe carrier, but its fixed mixed-radix original inverse is non-English. An exact interleaved lexicographic variant with either high- or minimal-cardinality low-order quotient forces at least 174 J+EO even with independent choices in the eight sections, versus a maximum 83 in 1,129,739 matched literary windows; arbitrary plaintext permutation cannot repair those counts. Printed groups are not authenticated plaintext words; no source-selected historical decoder or recovered unknown plaintext.

## Finding

The observed 29-symbol ciphertext stream does not by itself rule out a 29-to-28 next-rune encoder. Under the page-reset/global-86-repeat model, red/special marks alone are short of the required side information; fine punctuation plus generous ink and the optional binary line residuals are also insufficient under the fixed page-quota/coarse-boundary assumptions. A separate conditional H-shuffle group-reset model uses the 2,896 complete printed groups as resets, leaving 10,060 within-group transitions and 63 internal repeats. Its count-first codebook has a 264.489-bit deficit, so the red-run/large-mark/apostrophe carrier (323.144-bit state space) is cardinality-sufficient; however, one frozen physical-order mixed-radix inverse is non-English under the fixed quadgram control. Printed groups are not authenticated plaintext words, and this rejects only that exact rank/sidecar mapping. The [interleaved exact-repeat all-quotient gate](lp2-interleaved-lex-enumerative-allsidecar.md) excludes two natural sequential rank orders with either quotient placement against the finite literary comparison register, without searching the missing sidecar. Printed boundary positions still have ample *combinatorial* capacity but no source-selected reversible mapping. A separate physical-line-framed enumerative rank also fails: its original candidate has 0/1,132 long dictionary words, while universal GP29 recovery under the fixed per-line repeat schedule requires 662 bits even with a free head on every line and 711 bits with continuous seams. The original-image compositor model leaves at most 55 bits in its deliberately generous binary residual-line-end channel. These are scoped negative results, not a general impossibility theorem.

This is a capacity and scoped-decoder result, **not** a cipher identification or decryption.

## Conditional no-repeat deficits

Scope is the 55 rune-bearing unsolved pages p0–p49 and p51–p55. Physical p50 is the runeless grid page. The corpus contains 12,956 rune positions, 12,901 eligible within-page transitions, and 86 adjacent equal-rune transitions.

For a hypothetical encoder whose output is restricted to 28 choices at ordinary transitions and can use the observed repeats as exceptions, the existing exact-count analysis gives:

| Model | Minimum additional information |
|---|---:|
| Printed-group reset (2,896 groups; at most 63 within-group repeats) | **264.489 bits** |
| Global output has at most 86 repeats, repeat positions free | **325.450 bits** |
| Exactly 86 repeat positions are free and the repeated outputs are forced | **325.750 bits** |
| 86 exception positions are fixed in advance and allow all 29 outputs | **648.770 bits** (649-bit side channel) |
| Per-page repeat counts fixed only as upper bounds | **430.561 bits** |
| Per-page repeat counts fixed exactly | **445.732 bits** |
| All 86 repeat positions fixed in advance | **1,066.559 bits** |

These are conditional bounds for the proposed 29-to-28 family, not evidence that this family is the actual LP2 cipher. The 86/63 observed repeats are corpus observations, not author-authenticated rules. The printed-group row assumes H-shuffle: groups act as reset blocks even though the source does not establish them as plaintext words. Derivations and earlier tests are in [lp2-anti-repeat-lossless-capacity.md](lp2-anti-repeat-lossless-capacity.md).

## Tight invertible planted construction

For the literal fixed-exception model, let the 12,902-symbol GP29 input be a base-29 integer X. The output codebook has

\[
M=29\cdot29^{86}\cdot28^{12,815}
\]

members: one free initial symbol, 29 choices at each of 86 fixed exception sites, and 28 choices at every ordinary transition. The quotient \(q=\lfloor X/M\rfloor\) is the side channel; the remainder is mixed-radix-unranked into the ciphertext. The decoder reverses the rank and reconstructs \(X=qM+r\). The minimum side-channel size is **649 bits**, matching the **648.770-bit** information deficit to integer rounding.

The reproducer runs this construction on a deterministic 12,902-symbol synthetic GP29 input, verifies exact round-trip, and verifies that every ordinary transition excludes its predecessor. This is a tight positive control for the stated capacity bound, **not** a proposed LP2 cipher or recovered plaintext.


## Exact boundary-assisted original-input codec (15 November 2026, Agent 1)

**Decision:** a fully executable, lossless GP29 anti-repeat serializer can use the **observed printed word breaks** to carry the information missing from a 28-choice successor stream. Its literal natural BASE29/combinadic readout on all 55 original pages has GP29 coincidence **0.03444723816** and no intelligible unknown-page plaintext. A stronger *single common five-repeat bound per page* fails outright on **eight original physical pages (10, 22, 30, 36, 39, 51, 53, 54)** because the original source decodes to a number outside the allowed base29 message space. The source supplies no instruction selecting either rank convention, a repeat quota, or how printable spaces should carry code digits. Thus this establishes an implemented alternative to a capacity impossibility claim and a decisive negative for one simple frozen grammar, **without identifying the historical cipher**.

**Exact, deterministic mapping.** Let a physical page contain \(n\) original GP29 runes, \(B\) original printed separator gaps and a chosen maximum \(k\) for allowed adjacent repetitions. At each page start the first output rune has 29 possibilities. Subsequent transitions are ordered as *repeat the previous rune*, followed by the 28 nonzero cyclic GP29 steps. Let \(f(t,k)=28f(t-1,k)+f(t-1,k-1)\), \(f(0,k)=1\), and \(f(t,-1)=0\). The number of allowed ciphertext pages is \(M=29f(n-1,k)\). Lexicographically rank this constrained stream as \(R\), \(0\le R<M\). The current original printed break positions \(g_1<\cdots<g_B\), zero-based in the \(n-1\) gaps, have an exact combinadic rank \(H=\sum_{i=1}^B \binom{g_i}{i}\), \(0\le H<\binom{n-1}{B}\). Define \(T=29^n\), \(Q=\lceil T/M\rceil\), \(q=H\bmod Q\), \(s=\lfloor H/Q\rfloor\). The candidate plaintext is precisely the **n-digit GP29 representation of \(X=qM+R\)** if \(X<T\). Otherwise, this page is impossible under the frozen grammar.

The encoder maps any n-rune plaintext \(X<T\) to \(q=\lfloor X/M\rfloor\) and \(R=X\bmod M\), reconstructs the constrained ciphertext from \(R\), and places its \(B\) typographic boundaries by unranking \(H=sQ+q\) with the explicitly preserved layout salt \(s\). The salt is additional, freely settable state; the encoder verifies that \(H<\binom{n-1}{B}\). Full original-cipher **rune and separator-mask** reencryption is a correctness invariant, not evidence for a historical key. This natural code goes beyond the earlier capacity-only calculation by actually assigning a complete reversible map and applying it to the original artifact.

Two *declared* original-input decisions share this same mapping, without a key, phase, alphabet-order or language-score sweep:

| Constraint | Original original-page result | Native GP plaintext plant |
| --- | --- | --- |
| Allow exactly each page's **observed** repeat count as its upper bound \(k_p\) (explicit **post-selected** information) | **55/55** originals decode and reencode their exact runes and printed boundary positions; aggregate output IoC **0.03444723816**; no readable prose on p0–2, p23, p36 or p54–55 | Source-clear p57 GP indices cyclically fill every original page, producing all **12,956/12,956** recovered GP tokens. All 55 original layout salts are retained; only **144 of 2,873** separator positions move relative to the original layout. Plant IoC **0.07171027695** |
| Impose one shared upper bound **\(k=5\)** per page (five-dot motif is a conjectural motivation, not an authenticated operator) | **47/55** original pages are numerically representable; **eight listed pages** give \(X\ge29^n\) and are impossible without repairing the literal rule. The 47 eligible pages have aggregate GP IoC **0.03446130479** | A direct fixed-five plant may round-trip where its separately selected layout rank permits it, but is irrelevant because eight unchanged originals fail a necessary condition |

The exact original p54 \(k=5\) bound has \(Q=6\) and \(q=5\), overshooting \(T=29^{232}\) by about **11.03%**; p55 happens to pass with \(Q=2\), \(q=0\). The page-specific \(k_p\) construction only works because it uses the ciphertext's observed repeat count to select each codebook. That is a **retrospective parameter choice**, not information a 2014 solver was instructed to use. Its uniformly distributed recovered GP29 is a negative readout for this precise natural keyless rank.

The manuscript's visible separators have more than enough combinatorial possibilities for a lossless codec, which is why no general absence-of-channel theorem follows. Any stronger candidate must supply an **independent original-source instruction** for a specific boundary-order rule, a recipient and page/reset clock, and the encoder's repeat allowance and layout salt. Arbitrarily changing combinadic direction or tuning \(k\) after seeing plaintext would merely replace one unselected codec with another.

[Exact standalone CommonJS/JSDoc reproducer](../sims/lp2_no_repeat_boundary_enumerative_sft.cjs) checks the canonical original rune corpus against printed separator positions, all 55 original inverses and forward reconstructions, 55 full-length p57-native positive plants, and the eight fixed-five impossibilities. The SFT does not claim cryptographic authenticity from synthetic recoveries.

## Physical-line-framed enumerative rank (24 November 2026, Agent42)

A separate source-visible block hypothesis uses the exact 594 original printed rune lines. The frozen A/B/D rank consists of a first-symbol register, colex rank of the exact internal-repeat positions, and base-28 ranks of nonrepeating successors in GP29 chart order. A mixed-radix quotient carry connects line ranks; terminal state zero is the no-key diagnostic. The per-line repeat quotas and line-start seam schedule are read from the original ciphertext and are therefore post-selected, not authenticated encoder instructions.

| Mode | Repeat events | log2(product M / product P) | Minimum private-state bits | Original IoC | Long dictionary hits |
|---|---:|---:|---:|---:|---:|
| Free 29-way head at every line | 82 internal | −661.019827 | **662** | 0.034551775 | **0/1,132** |
| Continuous seam across lines | 82 internal + 4 line-start | −710.270509 | **711** | 0.034577978 | **0/1,132** |

Both original inverses start at state zero under terminal state zero, unrank every original line exactly, and forward-replay the full ciphertext. Both also pass a planted 12,956-rune authentic solved-GP29 positive control with known initial state 3301. Nevertheless, all 594 original line ranks fall below their 29-way plaintext line spaces, and the fixed-schedule product codebook covers only a fraction of unrestricted GP29 inputs. The line-framed output has no long dictionary words under the unchanged original word lengths. See the complete [line-framed rank report](lp2-line-framed-enumerative-original-gate.md) and [source-exact SFT](../sims/lp2_line_framed_enumerative_original_sft.cjs).

The independent original-JPEG compositor model explains 484/539 within-page line joins and leaves at most 55 non-forced joins under its deliberately generous binary exceptional-line-only model. Those 55 bits cannot supply even the 662-bit free-head state requirement. This is conditional on the fixed per-line repeat schedule and binary residual-line-end carrier; it is not a universal impossibility theorem for other source channels or a restricted natural-language encoder.

## Source-visible channel capacity

### Word-boundary positions

The original transcription contains **2,873 explicit typographic delimiter gaps** within the 55 pages. The count uses hyphen, period, ampersand, dollar, and section-sign punctuation between consecutive runes; slash and whitespace are not treated as word boundaries. The observed delimiter strings are:

- `-`: 2,708
- `.`: 153
- `.&`: 6
- `--`: 1
- `.&$`: 1
- `.-`: 4

For page p with L rune positions and B observed internal delimiter gaps, the maximum number of ways to place the same number of boundaries among the L−1 internal rune gaps is:

\[
\binom{L-1}{B}
\]

Summing the per-page logarithms gives **9,638.332 bits** of positional capacity while preserving each page's observed boundary count. The minimum page capacity is **50.730 bits** (p49); the maximum is **221.303 bits** (p29). Every page's positional capacity exceeds its own fixed-repeat-mask deficit; the largest per-page fixed-mask deficit is **37.706 bits** (p19).

The observed separator-string assignments have a further **789.936-bit** permutation ceiling if their per-page type counts are held fixed. This is an additional combinatorial upper bound, not a claim that punctuation types can be freely rearranged without changing meaning.

These calculations deliberately ignore grammar, lexical plausibility, line composition, and the fact that the printed boundaries are fixed. They measure the number of possible placements consistent with the observed per-page counts, not the entropy of the actual text or evidence that the author used this channel.

### Red and special marks

Across the same 55 pages, the annotation corpus records:

- **213 red runes** in **16 red spans**
- **31 large punctuation marks**: 27 red 13-dot, 1 black 13-dot, and 3 red 10-dot marks

An intentionally overgenerous ceiling gives every red rune an independent red/black choice (213 bits) and every large mark an independent choice among two dot sizes and two colours (2 bits each): **275 bits**. A more realistic block-level ceiling, treating each red span as one event, is **78 bits**. Both are below even the 325.450-bit global at-most-86 deficit.

Copied floral artwork is not counted as an independent event. Even the 275-bit estimate overcounts independence: contiguous red spans and repeated dot ornaments are not 244 separate freely selectable marks.

**Result:** red/special colour and mark choices alone cannot supply the required information under this model. Word-boundary positions could supply it in principle.

### Position-aware ink geometry refinement (Agent21, 24 November 2026)

The earlier 275-bit ink ceiling gives all 213 red runes independent red/black choices. The source annotation instead records 16 contiguous red spans (213 runes) and 31 large marks. There are 30 distinct large-mark offsets: 28 are exactly at a red-span endpoint or page end, leaving only two independently placed interior marks (p36 offset99 of238 runes; p38 offset186 of228). Thus the 31 marks do not provide 30 independent position choices in the source-structured layout.

For page p, let L be its rune count, R its total red-rune count and S its number of red spans. The number of non-overlapping placements of S ordered spans with fixed lengths, allowing touching, is C(L−R+S,S). If span lengths may also vary while preserving R and S, multiply by C(R−1,S−1). Summing the page-local log capacities gives 118.748733 bits with fixed lengths and 131.254049 bits with variable lengths. The two independent mark positions add log2(239)+log2(229)=15.740071 bits. Even retaining the prior deliberately generous allowance of two independent size/colour bits for each of the 31 marks adds only 62 bits. The resulting structured ink ceilings are 196.488804 and 208.994119 bits.

| Capacity component | Fixed span lengths | Variable span lengths |
| --- | ---: | ---: |
| Red-span placement | 118.748733 | 131.254049 |
| Independent large-mark positions | 15.740071 | 15.740071 |
| Four-state allowance for 31 marks | 62.000000 | 62.000000 |
| **Structured ink total** | **196.488804** | **208.994119** |
| + pooled fine punctuation labels | 274.054206 | 286.559521 |
| Remaining deficit to global 325.450254 bits | **51.396048** | **38.890733** |
| + all 55 residual-line bits, independently | 329.054206 | 341.559521 |
| Surplus if all 55 line bits are independent | 3.603952 | 16.109267 |

The global deficit and 77.565402-bit pooled fine-label value are read from [Agent6's exact punctuation-capacity data](lp2-no-repeat-punctuation-identity-capacity.json). The 55-bit allowance is summarized in the [physical-line-framed capacity report](lp2-line-framed-enumerative-original-gate.md), which attributes it to an original-JPEG compositor model explaining 484/539 joins. The separate [linebreak binary sidecar audit](lp2-linebreak-binary-sidecar-pagecapacity-gate.md) is a different 540-join model and must not be conflated with the 55-bit residual-line upper bound. These sums deliberately grant every channel independent capacity, even where their physical locations may overlap.

**Decision:** geometry-aware ink placement plus pooled fine punctuation labels is still 38.89–51.40 bits short. The combination crosses only if all 55 residual-line bits are independently available, and then by just 3.60–16.11 bits. This is a narrow conditional survival, not evidence that the residuals were intentionally encoded. The source-image compositor explains 484/539 printed joins; the remaining 55 are a bounded physical residual, not an authenticated key. The mark/ink branch therefore does not yet yield a source-selected exception map or plaintext. Reproduce with [the geometry-capacity SFT](../sims/lp2_no_repeat_ink_geometry_capacity_sft.py) and its [machine-readable result](lp2-no-repeat-ink-geometry-capacity.json).


## Punctuation-identity carrier with fixed coarse boundaries (Agent6, 24 November 2026)

**Decision:** punctuation variants cannot supply the missing bits of a universal page-quota GP29 constrained code if the coarse word/stop positions and per-page fine-label counts are retained. This removes a distinct type-only carrier, even when punctuation labels themselves need not be recovered. The unrestricted placement channel remains viable in cardinality; no source-selected inverse or unknown plaintext results.

Let n be the total runes, H=55 free page heads, t=n−H eligible transitions, K=86 observed repeats. For arbitrary GP29 plaintexts the input cardinality is U=29^n. The relaxed output codebook has cardinality G=29^H Σ[j=0..K] C(t,j)28^(t−j); imposing each observed page quota gives the product P of pagewise counts. The integer comparisons below use these **at-most**, not fixed-mask, codebooks, thus giving the encoder the more permissive capacity.

Fix the positions of the coarse separator classes “contains a period” and “does not contain a period”, while permitting all distinct assignments of each class's observed transcription-label multiset. The number of possibilities is the product of the two class multinomials. This is a transcription-level grouping, not an assertion that every rare label is a separate physical symbol or a linguistic punctuation type; permitting them all overcounts possible choices.

- Across the whole corpus the fine-label carrier is 77.565402 bits; with per-page label counts fixed it is only **18.831703 bits**. For comparison the unrestricted reassignment of all six label types at fixed boundary positions has 971.666436 global or 783.351197 per-page bits.
- The prior deliberately generous **designated-site** ink allowance is 213 red-rune binary choices plus 31 fixed large marks with four possible states, or 275 bits. The span-level version gives 78 bits. These are bounds only for those fixed-site models, not for freely moving ink positions.
- The 55-bit optional line contribution is the previously tested binary residual-line-end compositor model; grant all these bits independently, even if the channels overlap.

| Frozen carrier and quota | Remaining deficit (bits) | Minimum additional binary bits |
|---|---:|---:|
| Global quota; pooled fine labels; generous ink | −27.115 | 0 |
| Global quota; pooled fine labels; span-level ink + 55 line bits | 114.885 | 115 |
| Page quotas; page-local fine counts; generous ink | 136.729 | 137 |
| Page quotas; page-local fine counts; generous ink + 55 line bits | 81.729 | 82 |
| Global quota; jointly recover arbitrary same-inventory fine labels; generous ink | 50.450 | 51 |
| Global quota; joint label recovery; generous ink + 55 line bits | −4.550 | 0 |
| Page quotas; joint label recovery; generous ink + 55 line bits | 100.561 | 101 |

A negative deficit means capacity survives; it is not positive cipher evidence. In the joint-label version, if plaintext labels range over the same fixed-inventory permutations as ciphertext labels, their cardinality multiplies both sides and cancels exactly, so their apparent capacity cannot be spent twice. This argument also applies to joint recovery of arbitrary same-count boundary positions if both domains use the same arrangements.

With independently decoded pages and no other side channel, **42/55** pages fail even with their own generously counted ink choices. Their summed minimum binary deficits are 333 bits. Even if all six punctuation types are freely reassigned at the fixed boundary locations (without preserving coarse stop positions), **six pages (13, 20, 21, 37, 49, 51)** still fail; they need at least 20 additional binary bits in total across independent page channels. This local impossibility does not imply a pooled global all-type channel fails.

Exact BigInt cardinality comparisons and 20 exhaustively counted ternary toy domains validate the formulas; all 12,956 source rune positions were cross-checked against the canonical corpus. [Standalone reproducer](../sims/lp2_no_repeat_punctuation_identity_capacity_sft.cjs) and [raw output](lp2-no-repeat-punctuation-identity-capacity.json). This new section uses the image-corrected transcription (p8/p40 false periods become ordinary dividers) and the existing annotation inventory including the corrected 13-rune p0 heading. The older sections retain their explicitly legacy transcription inventory. The page-local fine-label bound and every integer decision are unchanged by the two source corrections. No physical distinction is inferred from a rare transcription delimiter, and no decoder is authenticated. Retire only these fixed coarse-position, quota and carrier regimes; arbitrary moved boundaries, a compressed plaintext register, a pooled generous fixed-site ink carrier, and an authentic external side channel are outside the negative conclusion.

## Per-page measurements

`boundary bits` is \(\log_2\binom{L-1}{B}\). `at-most deficit` uses the page's observed repeat count as a binomial upper-tail limit. `fixed-mask deficit` assumes the observed repeat positions are fixed in advance.

| Page | Runes | Repeats | Boundary gaps | Boundary bits | At-most deficit | Fixed-mask deficit |
|---:|---:|---:|---:|---:|---:|---:|
| 0 | 262 | 2 | 58 | 195.382 | 7.469 | 22.828 |
| 1 | 266 | 1 | 62 | 203.874 | 10.029 | 18.223 |
| 2 | 201 | 1 | 37 | 134.392 | 7.100 | 14.933 |
| 3 | 217 | 3 | 43 | 151.654 | 4.105 | 25.357 |
| 4 | 261 | 2 | 60 | 198.539 | 7.429 | 22.777 |
| 5 | 263 | 0 | 58 | 195.743 | 13.264 | 13.264 |
| 6 | 196 | 1 | 44 | 146.341 | 6.879 | 14.679 |
| 7 | 208 | 0 | 49 | 159.493 | 10.480 | 10.480 |
| 8 | 255 | 3 | 50 | 177.766 | 5.416 | 27.281 |
| 9 | 268 | 3 | 56 | 193.780 | 5.883 | 27.939 |
| 10 | 263 | 1 | 64 | 206.018 | 9.891 | 18.071 |
| 11 | 273 | 1 | 54 | 191.516 | 10.349 | 18.578 |
| 12 | 261 | 1 | 64 | 205.209 | 9.800 | 17.970 |
| 13 | 272 | 0 | 60 | 202.596 | 13.720 | 13.720 |
| 14 | 137 | 0 | 30 | 99.925 | 6.885 | 6.885 |
| 15 | 159 | 0 | 36 | 118.602 | 7.999 | 7.999 |
| 16 | 267 | 1 | 59 | 198.989 | 10.074 | 18.274 |
| 17 | 273 | 0 | 68 | 216.504 | 13.770 | 13.770 |
| 18 | 260 | 1 | 60 | 198.160 | 9.755 | 17.920 |
| 19 | 271 | 5 | 65 | 210.853 | 3.409 | 37.706 |
| 20 | 269 | 1 | 64 | 208.406 | 10.166 | 18.375 |
| 21 | 273 | 1 | 54 | 191.516 | 10.349 | 18.578 |
| 22 | 131 | 1 | 27 | 92.276 | 4.085 | 11.389 |
| 23 | 213 | 1 | 45 | 154.205 | 7.633 | 15.540 |
| 24 | 270 | 5 | 63 | 207.112 | 3.381 | 37.655 |
| 25 | 273 | 3 | 57 | 197.379 | 6.064 | 28.192 |
| 26 | 265 | 2 | 58 | 196.460 | 7.592 | 22.980 |
| 27 | 234 | 5 | 51 | 172.657 | 2.448 | 35.833 |
| 28 | 269 | 0 | 58 | 197.876 | 13.568 | 13.568 |
| 29 | 277 | 4 | 70 | 221.303 | 4.739 | 33.202 |
| 30 | 263 | 2 | 60 | 199.291 | 7.510 | 22.879 |
| 31 | 269 | 0 | 63 | 206.727 | 13.568 | 13.568 |
| 32 | 121 | 2 | 21 | 76.893 | 2.228 | 15.690 |
| 33 | 214 | 2 | 52 | 166.816 | 5.558 | 20.398 |
| 34 | 261 | 3 | 60 | 198.539 | 5.630 | 27.585 |
| 35 | 271 | 3 | 60 | 202.235 | 5.991 | 28.091 |
| 36 | 238 | 3 | 49 | 170.280 | 4.819 | 26.420 |
| 37 | 228 | 0 | 52 | 172.251 | 11.492 | 11.492 |
| 38 | 228 | 0 | 46 | 161.144 | 11.492 | 11.492 |
| 39 | 240 | 1 | 54 | 180.217 | 8.846 | 16.907 |
| 40 | 231 | 0 | 54 | 176.826 | 11.644 | 11.644 |
| 41 | 273 | 2 | 61 | 204.753 | 7.919 | 23.385 |
| 42 | 272 | 1 | 57 | 197.040 | 10.303 | 18.527 |
| 43 | 274 | 3 | 58 | 199.614 | 6.101 | 28.243 |
| 44 | 273 | 4 | 56 | 195.457 | 4.611 | 33.000 |
| 45 | 270 | 2 | 63 | 207.112 | 7.796 | 23.233 |
| 46 | 270 | 1 | 60 | 201.873 | 10.211 | 18.426 |
| 47 | 274 | 2 | 58 | 199.614 | 7.960 | 23.436 |
| 48 | 271 | 1 | 66 | 212.488 | 10.257 | 18.476 |
| 49 | 66 | 0 | 17 | 50.730 | 3.291 | 3.291 |
| 51 | 92 | 1 | 19 | 63.977 | 2.520 | 9.414 |
| 52 | 263 | 1 | 59 | 197.532 | 9.891 | 18.071 |
| 53 | 179 | 0 | 39 | 131.224 | 9.011 | 9.011 |
| 54 | 232 | 2 | 49 | 168.251 | 6.264 | 21.309 |
| 55 | 76 | 1 | 16 | 52.925 | 1.918 | 8.604 |

## Repeat-delimited variable-length radix inverse (24 November 2026, Agent25)

The fixed-length capacity deficit is not a universal obstacle: a variable-length decoder can carry the repeat-delimited framing intrinsically, without quotient bits, hidden sidecar, or fixed page/line lengths. This tests an independent, executable **rune-tape bijection**, motivated by the unusually low equality rate and the authentic historical BASE29 positional conversion. No original instruction fixes adjacent equality as a delimiter, so this is an exploratory architecture, not an authenticated operation.

Frozen in [#2273](https://github.com/FlareZ123/liber-primus/issues/2273) before inspecting the decoded text:

- Use the full continuous GP0 ciphertext tape, retaining its first rune as a seed header. Each subsequent equality with its immediate predecessor ends a block, with the repeat itself a framing symbol.
- For each nonrepeat successor x with previous rune p, form the base-28 digit d=x−1[x>p], i.e. rank in the ordinary GP chart with p omitted. Convert the complete digit block from base28 to base29 in ordinary big-endian positional order, preserving the count of leading zero digits (including an all-zero or empty block).
- For encoding, reverse the base conversion, reconstruct each successor as x=d+1[d≥p], and insert an equal rune at each decoded block boundary. There is no fitted start, salt, quotient, page reset, or hidden key. The original printed layout is independent of this rune-only transform and is **not** claimed to be decoded; seed and block breaks are retained in the decoded message format.

The complete original **12,956-rune tape** has seed GP0=15 and 86 delimiters (87 blocks). Its inverse contains **12,756 GP29 plaintext-candidate digits**, 200 fewer than the source (one header, 86 delimiter transitions, and 113 net radix-length reductions). The inverse replays all 12,956 original runes exactly. Two native solved sections held out of the language model (WELCOME 515 and second KOAN 319 runes) are encoded in fixed 128-rune blocks with different seeds, then recovered **834/834** exactly, including every block boundary. Their ciphertext lengths are 525 and 325, respectively.

Train the smoothed GP29 trigram model on the other seven solved source sections only, add 0.5 to each conditional rune count, and compare complete original blocks wholly inside the predeclared physical p0–2 and p16–21 ranges. Shuffle the nonrepeat rank digits within each block 128 times per range, using deterministic xorshift32 seed 3301, preserving each block's digit multiset and length before conversion.

| Evaluation | Decoded runes | IoC | Trigram nats/rune | Within-block shuffle scores ≥ observed |
| --- | ---: | ---: | ---: | ---: |
| Native WELCOME held-out positive | 515 | 0.059416 | −2.778925 | — |
| Native second KOAN held-out positive | 319 | 0.069813 | −2.648701 | — |
| Original p0–2, four complete blocks | 643 | 0.033817 | −3.432625 | 55/128 |
| Original p16–21, eight complete blocks | 1,387 | 0.034475 | −3.434132 | 77/128 |
| Full original rune tape, 87 blocks | 12,756 | 0.034496 | −3.434080 | — |

Both original ranges have visibly nonlinguistic outputs and ordinary shuffle-range scores (p0–2 shuffle range −3.457645 to −3.401791; p16–21 −3.448871 to −3.412536). The fixed receiver's beginning reads OLEOUUJEAGEOUNGPTHAEHLOETHAEUTHGPTHNADBDOOEFONASEAOYAEWUAEPTRIIAIATH; the withheld region starts THLPBTHTHCTRGWOFEAAEOFBNPNPANGMJEOBMLYFCAOTJBEAETETRTUITHWIXY. Exact forward replay validates the bijection, not the choice of radix or framing.

**Decision:** retire this specific variable-length repeated-transition framing plus canonical predecessor-excluded positional radix law. The low repeat rate alone does not select a source decoder even when same-length capacity obstructions are removed. This is not an exclusion of all variable-length, compressed, or source-selected constrained codes. No unknown plaintext recovered. The executable [SFT](../sims/lp2_repeat_delimited_radix_inverse_sft.cjs) was run directly in a JavaScript runtime against canonical corpus blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165` and native donor blob `1b064ef6d85819b7d96adaff31a82d1ec551598f`; script commit [937529f](https://github.com/FlareZ123/liber-primus/commit/937529fe979ba40d9d3738e64b83829ec8064671).

## Decision and next research gate

- The tested physical-line-framed exact-repeat rank is **rejected** under both natural line-start conventions: it yields no long dictionary plaintext and needs 662–711 bits for universal GP29 recovery, versus at most 55 bits in the simple residual-line-end model.
- The tested repeat-delimited variable-length predecessor-excluded radix inverse is **rejected** on both independent original regions, despite exact rune-tape replay and 834/834 solved-native plant recovery; length variation alone does not select a cipher.
- A blanket claim that every 29-to-28 no-repeat encoder is impossible is still **not** supported. The printed word-boundary position space has enough combinatorial capacity to carry missing information in principle.
- Under the page-reset/global-86 model, red/special marks alone remain insufficient; geometry-aware ink plus pooled fine punctuation labels remains 38.89–51.40 bits short, while granting all 55 residual-line bits independently only barely crosses. This is separate from the group-reset model below.
- A conditional H-shuffle group-reset enumerative receiver (2,896 groups, 63 within-group repeats, F ordinary) has a 264.489-bit deficit and a 323.144-bit red-run/large-mark/apostrophe carrier. Its exact physical-order mixed-radix inverse and forward replay pass, but the recovered tape is non-English; retire only that rank/sidecar mapping.
- No explicit, historically motivated, reversible plaintext-to-word-boundary or red/mark sidecar mapping has been found. The 9,638-bit boundary-position figure is a ceiling on possible arrangements, not evidence of a hidden message.
- One fixed global count-first enumerative rank, combined with page-concatenated word-boundary combinadic ranks and interpreted as a big-endian zlib/DEFLATE stream, is rejected under both zlib and raw DEFLATE. This retires that specific standard-compressor mapping, not every native-language compression model.
- Do not proceed to arbitrary boundary-bit subsets, fitted lookup tables, unconstrained per-page masks, further line-rank sweeps, or arbitrary compressor/rank-order sweeps. The remaining work needs an original clue that selects a distinct reset clock, sidecar readout, or genuinely moved-boundary encoding; the 55 compositor residuals remain an unverified possible channel, not an authenticated key. Require a locked prediction on untouched material.

## Reproduction

Run:

`node sims/lp2_no_repeat_escape_channel_capacity_sft.cjs`

`node sims/lp2_line_framed_enumerative_original_sft.cjs`

`node sims/lp2_group_reset_redmark_quotient_original_sft.cjs` (Windows Node 22 CI run [45528313580](https://github.com/FlareZ123/liber-primus/actions/runs/45528313580)).

Inputs are the current transcription, rune corpus, ink annotations, solved-GP29 donor, and TextBlob word-frequency control. The line-framed SFT verifies exact original unrank/replay, both capacity bounds, dictionary scoring, and source-native planted-key controls. The group-reset SFT verifies the exact original inverse/replay, the red/mark/apostrophe sidecar rank, fixed quadgram comparison, and p56/p57 source-native plants.


## Joint recovery of plaintext runes AND word breaks (24 November 2026, Agent 5)

The earlier boundary-assisted codec recovers arbitrary runes plus a layout salt, **not arbitrary original plaintext spacing**. The 9,638-bit carrier ceiling cannot simultaneously be counted as free side information and spent on restoring an arbitrary same-count plaintext boundary mask. This motivates a different, fully joint source-framed enumerative inverse, with no external salt.

For a physical page of n runes, k observed same-page repeats and b printed internal boundaries, let

- U = 29^n, the unrestricted rune alphabet capacity.
- M = 29 × C(n−1,k) × 28^(n−1−k), the exact-k-repeat ciphertext capacity.
- G = C(n−1,b), the set of all output boundary masks of the observed size.

The joint output space has MG members. **For arbitrary plaintext runes AND arbitrary plaintext spacing with b boundaries, the input has UG members.** Since M<U, the equal-size masks cancel in their capacity ratio: no injective encoder into this fixed output class exists. Across the 55 fixed physical pages the joint deficit is precisely **445.731557901 bits**, requiring at least 446 additional independent fixed-width bits for universal recovery. Moving the printed gaps cannot pay it while preserving every possible input gap mask. The same cancellation holds for arbitrary separator types if their input/output inventories agree. This is conditional on universal encoding of arbitrary messages and fixed per-page repeat/boundary counts; it is not a theorem about a restricted natural-language subset, nonuniform length, external context, or an individual observed LP2 manuscript. In particular it does not preclude a source-selected compression model.

**Tight per-page count sacrifice.** Permit fewer plaintext breaks, and define b_in as the largest integer at most b for which U × C(n−1,b_in) ≤ MG. All original b are below half the available gaps, so this monotonic search gives an exact largest admissible input count. The 55 original pages require removing **268** plaintext boundaries (minimum 2, maximum 9 per page), leaving at most **2,605** total internal plaintext breaks in the independent-page model. Pooling code space across pages, variable counts, changing rune lengths or restricting the language are different models. The observed exact k is used as a self-describing output count; unlike an at-most-k code, a plant cannot silently emit fewer repeats and thereby change its decoder's inferred parameter.

**One canonical joint rank map, frozen before reading output.** Enumerate exact-k-repeat ciphertexts by initial symbol followed by repeat-first cyclic successor choices, using f(0,0)=1, f(0,k>0)=0 and f(t,k)=28 f(t−1,k)+f(t−1,k−1). Rank each boundary mask by colex combinadic. If R is the ciphertext rune rank and H its gap rank, define J=R G+H. Decode a page only if J<U C(n−1,b_in); split J into a base29 rune integer and a colex plaintext gap rank by division by C(n−1,b_in). The forward encoder applies the exact reverse split and unranks R,H. This is a genuinely lossless joint code on the entire stated input domain, including native word breaks, with no layout salt, postselected glyph mapping, or hidden bits. The fixed page frames and maximal count-sacrifice convention are exploratory; the source does not authenticate them.

**Actual original run:** 29/55 pages fall outside the joint input rank domain, including all three original opening pages p0–2 and physical p16. The 26 representable pages exactly re-encode both original runes and their printed boundary positions; their 6,280 recovered runes have IoC **0.0344982719671**, not native prose. Examples from p5: CI R AEAEAEOIIW OENEN JD IP INICIAX; p23: U AE A AEI FRCSFAEF HP WNEOIEEEUCEHIA YEAR HYEO. Isolated apparent words in these pseudo-rune streams are not a decode. No alternate rank order, larger or smaller inferred b_in, key, or padding was tuned against originals.

**Independent native controls:** use the first 262 runes of the pinned solved-Cicada GP29 donor with its actual 66 internal breaks, and a disjoint 267-rune interval beginning at donor offset 1500 with its 59 internal breaks. With the respective original p0/p16 exact repeat counts 2 and 1, the minimum adequate output boundary counts are 72 and 65. Both plants have exactly the required output repeat count and decode all **529/529 native runes and 125/125 internal word breaks**; their native IoCs .0610687/.0591929 become ciphertext IoCs .0346290/.0355101. These controls demonstrate that the joint inverse is operational, not that the chosen grammar is the actual manuscript encoding.

**Decision:** a universal same-rune-length, equal-boundary-count, exact-per-page-repeat encoder cannot store its missing information solely in freely rearranged separators while also restoring arbitrary plaintext separators. The specific maximum-input-boundary canonical joint rank code is independently excluded by original rank-domain failures and nonlinguistic representable outputs. Do not treat the earlier 9,638-bit layout ceiling as cost-free capacity for a complete native text, or extend this particular rank model through fitted salt/count/ordering menus. Seek an independently selected compression, boundary reconstruction, variable-length mapping, or actual external side information. The generic constrained architecture and restricted natural-language encoders remain logically possible; no authentic original plaintext or key.

[Source-driven joint inverse SFT](../sims/lp2_joint_spacing_antirepeat_enumerative_sft.cjs), commit 11daf8d6426695b650b446b38dedd587f7b7c9d5. Executed against the exact fetched source corpus, master transcription and solved native donor in the connected JS runtime; no CI run claimed.


## Self-contained histogram/type-class compression — a complete full-original inverse (Agent 5)

A distinct receiver addresses the missing-repeat capacity **without spending any printed separator capacity or requiring an external plaintext histogram**. It is not dictionary coding, word-local rank transport, or an adaptive entropy model. Its reversible domain is every GP29 sequence whose empirical histogram is sufficiently compressible for the selected fixed physical-page frame, with the printed word gaps preserved as-is.

For n runes and exactly k ciphertext repeats let M=29×C(n−1,k)×28^(n−1−k). There are H=C(n+28,28) possible weak 29-part plaintext compositions h. Allocate each histogram an equally sized rank interval B=floor(M/H). The remaining M mod H ranks are invalid. For any h, T(h)=n! / product(h_j!) is its exact type-class cardinality. Only classes T≤B are admitted; this guarantees that every arrangement of the selected histogram is encodable. No histogram is fixed in advance or inferred from a donor.

Rank a histogram by stars-and-bars colex, and its sequence by ordinary lexicographic multiset rank r. The latter uses the exact block size T×h_j/N at each symbol, updating the remaining multinomial cardinality. An optional internal padding index s≥0 is allowed only when sT+r<B. The complete output rank is

```
J = rank(h)*B + s*T(h) + rank_type(P | h)
```

Unrank J into the same exact-repeat ciphertext class as above. The receiver determines h from floor(J/B), then obtains s and r by division by T. The histogram and padding are both recovered from the ciphertext itself. This is an injective full reverse mapping of the stated (P,s) domain; it does not need a hidden salt, original histogram, external layout, or word-length dictionary. The histogram rank allocation and multiset ordering are frozen exploratory choices, not authenticated Cicada instructions.

**Native controls:** use the two disjoint actual 262- and 267-rune donor windows and exact original p0/p16 repeat counts 2/1. These admit respectively 89.39 and 90.13 surplus bits after their self-contained histogram headers. Both recover all 529 runes and the original internal padding index 1 exactly, with the actual required repeat counts. Neither control's histogram is supplied to the receiver.

**Actual full original run:** all 55 rune-bearing pages have representable histogram/type ranks, all 12,956 decoded runes and internal padding indices re-encode the actual source ciphertexts exactly. Yet the aggregate output IoC is .03484747652, and the preserved printed page-fragment word segmentation yields 217/2,928 dictionary matches and **0/1,124 long matches** (≥5 runes, including physical-page fragments). Individual page IoCs can be native-like, precisely because arbitrary weak compositions are often skewed: p0 .0664795, p1 .0602922, p2 .0568657. Their text remains nonlinguistic: p0 begins UOEAGXICF IAIAIAO CXOEC FOEI IAFC IEAWXWCUIAOEBM; p1 begins PTCEAP SPUPGDTAE EOYXBTXAEN MWDW DAENGIATHX. No apparent authentic plaintext. No alternate composition ordering, type-class allocation or salt convention was tuned to the result.

**Decision:** a self-contained, full-page, reversible constrained-code inverse can absorb the exact missing-repeat capacity using empirical-composition compression; no additional original separator payload is mathematically necessary for the admitted native-like classes. This actual receiver satisfies full-original rank-domain and replay tests, but decisively fails native-language prediction. It is **not** the authentic #2273 receiver and cannot be promoted as a solution. It also illustrates why matching individual page IoC or universal original replay alone is insufficient evidence for a compressed-text interpretation. An independently selected native-language compression/order/operation remains necessary.

[Executable full-original histogram inverse SFT](../sims/lp2_selfcontained_histogram_antirepeat_enumerative_sft.cjs), commit a9916283fc9395d8c52609aaf5d533dcda0b6cf0. Actual connected JS run on the canonical corpus/transcription and pinned donor/lexicon; no CI claim.


## Global boundary-ranked zlib and raw-DEFLATE gate (Agent21 initial, Agent7 follow-up, 25 November 2026)

A single fixed compressed-text hypothesis was tested rather than sweeping rank orders or compressors. The global no-repeat codebook is ranked by page-head tuple, repeat-count class, colex rank of the global repeat-position mask, and base-28 nonrepeat deltas. The source-visible word-boundary mask is ranked page-locally by combinadic colex and concatenated in page order as a mixed-radix integer. Its residue modulo the global quotient range supplies the high quotient; the constrained ciphertext rank supplies the low remainder. The resulting fixed-length big-endian integer is tested as one standard DEFLATE stream under both common wrappers.

**Result: both standard wrappers reject this exact fixed stream.** The earlier SFT run 45518898048 established that zlib-wrapped DEFLATE rejects it. The later source revision also invokes Node's raw-DEFLATE decoder. Agent 7 ran that exact source SFT through the repository's Windows Node 22 read-only runner; run 45525467222 completed successfully, and the SFT's negative-gate assertion requires both inflateSync and inflateRawSync to reject the candidate. Thus this exact count-first/page-concatenated-boundary quotient mapping is neither zlib-wrapped nor raw DEFLATE.

This retires only the tested fixed rank/quotient serialization with these two standard wrappers. No other compressor, boundary order, source-selected code, or authentic key was tested; no plaintext is recovered.

Reproduction: [SFT](../sims/lp2_no_repeat_global_boundary_zlib_sft.cjs) · [zlib-wrapper negative gate](https://github.com/FlareZ123/liber-primus/actions/runs/45518898048) · [raw-DEFLATE negative gate, Windows Node 22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45525467222) · [initial source commit](https://github.com/FlareZ123/liber-primus/commit/e644a8cfac57f7c17108f9024141738c64f7b8eb) · [raw-DEFLATE extension](https://github.com/FlareZ123/liber-primus/commit/4390f90ddd26a2bc4a1d5355f2df3039a8416d1d).

## Printed-group-reset enumerative inverse with red/mark sidecar (Agent7, 25 November 2026)

**Scope and clock.** This is a conditional H-shuffle hypothesis, not an established plaintext segmentation. Treat every explicit printed separator in the corrected source as a reset, but do not reset merely because a physical page ends. The source yields 2,895 delimiter gaps and 2,896 complete printed groups; 22 delimiter gaps lie at page joins, while 32 page transitions carry a group across the page. Across 12,956 runes this leaves 10,060 within-group transitions. There are 63 equal transitions inside groups and 23 equal transitions across delimiters (86 total). The 2,896 groups are not authenticated plaintext words.

**Frozen codebook.** Treat all 29 GP symbols, including F, as ordinary symbols; do not import p56's separate transparent-F rule. Let \(W=2,896\), \(T=10,060\), and \(K=63\), where K is the observed within-group repeat count (a post-selected parameter, not an author-authenticated quota). The count-first constrained codebook has

\[
M=29^W\sum_{k=0}^{K}\binom{T}{k}28^{T-k},
\qquad U=29^{12,956},
\qquad Q=\lceil U/M\rceil.
\]

Its information deficit is **264.488872 bits**. Rank the ciphertext by the base-29 group-head tuple, ascending repeat-count class, colex rank of the within-group repeat-position mask, and base-28 ranks of the nonzero cyclic GP29 deltas.

**Source-visible sidecar.** Construct H in physical page order from: (1) ordered fixed-length red-span placements; (2) large-mark positions as multisets of visible boundary slots; (3) the four source-visible apostrophe positions on p4, p21, p35 and p41; and (4) the three ten-dot mark slots plus the black-mark slot among the 31 large marks. The carrier state space is **323.143652 bits**; the observed mixed-radix rank is **310.846835 bits**. Set \(q=H\bmod Q\) and \(s=\lfloor H/Q\rfloor\), leaving **46.357963 visible salt bits**. Thus this carrier has enough cardinality for the group-reset deficit, unlike the page-reset/global-86 comparison. The source does not independently select this exact concatenation or explain the leftover salt.

**Original-input result.** The exact inverse is \(P=\operatorname{base29}(qM+R)\), and the corresponding constrained-code unranker forward-replays all 12,956 original ciphertext runes under the observed printed-group schedule. Under the fixed Dukotah Round27 English quadgram table with 0.01 pseudocount, the candidate scores **−17.32 nats/quadgram**, versus **−10.27** for known p56 plaintext, **−10.18** for clear p57, and **−17.13** for the original ciphertext transliteration. About **60.1%** of candidate quadgrams are absent from the table, compared with 2/88 for p56 and 4/97 for p57. The recovered tape is therefore non-English under this unchanged diagnostic.

**Positive controls.** Source-native p56 plaintext (including its literal F as an ordinary symbol in this candidate code) and clear p57 plaintext were each planted through the same quotient/codebook construction with source-derived group counts and moved boundary masks. Both decode exactly and forward-replay exactly. These synthetic controls validate the implementation; they do not establish historical use.

**Decision.** Reject this exact group-reset count-first rank and red-run/large-mark/apostrophe quotient mapping. This is not an exclusion of H-shuffle, every group-reset encoder, other source-selected sidecars, or language-restricted encoders. No unknown plaintext, key, or destination is recovered.

Reproduction: [read-only SFT](../sims/lp2_group_reset_redmark_quotient_original_sft.cjs) · [Windows Node 22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45528313580) · [script commit](https://github.com/FlareZ123/liber-primus/commit/b6701955ed1bb9d27685822ecb6bca886c55ff8f).

