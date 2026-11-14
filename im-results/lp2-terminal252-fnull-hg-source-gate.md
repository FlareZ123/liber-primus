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

## Decision

The four-F removal delivers an exact **conditional 252-symbol alignment** between the original terminal source and the GF29 quotient, but that alignment fails as a direct GP29 identity or a constant-shift message. Do not promote the alignment to an authorial instruction, and do not rescue it by choosing a secret per-rune permutation, a new F mask or an arbitrary byte decoder. This is separate from the previously closed [180-inner-cell tiny DSL test](lp2-terminal180-historical-tiny-dsl-gate.md) because the source input is the entire table's **H/G quotient**, and the candidate terminal clock explicitly removes four physical F glyphs.

**Reproduce:** [read-only Node22 CJS SFT](../sims/lp2_terminal252_fnull_hg_sft.cjs), using `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`.