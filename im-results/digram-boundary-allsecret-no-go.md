# LP2 punctuation is not a stationary digram lookup of visible runes

**Scope, 10 November 2026:** an exact, key-independent exclusion of **visible-rune-conditioned deterministic separator tables**, with arbitrary secret tables in each stated public state. It does not recover LP2 plaintext, an authentic key or an intended punctuation grammar. Fully reproducible CommonJS [source-native SFT](../sims/digram_boundary_anykey_gate.cjs).

## The proposed interpretation and its decisive test

A possible explanation for the original manuscript's low word-length adjacency dependence and rare cross-word repeated runes is that printed separators were inserted by a small rule operating on the visible ciphertext. The most permissive stationary two-rune instance is

\[
B_i=f(C_i,C_{i+1}),\qquad f:\mathrm{GP29}^2\longrightarrow\{0,1\}.
\]

Here \(B_i=1\) exactly when the **original transcription** has a word-separating \`-\`, \`.\`, \`&\`, \`$\` or \`§\` between the two runes. Physical page and line breaks are not word separators. The table \(f\) can be **any of the \(2^{841}\) binary tables**; the test makes no guess about its secret key. There is one test opportunity for each physically adjacent rune pair on the 55 rune-bearing unsolved pages: **12,901** adjacent pairs, of which **2,873** have an intervening printed separator. The original **12,956 runes** are unchanged.

For any observable state \(z\), group the original instances of each \((C_i,C_{i+1},z)\) and count its marked and unmarked occurrences \(n_1,n_0\). The exact minimum number of required changes in original separator decisions, **across every possible secret lookup table**, is

\[
E_{\min}=\sum_{(a,b,z)}\min(n_0(a,b,z),n_1(a,b,z)).
\]

This is a sharp combinatorial identity: assign each lookup state its majority class. One state seen with both labels is already an absolute contradiction to a lossless deterministic lookup. This does not require a GP-English language model, an estimated p-value, recovered plaintext, or a cipher inverse.

## Original-source results

| Secret table can depend on | Occupied states | States with conflicting separator labels | Exact minimum changed decisions |
| --- | ---: | ---: | ---: |
| Current ordered GP29 digram only | **840** | **796** | **2,863 / 12,901** |
| Digram + raw source section (9 independently keyed tables) | 5,405 | 1,751 | **2,091** |
| Digram + rune-bearing physical page (55 tables) | 11,158 | 586 | **589** |
| Digram + global rune offset mod **8** | 5,673 | 1,798 | **2,028** |
| Digram + offset mod **13** | 7,428 | 1,507 | **1,596** |
| Digram + offset mod **29** | 9,975 | 910 | **922** |
| Digram + offset mod **32** | 10,160 | 874 | **887** |
| Digram + offset mod **59** | 11,379 | 508 | **508** |
| Digram + offset mod **79** | 11,684 | 400 | **400** |
| Digram + offset mod **128** | 12,122 | 263 | **265** |
| Digram + offset mod **256** | 12,477 | 149 | **149** |

The SFT additionally records fixed-period 2, 3, and 5 results, and counts all 840/841 source-observed ordered digrams. Under one globally stationary secret table, the all-zero rule makes 2,873 mistakes; the **optimal arbitrary secret table saves only 10 mistakes**. Only three original marked positions occur in digram states with no contradictory unmarked instance.

The **section-local** test uses the transcription's inherited \`$\` section breaks. The competing p33 ink-heading clock moves 91 runes and 23 words between two sections; neither clock is known to represent a cipher reset. The **global** and **page-local** results do not depend on this section ambiguity. The period tests use global rune offsets; the listed periods are finite source-motivated probes, not a claim that the original has any such clock.

A planted source-native deterministic separator rule \(f(a,b)=1[(a+3b)\bmod29<7]\) generates **3,100** marked original digram opportunities and obtains **zero** conflicts and **zero** changed decisions with the exact same routine.

## How much local ciphertext context would suffice?

Independently secret stationary lookup tables on longer **visible** rune windows have these exact original-input bounds. Windows are required to lie on one physical page, hence slightly differing sample sizes:

| Local context around the possible gap | Opportunities | Occupied contexts | Minimum changed decisions |
| --- | ---: | ---: | ---: |
| Two runes: immediately left and right | 12,901 | 840 | **2,863** |
| Three: one extra left rune | 12,846 | 9,886 | **934** |
| Three: one extra right rune | 12,846 | 9,886 | **922** |
| Four: one extra on each side | 12,791 | 12,668 | **43** |
| Five: two extra left, one extra right | 12,736 | 12,730 | **1** |
| Six: two extra on either side | 12,681 | 12,680 | **0** |

The six-rune result is effectively **interpolation** because virtually every observed context is unique. It provides no evidence of an actual six-rune delimiter cipher: an arbitrary giant codebook would need to be acquired independently. This illustrates why merely finding an unrestricted grammar fitting the source would be insufficient.

## Cryptanalytic consequences

This closes a concrete simple possibility: the printed word breaks are **not recoverable losslessly from a single secret, stationary GP digram table**, nor from any table with a frozen clock in the tested 2/3/5/8/13/29/32/59/79/128/256 global-period family. Even allowing a wholly independent arbitrary lookup table per page leaves 589 exact conflicting observations. An original-cipher candidate that discards punctuation cannot reconstruct the source's separator positions from these particular short contexts alone.

A different reading remains possible: punctuation may survive plaintext segmentation, derive from a hidden evolving state, encode independent data, depend on longer context, or be introduced by an encryption process using unobserved plaintext. This gate cannot decide whether printed spaces themselves are authentic English spaces. It complements the [two-rune affine boundary study](word-boundary-affine.md), [cross-word anti-repeat result](cross-word-anti-repeat-constraint.md), [word-length dependence](wordlength-order.md), and [original quote spans](../resources/liber-primus/lp2-quote-punctuation-spans.json). None supplies a source-identified key yet.

**Reproduction:** run \`node sims/digram_boundary_anykey_gate.cjs\` under Node.js 22 from the repository root. It reads only \`resources/lp2-transcription.txt\` and \`resources/liber-primus/lp2-corpus.json\`, asserts the exact source count and headline bounds, performs the independent planted-rule control, and writes no files.
