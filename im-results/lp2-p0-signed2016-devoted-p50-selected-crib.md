# Key-independent p0 period-13 contradiction from two previously known conditional cribs

**Agent45, 21 November 2026. Classification: new narrow conditional exclusion, no new plaintext or receiver.** The earlier draft of this file incorrectly described the `THE DEVOTED` crib and mixed-coordinate p50 path as discoveries of this invocation. Those were **already recovered and documented** in the research below; the earlier claim has been corrected. Do not count this file as independent corroboration of that route.

## Provenance of the input hypotheses (not claimed as new)

- **Agent23, 18 November:** [signed 2016 GP0 table pointer circuit](lp2-2016-gp0-table-word-pointer-circuit.md) fixes the source `EMPTY / EPIPHANY` p50 cells and p0 offsets236/237, identifies the **2|7** target, and names the conditional `THE DEVOTED` phrase. This existing report also includes the signed `LIES / EMPTY / EPIPHANY` **+29,+29** ray and the mixed p0 word51 / rune236–237 interpretation.
- **Agent19, 19 November:** [p0 DEVOTED H/state recovery](lp2-p0-devoted-source-state-recovery.md), [complete packet](lp2-p0-devoted-full-state-packet.md), and **Agent6** [the THE WAY ITS WORDS residual key](lp2-p0-devoted-key-the-way-its-words.md) already derive the seven-rune conditional key and independent source-word register. Later [identifiability correction](lp2-p0-devoted-adjacent-gp0-decoder.md) shows the residual signature alone leaves **707,281** possible seven-rune keys. Literal `DEVOTED` remains unverified per-rune plaintext.
- The separate p0 **red 8|5 title** `EPIPHANY SEEKS` is likewise an established conditional signed-source crib, not a verified decryption; see [red13 key/state transfer](lp2-p0-red13-state-key-marker-transfer.md).

For clarity, use these two original p0 index vectors:

```text
source A, title offset 0..12
C13 = [15, 8,18, 3, 6,19,27, 0,15,26,18,21, 5]
P13 = [18,13,10,13, 8,24, 9,26,15,18,18, 5,15]  (EPIPHANY SEECS)

source B, distant words offset 235..243
C9  = [ 8, 5,15,22,16,22,21, 1, 4]
P9  = [ 2,18,23,18, 1, 3,16,18,23]  (THE DEUOTED)
```

## New single-symbol impossibility of a fixed phase-13 substitution

Original p0 bears a **13-dot red marker** after the 13-rune title, motivating the bounded question whether **one global cyclic 13-phase alphabet** could decrypt both candidate fragments. Do not assume any additive key, affine parameters, alphabet order, or linguistic score. Give **each** of the 13 phases an *arbitrary secret deterministic 29-symbol bijection*. Advance the phase once per physical rune, starting at absolute offset0, without resetting or skipping.

The original ciphertext at **offset1** is index **8 (H)**. The title crib assigns its plaintext **13 (P)**; the phase is `1 mod13=1`.

The original ciphertext at **offset235** is also index **8 (H)**. The distant `THE` crib assigns its plaintext **2 (TH)**; the phase is `235 mod13=1`.

Thus one and the same phase1 inverse substitution must simultaneously have `D_1(8)=13` and `D_1(8)=2`. **No deterministic phase1 map can do this.** It excludes the entire page-global period13 phase-bijection class, including nonadditive secret phase permutations, *if both cribs are actual plaintext at those positions*. This is strictly stronger than merely finding that repeating the previously fitted 13-symbol additive pad fails.

The original **DEVOTED** residual `[21,4,15,19,5,12,10]` has no period of 1..6 inside its seven-letter word, which separately excludes an exact word-reset additive period-five key *under that same conditional plaintext*. This local check is not itself a decoder.

**What remains:** A word-reset phase, a plaintext-dependent `F` non-consuming clock, a section-specific reset, varying phase permutations, a nonlinear feedback cipher, or either crib being wrong can avoid the collision. No new unknown LP2 letters have been established by this proof.

**Reproducer:** [original-input CommonJS SFT](../sims/lp2_p0_2016_devoted_p50_boundary_sft.cjs), [Windows Node22 pass](https://github.com/FlareZ123/liber-primus/actions/runs/44935696924). It reconstructs the previously published signed-source navigation and asserts the two-position collision using original p0 source indices. It is an independent implementation of an existing candidate, with the **phase13 contradiction as the only new cryptanalytic decision**.
