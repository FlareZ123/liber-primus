# The two original moth-page terminal marks give equal GF(29) G-erasure values

**18 November 2026, Agent12. Classification: new exact, source-constrained structural coincidence and a complete negative plaintext/second-factor test. No unknown LP2 plaintext, authentic marker value, key, or decoding operation recovered.**

## Source-motivated construction

The manuscript gives two independently recognizable moth pages: physical LP2 **p53** (179 ciphertext runes) and **p55** (76 runes). Each ends with an original red 13-dot terminal stencil. P55's initial rune NG is the carried continuation of a word from p54. The complete local p55 body therefore has 75 new runes, and the source layout supplies **179 runes + first terminal mark + 75 runes + second terminal mark = 256 ordered positions**, exactly the cardinality of the original p49–51 32×8 numerical table.

The source's p39 red triad has original GP29 indices `[27,5,15]`, which interpreted as a polynomial with its initial glyph as the constant coefficient yields

`G(X)=27+5X+15X² = 15(X-24)² (mod 29).`

The independently original-read p50 numeric table, high-degree-first modulo29, is exactly divisible by this G. Its other source-linked factor `H(X)=3+26X+24X²` also divides the table. The enlarged p54 initial A has GP ordinal24, matching G's repeated root. These facts motivate one **investigator-proposed** test: might the two actual terminal mark positions be erasures in a second 256-slot polynomial codeword sharing G? No author instruction states that a 13-dot separator represents a GP-field symbol or that moth text is a G codeword.

## Source-fixed interpolation and independent checks

Let `E(u,v)` be the 256-element vector in printed order: all 179 p53 GP indices, unknown `u` at its terminal stencil, p55 indices1–75, and unknown `v` at its terminal stencil. Each unknown ranges over GF(29). Polynomial long division of this **original** vector by high-first G `[15,5,27]` gives exactly one pair making the remainder zero:

| Source-fixed parity condition | Unique completion `(u,v)` | Interpretation |
| --- | --- | --- |
| `G | E(u,v)` | **(7,7)** | Both marks reconstruct as GP rune **W**, index7 |
| `H | E(u,v)`, with H high-first `[24,26,3]` | **(23,26)** | Incompatible with the G completion |
| H remainder at G's W/W completion | **[21,26]** | The completed moth stream is *not* an H·G codeword |

The coincidence is specific to the frozen author-natural physical order. Original page order reversed gives G completion (10,9); original runes reversed separately in each page gives (9,6); preserving the incoming p55 NG while deleting the last p53 rune gives (26,16); preserving NG while instead deleting the last p55 rune gives (2,12); flipping G's coefficient orientation gives (27,10). These checks show the original-order equality is real under the chosen model, while providing a caution against unconstrained reordering.

**Crucial plaintext decision:** Dividing the 256-symbol W/W-completed vector by G produces a deterministic **254-GP-rune quotient**, with IoC **0.033114437770377515** and no continuous GP-native English. Its leading 65 GP glyph transliterations, written without separators, are `APOEIASECMOHNGXHLAYIAEOPYNTHTHAHAEOMEOYAEUAEBNGEOFWUDEOECTAEMMAEAEGPOHBGTHEAYOPEAXOEMN`. The output's severe frequency flatness is inconsistent with normal solved-LP native prose. The missing H parity independently rejects interpreting the original moth events as a complete member of the same four-constraint H·G code established for the table. No key or authentic instruction was obtained from the equality.

The fixed placement of two unknown values under two GF(29) parity checks ordinarily produces a unique pair, regardless of what the ciphertext is. The **extra equality** of the two independently reconstructed values has approximately **1/29** chance under an ideal uniform independent-erasure-value null. Here the test and motif association were discovered after extensive artifact exploration, so that figure is **not** a global significance value. Treat `W/W` as a lead requiring an independently selected consumer or original-input holdout, rather than a decoded punctuation convention. In particular, invoking seven-column transposition from the derived ordinal7 without an independent instruction would be postselection.

## Reproduction and decision

[Read-only Node22/CommonJS SFT](../sims/lp2_moth_g_two_mark_erasure_source_sft.cjs) consumes the canonical [GP corpus](../resources/liber-primus/lp2-corpus.json), [256-byte source table](../resources/liber-primus/lp2-grid-256.json), and [original ink marks](../resources/liber-primus/lp2-ink-annotations.json). It asserts page boundaries, all source factors, both exact erasure completions, second-factor failure, complete polynomial reconstruction, orientation controls, and the quotient's original-input IoC. A full **254/254** independent solved-p57 GP-native plant is encoded into a genuine G codeword, erased at the two actual source positions, recovered by the same solver, and decoded back exactly. Positive code consistency does not establish original plaintext.

**Next decision:** a future source-native cue would need to select G parity as the meaning of identical terminal stencils and supply a different complete plaintext receiver. The quotient's native-GP output is negative, and the independent table H constraint fails. Stop here rather than fit additional positional polynomial factors or claim that both physical punctuation marks historically meant W.
