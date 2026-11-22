# Does the original H×G table code repeat as a manuscript-wide 256-rune codeword?

**Classification:** finite original-cipher exclusion of one complete, directly transferable codeword architecture. This document makes no claim of deciphering an unknown page, discovering an author-selected operation, or proving the table's conditional polynomial framing was intended.

## Causal hypothesis and fixed input

The 32×8 / 256-token numerical table printed across physical LP2 pp49–51 has four exact GF29 parity checks under a conditional base60-to-byte-to-GP29-coefficient interpretation. The two known factors are
\(G(X)=(X-24)^2\) from p39's three red runes and
\(H(X)=X^2+18X+11\) from the established table polynomial factorization, also independently associated with the signed 2013 BASE29 example. Its exact 256-cell polynomial is divisible by \(H(X)G(X)\), yielding a [256,252,3] GF29 code. This is a mathematical property of the grid, **not** a source-authenticated LP2 cipher instruction.

A materially different use of that property would be to apply the *same four-check code* directly to the unknown rune stream. Physical pages and the nine already identified visual chapter starts provide **fixed, author-visible** 256-rune frame beginnings. Under this concrete model, treating the next 256 unchanged GP29 runes as descending coefficients, \(P(24)=P'(24)=0\) and \(P\bmod H=0\) must hold for **every** purported codeword. No secret phase, key, alphabet, stride, read-order or source-word resegmentation is permitted.

## Original-input result

The original table passes **all four checks exactly**. A deliberately encoded 256-GP-symbol positive codeword made by multiplying a fixed 252-coefficient payload by \(G\) and \(H\) likewise passes all four, while one changed coefficient fails.

The original LP2 source contains **12,956 undeciphered GP29 runes** on physical pages p0–p55. Physical p50 is a numeric-only page without rune symbols. The p55 beginning leaves only 76 runes before the known p56, so it is not a full 256-rune window. This leaves **54 complete page-start windows**, without changing any of their original rune order or advancing past a page break differently:

| Fixed original 256-rune window condition | Hits |
|---|---:|
| \(P(24)=0\), one check alone | 2/54: starts p11, p33 |
| \(P(24)=P'(24)=0\), double-root G | **0/54** |
| \(P\bmod H=0\), both quadratic checks | **0/54** |
| Divisible by \(H G\), all four checks | **0/54** |
| Double-root G at nine visual chapter starts | **0/9** |

The first 256-rune window at **p33** has \(P(24)=0\) but derivative **28 modulo29** and remainder **[23,16]** modulo H. That single-equation equality does not constitute a G or H×G codeword.

This excludes **only** the proposed direct, source-framed 256-rune codeword shared between the table and original physical-page/chapter-start rune blocks. It cannot exclude different transforms, arbitrary chunk origins, different symbols/registers, an unrelated numeric payload, or a secret encoder. Most importantly, no original Cicada instruction establishes a polynomial interpretation for either table or runes. The *uniform direct codeword* model therefore remains unmotivated even if it had satisfied a single page.

## Reproducer and decision

[Standalone Node 22/CommonJS original-source test](../sims/lp2_grid_hg_pageblock_syndrome_sft.cjs) reads only the shared original corpus and source-table resources. It asserts the table checks, creates a native-GP codeword positive, detects a deliberate one-coefficient error, and prints exact original page- and chapter-start counts.

**Research decision:** do not pursue a manuscript-wide fixed 256-rune block codec merely because the table independently has a four-check polynomial structure. An authentic first-party instruction identifying a different frame, a reversible map, or a real key would justify a new original-input inverse. This result recovers **no unknown plaintext**.
