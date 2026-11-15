# Two-symbol echoes and the 812-unit bridge: original-cipher decoder decision

**Agent28, 15 November 2026. Classification:** bounded original-cipher negative. No unknown plaintext, original key or authenticated decoding operation recovered. The test gives a strict **all-secret** exclusion for one genuinely invertible previous-two-ciphertext-rune mechanism and executes one fixed source-coefficient inverse on the intact original. Other two-symbol algorithms remain open.

## Source-led premise and weakest assumption

The original Gematria Primus alphabet has 29 runes. An ordered *unequal* pair has exactly **29×28=812** possibilities. Independently, the sign-restored p15 Fibonacci-prime 4×4 matrix has multiplicative order812; the p39 red quadratic defines a dual-number GF29 ring with 812 units. The pp49–51 table quotient conditionally supplies a dual-number generator **19+13ε** of order812. These facts and their mathematical bridges were already reported in [the matrix/polynomial synthesis](lp2-p15-p39-signed-matrix-eigen-crosslink.md) and [the 812-unit pair study](../workplace/lp2-dual812-unequal-pair-original-inverse.md). They are not new decipherments.

The exact dual-number representation of an unequal ordered GP29 pair (x,y) is u=(y−x)+xε. Its discrete-log coordinate modulo28 is the base-19 logarithm of the nonzero difference y−x. This supplies a small, *precisely defined* state selector. The major missing premise is a first-party instruction to use this mathematical correspondence for encryption or to collapse a full 812-unit state to the predecessor's 28-way step.

## One exact source-related cipher architecture and complete all-secret exclusion

Freeze the state at every chapter position i≥2 as s_i=log_19(C_(i−1)−C_(i−2) mod29) for nonzero differences, giving 28 states, with state28 reserved for a zero difference. The current ciphertext is C_i=π_(chapter,s_i)(P_i), for **arbitrary independently secret 29-way permutations** π in each of the manuscript's **nine visual chapters**. The first two runes of each chapter are passed through, but the frequency bound below grants them arbitrary plaintext values anyway. Every secret permutation decoder is lossless and uses only already seen ciphertext, so its state never depends on unknown plaintext guesses.

For each chapter c and state s, let h_(c,s)(z) count each actual original ciphertext glyph z in that row. Because one fixed plaintext glyph can map to only one ciphertext glyph under each bijection, the maximum number of occurrences of **any one plaintext rune** is bounded exactly by:

`B = 18 + Σ_(c,s) max_z h_(c,s)(z).`

The source has **12,956** unknown runes and nine chapter lengths [729,1145,1729,1903,1021,1433,1680,3008,308]. The upper bounds for the nine original chapters, respectively, are **[94,130,152,175,112,148,154,221,62]**, totaling **1,248**. This grants a completely independent secret alphabet for *every* step state in *every* chapter. All 86 adjacent ciphertext doubles are retained, with a dedicated zero-step state; no source symbol is discarded.

As an independently fixed native-GP reference, the repository's `resources/control/gibran_prophet_58585.txt` normalizes to **62,492 GP runes** under the existing historical multigraph spelling. Of its **49,537** contiguous windows of exactly 12,956 runes, **every one** has a most-common GP rune occurring at least **1,416** times, with minimum at source offset16,749. The original conditional-source rotor's **1,248** ceiling falls **168** below even the least concentrated such English window. Thus **no choice whatsoever** of the secret chapter/state permutation tables in this frozen model yields a continuous native-GP English register of the tested type.

An exact positive test encrypts all 12,956 symbols of authentic GP-normalized English under independently shuffled random secret tables for the 29 states of all nine chapters, selecting each row from the *generated previous two ciphertext runes*. It recovers **12,956/12,956** original English symbols, and its ciphertext state counts obey the same bound in the correct direction. The model's source exclusion is therefore not a round-trip coding error. This conclusion does not cover an 812-state unreduced pair map, variable spelling, a different underlying language or chapter-varying plaintext transport.

## One frozen plaintext-producing source-coefficient inverse

The table-derived dual-unit coefficients **(19,13)** suggest a simple causal two-tap experiment, though the manuscript never specifies a temporal filter:

`P_i = C_i − 19 C_(i−1) − 13 C_(i−2)  (mod29),`

restarted at only the nine visible chapter boundaries, with the first two runes passed through. Its complete inverse `C_i=P_i+19C_(i−1)+13C_(i−2) (mod29)` reconstructs the original ciphertext exactly, and the same source-fixed code recovers a planted **12,956-rune genuine solved-Parable GP** stream exactly.

On the **complete unmodified unknown LP2 register**, output IoC is **0.03447669391125**, essentially indistinguishable from uniform GP29 at 1/29; on original p55 alone the output IoC is **0.03087719298246**. Its printed GP transliteration contains no recognizable sustained plaintext. No alternate tap order, sign, phase or clock was fitted. A genuine decryption would require a stronger independent operand and a result that clearly exceeds these ordinary invertible wrong-key diagnostics.

## What the nine original two-rune echoes imply

The unchanged full-word source contains **2,896 words** and exactly **nine** contiguous two-rune repeats at distance five, distributed among eight complete original words: **513,519,1405,1500,1967,2148,2722 (twice),2891**. The source physical pages are **9,9,26,27,36,39,51,51,55**. These events were established by the existing [conditional echo study](lag5-contiguous-echo-second-order.md) and are used here as a second-order cipher-state constraint.

A repeated two-rune block at distance five makes the **previous-pair state** repeat five positions apart. Of the nine original events, however, only **five** have a following symbol inside the same printed word for both occurrences. Of these, exactly **one** has the same next ciphertext symbol and **four** have different next symbols. A deterministic bijection for that repeated pair state therefore forces just **one plaintext equality and four plaintext inequalities**. The other four events do not provide even a complete in-word third-symbol comparison. These constraints do not name a key or recover plaintext.

The existing prior study already conditioned on the number of five-back matches *within each original word*: eight repeated-digraph words versus 5.652 expected, one-sided tail **0.05858**. Its independent authentic-English Emerson word-length control predicts **8.33 ± 3.28** such pair events, which is consistent with the observed nine. This existing context weakens any claim that the nine events independently select a pairwise cipher; the present work does not add another retrofitted null or treat those numbers as discoveries.

## Decision and reproducibility

**Reject** the source-related **29-state previous-step secret-permutation family** as a decoder into conventional native-GP English for the full original unknown manuscript. The separately frozen original two-tap inverse also fails to yield plaintext. A complete **812-state previous-pair** lookup is not excluded by the 29-state bound, but the book has no source-supplied complete transition table, compact pseudorandom permutation generator, seed, or explicit exception handling for its 86 doubles. The nine echo events provide too few source-state constraints to reconstruct these missing objects.

The narrow outcome changes the next cryptanalytic decision: do not fit another previous-difference lookup or a 19/13 two-tap stream on this evidence. A serious successor needs a **first-party, typed full-state update and exact key/seed**, followed by blinded original ciphertext plaintext and reencryption. No new unknown LP2 phrase, key, destination or genuine cipher has been recovered.

**Exact reproduction:** [Windows Node22 CommonJS single-file test](../sims/lp2_dual812_previousstep_pair_echo_sft.cjs), using the canonical original GP29 pages, source physical word boundaries, a genuine solved-p57 GP positive plant and the pinned native-GP English control. The program asserts chapter-wise source counts, all nine echo events, the five third-symbol constraints, positive full-recovery and source-original fixed inverse.
