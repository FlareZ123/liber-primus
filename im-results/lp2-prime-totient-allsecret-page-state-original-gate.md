# Original LP2: full 29! secret-alphabet obstruction for solved-page prime-totient clocks

**Agent13, 13 November 2026. Result: a key-independent, all-secret permutation-family exclusion under independently sampled GP-English controls.** This is an attempt to transfer the genuinely solved LP2 p56 prime-totient operator to the 12,956 unsolved rune positions. No unknown LP2 plaintext, original key, destination or decipherment method was recovered.

## Human source route and exact scope

On independently solved physical LP2 page56, a verified operation subtracts Euler totients of consecutive primes from GP29 ciphertext indices modulo29, with an attested single literal-F pause. It is rational to ask whether one of the as-yet-unknown GP29 chapters uses the same published prime clock, but permutes its alphabet or prime-key mapping. An unknown 29-symbol substitution key can be arbitrarily complicated; an attack requiring guessed alphabet order could miss the real method.

Instead, allow **every source-visible (original physical page, current prime-totient residue)** pair to have its **own entirely arbitrary, unrelated, secret bijection of all 29 GP symbols**. This covers every fixed page-wide affine alphabet, an unknown output permutation after prime-totient addition, an unknown permutation of the 29 keystream residues before addition, and any other stationary one-symbol inverse at this state granularity. There are up to **1,595 independent state alphabets**, each with as many as **29!** possible assignments. No assignments are enumerated or guessed.

All three clocks use the actual original LP2 page lengths and the established prime series:

- **Book:** prime index continues across every unknown rune-bearing physical page.
- **Page:** restart prime index at the first rune of each physical page.
- **Chapter:** restart at the start of each of nine printed visual sections, original pp0,3,8,15,23,27,33,40,54.

Physical p50 has no runes and remains in the source numbering. The original p56 literal-F skip is not transferred to unknown pages without an instruction identifying its skip sites. Thus a key varying by actual absolute position, a hidden further state, secret skip events, altered segmentation, or an intermediate non-GP-English register remains outside this stated family.

## Exact all-secret equality invariant

For each source-observable state \(s=(\mathrm{page},\phi(\mathrm{prime}_{clock})\bmod29)\), let \(n_{s,r}\) count the appearances of GP rune \(r\), and \(m_s=\sum_r n_{s,r}\). Define the pooled within-state collision probability

\[
Q=\frac{\sum_s\sum_{r=0}^{28}n_{s,r}(n_{s,r}-1)}
        {\sum_s m_s(m_s-1)}.
\]

Under **any** secret bijection \(\sigma_s\), two symbols in the same state are equal after encryption if and only if their plaintext symbols were equal. Hence **the numerator and denominator are exactly invariant under all secret alphabets in this family**, even if each page and each prime residue has a separate 29! key. A cipher of this form cannot hide the native plaintext's state-conditioned collision concentration.

The original input is the unchanged [canonical physical-page rune corpus](../resources/liber-primus/lp2-corpus.json). The independent comparison converts [300,000 printed Shakespeare characters](../resources/control/shakespeare_first300k.txt) to **217,644 native GP tokens** with the period-compatible K/Q→C, V→U, Z→S and TH/NG/ING/EO/OE/AE/IA/EA conventions. For each clock, exactly **150 deterministically spaced contiguous native controls**, each of length12,956 and cut into the original 55 page lengths, receive the **same observed state sequence**. Their windows overlap, so the 150 counts are descriptive finite coverage, not independent p-value trials.

| Prime clock | Original equal ordered pairs | Eligible ordered pairs | Active states | Original Q | Native control Q minimum | Native median | Native maximum |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Book-continuous | **3,602** | 107,016 | 1,540 | **0.03365851835** | **0.05653360245** | 0.06109366824 | 0.06415863049 |
| Page-reset | **3,594** | 103,732 | 1,595 | **0.03464697490** | **0.05710870320** | 0.06104191571 | 0.06478232368 |
| Chapter-reset | **3,670** | 105,532 | 1,548 | **0.03477618163** | **0.05757495357** | 0.06115680552 | 0.06466285108 |

All three actual original-state collision probabilities lie near \(1/29\), **below every single one of the 150 independent-source windows** for the matching clock. The gap is much greater than a plausible per-state 29-symbol relabeling can explain, because the rate is exactly unaffected by such relabeling.

The native controls are samples from one English register, so this is an exclusion for **ordinary native GP-English plaintext under the declared fixed-state family**, rather than an algebraic impossibility for any conceivable plaintext language, compressed binary register or adversarial sequence.

## Reversible positive that actually uses secret state alphabets

The [original-source CommonJS SFT](../sims/lp2_prime_totient_allsecret_state_permutation_sft.cjs) constructs a complete native 12,956-GP-rune plant and encrypts it under the genuine state-specific affine alphabet

\[
C_i = a_{s_i} P_i + b_{s_i}\pmod{29},
\quad
a_s=((7p+11k+3)\bmod28)+1,\quad
b_s=(13p+19k+5)\bmod29,
\]

where \(p\) is the original page number and \(k\) the prime-totient residue of that position. Every \(a_s\) is nonzero and therefore invertible in GF(29). The SFT verifies **exact recovery of all 12,956 planted native GP symbols**, and that its enormous collection of independently changing secret alphabets preserves every original native numerator and denominator **exactly**. This is a valid counterfactual true-positive demonstration, not a historical LP2 key.

The same SFT asserts the three source-original integer numerator/denominator/group triples, generates the 150 matched native windows per clock, and requires all controls to exceed the actual source. The independent complete [Hungarian key-recovery SFT](../sims/lp2_prime_totient_secret_alphabet_assignment_sft.cjs) runs the two direct decryptors below and asserts exact original heldout scores plus perfect source-native key recovery. Both passed the [manual Windows Node22 GitHub Actions run 43364275566](https://github.com/FlareZ123/liber-primus/actions/runs/43364275566), with Node syntax checks and all original-source and planted assertions. The tests use no runtime network access or nondeterministic fitting.

## Separate actual key-recovery attempts

Beyond the key-independent invariant, this invocation directly attempted **maximum-likelihood inverse recovery** for the two simpler full-29! global secret-key models on the original unchanged source. Shakespeare GP unigram probabilities were fixed before looking at the target, a 29×29 Hungarian assignment maximized likelihood over **every possible 29-symbol permutation**, and the original pp0–27 (6,761 runes) trained the key. Original pp28–55 (6,195 runes) were untouched holdout:

- Unknown output alphabet \(\sigma\), \(C_i=\sigma(P_i+\phi(prime_i))\): best of book/page/chapter clocks and both signs attained **−4.20755 nats/rune** on the held-out original.
- Unknown permutation \(\tau\) of the totient-residue keystream, \(C_i=P_i+\tau(\phi(prime_i))\): best of the three clocks attained **−4.23363 nats/rune** on held-out original.

Under each **actual source-shaped native-GP positive plant**, the same fitting routine recovered **all 29/29 secret alphabet entries**, and the independent holdout score was approximately **−2.95584 nats/rune**. The negative originals are therefore substantive failed decryption attempts with an actual powered positive and frozen original holdout. Each exact 29×29 assignment algorithm and all six-plus-three original clock variants are frozen in the runnable Hungarian SFT. The exact all-secret statewise equality bound above is the stronger, key-independent result; no interpretation of the best-scoring original keys as plaintext is justified.

## Research decision

A direct extension of p56's prime-totient cipher to unknown LP2 with a stationary arbitrary alphabet keyed only by the **current prime residue and original page** cannot explain ordinary native GP-English plaintext, for any chosen 29! alphabets. Future work must introduce evidence for a genuinely **changing per-symbol state, nonnative intermediate register, external secret material, different prime-index selection or a different cipher architecture**. Another static key search inside these already excluded classes cannot unlock unknown pages. Do not turn this negative into a claim that the solved p56 method proves an LP2-wide cipher.
