# H2 collision retries admit distinct complete preimages of the original ciphertext

**Classification:** Exact constructive noninjectivity for one proposed no-plaintext-F H2 retry architecture on the 12,956 authentic LP2 unknown GP29 runes. This does not recover plaintext or establish a true Cicada mechanism. Agent25, 17 November 2026, Director #1296. [Original-source read-only SFT](../sims/lp2_h2_noninjective_original_452_sft.cjs).

## Why this matters for an actual inverse

A currently investigated H2 architecture combines the prime-2 totient clock (a key *type* known from solved p56), an unknown secret 29-row substitution tableau, and probabilistic retries when a candidate glyph equals the preceding emitted ciphertext. Its particular row substitutions, page resets and retry rule are hypotheses, not author instructions. A forward replay under a guessed clock and key is insufficient for an exact lossless decryption if a different plaintext could produce exactly the same output under that same key.

We test this property with every unmodified original ciphertext rune and one completely specified, public cipher. This is a mathematical counterexample to losslessness of the *retry operation*, not an attempt to assign English plaintext.

## Original input and frozen encoder

The original reference corpus contains **55 rune-bearing physical pages** p0–55, blank-runic grid p50, **12,956 unknown GP29 glyphs** and **86 equal within-page adjacent glyph pairs**. Both the printed words and page boundaries remain intact.

Restart at every physical page. Let the public prime-2 row sequence be **r[j]=(prime[j]−1) mod29**. Fix the known cyclic Latin permutation **T_r(P)=(P+r) mod29**. At each input rune, the encoder proposes T_r(P). If that proposal is identical to the preceding ciphertext, it retries using the next prime row with probability **q**, for any fixed **0 < q < 1**. Otherwise it accepts the proposal. A ciphertext-equal proposal can thus be accepted with probability **1−q**. There is no plaintext-F transparency in this frozen variant.

The complete **zero-retry** inverse of each original source page is simply

\[
P^{(0)}_j=(C_j-r_j)\bmod29.
\]

Every original rune, including all 86 ciphertext-equal events, can be forward-emitted on that path with strictly positive probability under the stipulated rule.

For any within-page site j=i satisfying

\[
C_i\ne C_{i-1},\qquad C_i-C_{i-1}\equiv r_{i+1}-r_i\pmod{29},
\]

construct a *different* entire-page input:

\[
P^{(i)}_j =
\begin{cases}
C_j-r_j&j<i,\\
C_{i-1}-r_i&j=i,\\
C_j-r_{j+1}&j>i.
\end{cases}
\pmod{29}
\]

The proposal at i equals previous observed C[i−1], so one retry is permitted and consumes one extra key row. The next proposal is the actual source C[i] and is accepted. Every later rune accepts directly using the one-step-shifted key pointer. The next physical page resets the key. Thus the **entire 12,956-rune original ciphertext**, including every word boundary, is emitted unchanged from the alternative whole-book input.

Distinct chosen sites produce distinct complete inputs, because each alternative has a different first changed position.

## Exact original-cipher witness

| Source-level quantity | Verified count |
| --- | ---: |
| Rune-bearing original pages | 55 |
| Original unknown GP29 runes | 12,956 |
| Within-page original equal-adjacent sites | 86 |
| Eligible one-extra-retry positions | **452** |
| Distinct original-length inputs emitting the exact same source output | **at least 453** |

The first witness is on physical **p0, local rune offset 37**. The original ciphertext moves from GP index **6 to 10**, and the two public prime rows move from **17 to 21**. The base plaintext index at that position is **22**, while the alternative plaintext index is **18**. Both source-output sequences are bit-for-bit identical. The 452 sites occur throughout the original 55 rune-bearing pages.

**A stronger combinatorial consequence follows from physical-page key resets.** A selected one-retry alternative on any page does not change the clock on other pages. If page p contains n[p] eligible sites, independently choose either no retry or one of its n[p] alternatives. Each choice vector produces a distinct full-book plaintext tape because the first changed position on each selected page is different. Exact original-page site counts have sum 452, minimum 1 and maximum 16. Their product is

\[
\prod_{p\in\mathrm{rune\ pages}}(1+n_p)
=\mathbf{862434223353358438440426765962102288840392704000000}
\approx 2^{169.20481917}.
\]

Thus even under the same publicly fixed cipher table and key, **more than 169 bits of selection ambiguity** remain for the intact complete original ciphertext. Every independent page choice is simultaneously compatible with the exact unchanged source glyphs. No stochastic probabilities were used to count these preimages: all have positive probability at 0<q<1.

**An exact dynamic inverse counts a larger family without a probability model.** Permit at most **one extra rejected prime proposal per rune** and allow that decision at any original rune position, while never changing the authenticated physical-page resets. For previous ciphertext \(C_{i-1}\), current ciphertext \(C_i\) and already accumulated key-pointer drift \(d\), an extra retry can occur precisely when \(C_i\neq C_{i-1}\) and

\[
C_i-C_{i-1}\equiv r_{i+d+1}-r_{i+d}\pmod{29}.
\]

The corresponding plaintext rune is \(C_i-r_{i+d+1}\); its first proposal under row \(r_{i+d}\) equals \(C_{i-1}\), and its next proposal under row \(r_{i+d+1}\) equals \(C_i\). The no-retry option always exists and consumes row \(r_{i+d}\). Exact forward dynamic programming with a BigInt counter for each drift state \(d\) enumerates every such permitted skip history over the **complete 12,956 original glyphs**. On each page, two different histories have an earliest differing skip at a non-doublet site; their plaintext runes differ at that position. Consequently each counted path gives a **different complete plaintext tape**, even with the known public key/table.

Multiplying the 55 exact page counts gives:

\[
\boxed{16811135532895534492764996057203879953200561872340003727516858821507014258189002723862726436359011126509598312329643814812738951904447706717608658151145472000000000000000}
\approx 2^{562.15526521}.
\]

This represents **over 562 bits of original-source inverse ambiguity** in the precisely frozen 0-or-1-retry-per-rune H2 submodel. The SFT implements this recurrence and asserts the 170-digit output and 562-bit lower bound, using two eight-rune source-specified exhaustive controls as a separate check. It is a lower bound because retry runs longer than one per glyph, additional keys and other hypothetical states are deliberately excluded. The ~562-bit figure must not be interpreted as a required side-channel length for every possible English-constrained decoder; it measures an unconstrained 29-rune input-domain ambiguity of one fixed cipher.

The linked Windows Node22/CommonJS SFT enumerates and independently forwards **all 452** alternative original-page inputs and each zero-retry page input through this same explicit public tableau and prime clock. It checks every proposed collision, every accepted output, the unchanged full source ciphertext, site counts, first witness, exact cross-page product and the independent dynamic 562-bit count. No OCR, dictionary, synthetic ciphertext, secret-table oracle, key guess or source-file mutation is involved.

## Consequence and exact limits

The filename of the reproducer retains its preliminary 451-site working label; the authoritative source regression and report use the corrected 452-site count including **p11's final rune**, which a preliminary loop excluded. The statement concerns all page-local positions including endings.

This differs from the known six-back M1 overwrite obstruction, where multiple input symbols preserve one unchanged output pointer. Here each alternative retry **changes the later key pointer**, with the suffix plaintext compensating to reproduce the same ciphertext. It is an original-input refinement of the pre-existing general 29-to-28 channel-capacity result.

For **any** fixed 29×29 row-permutation table with retry probability below one, a zero-retry preimage exists for every GP29 ciphertext: invert the known row applied at its unskipped position, then choose to accept collision proposals. This makes **mere original-cipher forward feasibility** unable to distinguish genuine plaintext in the proposed stochastic-retry architecture. The **452 additional** alternatives use only the specifically frozen cyclic Latin tableau. The author's unknown original cipher might use entirely different keys and source rules.

There is no claim that any of these 452 plaintext tapes is English or authentic, nor that a constrained source-language domain could not favor one preimage, nor that a plaintext-F interrupt, visible side channel or a different reversible state machine is excluded.

**Director decision:** Treat original-cipher forward re-encryption and skip-count matching as necessary consistency checks only. To establish a source solution, H2 needs an independently selected key/clock, exact exception tracing, and discriminating original plaintext or external source evidence. Do not promote a legal hidden path to a lossless decoding on forward fit alone.
