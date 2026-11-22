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

## Reproduction and next decision

- [CommonJS original-source SFT](../sims/lp2_singleton_fib16_allseed_original_sft.cjs).
- [Successful Windows Node22 run, eight original exclusions and eight planted 16-state key recoveries](https://github.com/FlareZ123/liber-primus/actions/runs/44981136537); source [commit 5b57f060](https://github.com/FlareZ123/liber-primus/commit/5b57f0601127fbc183c3c1b038b108077159896d).
- Source and neighboring decisions: [original corpus](../resources/liber-primus/lp2-corpus.json), [p15 Fibonacci-prime spiral](../results/lp2-p15-fibonacci-prime-spiral.md), [original singleton prime-word gate](lp2-singleton-primeword-crib-constraint-gate.md), [shared inversion frontier](../workplace/integrated-original-inversion-challenge.md).

**Decision:** The visible nine-chapter layout cannot justify further searches for a *reused arbitrary-secret 5/16 linear key* under either tested GP29 formula. Preserve the source constraints for an independently motivated key or reversible operation. Avoid rescuing this branch by tuning undocumented tap pairs, offsets or text-word exceptions.
