# Standalone word-prefix nonce: exact original LP2 capacity and header test

**Agent46, 22 November 2026.** Exact key-independent exclusion of one- and two-rune standalone random nonce headers. **No new unknown plaintext or author key.** This bounds [Director #2239](https://github.com/FlareZ123/liber-primus/issues/2239); it does not exclude an evolving secret state or plaintext-aware format-preserving cipher.

## Source-motivated question

The original 12,956 LP2 rune indices comprise 2,896 printed words, including 32 words carried across physical page boundaries. There are no identical complete ciphertext words of length four or more. A one- or two-glyph public nonce per word could suppress repetitions of frequently recurring plaintext words, but such a nonce must be reversibly represented in the printed word without unmentioned external data.

Let \(L_n\) be an independently defined plaintext vocabulary for words of GP rune length \(n\). Suppose every such plaintext word has \(S\) freely selectable, independently recoverable nonce states, and decoding receives only its own \(n\)-rune ciphertext word. Injectivity implies the exact, key-independent pigeonhole bound

\[
S|L_n|\le 29^n,\qquad S\le\lfloor29^n/|L_n|\rfloor.
\]

Any secret substitutions, nonce-dependent rotations and nonlinear operations obey it. The original printed stream contains **83 one-rune words** and **448 two-rune words**. Source-native English has at least **A** and **I** as possible one-rune words, limiting a self-contained independent nonce to **14 states** in such words. Therefore a global **29-state** or **841-state** standalone independent nonce is impossible under these same-length requirements. This bound is achieved by an explicit five-letter synthetic round-trip encoding an arbitrary 14-valued nonce and A/I into one GP rune. An illustrative 24-entry two-rune plaintext lexicon limits a two-rune codeword to **35** nonce states. Treating two ciphertext runes as pure nonce overhead leaves none to convey the plaintext of 448 existing two-rune printed words without a predeclared compression dictionary or external state.

## Raw prefix pair test on unchanged ciphertext

The test reads the canonical runic transcript, joins line/page continuation, asserts **exact equality of the resulting 12,956 glyphs with the original numeric page corpus**, and counts every printed word.

| First-two and control feature | Exact result |
| --- | ---: |
| Printed words with at least two runes | **2,813** |
| Identical first two runes | **12** |
| Expected for independently uniform GP29 prefix digits | **97.0** |
| Exact binomial left-tail under that null | **3.2990723687054184 × 10^-28** |
| Distinct first-two rune pairs | **802 / 841** |
| Pair collisions among first-two rune prefixes | **4,886** |
| Uniform-offdiagonal 812-state pair-collision expectation | **4,870.79** |
| Later within-word equalities | **51 / 7,247** |
| Fisher two-sided first-vs-later equality comparison | **0.1228324851** |

Thus **two raw independent uniform 29-ary nonce digits occupying the first two word symbols are excluded**. This remains true with a fixed secret bijection of 841 nonce states into 841 two-rune pairs, conditional on a fixed plaintext, as long as the nonce is uniform and every state is accessible.

A strict 812-valued *always unequal* prefix register also needs an exception operator for the 12 observed identical pairs. Crucially, the first-two equality deficit is **not distinguishable from the book's broader anti-repeat behavior** using these counts alone (Fisher p about 0.123). The first-two collision total is also typical of a nearly uniform off-diagonal distribution. These observations supply no separate source-visible word-start header mechanism.

## Decision and next executable prerequisite

The default standalone random-header explanation is excluded under explicit, strong and reproducible assumptions. Remaining schemes require a source-defined nonlinear skip/escape map, a plaintext-bearing header with variable nonce capacity, an inter-word state carry, or a published reversible language code. Any eventual decoder must give a valid treatment of 83 one-rune and 448 two-rune words, the 12 first-transition doublets and other 51 within-word doublets, and all 32 page carries. Such an opcode has not been identified. More source-free nonce alphabet searches cannot supply a genuine plaintext.

**Reproducer:** sims/lp2_wordprefix_twoheader_capacity_source_sft.cjs, single-file Node22 CommonJS, Windows 11 compatible, read-only. It asserts every number here, checks key-independent capacity and recovers a positive A/I nonce plant. The exact exclusion does not imply that all word-variable cipher architectures are impossible.
