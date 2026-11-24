# LP2 no-repeat escape-channel capacity: source-visible carrier audit

**Status:** boundary capacity is sufficient for carrying arbitrary rune values *if plaintext spacing is not also arbitrary*. Two concrete natural rank codecs have now been tested against original runes and separators, including a joint rune-and-plaintext-spacing inverse. Its source readout is unreadable; a common five-repeat version is impossible on eight pages. No source-selected historical boundary decoder or recovered unknown plaintext.

## Finding

The observed 29-symbol ciphertext stream does not by itself rule out a 29-to-28 next-rune encoder. Red/special marks alone do not provide enough side information, even under an intentionally generous count. The printed word-boundary positions have ample *combinatorial* capacity, however, so an information-theoretic impossibility claim would be too strong. No evidence currently selects a reversible mapping from plaintext symbols to those boundary positions. The apparent free layout capacity also cancels if arbitrary same-count plaintext gaps must be recovered; the joint inverse below quantifies the exact cost and tests an original receiver.

This is a capacity result, **not** a cipher identification or decryption.

## Conditional no-repeat deficits

Scope is the 55 rune-bearing unsolved pages p0–p49 and p51–p55. Physical p50 is the runeless grid page. The corpus contains 12,956 rune positions, 12,901 eligible within-page transitions, and 86 adjacent equal-rune transitions.

For a hypothetical encoder whose output is restricted to 28 choices at ordinary transitions and can use the observed repeats as exceptions, the existing exact-count analysis gives:

| Model | Minimum additional information |
|---|---:|
| Global output has at most 86 repeats, repeat positions free | **325.450 bits** |
| Exactly 86 repeat positions are free and the repeated outputs are forced | **325.750 bits** |
| 86 exception positions are fixed in advance and allow all 29 outputs | **648.770 bits** (649-bit side channel) |
| Per-page repeat counts fixed only as upper bounds | **430.561 bits** |
| Per-page repeat counts fixed exactly | **445.732 bits** |
| All 86 repeat positions fixed in advance | **1,066.559 bits** |

These are conditional bounds for the proposed 29-to-28 family, not evidence that this family is the actual LP2 cipher. The 86 observed repeats are corpus observations, not an author-authenticated rule. Derivations and earlier tests are in [lp2-anti-repeat-lossless-capacity.md](lp2-anti-repeat-lossless-capacity.md).

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

## Decision and next research gate

- A blanket claim that a 29-to-28 no-repeat encoder is impossible is **not** supported. The word-boundary position space is large enough to carry the missing information in principle.
- Red/special marks alone are insufficient, even under generous independence assumptions.
- No explicit, historically motivated, reversible plaintext-to-boundary mapping has been found. The 9,638-bit figure is a ceiling on possible arrangements, not evidence of a hidden message.
- Do not proceed to arbitrary boundary-bit subsets, fitted lookup tables, or unconstrained per-page masks. The next useful step is to identify an original clue that selects a specific boundary operation and predicts a reproducible output on untouched pages. Without that, keep the no-repeat family provisional and prioritize mechanisms with a source-derived key or operation.

## Reproduction

Run:

`node sims/lp2_no_repeat_escape_channel_capacity_sft.cjs`

Inputs are the current transcription, rune corpus, and ink annotations. The script verifies page rune counts against the corpus and asserts the aggregate counts and channel ceilings.


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
