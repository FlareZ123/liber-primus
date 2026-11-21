# The p0 13-dot marker as a 2014 square central-diagonal mask: an exact original-cipher obstruction

**Agent 29, 21 November 2026. Classification:** source-visible geometric hypothesis; key-independent original-language exclusions for stationary and affine/quadratic position clocks, and an exact two-survivor finite result for per-column-offset codebooks, with no unknown-page plaintext recovered. This complements the already documented red13 DH-state serializer and the independently investigated 2014 5–7–5 square / terminal 99-unit geometry. It is specifically a **p0 title receiver** test, not another p55 square-count proposal.

## Why a solver would consider this

The original p0 red title ends with a 13-dot ornament. Pixel inspection and the existing original-mark SFT establish nine staggered rows containing

```
1,2,1,2,1,2,1,2,1
```

dots, and the three physical vertical columns hold **4|5|4** dots. The historical 2014 OpenPuff source `resources/cicada2014-openpuff-magic-squares.txt`, distributed before the May2014 LP2 pages, contains two complete **5×5** numerical squares (first and third source groups), separated by a 7×7 square.

Take any 5×5 original square, retain its **three adjacent main diagonals** `|row−column|<=1`, and rotate those thirteen cells by45 degrees using the invertible coordinate transform

```text
display_row = original_row + original_column
display_column = original_row − original_column
```

The output has exactly the original marker's nine-row pattern and the same physical **4|5|4** columns. This is a concrete geometric construction from a period-available original artifact; it does not require choosing a plaintext phrase. It does **not** prove the creator intended the source square as a p0 key.

## Exact no-secret obstruction

Both actual 5×5 source squares are invariant under a180-degree rotation. Reading their diagonal bands as left4 / center5 / right4, each resulting 13-integer packet is a palindrome, regardless of which of the two source squares is chosen. Therefore **every stationary rule mapping each square integer to one GP29 shift**, including an unknown arbitrary nonlinear function `f(number)`, necessarily yields a palindromic 13-rune key under the same natural physical dot order.

The original p0 title's first13 GP29 ciphertext indices are:

```
C = [15,8,18,3,6,19,27,0,15,26,18,21,5].
```

The already published, explicitly **conditional** signed-2016 candidate `EPIPHANY SEEKS` is GP29 `EPIPHANY SEECS`:

```
P = [18,13,10,13,8,24,9,26,15,18,18,5,15].
```

Any additive decoder of that candidate requires the exact original residual:

```
K = C − P mod29
  = [26,24,8,19,27,24,18,3,0,8,0,16,19].
```

All **six** mirror pairs `K[i]` and `K[12−i]`, for i=0..5, **differ**, while a stationary key extracted from either square band would require all six equal. This key-independent contradiction excludes *every source-value-only per-cell key*, no matter how the historical integers were secretly mapped to 0..28. It is conditional on the original `EPIPHANY SEEKS` plaintext candidate and on the particular physical 13-dot mapping.

An independent previously published p0 **raw title** candidate, `SECUENDI RATIO` in the one-rune-per-Latin-letter branch (`sims/lp2_p0_red_heading_raw13_register_geometry_sft.cjs`), provides a second explicit conditional control. Its GP29 candidate and required pad are:

```text
P_raw = [15,18,5,1,18,9,23,10,4,24,16,10,3]
K_raw = [0,19,13,2,17,10,4,19,11,2,2,11,2].
```

**Five of six** mirrored key pairs differ. Thus the same no-secret source-square symmetry also excludes the stationary per-value additive mapping if this distinct raw title is correct. These two cribs are incompatible interpretations of the original ciphertext; neither is asserted as verified plaintext.

Four direct source operations for each of the two 5×5 groups are additionally executable: raw-number mod29 or Euler φ(number) mod29, and ± additive sign. None produces that candidate from untouched p0 ciphertext; no coherent 8+5 GP-native plaintext is recovered. The exact positive control encrypts and decrypts an independently clear 13-rune p57 slice using each same source-derived key. All eight direct candidate inversions fail both conditional title readings.

## Stronger plaintext-crib-free English word-pair exclusion

The previous two conditional title readings are not needed to test this source key mechanism. The red title has an original, explicit **8|5 GP29 word division**, and any symmetric 13-key stream satisfies

```text
K_i = K_(12-i),  i=0..5
K_i = (C_i - P_i) mod29 for non-F plaintext.
```

Let `A` be the eight-rune unknown first word and `B` the five-rune unknown second word. The source-symmetric key forces **one wholly within-word necessary constraint** `A[5]-A[7]=C[5]-C[7] mod29` and determines the entire second word directly from the *first five* GP values of the first:

```text
B[4-i] = A[i] - C[i] + C[12-i] (mod29), i=0..4.
```

This prediction uses neither the plaintext labels `EPIPHANY SEEKS` / `SECUENDI RATIO` nor the numerical values of a secret square-cell key. Any stationary arbitrary function of the original square values has to obey it.

We evaluated every **distinct eight-rune** and **distinct five-rune** spelling in the repository's pinned `resources/control/english_wordfreq_textblob.txt`, under the two already published encoding conventions: (a) source-native longest matching GP29 transliteration with original `ING→NG` and `IO→IA`, and (b) one rune per normalized Latin letter. The historical normalizations are `QU→CW`, `V→U`, `K/Q→C`, `Z→S`.

| Source spelling | Distinct 8-rune words | Distinct 5-rune words | First-word internal survivors | Complete 8|5 pairs |
| --- | ---: | ---: | ---: | ---: |
| GP-native, all runes consume shift | 4,325 | 3,613 | 153 | **0** |
| GP-letter, all runes consume shift | 4,472 | 2,940 | 169 | **0** |
| GP-native, plaintext literal-F bypass | 4,325 | 3,613 | 137 | **0** |
| GP-letter, plaintext literal-F bypass | 4,472 | 2,940 | 152 | **0** |

For the p56-style literal-F rule, a plaintext `F` emits ciphertext `F` without consuming a key. The unchanged title ciphertext contains only one `F` at zero-based position7. Grant a bypass when a candidate first word has `F` there, in which case the internal mirror constraint on 5/7 is waived. Exactly **five** eight-rune candidate spellings per encoding use that exception among the surviving options. Every other F outside the original ciphertext F position is excluded. The mirrored cross-word constraints still yield **zero** complete dictionary phrases in either mode.

Positive source controls plant the literal English phrase `EPIPHANY SEEKS`, encrypted by the **actual original 2014 first 5×5 square's central-diagonal values modulo29** (palindromic), and the same no-key reader recovers it in both spelling registers with and without the literal-F switch. Thus the zero original result does not reflect a faulty index orientation, zero dictionary coverage, or an impossible recognizer.

### Stronger necessary condition: arbitrary quadratic dot-position clock

A natural way to break the stationary palindrome is to let the numeric square value contribute an unknown secret shift \`f(value)\` while a clock advances with each **physical red-dot position**. The entire family

\[
K_i=f(v_i)+a i+b i^2\pmod {29},\qquad i=0,\ldots,12,
\]

is still testable with **no source key, secret coefficients, fitted plaintext, or guess of \`f\`**. The original five-by-five band has \(v_i=v_{12-i}\). Therefore

\[
K_{12-i}-K_i=(12-2i)(a+12b)\pmod {29}.
\]

Only one unknown anti-palindromic slope \(t=a+12b\) survives. For any proposed eight-rune first word \(A\), non-bypassed positions 5 and 7 fix \(t=((C_7-A_7)-(C_5-A_5))/2\pmod{29}\); the known ciphertext and the first five runes of \(A\) then **predict all five runes** of the second word. The one-rune first F exception, when permitted, is exhaustively handled by allowing all 29 slopes. A source-value secret function can impose additional constraints, so this is a **superset** of genuine compatible plaintext.

| Original p0 title test | Eight-rune first-word candidates | Five-rune second-word candidates | First words eligible with literal F | Slope cases checked with literal F | Exact 8|5 GP-English pairs |
| --- | ---: | ---: | ---: | ---: | ---: |
| Native GP29 | 4,325 | 3,613 | 3,871 | 4,011 | **0** |
| Latin-letter GP29 | 4,472 | 2,940 | 4,011 | 4,151 | **0** |

The all-runes-consumed tests also have **zero** matches (4,325 native and 4,472 literal-letter slope cases). The separate pinned Vulgate whole-word control still permits only the previously noted, unattested \`CERVICES MARTHA\` pairing, with slope zero; it does not produce an independent plaintext title. Sixteen source-native positive plants use both original 2014 five-by-five bands, nonzero \((a,b)=(5,7)\) and \((9,11)\), both orthographies, and both F conventions; **all positive plants are detected exactly**, with the predicted \(t\).

This excludes a materially wider source-derived family: any secret stationary cell-value mapping **plus any arbitrary quadratic dot-position counter**, including every affine counter, for the exact pinned 8|5 English word corpus. Its limit remains important: different cell-to-rune ordering, cubic/higher clock, a plaintext language outside the controls, or a genuine stateful rule can evade the mirror relation. No Cicada-supplied clue selects any such rescue, and the quadratic class produces no recovered plaintext. [Standalone Windows Node22/CommonJS SFT](../sims/lp2_p0_dot13_affine_quadratic_clock_sft.cjs).

### Physically distinct three-column offset: two algebraic English candidates, no selected key

A clock adds a function of *position*. The original p0 ornament also has three visibly distinguished **columns**, exactly `C,L,R,C,L,R,C,L,R,C,L,R,C` in its top-down raster. That motivates a different original-image hypothesis, `K[i]=f(source_square_cell[i])+h(physical_column[i]) mod29`: one arbitrary unknown codebook for the **seven distinct 2014 square-cell values** in the 13-cell band, plus three fixed per-column offsets. The source square is 180°-symmetric, but the opposing noncenter columns interchange under this half-turn. The key therefore need not be palindromic.

For each original mirror pair the center-column atoms must still agree, `K0=K12` and `K3=K9`. Every left/right pair differs by the **same** offset `delta=hL-hR`. In the natural physical scan order, first-word GP rune positions5 (right) and7 (left) fix `delta=(C7-A7)-(C5-A5) mod29` if they are both encrypted. Once an eight-rune first word `A` is specified, the five-rune second word `B` is fixed **without knowing any numeric source-square values or codebook**:

\[
\begin{aligned}
B_0&=A_4+C_8-C_4+\delta,&
B_1&=A_3+C_9-C_3,\\
B_2&=A_2+C_{10}-C_2-\delta,&
B_3&=A_1+C_{11}-C_1+\delta,\\
B_4&=A_0+C_{12}-C_0 \pmod{29}.
\end{aligned}
\]

Because each of the two source five-by-five square bands has **seven distinct entries**, each occurring only once or in an exact opposite-dot pair, these same conditions are also **sufficient** for some arbitrary source-value codebook and three static column shifts. No further hidden equality is silently ignored.

| Original 8+5 title lexical register | Unique first words | Unique second words | Original exact combinations |
| --- | ---: | ---: | --- |
| Source-native GP29 | 4,325 | 3,613 | **2:** `REGULATE TAMED`, `REVULSION TAXED` |
| Literal-letter GP29 | 4,472 | 2,940 | **1:** `REGULATE TAMED` |

Every surviving pair has `delta=16`. The second is specific to native `IO` ligature compression; both pairs have weak stand-alone title semantics and neither is known original plaintext. The source-motivated static literal-F passthrough at the printed F (position7) does not create additional wholeword survivors. Eight original-square positive plants per spelling, including four fixed-position F-bypass plants, are recovered exactly.

**Chance calibration of the two formal phrase matches.** Shuffle the original 13 ciphertext runes 2,000 times using deterministic seed `0x3301`. Each matched shuffle preserves the original **first-seven rune histogram**, the single ciphertext F at first-word offset7, and the **last-five rune histogram** separately, thereby preserving the original word boundary and the unique F anchor. Re-run the full same 8|5 lexicon receiver on every shuffle, without adapting any key. Native word pairs appear with mean 0.7785 per shuffle; **368 of 2,000** shuffles produce **at least two** (plus-one upper-tail **369/2001 = 18.44%**). Literal-letter GP yields mean 0.6700 and **931 of 2,000** yield **at least one** (plus-one upper-tail **932/2001 = 46.58%**). Thus the exact original matches are **unremarkable under a source-matched null**. Their scarcity among millions of dictionary pairs does not authenticate either title. The 2,000 exact trial counts and fixed-seed histograms are asserted by the source-input SFT.

The independently proposed signed-source `EPIPHANY SEEKS` candidate **fails** even the free-codebook column model: its required key has **K0=26, K12=19** and **K3=19, K9=8**, violating the unchanged center-dot equalities. The two formal English survivors also fail **all eight** direct historical numeric recipes (two source five-by-five squares × source-number residue or Euler totient residue × two native candidate word pairs) even when every visible column is granted a free shift; the literal-letter survivor duplicates one native pair. Thus every original English survivor would still need a specifically fitted, unprovided codebook. There is no source instruction telling a human solver to derive that codebook.

This is a **different geometric cipher class** from the stationary/affine/quadratic clock. It establishes that the prior zero-pair result cannot be generalized to all plausible ways to use the p0 13-dot source square. It leaves two purely algebraic phrase candidates, both unsurprising under matched shuffles, with no authenticated or actionable decryption. [Original-cipher source-only SFT](../sims/lp2_p0_dot13_columnshift_square_sft.cjs) · [Windows Node22 CI PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44944527796).

**Independent Latin source-language control:** The separately pinned Latin Vulgate New Testament native GP29 **whole-word** corpus has **1,130 distinct eight-rune words** and **793 distinct five-rune words**. This broader language alternative admits exactly **one** formally compatible synthetic cross-word pair, native GP code `5I41A5IF JO42O`, decoding to normalized `CERUICES MARTHA` (Latin **CERVICES MARTHA**, “necks Martha”). The individual words are attested in separate contexts, but the two-word sequence occurs **zero times** in the actual pinned Vulgate text, and is not a coherent stand-alone title. Both plain all-consumed and transparent-literal-F variants produce this same single formal pairing. Its conditional additive residual on the original p0 title is the exactly symmetric `[10,19,14,2,25,14,9,14,25,2,14,19,10]`, while none of the thirteen source-square numbers reduced modulo29 matches that required shift at its physical dot cell. Thus the exception requires an additional unsourced arbitrary numeric-value-to-shift codebook. It demonstrates the finite English exclusion is **language-dependent**; the proposed operation has no authenticated Latin plaintext or key. Positive controls remain in the same test. The [extended English-plus-Latin SFT](../sims/lp2_p0_dot13_allsecret_english_wordpair_gate_sft.cjs) freezes this exact exception.

**Interpretation:** The entire source-derived stationary additive palindrome-key architecture has no exact two-English-word solution in this explicit finite lexicon, without choosing either historical title candidate. This is a stronger exclusion than the two conditional crib mismatches. An out-of-dictionary/foreign plaintext, nonstandard author spelling, position-dependent state update, or a different source geometry remains possible. The original p0 title cannot be declared solved from this experiment.

[Complete original-text lexical key-free SFT](../sims/lp2_p0_dot13_allsecret_english_wordpair_gate_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44938621805).

## What this changes

The geometric match alone does not select a title decipherment. The complete pinned English corpus also provides no word-pair solution for its symmetric stationary additive key. A source-defined **position-dependent state update, an outside-in H transform, a different readout order or different text receiver** might break the palindrome; the 2014 original squares supply no instruction selecting one such operation. The previous conditional red13 DH-state serializer in [this report](lp2-p0-square-state-rise-key-serializer.md) uses distinct side-column packets and a retrospective rise grammar, so its case is **not** eliminated by this narrower argument.

**Result:** the 5×5 diagonal-band shape is exact on the physical original source geometry. Both conditional title cribs and the full fixed 8|5 English word-pair census exclude stationary, affine and quadratic clock source-square keys in the pinned English registers. A distinct three-column-offset source-square codebook has precisely two native English algebraic survivors, both semantically weak and requiring source-unselected numeric codebooks. Neither class identifies an authored key or original title plaintext. Do not open arbitrary coordinate or permutation menus to rescue the model.

[Windows Node22 original SFT PASS, CI run 44937394995](https://github.com/FlareZ123/liber-primus/actions/runs/44937394995); the updated second-crib assertion is validated in the successor execution. A new first-party clue must independently select a nonstationary transformation before this geometric branch deserves further work.

**Run:** `node sims/lp2_p0_dot13_stage10_three_diagonals_sft.cjs` with Node22 on Windows. The original 2014 square file and unchanged original p0 ciphertext are read directly; no private parameters or fitted phases are used.
