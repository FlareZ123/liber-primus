# Terminal 256/252 alignment using authentic F-null and H/G quotient

**14 November 2026, Agent 2. Classification: a distinct direct original-cipher source-pairing negative. No unknown LP2 plaintext, cryptographic key or verified continuation recovered.**

## New bounded question

The original pp49–51 table has exactly **256 bytes** under the already documented base60 reading. Over GF29 its original high-power-first coefficient polynomial contains the previously authenticated source-derived fourth-degree factor
`F(X)=X⁴+28X³+13X²+9X+14`, the product of the signed-2013 H and p39 red-triad G. Exact division yields **252** quotient coefficients. Independently, the original terminal LP2 pages have **76+85+95=256** runes, a relationship explored previously without this specific null-removal clock.

The original p55 has exactly **three printed ᚠ (GP index0)** at page-local offsets **15,25,41**. On independently solved p56, the *only* authenticated literal, non-key-advancing ᚠ is at offset **56** (the four other source p56 F glyphs decrypt normally). Thus **assuming** all three unverified p55 F's also act as removable nulls, the terminal stream has exactly
`(76−3)+(85−1)+95=73+84+95=252` non-null runes.

This is a source-motivated candidate clock, but there is no original instruction to remove *all* three p55 F glyphs, to pair the surviving 252 runes with the numeric quotient, or to treat the quotient as GP29 plaintext. The count match alone is not a decoding result.

## Frozen source-origin test

Using the original row-major table and monic H/G divisor, calculate the unique GF29 **252-term quotient** (the polynomial has exact zero remainder). Pair its positions **0–72** with the 73 original p55 non-F **ciphertext** runes, positions **73–156** with the 84 p56 runes omitting only the known literal-F, and positions **157–251** with the 95 original *cleartext* p57 runes. Also compare the p56 portion with its independently authenticated prime-totient **plaintext**, after deleting the literal F. No unknown sign, starting phase, page rotation, transposition or rune substitution is fitted.

| Prescribed original comparison | Rune count | Exact equality | Best among 29 Caesar offsets |
| --- | ---: | ---: | ---: |
| p55 ciphertext with all three F removed | 73 | **0** | 6 |
| p56 printed ciphertext with one literal-F removed | 84 | **4** | 6 |
| p56 *solved plaintext* with literal-F removed | 84 | **1** | 7 |
| p57 original plaintext | 95 | **1** | 8 |

## Exact all-secret stationary-alphabet obstruction

The failure is stronger than the finite Caesar-offset table suggests. Allow a **completely arbitrary hidden function** \(f:\mathrm{GF}(29)\to\mathrm{GF}(29)\), not even requiring an invertible GP alphabet, and ask whether each terminal segment could be obtained as \(P_i=f(Q_i)\) from the same printed quotient alignment. Any repeated quotient value must always predict the **same** original symbol. That necessary condition fails on every segment independently:

| Original terminal segment | Earliest repeated quotient value, 0-based positions within segment | Two incompatible original output values |
| --- | --- | --- |
| p55 original ciphertext after three F removals | Q=17 at local **3,9** | **10,15** |
| p56 printed ciphertext after authenticated F removal | Q=13 at local **8,9** | **3,8** |
| p56 authentic plaintext after F removal | Q=13 at local **8,9** | **10,9** |
| p57 original cleartext, untouched | Q=12 at local **3,9** | **24,5** |

For example, both quotient digits at the known-clear p57 offsets3 and9 equal12; the original p57 GP indices there are24 and5. Any stationary lookup would have to set both \(f(12)=24\) and \(f(12)=5\). This two-position contradiction excludes **every** secret stationary 29-entry lookup for the locked terminal clock, including all 29! permutations, all affine substitutions and noninjective maps. It is exact source arithmetic, without a dictionary or language scoring.

**A stronger two-symbol memory test also fails.** Grant an arbitrary secret **first-order local decoder** \(P_i=g(Q_{i-1},Q_i)\), where every one of the 29² possible ordered pairs may independently map to any of 29 output runes, with no requirement that \(g\) be invertible. Under this model, repeated consecutive quotient pairs must give the same output. The original terminal data contain the following exact contradictory repeated pairs:

| Original terminal segment | Identical consecutive quotient pair | Local endpoint offsets | Incompatible output indices |
| --- | --- | --- | --- |
| p55 original ciphertext, three F omitted | (20,13) | 8,18 | 19,5 |
| p56 printed ciphertext, one literal-F omitted | (5,5) | 34,35 | 5,0 |
| p56 solved plaintext, one literal-F omitted | (5,5) | 34,35 | 2,24 |
| p57 original cleartext | (10,26) | **5,37** | **20,7** |

The p57 line alone is an untouched known-plaintext counterexample to the entire **29^(29²) arbitrary deterministic two-input local lookup family**, under this exact source order. This includes every fixed output alphabet applied to a source-adjacent difference, source pair, first-order source-only transition or sum. The demonstration does **not** disprove ciphertext-feedback machines, changing output alphabets, a secret running state, longer memory, secret position clocks, or different source order; those mechanisms require separate clues and a complete reversible construction.

The 252-term original quotient matches only **5/252** positions of the mixed-mode printed terminal stream, against **252/252** needed for direct identity. Even an arbitrary *single* GP29 Caesar offset in each separately paired segment fails far short of literal recovery. In particular, the complete known p57 plaintext supplies an untouched **95-rune source-authenticated negative**.

A 252-rune synthetic planted terminal stream, systematically encoded by the **same** fourth-degree polynomial, decodes back to all 252 known rune indices exactly, and the authentic 256-byte original codeword reconstitutes byte-residue-for-byte-residue from its quotient. The original p56 prime-totient decryptor is checked against its actual 85 symbols. This detects a wrong polynomial division, clock length or terminal segmentation independently of the original negative.

## Competing four-F erasure interpretation of the intact 256 runes

Instead of deleting four F glyphs to obtain a 252-term quotient, treat their **original terminal positions** as four erased/check slots in a 256-coefficient GF29 codeword divisible by H×G. This is the other simple 256↔252 use of the identical degree-four factor. The four stipulated positions are **p55 local 15,25,41 and p56 local56**, corresponding to **global offsets [15,25,41,132]** in the 256-rune p55–p57 stream. The author has not specified that these F glyphs denote erasures. The authentic p56 prime-totient rule does identify the fourth as its only literal, non-key-consuming F.

The monic factor induces four linearly independent parity checks on a 256-symbol GP29 stream. With the same untouched 252 other original symbols, solving the exact four-by-four GF29 syndrome system gives a **unique** erasure fill, rather than a guessed output:

| Source-frozen 256-symbol register | Four unique replacement GP indices | Rendered GP symbols | Restores all four original F symbols? |
| --- | --- | --- | --- |
| p55 ciphertext + p56 printed ciphertext + p57 clear | **15,20,9,27** | S L N IA | **No** |
| p55 ciphertext + p56 authenticated plaintext + p57 clear | **6,19,28,20** | G M EA L | **No** |

The four syndrome columns for the specified zero-based positions, in constant/linear/quadratic/cubic remainder order, are **[19,26,24,0]**, **[8,18,12,12]**, **[16,4,5,2]**, and **[20,24,0,0]**; they form a full-rank matrix. Both computed replacement streams divide exactly by the original H/G factor, confirming the construction. In neither original mode does the required p56 local56 replacement equal its **known** GP F value0. Thus the four physical F glyphs do **not** simply act as erasure slots for an otherwise literal terminal H/G codeword in either printed-ciphertext or known-plaintext p56 register. The two replacement strings are numerical artifacts of forcing an arbitrary codeword constraint, not recovered plaintext or instructions.

This closes the direct four-erasure version alongside the no-F 252 quotient identity and all-secret one-/two-rune lookup versions. It leaves open a separately authored nonlinear code, a different input register or an explicitly selected stateful consumer. The same [source-exact SFT](../sims/lp2_terminal252_fnull_hg_sft.cjs) asserts all four syndrome columns, both solutions, exact remainders and mismatch to known F.

## Alternative four-*known*-F terminal clock (Agent21, 14 November 2026)

The preceding p55-null clock removes **three F glyphs whose plaintext status is unknown**. A distinct, independently source-fixed clock is available without interpreting any p55 ciphertext F as a literal: original **p55 has 76 ciphertext runes; authenticated p56 has 84 key-consuming runes after its one known literal-F exception; and already-plaintext p57 has 92 non-F runes after excluding its three printed clear F glyphs at offsets 33, 59, 67**. The sum is exactly **76+84+92=252**, matching the independently obtained 252-term quotient of the original p50 numeric-table polynomial by H×G. The original source supplies these four *known clear F's* without guessing a missing p55 plaintext, though **it does not state that the unencrypted p57 F's are nulls for a new table codec**.

Freeze all 76 original p55 ciphertext runes unchanged, omit only p56 local56, and omit only p57 locals33/59/67. Compare in print order with quotient positions0–75, 76–159, and160–251. Two independently known p56 source representations are shown.

| Original terminal register | Length | Exact original GP29 identity positions | First decisive arbitrary-secret stationary symbol-function contradiction | First decisive arbitrary-secret previous-pair-function contradiction |
| --- | ---: | ---: | --- | --- |
| p55 ciphertext, all original runes | 76 | **7** | source Q=17 local3/9 → output10/15 | source pair(20,13) local8/18 → output19/17 |
| p56 printed, its one authenticated literal F omitted | 84 | **2** | Q=13 local5/6 → 19/26 | (5,5) local31/32 → 9/26 |
| p56 genuinely solved, its literal F omitted | 84 | **2** | Q=13 local5/6 → 7/10 | (5,5) local31/32 → 24/6 |
| **p57 genuinely clear, all three F's omitted** | 92 | **2** | Q=12 local0/6 → **13/18** | (10,26) local2/34 → **4/5** |

A single repeated-input mismatch excludes *every* arbitrary fixed 29-symbol table \`f(Q)\` or fixed predecessor-aware 29²-symbol lookup \`g(Q_previous,Q)\`, even if the maps are kept secret and are noninvertible. The p57 witnesses are especially useful because all **92 values are genuine known original plaintext**. A changing secret key/clock, a nonlocal operation, or a differently source-selected quotient orientation is outside this rejection.

**Four-authenticated-F erasure interpretation.** Retain the unmodified 256-rune terminal stream, now constrain the four known clear F positions to global offsets **[132,194,220,228]** (p56 local56; p57 locals33/59/67). If that stream were the same degree-four GF29 codeword as the p50 table, these four zero glyphs should be the unique parity/erasure contents. They are not. For original p56 ciphertext the H×G syndrome (in **descending coefficient order**) is **[3,22,16,2]**; solving the full-rank four-by-four linear system forces four **nonzero GP residues [8,17,17,7]**, changing every known F. For genuine solved p56 plaintext the syndrome (in descending coefficient order) is **[6,10,12,17]** and the forced symbols are likewise **[23,10,13,4]**, again changing every known F. In both cases, inserting the forced values yields a true zero-remainder synthetic codeword, verifying the exact algebra. Therefore **the four independently known F's cannot themselves be the four check-symbol positions of a literal terminal codeword**, under either original p56 representation.

This **closes a stronger source-known clock**, distinct from the earlier p55 three-*conjectured*-F removals, without fitting skips, radix order, arbitrary secret relabelings or decrypted English. No unknown p55 plaintext, key, or destination was recovered. Updated [single-file CJS original-source SFT](../sims/lp2_terminal252_fnull_hg_sft.cjs) asserts the full 256 original-grid bytes, exact H×G quotient, every original F offset, four original lookup conflict witnesses, both forced erasure solutions, source re-encoding and native control.

**Independent execution:** [Windows Node22 exact original-source SFT success, run 43652557355](https://github.com/FlareZ123/liber-primus/actions/runs/43652557355). A first attempt had a reversed syndrome display-basis assertion; the corrected source uses ascending polynomial remainder arrays internally and presents syndromes high-to-low in the explanatory table. The cipher conclusions were unchanged.

## Decision

The four-F removal delivers an exact **conditional 252-symbol alignment** between the original terminal source and the GF29 quotient, but that alignment fails as a direct GP29 identity or a constant-shift message. Do not promote the alignment to an authorial instruction, and do not rescue it by choosing a secret per-rune permutation, a new F mask or an arbitrary byte decoder. This is separate from the previously closed [180-inner-cell tiny DSL test](lp2-terminal180-historical-tiny-dsl-gate.md) because the source input is the entire table's **H/G quotient**, and the candidate terminal clock explicitly removes four physical F glyphs.

**Reproduce:** [read-only Node22 CJS SFT](../sims/lp2_terminal252_fnull_hg_sft.cjs), using `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`.