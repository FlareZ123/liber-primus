# Exact skipped-key phase likelihood: arithmetic ramps modulo 29

**Status (Agent 20, 2026-11-10): bounded, executable negative.** No LP2 plaintext, key, or general cryptosystem recovered. This extends an already-investigated family with an exact likelihood that explicitly sums over hidden key skips, rather than assuming a fixed ciphertext-to-key phase.

## Attack and why it matters

The unsolved LP2 corpus has 12,956 rune symbols and only 86 identical adjacent pairs within its 55 rune-bearing physical pages. A collision-rejection cipher is a natural but unproved way to generate this profile. If the encryption pointer consumes an extra key symbol on a collision, fixed-offset periodicity scans can be weakened by cumulative unknown pointer drift.

Test the complete **29-position arithmetic-ramp key** family

- \(K_j=a\,j\bmod 29\), for each \(a\in\{1,\ldots,28\}\). An additive key constant is absorbed into the 29 possible initial phases because every nonzero \(a\) is invertible modulo 29.
- For a plaintext rune \(P_t\) and state \(j\), propose \(C_t=P_t+K_j\bmod29\). If this equals the previous emitted ciphertext rune, accept the repeat with probability \(1-r\), or discard that key symbol and retry the **same plaintext rune** with \(K_{j+1}\) with probability \(r=0.81\). A nonzero ramp always has \(K_{j+1}\neq K_j\), so one retry is sufficient. The key consumes one or two symbols.
- Prior \(q\): empirical Gematria Primus runes from the literal, unencrypted LP1 transcription pages 3, 8–11, 14, plus both solved LP2 pages 56 and 57. Total **1,181 reference runes**, with one pseudo-count per of 29 symbols. Plaintext symbols are modeled as iid draws from \(q\). This prior is a provisional English-language approximation, rather than a faithful grammar model.
- An exact 29-state backward recursion marginalizes every hidden skip history. For each physical LP2 page, integrate over a uniform initial phase, or independently maximize over all 29 start phases. The second, more permissive model is an upper bound on a fixed page-reset phase model (but not an unconditional exclusion of every possible plaintext source).
- Compare against a uniform-output anti-repeat Markov null, with \(P(C_t=C_{t-1})=86/12901\) and equal probability for all 28 distinct successors. The first rune of each page has probability \(1/29\).

### Forward transition probabilities

For \(c\neq c_{\mathrm{prev}}\), the no-skip transition from phase \(j\) to \(j+1\) has probability \(q(c-K_j)\). If \(c-c_{\mathrm{prev}}\equiv a\pmod{29}\), an additional skip path from \(j\) to \(j+2\) has probability \(r\,q(c_{\mathrm{prev}}-K_j)\). For \(c=c_{\mathrm{prev}}\), only the phase-\(j+1\) transition contributes, with probability \((1-r)\,q(c_{\mathrm{prev}}-K_j)\). This is an exact partition of output possibilities for this key schedule and rejection rule. The initial symbol uses the ordinary, no-previous-cipher transition.

The implementation computes all phase-conditioned likelihoods by a backward pass per page with per-step normalizations, avoiding numerical underflow over long ciphertext sequences. It tests all 28 slopes, with no fitted per-rune key parameters.

## Reproduced results

GitHub Actions [run 42744135546](https://github.com/FlareZ123/liber-primus/actions/runs/42744135546) completed successfully using Node.js 22. All values below are natural log-likelihood differences against the uniform anti-repeat null, computed from **all 12,956 ciphertext runes**, not page fragments or isolated quotations.

| Input and phase treatment | Best slope | Relative log likelihood |
| --- | ---: | ---: |
| Actual LP2, phase integrated independently on every page | 10 | **−3,330.611** |
| Actual LP2, independently *optimized* starting phase on every page | 10 | **−3,156.441** |
| Planted slope-9 cipher, independently random initial phase per page, phase integrated | **9** | **+3,542.033** |
| Same positive control, freely optimized phase on every page | **9** | **+3,721.173** |

The next-best actual LP2 slopes under free-phase optimization are \(a=2\) (−3,178.142), \(a=4\) (−3,180.598), and \(a=9\) (−3,260.233). The fitted observation remains below the null baseline by over three thousand nats, even after 55 independent page-phase optimizations. The raw null log likelihood is −43,404.036.

The positive control emits new synthetic pages with the *same physical page lengths* as LP2, exact collision-triggered key skipping (81% chance), true slope \(a=9\), independently randomized start phases, and plaintext iid from the same external \(q\). It uses fixed xorshift32 seed **0x1d4ea21b** (decimal 491,692,571). The planted slope is ranked first over all 28 slopes, many thousands of nats above the null and above the competing slopes. This establishes strong sensitivity to the precise planted construction and output lengths.

## Interpretation and next work

The tested 29-state **arithmetic ramps** fail decisively under the specified LP1-like unigram prior, including explicit hidden skip-state uncertainty. A simple phase drift cannot explain the absence of the expected plaintext signal in that family. This agrees with earlier wide periodicity negatives, while testing a different, exactly specified likelihood rather than fixed-position coincidence.

The negative does **not** extend automatically to an arbitrary 29-position key permutation, a long keyed pseudorandom generator, multiple skips under adjacent identical key values, a page-varying key alphabet, running-key plaintext dependence, or non-LP1-like text/encoding. The next substantial extension would learn an arbitrary 29-value key schedule under the same dynamic skip model and validate it on planted ciphertext with unknown phases before applying it to LP2. Estimating a key via many free parameters must be evaluated on independent held-out pages and matched anti-repeat controls to avoid overfitting.

Executable: [sims/skip_phase_hmm.cjs](../sims/skip_phase_hmm.cjs). Manual runner: [skip-phase-hmm.yml](../.github/workflows/skip-phase-hmm.yml). Fixed original rune encoding and page index source: [LP2 corpus](../resources/liber-primus/lp2-corpus.json), and [LP1 transcription](../resources/transcriptions/lp1_wulfic_canonical.txt). Historically similar key-skip families have been considered by [Leo-Y-Zhang](https://github.com/Leo-Y-Zhang/LiberPrimusAnalysis/blob/main/docs/REPORT.md) and [Wulfic](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md); this report claims no first discovery of anti-repeat filtering itself.
