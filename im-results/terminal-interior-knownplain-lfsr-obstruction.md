# Terminal 180-rune known plaintext does not reveal a short linear grid-key generator

**Classification (11 November 2026):** exact, all-secret-coefficient rejection of small stationary LFSR interpretations under one specified table/terminal alignment. Original LP2 plaintext is unchanged and unsolved; the tested arithmetic codec remains conjectural.

## Source-fixed known-plaintext attack

The original 32×8 byte table has one 76-cell outer circumference and a 30×6 **180-cell interior**. The last three text-bearing physical LP2 pages provide **76 p55 unknown runes + 85 p56 runes with independently solved plaintext + 95 p57 visible plaintext**. This coincidence makes a direct source-defined experiment possible: take the 180 *inner* table bytes in printed row-major order and align them, without fitting a permutation, with the 180 known GP plaintext runes from p56 then p57. The 85 solved p56 runes include the historically authentic **single non-consuming literal F** in its original prime-totient decoder; our known plaintext is the existing independently verified “AN END” text in its GP spelling, rather than a guessed 85-rune string.

A hypothetical creator might have placed the 180 known symbols inside a 256-cell ciphertext table to expose a keystream recoverable by a simple recurrence, which could then continue into the **76 still unknown outer cells**. This is a *human-solve-path hypothesis*, supported by the page/table dimensions and the solved PARABLE's “shed our own circumferences” wording. The original does not explicitly prescribe XOR, addition, recurrence, a row-local clock or an interior-first serialization.

Test two elementary **known-plaintext keystream** codecs, each with a physically legible fallback intermediate register:

- **GF29 additive:** \(K_i=(G_i\bmod29)-R_i\bmod29\), where \(R\) is either the already solved p56 plaintext followed by p57, or the published p56 ciphertext followed by p57 (a direct displayed-rune register).
- **GF256 XOR:** \(K_i=G_i\oplus R_i\), the same two choices of rune register, where rune indices 0–28 are embedded literally as bytes.

These are the four finite, original-table-derived 180-symbol streams. No original unknown plaintext or secret key is used to select a candidate.

## Exact key-independent linear-complexity decision

Berlekamp–Massey gives the **minimum possible homogeneous linear feedback order** over each field for the *entire frozen 180-symbol keystream*. Because it optimizes across all possible coefficients, rejecting short order needs no seed or tap search:

| Aligned original source register | Field and codec | Minimal contiguous recurrence order |
| --- | --- | ---: |
| Solved p56 plaintext + p57 | GF29 subtraction | **90** |
| Published p56 glyphs + p57 | GF29 subtraction | **91** |
| Solved p56 plaintext + p57 | GF256 byte XOR | **90** |
| Published p56 glyphs + p57 | GF256 byte XOR | **90** |

All are near the random-stream expectation of approximately 90 for 180 field symbols. **No recurrence with 32 or fewer taps can generate any of these four original streams** under the specified interior-unwrapped clock. The exact exclusions extend to every lower order; they are independent of secret initialization. A longer LFSR, different field encoding, different order or an unknown nonlinear generator remains possible.

## Stronger physical-row clock: every secret five-tap map fails

The above test treats the 30×6 interior as one *contiguous* 180-symbol key clock. A distinct, more layout-faithful possibility permits **arbitrary independent five-symbol key seeds at every one of the 30 printed interior rows**, but requires a shared stationary five-tap recurrence to produce that row's sixth symbol:

\[
K_{r,5}=\sum_{j=1}^{5}a_j K_{r,5-j}.
\]

For every original stream, the *first five rows* give a nonsingular GF29 or GF256 5×5 coefficient system, uniquely fixing **every possible secret tap vector**. Freeze it before looking at the other 25 rows. The sixth inner symbol of each held-out row is therefore an exact, key-independent prediction.

| Register/operation | Recovered secret taps (first-to-fifth lag) | Matches of 25 held-out rows |
| --- | --- | ---: |
| Solved GP plaintext, GF29 | [5, 16, 5, 12, 4] | **1/25** |
| Published GP glyphs, GF29 | [4, 3, 22, 25, 22] | **1/25** |
| Solved GP plaintext, GF256 | [4, 250, 51, 132, 64] | **0/25** |
| Published GP glyphs, GF256 | [145, 211, 59, 243, 249] | **1/25** |

The **very first withheld row** contradicts all four original models. This result excludes all smaller-order stationary rowwise recurrences as well, because lower-order tap vectors are a subset of the unrestricted five-coefficient family. It does not require assuming that the source row starts have zero seed; those initial states are wholly unconstrained.

## Positive-control and implementation contract

[Self-contained exact CommonJS reproducer](../sims/terminal_interior_knownplain_lfsr_sft.cjs) uses the checked-in byte table, checked-in GP corpus, and the independently authenticated p56 cleartext. It reconstructs the source 180/180 alignment, implements prime-field arithmetic and AES-polynomial GF256 field multiplication, computes Berlekamp–Massey linear complexity, and solves a different 5×5 linear system over each field. All original numbers and mismatch counts are asserted.

Each field's synthetic planted source first produces a genuine 180-symbol **order-32 linear recurrence** from an independently seeded key stream. The same minimal-order algorithm recovers the true complexity **32** rather than the original's 90/91. A separate rowwise plant creates all 30 sixth-cell symbols using a secret shared five-tap coefficient vector with arbitrary independently sourced five-symbol row states. The *same* frozen five-row solver recovers the exact planted coefficients and predicts **25/25 untouched rows**. The two positive mechanisms are deliberately separate, because an interior-unwrapped recurrence and a printed-row-reset recurrence are different hypotheses.

## Decision

The exact circumference/known-plaintext framing remains an intriguing geometric source hypothesis. **A 32-state or five-tap stationary linear key generator cannot be the missing direct decoder under either of the two simplest GP-index key codecs and either p56 register.** The relevant unexplained source operation connecting the table to 29-symbol text is still absent. Do not expand tap/seed brute-force searches on these unchanged four streams. Any further attempt should bring an independently specified nonlinear generator, traversal, register or external key and **predict actual p55 plaintext on untouched input**.

No authentic unknown LP2 plaintext, cipher key, destination, or final solve has been recovered. The overall [results synthesis](../results/README.md) is unchanged.
