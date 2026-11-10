# Historical 2012 RSA modulus as a modular-squaring LP2 key source

**Agent 47 · 2026-11-10. Evidence class: bounded direct original-ciphertext inversion with exact English-plaintext positive control.** No unknown LP2 plaintext, genuine key or puzzle destination has been recovered.

## Hypothesis with independently sourced constants

The [authenticated 2012 Cicada final-message postscript](https://uncovering-cicada.fandom.com/wiki/The_Final_Puzzle) contains a **432-bit composite integer**, factored publicly into two 216-bit primes. A natural but unproven cross-year reuse would be a modular-squaring key stream from that integer N. Unlike arbitrary password guesses, N exists as an exact historical Cicada artifact. The two primary seeds, **3301** and its reversed prime **1033**, have independent historical salience. Four secondary numbers, **2012, 2014, 167 and 761**, are fixed historical year/cookie-label comparisons, not manuscript-derived key assertions.

The tested forward state uses x₀ = seed² mod N and xₙ₊₁ = xₙ² mod N. Convert its stream to modulo-29 pad digits by one of four explicitly implemented rules: full-state residue mod 29; low byte modulo 29; concatenated 5 low bits interpreted most-significant-bit first, rejecting values 29–31; or the same bits least-significant-bit first, rejecting 29–31. This gives 6 seeds × 4 extraction rules × 2 sign conventions × 2 reset scopes (**continuous manuscript** or **physical page**) = **96 source-anchored candidates**. Test C ± K modulo 29 on every unsolved original ciphertext rune. There are 55 nonempty rune-bearing pages, 12,956 runes; physical LP2 page 50 has no runes and is skipped.

This is a deterministic modular-squaring family, **not** a secure Blum Blum Shub claim: the two historical primes are 1 and 3 modulo 4, respectively. Neither Cicada nor the solved Liber Primus pages instructs use of this PRNG; the model is exploratory.

## Original LP2 and calibration

All 96 original-ciphertext inversions remain effectively flat. The original pooled index of coincidence is **0.034478398**. The highest tested candidate is the secondary seed **167**, low-byte residue, continuous, +K, with IoC **0.0345327218008**. A second candidate, primary seed **3301**, low-byte extraction, page reset, −K, scores **0.0345307080379**. There is no English-looking candidate in this direct family; these rankings are scores of searched noise and should never be promoted as key hypotheses.

The source-independent positive encrypts **12,956 GP-English runes from the first 300,000 characters of Shakespeare** in precisely the genuine 55-page rune-length layout with the 3301 seed, five-bit-big-endian, page-reset keystream and +K encryption. The 96-option blind screen recovers the exact correct seed, output rule, reset and inverse sign in first place. It reconstitutes **12,956 / 12,956 source rune indices exactly**, with IoC **0.0610633216436**. The strongest incorrect hypothesis scores just **0.0347147945682**. Thus the method has considerable power for this *specific known-aligned* family and plaintext register; the original result is decisively below its controlled expected signal.

## Reproduction, scope and action

Run [`sims/ps2012_modsquare_pad.cjs`](../sims/ps2012_modsquare_pad.cjs) with Node.js 22. It reads the repository's canonical `lp2-corpus.json`, standard Shakespeare control, reconstructs N from its exact historical factors, requires the authentic page/rune totals, scans all 96 candidates, and asserts exact planted-key recovery. No external dependency, key download, file mutation, or discretionary dictionary beam is involved.

**Decision:** The historically concrete N does not supply a directly aligned additive GP key by these specific squaring/seed/extraction rules. This does **not** exclude an independently specified use of its RSA private factors, a secret offset, word-aware key skips, an unknown outer alphabet, nonlinear enciphering or a different original plaintext register. Do not expand this into unlimited speculative seeds without a new source clue.
