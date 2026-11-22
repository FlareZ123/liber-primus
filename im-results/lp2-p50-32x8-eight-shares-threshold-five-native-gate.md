# Original LP2 32×8 base60 bytes as eight Shamir shares of a 32-byte key

**Agent34, 22 November 2026. Status:** source-structured, typed cryptographic negative. The original 256-cell numeral object is **not** an ordinary threshold-five Shamir encoding of eight 32-byte shares in either of the standard byte fields or the separately source-motivated GF257 field under the printed column coordinates. The tested layout would have recovered an actual **256-bit key** if supported. No LP2 unknown plaintext, key or original next instruction is recovered.

[Original-source Node22 CommonJS SFT](../sims/lp2_p50_32x8_eight_shares_t5_sft.cjs) · [Windows Node22 PASS](https://github.com/FlareZ123/liber-primus/actions/runs/45057638762).

## A new typed receiver, distinct from the rejected one-polynomial GF257 sequence

The manuscript itself displays a 256-cell numeral object over physical p49–51 as **32 rows × 8 columns**, each cell printed as a **two-character base60 token** encoding an authentic byte from **0 through 255**. This layout can naturally be read as **eight 32-byte sequences**, one per printed column. In Cicada's authenticated **2013** historical work, Shamir secret sharing used a threshold of **five shares**. A 32-byte common secret would yield a cryptographic 256-bit seed/key, enough to operate a modern page-stream cipher if it were accompanied by an original key consumer.

**Testable hypothesis:** each original row gives the same secret-byte position in eight Shamir shares; the byte at column j is the evaluation of a separate unknown degree≤4 polynomial at original public coordinate x=j for j=1,...,8. Exactly five shares uniquely determine the polynomial, its byte at x=0, and all other column bytes. This predicts **3×32=96 untouched original cell values** from the first five complete printed columns and recovers the entire alleged 32-byte common secret **without inspecting the other three columns**. Every coordinate, threshold, byte and holdout is fixed before comparison. This model is distinct from #2136's **single** degree4 polynomial spanning all 256 cells, which was already rejected. It uses 32 separate byte-level polynomials because 32×8 is the actual printed source layout.

For finite-field arithmetic the source supplies two independently motivated, unkeyed choices: the conventional 8-bit finite field \`GF(2^8)\` and the earlier **p0 FFF-derived numeric candidate 257** as a possible prime modulus (its selection as a cipher field has never been author-authenticated). To avoid postselected polynomial conventions, test only the two standard 8-bit polynomial implementations **AES GF(256)/0x11B** and **Reed–Solomon GF(256)/0x11D**, together with **GF(257)**. The 256 original bytes, original 32×8 order and base60 encoding are independently pinned by \`resources/liber-primus/base60-grid.json\`, which the SFT checks against each original two-character printed cell. Column reversal or coordinate shifts are affine changes of the interpolation variable and cannot make a non-degree4 8-point row become degree4.

## Frozen original 96-cell holdout

| Field | Held-out 8th-byte positions predicted from five columns | Exact authentic matches | Failed predictions |
| --- | ---: | ---: | ---: |
| AES GF(256), polynomial 0x11B | 96 | **2** | 94 |
| RS GF(256), polynomial 0x11D | 96 | **0** | 96 |
| Prime GF(257) | 96 | **0** | 96 |

The two incidental AES-field matches occur only at **row13, column5** and **row20, column6**, zero-based physical coordinates; no row passes all three withheld bytes. Original first source row bytes \`[203,231,167,186,97,237,126,183]\` are a compact falsifying witness: AES-field prediction of the last three from the first five gives \`[96,49,127]\`, RS field gives \`[102,231,109]\`, prime GF257 gives \`[114,85,6]\`. None reproduces the observed \`[237,126,183]\`.

The independent positive construct generates **32 authentic-shaped degree4 polynomials** per finite field, serializes all **32×8** shares and recovers **96/96** sealed column6–8 values as well as **32/32** actual original planted secrets at x=0. The implementation also checks all **256** original printed base60 cell values exactly against the canonical byte array. The failed original reconstruction therefore is not due to an incomplete sample, a wrong printed-byte parser, or an inability to interpolate.

**Decision:** reject this complete, source-layout-respecting **eight 32-byte Shamir shares of one common 256-bit key, t=5** as a conventional original plaintext-key route in the specified three fields. The historical threshold precedent establishes a *recognizable candidate operation*, and the table structure supplies a naturally typed receiver, but no original instruction actually labels the eight columns as participants or requires a threshold cipher. Do not rescue the failed model by choosing different fields, row permutations, independent x-coordinate keys or postselected polynomial degrees. A future attempt needs a new first-party typed grid rule, preferably one that predicts an untouched byte or actual unknown plaintext.
