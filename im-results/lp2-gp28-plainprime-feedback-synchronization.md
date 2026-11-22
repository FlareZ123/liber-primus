# GP28 plaintext-prime feedback: secret-state convergence and original-language exclusion

**Decision (Agent21, 13 November 2026):** A fully reversible original-LP2 ciphertext inverse with a running **recovered-plaintext** GP-prime clock has a useful deterministic property: most of its 28 possible initial states **coalesce on the published ciphertext**, making thousands of proposed plaintext runes independent of the unknown starting key. The recovered ranks remain nearly uniform, unlike any of 1,036 source-shape-matched GP-native reference windows. Consequently this specific plaintext-prime / discrete-log step mechanism does **not** decipher the manuscript as direct ordinary GP-native prose, under either sign and any independently secret initial seed on each original page. **No original unknown plaintext, historical cipher key, or Cicada continuation recovered.**

## Human-clue hypothesis and precise missing source instruction

The original 29 GP symbols have published GP prime values. The p3 red triangle features **15**, a primitive root modulo29, so each nonzero GP29 ciphertext difference has one of 28 exponent ranks. The original source's severe within-page repeated-rune suppression (exactly **86** of **12,901** eligible transitions) suggests a predecessor-exclusion code, where a zero difference reserves GP index28. The already-solved p56 uses GP prime/totient arithmetic, and the independently signed 2016 message calls the words a map and their numbers a direction.

This supplies an affordable, recognizable **causal plaintext-dependent** prime clock different from preceding-word plaintext-prime feedback or the companion running-ciphertext-prime clock. The original historical material does **not specify** this recurrence or a reserved-EA marker code; these are the explicit hypotheses tested.

For one original physical page of ciphertext C[0..n−1], transport C[0] as the unencrypted page IV and start with any hidden q[1] in 0..27. For later rune i:

    d[i] = (C[i]−C[i−1]) mod29
    P[i] = 28                                  if d[i] = 0
           (log_15(d[i]) − sign*q[i]) mod28     otherwise
    q[i+1] = (q[i] + GPprime[P[i]]) mod28

Here sign belongs to {−1,+1}. This decoder is causal because P[i] is recovered before q[i+1] is updated. The exact encoder emits C[i−1] when P[i]=28 and otherwise emits C[i−1]+15^((P[i]+sign*q[i]) mod28) modulo29. Both maintain identical state transitions, without an invisible skip, guessed pad, modified original glyph, or ciphertext-fitted language choice.

## All-secret original-state convergence

Initialize the full set of **28 possible initial states** on each published page, separately for each sign. At every original ciphertext step, advance every state with the *same* deterministic map from q to q+GPprime[(log_15(d)−sign*q) mod28], or the reserved-symbol update when d=0. The transition map is not necessarily injective. Once states collide, they and their recovered runes remain identical forever; the initial-key ambiguity irreversibly falls.

Across all **12,956 original GP29 ciphertext runes** on **55** rune-bearing pp0–55:

| Exact original inverse | Completely merged pages | Largest first-merge offset among merged pages | Seed-independent rune positions (including 86 forced repeats) | Independent nonrepeat content symbols | Independent-content IoC |
| --- | ---: | ---: | ---: | ---: | ---: |
| sign +1 | **54/55** | **148** | **9,548** | **9,462** | **0.03566307688** |
| sign −1 | **37/55** | **242** | **4,087** | **4,001** | **0.03568357911** |

For the positive sign, **physical p55 alone** does not fully converge, ending with two states after 76 runes. For the negative sign, the nonconverged pages are **1,6,11,12,14,15,23,30,32,36,38,41,44,45,49,51,53,55**, each ending with two or three states. The forced GP-index28 repeats are directly observable from ciphertext and excluded from the content IoCs. Every original page forward-reencrypts exactly under **all 28 possible initial states** and both signs.

**Why this is stronger than fitting a starting key:** the 9,462 / 4,001 content symbols are literally identical under **every possible initial state**. No correct key selection or per-page initial-state optimization could change these inferred symbols under this model.

## Matched native-prose discrimination

The source Shakespeare reference yields **218,800 GP-native runes** after historic GP digraph transliteration. For this candidate 28-content-rank register, ordinary native EA is folded to E because GP index28 is reserved for the zero-step marker. Freeze the positions on the original ciphertext where all 28 initial states imply the same nonmarker rune. Insert contiguous control prose into the exact **12,815** original nonmarker positions; score only that **original-fixed, seed-independent** mask. Sample **1,036 overlapping windows at stride199** from the independent GP-native control.

| Frozen matched content positions | Original inferred content IoC | Lowest matched native IoC | Median native IoC |
| --- | ---: | ---: | ---: |
| sign +1, 9,462 symbols | **0.03566308** | **0.05938223** | **0.06215980** |
| sign −1, 4,001 symbols | **0.03568358** | **0.05848125** | **0.06203312** |

All matched GP-native windows are more linguistically concentrated than the unambiguous original output. This finite comparison does not produce discovery-wide p-values because the control windows overlap. It does not exclude an encrypted/compressed intermediate or a different language/symbol register.

**Full-length positive:** take independently sourced GP Shakespeare, fill the source's exact nonrepeat positions with its native-content ranks, force the **86** actual repeated-rune marker sites, and use a separate hidden initial state q=(7×physicalPage+3) mod28 for each page. Encrypt each original-shape page under both signs. Decoding with the correct hidden states returns **12,956/12,956** planted runes and the same explicit forward encoder exactly recreates **12,956/12,956** synthetic ciphertext symbols. All 86 marker placements remain source-identical. This establishes a capable original-shape inverse, separately from the original negative.

## Decision and reproduction

The proposed running **plaintext-prime** register is self-synchronizing on the actual original ciphertext and its large key-independent recovered subsets are nonlinguistic. Retire this exact direct-native-prose model. A position-varying extra key, alternate nonlinear update, or hidden channel would be a qualitatively new model requiring its own independent source instruction. The companion **ciphertext-prime** clock had a different key-invariance argument, so this result is genuinely distinct.

- [Exact original-input standalone CommonJS SFT](../sims/lp2_gp28_plainprime_feedback_sync_sft.cjs), which checks all original pages, **3,080** page/sign/seed inversions, native matched windows and both 12,956-rune native plants. The committed SFT was executed directly against the current pinned original GitHub corpus and control file; every assertion passed. No third-party package or file write is needed.
- [Companion ciphertext-prime clock](lp2-gpprime-rank28-clock-allseed-gate.md), [canonical original runes](../resources/liber-primus/lp2-corpus.json), and [pinned prose control](../resources/control/shakespeare_first300k.txt).

**Remaining blocker:** an independently attributable instruction choosing the original cryptographic operation/key; no complete unknown original page has yet been deciphered.
