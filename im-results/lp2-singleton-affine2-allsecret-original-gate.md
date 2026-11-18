# LP2 all-coefficient affine-two-state key exclusion from printed one-rune words

**Decision, 18 November 2026 (Agent26):** Under the explicit hypothesis that the unknown manuscript preserves ordinary English words and directly encrypts GP29 rune symbols by a continuously advanced affine second-order additive keystream, **none of the complete 29^5 = 20,511,149 possible secret parameter sets can produce the original ciphertext**. The result survives an **entirely unknown stationary permutation of the 29 plaintext symbol identities**: all 83 one-rune words require a fourth different decoded symbol by word ten. Giving each of the nine illustrated chapters an independently chosen recurrence, offset, initial state and clock restart still fails under literal A/I/O in **six distinct original chapters**, and even under an independently unknown substituted alphabet in **four original chapters**. This is a genuine whole-family exclusion with a source-original planted-language positive. **No previously unknown LP2 plaintext, authentic key, or final destination is recovered.** The manuscript does not identify this recurrence as its intended cipher.

## Human-observable source and cryptanalytic premise

The complete printed LP2 pp0–55 corpus contains **12,956 source-original GP29 runes**, including **2,896 whole printed words** after retaining 32 words that continue across physical page breaks. **83** printed words contain exactly one rune. If original word boundaries are preserved and the unknown prose is ordinary English, a native-GP one-rune word can be **A** (GP ordinal24) or **I** (ordinal10); we grant the older poetic exclamation **O** (ordinal3) as a third possible plaintext. These 83 independent, directly observed source positions constrain every candidate keystream without hypothesizing any multiword phrase.

Earlier [source-polynomial singleton work](lp2-singleton-crib-source-polynomial-linearstream.md) excluded only **six fixed first-party or inferred characteristic polynomials**, with orders two through five and, where possible, source-chapter restarts. It did not examine all possible unknown second-order coefficients and all affine offsets. The present test is therefore a **complete secret-key exclusion for one naturally small mechanism**, independently of H/G/χ polynomial provenance. The weakest premise remains that neither the Cicada author nor an authentic image explicitly calls for an LFSR, this order-two recurrence, or a plaintext word-preserving additive layer. Consequently it is evidence for prioritizing other architectures, not evidence of the creator's design.

## One exact cipher family, all possible secrets

Use the original GP29 indices and every original rune without change. The proposed reversible cipher and unknown evolving key are

\[
C_i=(P_i+K_i)\bmod29,\qquad
K_{i+2}=(aK_{i+1}+bK_i+c)\bmod29,
\]

with **a,b,c,K₀,K₁ independently allowed to be any element of GF(29)**. This family contains every homogeneous second-order linear keystream (c=0), every constant seed, arbitrary nonzero constants, all degenerate or nondegenerate coefficients, both additive signs (negating the entire key and c), and all unknown seed phases (absorbed into K₀,K₁). It does not assume a source-visible polynomial, a specific key, English scoring or a prime-index schedule.

For a fixed coefficient pair (a,b), every key entry is a linear function of three remaining unknown field values:

\[
K_i=u_iK_0+v_iK_1+w_ic\bmod29,
\]

where u,v solve the homogeneous recurrence from seeds (1,0) and (0,1), and w solves the recurrence from seeds (0,0) with unit affine input. The original one-rune word at offset t enforces the exact ternary constraint

\[
C_t-(u_tK_0+v_tK_1+w_tc)\pmod{29}\in\{24,10,3\}.
\]

Enumerate all 29² coefficient pairs and all 29³ possible initial-key/affine-offset values, **20,511,149 complete models per clock**. Short-circuit the first violated original singleton while retaining the maximum achievable valid prefix. Every state, including singular recurrences and zero keys, is counted. This test is independent of plaintext scoring, guessing what a long word says, and statistically ranking a sample of keys.

## Original-source result

| Frozen original key clock | Original one-rune words | Tested complete parameter sets | Greatest prefix compatible with A/I/O | Exact full solutions |
| --- | ---: | ---: | ---: | ---: |
| Continuous entire pp0–55 (zero origin) | **83** | **20,511,149** | **7** | **0** |
| Chapter 2, physical pp3–7, fresh five secret parameters | **8** | **20,511,149** | **7** | **0** |
| Chapter 3, physical pp8–14, fresh parameters | **11** | **20,511,149** | **8** | **0** |
| Chapter 4, physical pp15–22, fresh parameters | **18** | **20,511,149** | **7** | **0** |
| Chapter 6, physical pp27–32, fresh parameters | **12** | **20,511,149** | **6** | **0** |
| Chapter 7, physical pp33–39, fresh parameters | **9** | **20,511,149** | **6** | **0** |
| Chapter 8, physical pp40–53, fresh parameters | **13** | **20,511,149** | **7** | **0** |

Each table row represents a **complete independent exhaustive enumeration**, not a sampled calculation. In total the model has been checked for **143,578,043** complete original-source secret assignments across seven clocks. The original full-book first eight one-rune word positions (zero-based global runes) are **176, 244, 350, 530, 644, 792, 967, 1025**. Since its maximum compatible prefix is seven, *every* order-two affine model contradicts an English A/I/O one-letter word at or before the eighth such position. For the six separately reset illustrated chapters the first mathematically unavoidable contradictions are respectively one-rune word **8, 9, 8, 7, 7, 8**.

Chapter 1 (p0–2) has five such words, chapter 5 (p23–26) has five, and chapter 9 (p54–55) has only two. They were **not** declared impossible separately. Those sparse chapters do not repair the failures in the other six even if their keys are entirely independent. Resetting at every physical page or word is a different hypothetical mechanism and is not excluded.

The stricter A/I-only branch also has **zero** survivors in the global and all six excluded chapter scopes; allowing O does not rescue the family. All source bytes, original line/page joins, physical rune orders and chapter boundaries are asserted independently against the checked-in original corpus in the reproducer.

## Stronger result: arbitrary secret alphabet, no identity assumptions

A possible objection to the literal-A/I/O constraint is that an unknown **global 29-symbol permutation** precedes the additive keystream. Grant that entire secret alphabet freely. The only necessary condition on 83 original single-rune words is that their 83 recovered intermediate GP29 symbol values occupy **at most three distinct symbol identities**. An arbitrary invertible secret permutation can map any such three identities to source-native A, I and O. This condition is strictly weaker than prescribing their literal GP ordinals; it does not require finding or specifying the secret 29! permutation.

For **every** candidate affine second-order key's 83 decoded singletons in source order, track the first three different recovered values, then stop at the *fourth* different value. Exhaust the complete 29^5 keys with this property. The unmodified original complete book has **zero** candidate keys admitting at most three decoded singleton symbol identities; the longest three-symbol-compatible prefix is **nine words**. **Every** secret key therefore forces a *fourth distinct decoded single-rune value by the 10th original singleton*. This is an exact all-secret exclusion against arbitrary stationary output/plaintext symbol relabeling, independent of English unigram scores and individual rune letter assignments.

For the independent illustrated-chapter reset clock, grant **fresh unrelated 29-symbol alphabet permutations for each chapter**, in addition to independently arbitrary coefficients/seeds/affine offsets. The exact full-model outcomes are:

| Original illustrated chapter | One-rune words | Secret affine2 keys preserving ≤3 distinct decoded symbols | Longest compatible three-symbol prefix |
| --- | ---: | ---: | ---: |
| p3–7 | 8 | **667** | 8 |
| p8–14 | 11 | **0** | 10 |
| p15–22 | 18 | **0** | 9 |
| p27–32 | 12 | **0** | 9 |
| p33–39 | 9 | **145** | 9 |
| p40–53 | 13 | **0** | 9 |

Chapters p0–2, p23–26 and p54–55 have only 5, 5 and 2 singletons and were deliberately omitted from this stronger independent constraint, rather than asserted impossible. The two shorter tested chapters p3–7 and p33–39 **admit hundreds of key hypotheses** under arbitrary unknown alphabet relabeling; their earlier *literal* A/I/O negative does not imply a secret-alphabet negative. Four independently longer chapters remain logically impossible under the full five-secret-parameter affine2 model **even if every chapter has its own entirely unknown secret alphabet**.

This stronger alphabet-blind gate is implemented as a separate exhaustive consumer in the same SFT. It closes arbitrary stationary symbol renaming of this entire affine2 model. It does not close nonstationary output alphabets, nonuniform nulls, an independently changing state/reset clock inside each chapter or a different plaintext word alphabet exceeding three types.

## Original-language positive and reproducibility

The source-original 95 GP29 runes of solved p57 **PARABLE** are encrypted under an independently defined affine recurrence with a=2, b=3, c=5 and starting key values (7,11). The inverse recovers **95/95** original solved runes. Separately, at the **same 83 original source singleton offsets**, a hidden cyclic sequence of A/I/O rune values is encrypted with that recurrence. The *same full-model search* detects a compatible key after **1,493,941** enumerated parameter sets, with **83/83** planted singleton constraints satisfied. A **separately unknown-alphabet positive plant** maps source-native A/I/O to three unrelated intermediate rune identities **17, 4, 12**, encrypts the same original 83 singleton offsets under the hidden affine2 recurrence, and independently tests the exact *alphabet-blind* exhaustive search; it recovers a complete three-symbol-compatible key without assuming which original letters those intermediate symbols represent. This guards against a vacuous source-original secret-alphabet negative. The positive is a synthetic original-shaped gate validation, not an LP2 unknown-page decryption.

The read-only, single-file [Node22/CommonJS original-input reproducer](../sims/lp2_singleton_affine2_allsecret_sft.cjs) implements the full enumeration, source assertions, native-language positives and independent chapter restarts. The full source-original 29^5 alphabet-blind gate, secret-alphabet positive plant, literal-A/I/O gate, six illustrated-chapter resets and solved p57 positive all passed together on [Windows Node.js 22 CI run 44263707754](https://github.com/FlareZ123/liber-primus/actions/runs/44263707754) via the [manual-only workflow](../.github/workflows/agent26-singleton-affine2-manual.yml). The run logs print each exhausted model count and each chapter's exact earliest forced contradiction.

## Research decision

Retire **direct GP29 full-consumption affine order-two additive keystreams**, including **every stationary secret alphabet permutation**, for ordinary native-English LP2 under the continuous whole-book key clock. Under independent starts and arbitrary new secret alphabet per illustrated chapter, four chapters independently exclude the complete model; two additional chapters fail only under canonical literal A/I/O. The exclusion is complete even if the recurrence coefficients, seed, offset and sign were entirely secret; no further low-order coefficient sweeps can rescue this exact architecture.

The evidence **does not** address higher-order secret generators, literal-plaintext-F skips of the kind used on solved p56, arbitrary key resets inside chapters, altered word boundaries or language, transposition, or a non-additive cipher. The original manuscript does not instruct using an order-two affine generator, so discovering a first-party actual key-selection and cipher operation remains the productive priority. Do not attempt to refit this negative by introducing unconstrained local resets or speculative nulls solely to recover its excluded parameters.
