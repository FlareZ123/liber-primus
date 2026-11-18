# Collision-retry clock: complete original-page ambiguity and calibrated 29-phase challenge

**Agent 7, 18 November 2026. Status:** a mathematically exact **lossless-decoding obstruction** for a specific soft-collision-skip mechanism, plus a finite 6,360-plant original-cipher statistical mismatch. **Neither result recovers unknown plaintext, an authentic Cicada key or a destination.** This report evaluates a motivated *analyst* cipher hypothesis, not an author-signed LP2 cipher instruction. It extends [the earlier exact arithmetic-ramp hidden-skip HMM](skip-aware-ramp-hmm.md), without rerunning its original fixed-rejection likelihood scan.

## Causal premise and the proposed operation

The 55 rune-bearing original LP2 unknown pages contain 12,956 GP29 runes but only **86 adjacent equalities among 12,901 within-page successor pairs**. An encoder that rejects a candidate ciphertext rune when it duplicates the preceding printed rune offers a simple reason for the low count. The prior ramp-HMM report tested a 29-phase additive cipher with a collision-triggered extra key consumption, retaining a repeat with nonzero probability, and showed that 28 fixed arithmetic slopes do not recover ordinary native-GP plaintext by exact likelihood. Its proposed next extension was an unrestricted unknown 29-position secret key.

Here the key **K** is any permutation of the 29 GP symbols. At each rune, with plaintext P and phase j, propose

    candidate = (P + K[j]) mod 29

and consume state j. If the candidate equals the previously emitted rune, accept it with probability 1−r. With probability r, discard the candidate, consume the next key state and retry **the same plaintext rune**:

    output = (P + K[(j+1) mod 29]) mod 29

A permutation guarantees adjacent key values differ, so the retry cannot duplicate the preceding output. Every physical page starts in an unconstrained key phase; no hidden skip choices are printed. We grant each key its own rejection rate r calibrated from the original first-order collision frequency. This is more favorable than using a fixed rate for every key.

**The strongest unsupported premise** is that Cicada employed random, unprinted key-state skips. The model is attractive as an explanation of adjacent-runic anti-repeat, but there is no authenticated operation selecting this key clock, rejection mechanism, coin, or hidden-state decoder.

## Exact structural obstacle: key and ciphertext do not determine plaintext

**The proposed probabilistic encoder is not injective without its hidden skip trace**, even if the entire 29-entry key and initial key phase are known. This is an all-key structural result, separate from any language or random-key simulation.

For *any* permutation K and phase j, let x denote the preceding ciphertext rune and let

    d = (K[(j+1) mod 29] - K[j]) mod 29,  d != 0,
    y = (x + d) mod 29.

There are two valid forward histories producing the same next ciphertext y:

| History | Plaintext at this position | Emission | Key consumption |
| --- | --- | --- | --- |
| Direct, no collision | (y−K[j]) mod29 | y | One state |
| Rejected collision then retry | (x−K[j]) mod29 | first x (rejected), then y | Two states |

The two plaintext symbols differ by d and are therefore distinct. The direct branch has positive probability because y differs from x; the skip branch has positive probability whenever r>0. For the authentic observed doublets elsewhere in a ciphertext, a non-skipped collision also has positive probability when r<1. **For any complete ciphertext suffix**, either history can then continue through direct emissions, choosing each later plaintext symbol to match the next ciphertext from its own current key phase; a repeated desired output is simply an accepted collision. Thus observing the rest of a page cannot restore uniqueness without further constraints.

This is also a **concrete original-source ambiguity for every possible 29-symbol permutation K**. Original physical **p0** (262 GP runes, source 17.jpg) contains **all 28 nonzero predecessor-difference values**. Since every K has nonzero d at adjacent phases, p0 contains a transition with that d. Choosing its freely unknown page-start phase so that the transition uses key state zero yields two complete, distinct p0 plaintexts that re-encrypt to exactly the **same unchanged 262-rune original source** with the **same K and initial phase**. The full SFT constructs both histories for each of its 278 tested key schedules, while the argument applies to *all 29! keys*.

A particularly compact original witness uses K[j]=4j mod29. Source p0 local rune offset **17** follows GP **AE (25)** and prints **F (0)**. The offset's cipher difference is 4; choose start phase **12**, making key phase zero at offset17:

* Direct: plaintext rune **F (0)** emits F, consuming one state.
* Skip: plaintext rune **AE (25)** proposes the preceding AE, discards it and emits F under next key value4, consuming two states.

All other original p0 ciphertext runes are reproduced exactly in both traces. The plaintexts differ at this position and subsequently because their key phases diverge. Both traces have positive probability for any 0<r<1. A key alone, even one discovered from the original manuscript, does **not** give a unique cryptographic plaintext under this standalone rule.

**Exact source-wide multiplicity, stronger than the one-site witness.** Fix the same known slope-four key K[j]=4j mod29 and fix any initial key phase independently for each original physical page. A source ciphertext transition admits the extra skip branch if and only if its GP29 predecessor difference equals **4**. The original p0 contains exactly **10** such sites; the entire original 55-page rune-bearing unknown corpus contains exactly **435**. Each can independently be direct or skipped: the key-phase difference changes future plaintext but never prevents reconstructing the fixed later ciphertext. At the first differing branch, the two plaintext reconstructions differ in their immediate rune by four modulo29, so every separate binary trace yields a separate plaintext. Consequently the **same known key and fixed page phases** decode the identical original source to exactly **2^10 = 1,024 different full-p0 plaintexts** and **2^435 different whole-book plaintext rune streams**, all having positive probability when 0<r<1. This is a deterministic combinatorial count for the proposed cipher, independent of the iid language model or simulated p-values. Language constraints or additional authenticated side information could favor one of those plaintexts, but the ciphertext and key alone cannot distinguish them.

The same exact reasoning applies to **each of the 28 nonzero arithmetic ramp keys** K[j]=a·j mod29. In a given ramp, a skip is possible at exactly those original predecessor transitions with GP29 difference a. The untouched source histogram across all within-page transitions has between **401 and 510** occurrences of each respective nonzero difference, so **every one of the 28 possible ramp keys admits exactly between 2^401 and 2^510 distinct complete original-book plaintexts** for any fixed page-start phases, with all outcomes source-ciphertext-identical. This includes slope-four's 2^435 value. These are exact combinatorial counts, not stochastic simulation outcomes, but they do not apply automatically to irregular 29-permutation key increments.

**Fixed-known-phase all-key strengthening.** The combined original 55-page source has an even stronger exact coverage property: for **every page-local rune-position residue i mod29 (all 29 classes)**, the multiset of nonzero original predecessor differences covers **all 28 nonzero GP29 values**, with at least two original occurrences per phase × difference cell. For any arbitrary 29-symbol permutation key K and any **fixed known phase φ shared at all physical page starts**, choose any local residue r; K[(φ+r+1) mod29]−K[(φ+r) mod29] is a nonzero value and therefore appears as the original ciphertext difference at a source site of that same residue. Following the direct history up to that site aligns the known phase; substituting one rejected-collision extra key consumption yields a distinct plaintext that re-emits the same complete original page and original book with all later emissions direct. Thus **every key and every known shared reset phase** has this ambiguity, without choosing a favorable start phase after seeing the key. The coverage is asserted on untouched original GP indices in the same SFT. This does not force the same conclusion for independently chosen unrelated start phases on all 55 pages or a non-cyclic/non-retrying cipher.

**Scope:** a source-specified secondary channel transmitting skip events, a deterministic encoder whose inverse uniquely identifies them, or powerful external admissibility constraints could restore practical recoverability. The proof does not exclude such *different* mechanisms, including genuinely reversible predecessor-exclusion rank encoders already investigated elsewhere. It disqualifies probabilistic secret key-skipping as a **standalone lossless LP2 decoding algorithm**.

## Independent calibrated original-source challenge at lags 28 and 29

Even putting information loss aside, a 29-state key that usually advances once per printed rune tends to return to similar key phase 29 runes later when no collision was skipped, and 28 runes later when exactly one state was additionally consumed. This creates a distinctive **paired lag28/lag29 echo** when the unencrypted native-GP rune distribution is nonuniform.

Use the previous HMM pilot's independent **1,181 genuinely solved GP29 runes** from original LP1 pages 3,8–11,14 and solved LP2 p56–57 as an iid source prior, with exactly one pseudocount for each of 29 symbols. Its GP29 letter coincidence probability is **0.05599071101700703**. This is an explicit language model; it is not proof of the unknown author's actual letter distribution.

For each prospective K, calculate its mean **pre-rejection** collision probability from the source-native GP29 autocorrelation over consecutive key increments and select

    r(K) = 1 - (86/12901) / mean_j[ sum_p q[p] * q[(p + K[j+1]-K[j]) mod29] ].

This first-order calibration uses **only the observed adjacency rate**, leaving all lag28/lag29 events unfit. Its 278 candidate key schedules receive individually calibrated rejection rates **0.741034–0.857069**. Every simulated ciphertext keeps the **exact 55 physical-page lengths** and follows the specified causal rejection/one-retry rule, with independent random initial phase per page. Every original and planted lag pair is counted **only within a physical page**.

| Within-page statistic | Original unchanged LP2 | Planted control, strongest arithmetic-slope mean (slope25) |
| --- | ---: | ---: |
| Adjacent equalities | **86 / 12,901** | **84.78** |
| Lag28 equalities | **381 / 11,416** | **402.11** |
| Lag29 equalities | **395 / 11,361** | **507.73** |
| Joint lag28+lag29 count | **776** | **909.84** |

The test covers **all 28 nonzero arithmetic cyclic permutations**, with 120 independent source-sized plaintext/cipher samples each, and **250 independently shuffled arbitrary secret permutations**, with 12 samples each: **6,360** complete original-length cipher plants. Every planted case preserves all GP symbols and is verified by a traced exact positive re-encryption/decryption, while the secret initial phases and rejection draws are fresh.

- **0/6,360** planted samples had joint lag28+lag29 count ≤ the original **776**; the lowest was **797**.
- Among the **4,739** planted examples with adjacent-repeat counts within ±10 of original86, **0/4,739** attained a joint count ≤776.
- The lowest individual planted lag29 count was **412**, above the original **395**.
- The overall 6,360-sample mean of adjacent doublets was **86.1256**, closely matched to original86. For slope25, mean joint count was **909.84**. The best mean among the 250 random schedule samples was **940.42** (only 12 trials per schedule).

For independent presentation only, original p0–27 has 191/5,977 lag28 and 212/5,949 lag29 equalities; p28–55 has 190/5,439 and 183/5,412, respectively. This demonstrates that the full-book deficit does not come solely from one physical half. The lags were selected from earlier exploratory work, so this split is **not** a prospectively blinded validation.

These experiments are **finite evidence**, not an exclusion of all 29! keys or all coherent English texts. Simulated plaintext is iid rather than authentic paragraph language. The calibration r(K) is first-order rather than a maximum-likelihood fit. The report makes no post-selection p-value claim for the pair of lags. An adversarial untested permutation or different plaintext register might fit. The structural noninjectivity proof above, however, is exact for every secret permutation under the specified standalone stochastic channel.

## Research decision and reproducibility

A blind search for 29 secret cyclic key residues plus an untransmitted collision-retry coin **cannot by itself yield a uniquely decryptable manuscript**. Its separate stochastic predictions also conflict with this original-runic sample more than the best 278 tested schedules can explain. A serious successor must identify an **originally visible way to determine each extra key consumption**, or switch to an explicitly reversible alphabet/predessor-state encoder whose source-selected key and clock are independently recoverable. More random permutation sampling without such a decoder has low value.

The executable [read-only, JSDoc/CommonJS source SFT](../sims/lp2_secret29_skip_lag2829_original_sft.cjs) uses an explicit Xorshift32 seed **0x20262918**, derives all original-page and solved-source counts from committed reference files, constructs the p0 double-plaintext certificates for each key, checks true-source encryption and exact key+trace inversion, records the 6,360 exact-length controls, and asserts the observed original counts. It passed on **Windows Node.js 22** in [manual CI run 44316630393](https://github.com/FlareZ123/liber-primus/actions/runs/44316630393), remote revision [0af1fabb](https://github.com/FlareZ123/liber-primus/commit/0af1fabb375f415faafbe9f8d050762ba2214a96). See the independent earlier [arithmetic-ramp hidden-skip likelihood study](skip-aware-ramp-hmm.md) for complementary results with all 28 slopes and a fixed r=0.81.

**No unencrypted original LP2 rune, creator key, or destination was recovered.** This is a causal obstruction on one proposed explanation for the output distribution, rather than a complete solution of the book.
