# Exact all-secret 16-state Fibonacci singleton inverse on original LP2

**Bounded decision, 22 November 2026 (Agent9):** The original 83 authentic single-rune printed words exclude a *continuous or chapter-restarted, shared-secret*, GF(29) lag-(5,16) Fibonacci keystream under two specified reversible encryption formulas, even after granting **all 29^16 initial states**. This is an exhaustive negative for the declared models. **No unknown LP2 plaintext or original authored key is recovered.**

## Independent source cue, hypothetical mechanism, and rival

The p15 original physical page (32.jpg) prints a 16-cell Fibonacci-prime spiral beginning at red 3299; a matching five-dot stencil occurs on p7, p23 and solved-encrypted p56. Their *speculative* simplest combination is a 16-state GF29 lagged-Fibonacci stream with feedback taps 5 and 16. Neither original illustration specifies that operation or applies its stream to GP29.

Let S[0] ... S[15] be **arbitrary secret values** in {0,...,28}, with S[n]=(S[n-5]+S[n-16]) mod29 thereafter. The two receiver candidates are:

- **ADD:** C[n] = P[n] + S[n] (mod29).
- **DIFF:** C[n] = C[n-1] + P[n] - S[n] (mod29), with C[-1]=0 at any reset.

Two clocks are frozen from physical boundaries: **one continuous rune clock** over all 12,956 unsolved positions, and **nine illustrated chapter resets** at physical p0, p3, p8, p15, p23, p27, p33, p40, p54, each reusing the *same* unknown 16-state seed. The reset model restarts the key and the DIFF ciphertext predecessor. Physical p50 contains no runes and advances neither clock. Thirty-two genuine cross-page words remain intact.

A **conditional plaintext assumption** takes the entire 83 authentic one-rune printed words to be GP29 A=24 or I=10. Separately, a generous alternative permits O=3. Original printed word boundaries may instead serve an encrypted framing role; if so, this assumption may be false. Independent chapter-private keys and nonlinear transforms lie outside the test.

## Exact all-secret calculation

The canonical original parser matches 12,956 original ciphertext runes, 2,896 printed words, 32 cross-page carried words and exactly 83 singleton words. For each singleton position t and proposed plaintext p, the cipher fixes:

- ADD key S[t] = C[t] - p (mod29).
- DIFF key S[t] = C[t-1] + p - C[t] (mod29), using zero at the selected reset.

The 16 GF29 stream-response rows at the **first 16 true singleton positions have rank16** under each of the two reset conventions. Consequently the permitted 16 plaintext choices identify all initial seed values algebraically. Every seed capable of matching the full 83-site original mask belongs to the exact enumeration of 2^16=65,536 (A/I) or 3^16=43,046,721 (A/I/O) first16 assignments, even though **29^16=250,246,473,680,347,348,787,521** secret 16-states are possible a priori.

Modular Gaussian elimination transforms the remaining 67 untouched singleton observations into linear equations over those first16 response values. The executable SFT enumerates two 8-site halves with precomputed modular partial sums, tracking all survivors at each source-original crib position.

| Clock | Cipher | Singleton alphabet | First16 cases tested | Longest original compatible prefix | All83 survivors |
|---|---|---|---:|---:|---:|
| Continuous | ADD | A/I | 65,536 | 20/83 | 0 |
| Continuous | ADD | A/I/O | 43,046,721 | 26/83 | 0 |
| Continuous | DIFF | A/I | 65,536 | 20/83 | 0 |
| Continuous | DIFF | A/I/O | 43,046,721 | 24/83 | 0 |
| Nine shared resets | ADD | A/I | 65,536 | 20/83 | 0 |
| Nine shared resets | ADD | A/I/O | 43,046,721 | 23/83 | 0 |
| Nine shared resets | DIFF | A/I | 65,536 | 19/83 | 0 |
| Nine shared resets | DIFF | A/I/O | 43,046,721 | 23/83 | 0 |

Every A/I/O candidate is eliminated by original observation 27 or earlier, long before the remaining 56+ printed single-letter positions. This is independent of longer-language scoring.

## Eight planted forward/inverse/key-recovery controls

Eight original-shaped GP29 plants were constructed from known solved original p57 runes repeated to 12,956 positions, with precisely the 83 source singleton slots overwritten by predeclared A/I or A/I/O text. The private test seed was frozen to the visible p15 16-term spiral reduced mod29. For both cipher models, both clocks and both alphabets, all eight controls:

1. Encrypt all 12,956 positions, decrypt them exactly and replay the full ciphertext.
2. Recover **the unique actual 16-state seed** solely from the 83 sparse one-rune crib positions.
3. Reject a separately changed wrong-seed value.

These synthetic controls establish exact inference correctness when a key exists. They are **not original unknown-page decryptions**.

The test is genuinely different from closed #1199's prime-of-printed-word-index affine key and closed #1380's *single fixed* p15 16-value lagged-Fibonacci initial state. It grants **every** compatible 16-state seed, plus the common-key visible chapter restarts. It does not exclude chapter-private seeds, a source-specified external key, variable clocks, F-transparent skips, changed plaintext word breaks or other nonlinear operations.

## Additional chapter-private p0 attack: a signed-source 13-rune heading hypothesis

The 2016 signed Cicada phrase **EPIPHANY SEEKS** offers an unusually specific *conjectural* crib for p0's original red **8+5-rune** opening. GP29 convention renders the K sound as rune C, giving the 13 indexed GP plaintext symbols **EPIPHANY SEECS**. The later signed clue has not been proved to describe the original red text. We therefore test this as a bounded conditional inverse, rather than authentic unknown plaintext.

The visible red phrase fixes the first 13 secret lag-(5,16) stream positions on **p0 alone** under either ADD or DIFF. Source parsing identifies p0's only two **genuine complete one-rune words** at local positions 176 and 244. The third local one-rune fragment at p0 offset261 continues onto p1, so is deliberately excluded as a false A/I crib. If the true complete one-rune words are A or I, they impose two independent GF29 linear equations on the three remaining initial stream values. Four A/I assignments and exactly one free GF29 digit yield **4×29=116** complete private-key candidates *per cipher*, **232** fully reproducible original p0 inverses in total.

None of these 232 inversions yields coherent text past the conjectured 13-rune heading. To avoid classifying solely by uniform-letter statistics, a fixed 43-word common-English glossary was applied to the **56 complete original p0 words after the heading**, excluding the carried final fragment. The best original ADD inverse contains **3/56** glossary words and the best DIFF contains **5/56**. The exact same glossary over all **127 consecutive 56-word windows** in independently known clear LP1 rune prose, original physical pp9–12, finds **23–31** glossary words. Those solved-control ranges are a language plausibility diagnostic, not a mathematical impossibility theorem; a wholly unusual prose register or false heading can invalidate the comparison. Maximum post-heading GP29 IoC over the original seeds is only **0.038509** (ADD) and **0.037829** (DIFF).

An original-shaped 262-rune planted positive was generated independently for each cipher using source-native clear LP1 runes, imposing the 13-rune heading and two genuine A/I singleton positions, encrypted under the source-visible p15 sixteen values as a private seed. Each 116-candidate inverse set recovers the true complete key and plaintext exactly, with wrong-seed rejection and full forward replay. The **conditional** source-linked private-p0 extension therefore also provides no original plaintext and needs no enlarged arbitrary-seed search.

- [Original p0 finite-crib CommonJS SFT](../sims/lp2_p0_epiphany_13crib_fib16_inversion_sft.cjs).
- [Successful Windows Node22 original + native-LP1 calibration + two planted positives](https://github.com/FlareZ123/liber-primus/actions/runs/44982007268), source [commit c6b0e15](https://github.com/FlareZ123/liber-primus/commit/c6b0e15ba4a3ac072b27a2302b5e5c90e296466c).

**Combined decision:** Reused book-global/chapter-reset secret lag-(5,16) under either ADD/DIFF is excluded by exact original singleton contradictions, independent of the p0 heading guess. Private p0 lag-(5,16) under the conjectural signed red-heading crib is independently exhausted and does not recover prose. The unselected stream mechanism and the crib are separate assumptions. Their failure should move attention toward an actual author-selected original-value-changing operation instead of enlarging this specific seed space.

## Reproduction and next decision

- [CommonJS original-source SFT](../sims/lp2_singleton_fib16_allseed_original_sft.cjs).
- [Successful Windows Node22 run, eight original exclusions and eight planted 16-state key recoveries](https://github.com/FlareZ123/liber-primus/actions/runs/44981136537); source [commit 5b57f060](https://github.com/FlareZ123/liber-primus/commit/5b57f0601127fbc183c3c1b038b108077159896d).
- Source and neighboring decisions: [original corpus](../resources/liber-primus/lp2-corpus.json), [p15 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md), [original singleton prime-word gate](lp2-singleton-primeword-crib-constraint-gate.md), [shared inversion frontier](../workplace/integrated-original-inversion-challenge.md).

**Decision:** Original singleton contradictions exclude the entire declared reused-seed 5/16 stream family. The independent conditional p0 red-heading crib/private-seed experiment also fails its finite 232 possibilities, without identifying the heading as authentic plaintext. Preserve these source constraints for a future author-selected operation. Do not rescue either model with unmotivated tap, phase or word exceptions.
