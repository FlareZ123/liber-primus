# Terminal four-ring and eight-column red-rune Vigenère inverse

**Agent 5, 11 November 2026. Decision:** A single literal, source-constrained, reversible terminal-table inverse produces no recognizable unknown LP2 plaintext. Do not branch into retrospective table phases or key variants without a new original instruction. This is an intermediate, model-specific negative; no authentic LP2 key or plaintext has been recovered.

## Exact original source selector

The manuscript visibly places a **32×8** two-character numeral table before its final illustrated section. As [previously documented](terminal-grid-xor-anend-digest.md#alternative-four-nested-grid-rings-aligned-with-pp5355), four concentric rectangular rings of the printed table have exactly **76, 68, 60, 52** cells. The source-native rune groups are p55's **76**, p53's **128 black** split into 68+60, and p53's **51 red** plus p54's following oversized initial **Ac24**, completing the innermost 52. The 68/60 division crosses a printed word, a serious objection to intentional mapping.

The **previously unused remainder of p54's initial nine red runes** is an ordered sequence of **eight GP29 indices [19,21,23,27,2,14,10,19]**. This is exactly the printed table's column count and supplies one candidate shift per column without selecting numerical key bytes from ciphertext. The source offers no explicit instruction to apply these offsets, so the candidate remains hypothetical.

## One fixed reversible original test

The [single-file CommonJS reproducer](../sims/lp2_terminal_red8_column_vigenere_sft.cjs) reads the source corpus, original-rune annotation and base60-derived table. For ring 0 through 3, traverse from the top-left clockwise and assign the four source rune groups in the order above. This defines exactly one GP29 ciphertext rune `C[i]` for each original table cell `i=8r+c`.

With unchanged original table byte `B[i]` and the eight p54 GP29 keys `K[c]`, apply the historically attested GP29 modular-addition style as a candidate:

```text
P[i] = (C[i] - B[i] - K[i mod 8]) mod 29
C[i] = (P[i] + B[i] + K[i mod 8]) mod 29
```

The inverse is bijective for every original symbol. No corpus-derived phase, adjustable start, unobserved glyph, searched alphabet, key byte, or desired plaintext determines the mapping. Re-encryption of all 256 source runes is exact. A 256-rune source-GP control encrypts/decrypts exactly, and using the unrelated p40 red eight-rune header as the wrong-source key fails the control.

## Original-output decision

| Frozen metric | Original source result |
| --- | ---: |
| Aligned source terminal runes | **256** |
| Source ring lengths | **76 / 68 / 60 / 52** |
| GP29 original cipher index of coincidence | **0.03431373** |
| GP29 decoded index of coincidence | **0.03507966** |
| Original cipher mean English quadgram log score | **−17.68491** |
| Candidate decoded mean English quadgram log score | **−16.70829** |
| Independent *solved plaintext* p57 mean quadgram score | **−10.17888** |
| Independent known-encrypted p56 mean quadgram score | **−17.81794** |

Scores use the existing pinned Duko English quadgram corpus with exact GP transliteration and the original p57 known plaintext as an independent native register control. The modest improvement from the raw cipher score does not approach the solved-page plaintext register. The first 80 GP-transliterated candidate positions, in table row-major order, are:

```text
THCOFAAEYSSOLJHHJLDIALPUDHAECAAEOEGTHWCEOMTHTNXTJEADUAEEOAERSEOJRXXINMTHTHAASRLPNMIAXMEOIAEITHCREOOEAP
```

The output has no recognizable independent payload and cannot be promoted as genuine plaintext. The source-native reversal establishes the arithmetic, not the intended author key. The eight red p54 offsets, the four ring lengths and the candidate `mod29` byte reduction have plausible visual motivation but **no documented single command connecting them**. This sharply bounds the literal column-keyed reading while leaving genuinely different historical key sources unresolved.

## Decision for Director Issue #253

The source supports the terminal ring correspondence and a visually available eight-rune key. It does not specify the extra three operations (ring/rune pairing, byte-to-GP reduction, and Vigenère combination) before seeing the output. Under this simplest explicit candidate, the original is ciphertext-like. The next viable source-first research decision needs a **creator-visible instruction selecting the actual transform or an external genuine key**. More orientation, AES, key-modification or language-score sweeps on this same terminal geometry lack an independent causal selector.
