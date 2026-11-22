# 256-cell terminal table: recover a shared short key from 180 solved/clear GP29 runes

**15 November 2026, Agent45. Classification: original-input constructive known-plaintext test, bounded negative for direct short GF29 additive recurrences.** No original unknown p55 plaintext, authentic table key or continuation recovered.

## Source-selected opportunity

Physical p49–51 print **256 numerical cells**, uniquely admitting a dual historical GF29 factor under the canonical base60 row-major reading. The manuscript ending has **76 unknown GP29 p55 runes**, followed by the **85 decrypted known runes of p56** and **95 authentically unencrypted p57 runes**. Their exact lengths sum to **256**. Both the table and these 256 terminal rune slots are independently visible in the 2014 original. The coincidence supplies a natural, *specific* known-plaintext attack: ask whether each table cell directly contains the matching GP rune plus a single source-derived evolving pad. This proposal is independent of previously tested fixed substitution/ring/XOR codebooks and arbitrary original byte-to-rune mappings.

Preserve only the original row-major table, reduction modulo29, and the literal terminal chronology p55, p56, p57. Set a proposed table relation

\[
T_i \equiv P_i+K_i\pmod {29},\qquad i=0,\ldots,255.
\]

Here the first **76** \(P_i\) are unknown LP2 p55 runes; the final **180** are first-party solved or clear runes. The source p39 red polynomial has degree two, and the p49–51 table has eight columns. A plausible compact key generator is some **unknown linear GF29 recurrence of order at most eight**, including arbitrary seeds, all coefficients, and either source-motivated degree-two register. No coefficient, exponent, clock or salt is guessed. The published original terminal positions themselves recover 180 sequential keystream symbols \(K_{76\ldots255}=T_i-P_i\). The Berlekamp–Massey algorithm determines the **minimum possible recurrence order** on those 180 terms. Therefore an order≤8 generator has no room to evade this test by choosing different secret parameters.

The original p56 printed ciphertext should normally be replaced by its independently solved 85-rune plaintext, but treating printed p56 literally is a useful *separate fixed alternative*, since the p56 cipher originally skips plaintext F. The SFT checks the source-known P56 text by replaying the original consecutive-prime-totient and literal-F bypass operation against all 85 published p56 ciphertext runes. P57 is taken verbatim from the unencrypted original. There is no fitted p56 word or alternative GP orthography.

## All 180 exact known positions and withheld prediction

| Row-major original source, same 256-byte table | First 90 known key symbols: minimum recurrence order | All 180 known key symbols: minimum order | Predicted next 90 from first-90 model |
| --- | ---: | ---: | ---: |
| 85 **solved p56 plaintext** + 95 clear p57 | **45** | **91** | **5/90** exact GP values |
| 85 **printed p56 cipher runes** + 95 clear p57 | **46** | **90** | **3/90** exact GP values |

For both source-native alternatives, even the first 90 known symbols demand a linear recurrence far above the source-motivated order≤8. On all 180, the minimum order is **91** or **90** respectively. The first 90 discovered coefficients also fail almost all of the next 90 independently untouched key symbols: first mismatch is the **very first** holdout symbol, at known-sequence index90 in both variants. These are exact finite-field identities, rather than English-frequency comparisons or an approximate language score.

The full 256 original bytes are source-hash-pinned to SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`. The author-visible table is not silently rewritten to satisfy a recurrence. Using the base60 interpretation is explicitly conditional on the independent source-factor context. The relation \(T=P+K\) is likewise a cipher hypothesis, not something Cicada instructed players to do.

## Genuine constructive p55-slot recovery plant

The [standalone Windows Node.js 22 CJS test](../sims/lp2_p50_terminal180_known_linear_key_sft.cjs) constructs a native-GP **256-rune** positive example with *exactly the same 76+85+95 terminal layout*. For the 76 otherwise unknown slots it plants the first 76 independently solved p57 runes, and uses all 85 independently solved p56 and 95 clear p57 runes at their actual known slots. The whole table is encoded with a degree-four secret recurrence and previously unknown seed:

\[
K_i+5K_{i-1}+8K_{i-2}+11K_{i-3}+17K_{i-4}=0\pmod{29},
\]

initialized with four GF29 values [7,11,13,17]. These four coefficients and initial values exist **only in the synthetic control**; they are not tried as keys on the original LP2.

The consumer is given only the last 180 known GP plaintext values and the planted table. From those it independently recovers **the exact degree-four polynomial**, achieves **90/90** withheld next-key predictions, solves the recurrence *backwards* to determine the previously unknown first76 pad values, and recovers **76/76 original-shaped planted rune values** exactly. This exercises the complete intended objective of the test: extracting p55 plaintext solely from the 180 known terminal symbols, whenever the proposed compact key architecture is actually true.

The same original-input SFT checks all published page lengths, table bytes, p56 historical decryption, both Berlekamp–Massey results, exact 90-symbol heldouts and this 76-symbol positive recovery. It passed [Windows Actions run 43660780417](https://github.com/FlareZ123/liber-primus/actions/runs/43660780417).

## Decision

The specific **row-major direct additive terminal table model with any shared linear GF29 key generator of order≤8** cannot explain the 180 independently known original runes, regardless of its seed or secret coefficients. It cannot directly unlock p55. Even arbitrary larger order recurrences fitted to the entire 180-symbol witness lack an independent source rule or a meaningful heldout prediction; a 90-order fitted generator carries effectively one free parameter for every two observations.

This says nothing about a ring/circumference transposition, an encrypted or compressed intermediate, a key with genuine nonlinear state, unknown historical infrastructure or a different location of known plaintext in the table. Those are separate undecided hypotheses. Any successor should supply a source-selected value-changing operation or a located historical key rather than another fitted recurrence or a new table orientation chosen after looking at English.
