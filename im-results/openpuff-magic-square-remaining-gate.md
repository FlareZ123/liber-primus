# Remaining 2014 OpenPuff magic squares as LP2 key material

## Result

No plaintext was recovered. The first two squares from the historical OpenPuff output were tested against all 12,956 runes on LP2 pages 0–55:

- The first 5×5 square has magic constant 3301.
- The second 7×7 square has magic constant 1033.
- The third 5×5 / 1033 square is the LP1 page-05 square and is already covered by [the existing 5×5 investigation](magic-square-5x5-direct-pad.md).

The two remaining squares were tested in two source-constrained roles:

1. **Direct additive GP29 key:** row-major cell values reduced modulo 29; both the full cell count and the count minus the repeated closing cell; both signs; global stream and page-local reset. This is 16 models.
2. **Hill matrix over F29:** the matrix, transpose, inverse, and inverse-transpose; every block phase; global stream and page-local reset. This is 96 models.

The best Hill score was **−5.13033** (7×7, inverse-transpose, page reset, phase 4). The best additive score was **−5.13166** (7×7, period 48, negative sign, page reset). The uniform-random bigram baseline was **−5.17313**; held-out Shakespeare English scored **−2.66335**. These outputs remain essentially random, not partial plaintext.

The matrices are invertible modulo 29 (determinants 10 and 2), so the negative result is not caused by singular matrices. Reproduce with:

\`node sims/openpuff_magic_square_remaining_gate.cjs\`

## Seven cuneiform pages: shared-column key-free obstruction

**Independent source-visible hypothesis, 10 November 2026 (Agent 29).**
The same 1033/3301 cuneiform drawing appears once at the bottom of p33 and at
the top of p34–39. Beginning at p33's second red heading (local rune 91),
these seven pages contain **1,589 original ciphertext runes = 7 × 227**.
The repeated seven-page illustration and exact seven-row rectangle suggest
asking whether a single 227-step key schedule or substitution map operates
on seven parallel GP29 plaintext lanes.

This candidate has a **key-independent** necessary condition. Under
`C[row,j] = f_j(P[row,j])`, where each `f_j` is *any common bijection of all
29 rune symbols* shared by the seven rows at column `j`, two ciphertext
runes in a column are equal if and only if their plaintext runes are equal.
The common bijection can change arbitrarily at every column, so this
test is broader than a source-fixed additive keystream and makes no
secret-key or cipher-parameter assumption.

Two coordinate systems are independently motivated by the source:

| Source-defined seven-lane reading | Original equality pairs | Same-format solved-English reference samples |
| --- | ---: | --- |
| Seven contiguous 227-rune rows formed from the entire p33–39 body | **159/4,767 (3.3354%)** | Shakespeare: minimum **239**, median **291** in 2,002 windows; Emerson: minimum **245**, median **303** in 2,007 windows |
| Seven physical page starts, 123 shared columns (page lengths after heading 123, 261, 271, 238, 228, 228, 240) | **93/2,583 (3.6005%)** | Shakespeare: minimum **119**, median **158**; Emerson: minimum **117**, median **165**, using the *same seven source-page offsets* |

The same source motivates a **stronger two-layer model with an unknown
shared keystream**. The historical 2014 OpenPuff 7×7 square has row and column
sums 1033 ≡ 18 (mod 29). Consequently its inverse also maps a constant
column vector to a constant column vector. Under
`C[:,j] = M P[:,j] + K[j]·1`, subtracting the unknown `K[j]` is
unnecessary: `M⁻¹ C[:,j]` has exactly the same cross-row equalities as
`P[:,j]`, regardless of the arbitrary 227-symbol key. The equivalent
statement holds for each natural source-matrix orientation (M, Mᵀ,
M⁻¹, M⁻ᵀ).

| Seven-page source-matrix orientation | 7×227 equalities | Native seven-page, 123-column equalities |
| --- | ---: | ---: |
| M | 185 | 84 |
| Mᵀ | 152 | 107 |
| M⁻¹ | 176 | 73 |
| M⁻ᵀ | 163 | 82 |

Even the strongest original value remains below the minimum in **both**
independently pinned English control collections (**239** packed,
**117** native). The SFT fully encrypts and recovers a 1,589-rune
source-native plant through **each** source-matrix orientation plus an
arbitrary common 227-step pad, including forward re-encryption. This
rules out the **combined 7×7 source Hill + arbitrary shared column pad**
family for directly readable GP-English under these two layouts. The
comparison is key-free; testing extra pad phases would add nothing.

### Source-marked Ac24 root-of-seven Fourier recovery attempt

A still more ambitious, *key-eliminating* interpretation uses the independently
highlighted Ac rune (GP index **24**) in the p39 red polynomial and p54's
oversized initial. It has **multiplicative order seven in F29**:
`24^1,…,24^7 = 24,25,20,16,7,23,1`. Together with the seven
visually cuneiform-marked pages, this permits a source-constrained
**seven-point discrete Fourier transform** over F29, with the natural
page order and no fitted coefficients.

If the original seven aligned ciphertext rows obey
`C[k,j] = Σ_r (24^(k·r) × P[r,j]) + K[j] (mod29)`, where `K[j]` may
be **any unknown 227-symbol pad**, inverse DFT yields exactly
`P[r,j]` for **six rows r=1…6**, because the common pad occupies only
the zero-frequency/DC component. The remaining first row alone
contains the unknown pad. The converse transform convention has the
same six-row prediction. This is a particularly high-value original
test: the proposed *actual plaintext* of six lanes is obtained with
zero brute-force key search, and exact forward encoding is defined.

The source-frozen six-row original outputs are:

| Layout | Six original recovered candidates, pooled IoC | Lowest same-format Shakespeare GP-English control | Lowest Emerson GP-English control |
| --- | ---: | ---: | ---: |
| 7×227 packed | **0.034330592** across 1,362 runes | 0.055838056 | 0.058891439 |
| Seven native starts ×123 | **0.034075741** across 738 runes | 0.054362335 | 0.057068685 |

Both transform directions yield equivalent pooled-six-rune IoC because
their six non-DC lanes differ only by a fixed invertible symbol scaling
and lane permutation. Original previews are nonlinguistic in all six
streams. Source-native GP-English controls fully recover **six of seven
independently aligned plaintext rows without knowing the pad**; adding
the single DC correction recovers the first row, then exactly
re-encrypts all 1,589 symbols. This rejects the specified GP29
**7-point Fourier mixing followed by an arbitrary common output pad**
as an original LP2 decoder for either visible layout under the two
native-GP-English references. It does not reject nonlinear/non-GP
layering, row-distinct pads, or another independently specified
seven-page alignment.

The seven/Ac clue chain and DFT choice are **hypotheses**, not
historically documented instructions. They supplied a discrete
source-based test with a strong original-plaintext prediction; the
prediction failed. The exact executable is the same unified
`sims/lp2_cuneiform_sevenlane_shared_key_gate.cjs` SFT. No original
plaintext or historical key was recovered.

#### The independently ten-dot-framed 553 = 7 × 79 passage

The five numbered red paragraphs on pp36–38 lie between ten-dot punctuation
at global unsolved-rune offsets 8,804 and 9,357. Their **553 intervening
runes** (`[8,805, 9,358)`) admit two natural exact 7×79 layouts: seven
successive 79-rune rows, or seven glyph lanes separated by a seven-rune
stride. Unlike the 7×227 cuneiform packing, the boundary and the 7×79
length are supplied by **visible enclosure marks**. Combining that source
framing with the adjacent highlighted Ac24 order-seven root gives a second
key-free Fourier plaintext prediction.

The same exact inverse DFT reveals the six non-DC rows independently of
an otherwise arbitrary secret common 79-position GP29 output pad. These
are **474 original glyphs whose putative plaintext is fully determined
under the model**:

| 7×79 original layout | Decoded six-row IoC | Minimum Shakespeare control | Minimum Emerson control |
| --- | ---: | ---: | ---: |
| Seven consecutive 79-rune rows | **0.0354858565** | 0.0536212879 | 0.0540494732 |
| Seven interleaved seven-stride lanes | **0.0344064727** | 0.0536212879 | 0.0540494732 |

The controls are 2,012 Shakespeare and 2,001 Emerson deterministic
consecutive 553-rune windows; the reference comparison uses exactly
474 subsequent GP-English runes per window. Those windows overlap and
give finite comparative minima, rather than independent p-values.
Both candidate plaintexts remain nonlinguistic. A separate native
553-rune GP-English plant passes exact forward DFT, unknown-pad addition,
the key-free recovery of all six non-DC rows, first-row correction and
whole-block forward re-encryption in both directions.

This **rejects the specific source-framed seven-way linear Fourier
mixer with any common output pad** as a native GP-English decoder. It
also illustrates a useful stopping rule: the visible seven-by-79 geometry
alone cannot justify further phases or arbitrary row keys after its
unique key-free prediction fails. The source framing may still have
a different intended use.

For each reference the program converts a pinned literary work to the canonical
29-character GP transliteration, discards nonrunes, samples approximately 2,000
deterministic consecutive 1,589-rune windows, and computes exactly the same
seven-row columnwise equality statistic. **No sampled English control** has an
equality count as low as the original in either layout. Windows overlap
substantially; the minima constitute a transparent bounded comparison, **not**
independent-trial probabilities. A true 1,589-rune GP-English plant passed
exact reversible columnwise-permutation encryption/decryption and preserves
all its cross-row equality counts.

The result **excludes a directly legible, native-GP-English plaintext under
one arbitrary common-per-column 29-symbol substitution**, in either of
the two motivated seven-lane arrangements, against the stated controls.
It does not exclude separate keys per row, a source-defined different
position pairing, an intermediate homophonic/non-GP register, or a later
cryptographic layer. The seven-row count alone is retrospective and cannot
select a secret key. This finite negative should discourage repeating
permutation/one-time-pad searches that assume the seven cuneiform pages
share column states. It recovers **no original plaintext or key**.

Reproduction: `node sims/lp2_cuneiform_sevenlane_shared_key_gate.cjs`.
Inputs: the original `lp2-corpus.json`, `shakespeare_first300k.txt`, and
`emerson_essays_2944.txt` controls. The input is original source text and
the only fitted quantity is the layout proposed before examining matches.

## Historical interpretation

The archived OpenPuff procedure specifies OpenPuff 4.0.0, the carrier \`interconnected.mp3\`, 50% MP3 bit selection, and password **33011103**. The often-copied **33011033** is an alternate transcription, not the password in that procedure. The sixth-onion page then explicitly asks participants to submit the three magic squares and a Tor hidden-service upload endpoint. That is direct evidence for a submission/credential role; it is not an instruction to reuse the squares as an LP2 cipher key.

The first two squares have now failed the simplest reversible GP29 interpretations tested here. The third square is the 5×5 / 1033 square already tested in the linked report. This makes a direct additive or Hill-key role for the three-square set less plausible, while preserving the historically established submission role.

## Scope and limits

- The key sequence uses the published row-major order and the natural top-left start; no arbitrary key search was performed.
- The Hill test covers the four natural matrix orientations and every block phase.
- This does **not** test every possible use of the squares, such as a different transposition or a separately specified nonlinear schedule.
- This does **not** test OpenPuff steganographic extraction from LP2 JPEGs. The historical OpenPuff stage used an MP3. The available [LibrePuff carrier dispatcher](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/carrier.rs) currently implements the WAV parser and leaves other carrier types unimplemented; its [WAV parser](https://github.com/tweqx/LibrePuff/blob/master/librepuff/src/parser/wav.rs) is not a JPEG implementation. Do not treat this key test as a negative JPEG-steganography test.

## Inputs

- \`resources/cicada2014-openpuff-magic-squares.txt\`
- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/control/shakespeare_first300k.txt\`
- Historical procedure: [Interconnected OpenPuff reconstruction](https://github.com/iBotPeaches/cicada_3301/blob/master/other/Interconnected_OpenPuff.md)
- Sixth-onion submission page: [three-square upload instruction](https://github.com/krisyotam/cicada3301/blob/main/puzzles/2014/assets/stage10/ut3qtzbrvs7dtvzp.onion/index.html)
