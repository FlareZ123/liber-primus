# Key-independent conditional-entropy obstruction for a fixed previous-ciphertext GP29 permutation

**12 November 2026, Agent 10; classification: rigorous conditional cipher-family exclusion, no unknown plaintext or historical key.** A fixed secret substitution alphabet selected solely by the previous ciphertext rune is a lossless human-implementable alternative to a large random pad. For original LP2 physical pages 0–55, its **entire class of 29 arbitrary predecessor-indexed GP29 permutations** must meet an exact empirical entropy inequality. The source original does not meet that inequality with normal contiguous Shakespeare, Gibran or Emerson GP29 English as plaintext. This constraint does not require guessing any permutation or testing candidate keys.

## Exact cipher contract and theorem

Let each original physical page reset, and for every later position define

\[
 C_i=\pi_{C_{i-1}}(P_i),\quad \pi_s\in S_{29},
\]

where all 29 substitution rows are arbitrary secret *bijections*, fixed book-wide. Page initials may be arbitrary and are omitted from the transition test. Fix the **observed** previous-ciphertext labels as the state variable \(S_i=C_{i-1}\). For any finite original and candidate plaintext pair under the contract, the conditional frequency row for \(C_i\) given \(S_i=s\) is a **permutation** of the frequency row for \(P_i\) given that same state \(s\). Entropy is invariant under alphabet relabeling, so, exactly for the empirical distributions,

\[
\widehat H(C_i\mid C_{i-1})=
\widehat H(P_i\mid C_{i-1})
\leq \widehat H(P_i)
\]

where the last marginal uses **only the 12,901 non-initial positions**. Thus the original conditional entropy is a key-independent *minimum required plaintext-symbol entropy*. The theorem holds for all \(29!^{29}\) possible static secret tables and does not assume a particular secret key.

## Original-input measurements

Read only canonical numeric GP29 runes from \`resources/liber-primus/lp2-corpus.json\`, page IDs 0–55 inclusive, and count transitions strictly within physical pages. Use base-2 plug-in entropy, with no fitted alphabet, page reordering, inferred word resets, or zero-count smoothing.

| Reproducible input | Exact statistic |
| --- | ---: |
| Unsolved original runes | 12,956 |
| Eligible same-page adjacent pairs | 12,901 |
| Original adjacent-equal pairs | 86 |
| Original marginal \(\widehat H(C)\) | **4.856503613708271 bits/rune** |
| Original conditional \(\widehat H(C_i\mid C_{i-1})\) | **4.785306737223472 bits/rune** |
| GP29 Gibran *Prophet* control marginal | 4.273684509802536 |
| GP29 Shakespeare control marginal | 4.269188471277368 |
| GP29 Emerson essays control marginal | 4.239967501642559 |
| Printed solved p57 PARABLE GP29 marginal (95 runes) | 4.07473699962164 |

Control sources are exactly \`resources/control/gibran_prophet_58585.txt\`, \`shakespeare_first300k.txt\`, \`emerson_essays_2944.txt\`. The GP transliterator and its 63,114 / 218,800 / 324,630 control lengths are copied from the established \`sims/lp2_2013_instar_p27_autokey17_sft.cjs\` mapping; this comparison does not create a new register. Any candidate whose **12,901 GP29 plaintext transition runes** have empirical marginal entropy below 4.7853067372 is mathematically incompatible with the stated fixed predecessor-permutation cipher, regardless of all hidden substitution rows. The corpus measurements show how strongly ordinary GP29 English conflicts with that threshold; they are finite source controls, not a universal theorem that all intelligible English must have that entropy.

## Original-shape counterexample to marginal/doublet-only screening

For a positive plant, take exactly 12,956 GP29 runes from Shakespeare starting at normalized offset 1,500 and cut them to the **same 56 original physical page sizes**. Its rare GP29 \`EA\` (index 28) occurs exactly 86 times after page-start exclusion. Choose this escape symbol *retrospectively* to match the original repeat count. On each page, emit the first rune unchanged. Thereafter, if plaintext \(P_i=28\), emit \(C_i=C_{i-1}\); otherwise for \(0\le P_i\le27\), emit

\[
 C_i=(C_{i-1}+1+P_i)\bmod29.
\]

For each predecessor, those rules are a complete, single-valued 29-symbol permutation. The exact inverse emits 28 when a ciphertext repeat occurs; otherwise it emits \((C_i-C_{i-1}-1)\bmod29\).

| Statistic | Original LP2 | Reversible native-English plant |
| --- | ---: | ---: |
| GP29 runes | 12,956 | 12,956 |
| Same-page adjacent repeats | **86** | **86** |
| Marginal entropy (bits/rune) | **4.856503613708271** | **4.856499598522683** |
| Cipher conditional entropy (bits/rune) | **4.785306737223472** | **4.2129849361225045** |
| Entire original-layout native plaintext recovered by inverse | Unknown | **12,956/12,956** |

This illustrates how an exactly lossless predecessor-excluding/escape cipher can match both original doublet count and marginal uniformity while diverging decisively in conditional entropy. That does not make the chosen escape key historically plausible. The synthetic conditional entropy equals the empirical \(\widehat H(P_i\mid C_{i-1})\) to floating precision, testing the central theorem.

## Scope, novelty boundary and next decision

The source-original high-order/word-boundary analysis in Director #267 tested many lag/MI/reset diagnostics; #597 derived finite-control lower bounds for a different general finite-state permutation transducer. The earlier #5/#14 and predecessor-exclusion models already established the importance of repeats. This report contributes a **short universal exact inequality for the narrower static previous-ciphertext permutation class**, plus a matched-original-shape counterexample to marginal/repeat-only identification. It supersedes no earlier source findings and should never be extrapolated to secret evolving state.

**Decision:** do not spend resources tuning 29 secret predecessor substitution rows against normal English GP29 plaintext. A plausible successor needs independent source selection of a *changing* state/key, page-varying permutations, a non-GP/variable-length representation, or independently attributable high-entropy plaintext. A cipher capable of reconstructing original unknown text remains unestablished.

**Reproduce:** \`node sims/lp2_predecessor_permutation_entropy_sft.cjs\`, using only tracked original and control inputs. The single file asserts the complete page/rune/transition/repeat counts, the fixed numeric metrics, equality of the synthetic inverse to all 12,956 GP-native runes, and invariance of the two conditional entropies.
