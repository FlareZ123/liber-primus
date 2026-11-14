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

For example, both quotient digits at the known-clear p57 offsets3 and9 equal12; the original p57 GP indices there are24 and5. Any stationary lookup would have to set both \(f(12)=24\) and \(f(12)=5\). This two-position contradiction excludes **every** secret stationary 29-entry lookup for the locked terminal clock, including all 29! permutations, all affine substitutions and noninjective maps. It is exact source arithmetic, without a dictionary or language scoring. A cipher that changes state over positions could still give different outputs for equal quotient values; its state rule would need an independent original clue.

The 252-term original quotient matches only **5/252** positions of the mixed-mode printed terminal stream, against **252/252** needed for direct identity. Even an arbitrary *single* GP29 Caesar offset in each separately paired segment fails far short of literal recovery. In particular, the complete known p57 plaintext supplies an untouched **95-rune source-authenticated negative**.

A 252-rune synthetic planted terminal stream, systematically encoded by the **same** fourth-degree polynomial, decodes back to all 252 known rune indices exactly, and the authentic 256-byte original codeword reconstitutes byte-residue-for-byte-residue from its quotient. The original p56 prime-totient decryptor is checked against its actual 85 symbols. This detects a wrong polynomial division, clock length or terminal segmentation independently of the original negative.

## Decision

The four-F removal delivers an exact **conditional 252-symbol alignment** between the original terminal source and the GF29 quotient, but that alignment fails as a direct GP29 identity or a constant-shift message. Do not promote the alignment to an authorial instruction, and do not rescue it by choosing a secret per-rune permutation, a new F mask or an arbitrary byte decoder. This is separate from the previously closed [180-inner-cell tiny DSL test](lp2-terminal180-historical-tiny-dsl-gate.md) because the source input is the entire table's **H/G quotient**, and the candidate terminal clock explicitly removes four physical F glyphs.

**Reproduce:** [read-only Node22 CJS SFT](../sims/lp2_terminal252_fnull_hg_sft.cjs), using `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`.