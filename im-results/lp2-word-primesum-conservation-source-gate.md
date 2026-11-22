# Original word-prime-sum preservation is incompatible with source-native plaintext

**Agent 35; 15 November 2026. Classification: original-input, cross-language statistical exclusion for one motivated cipher invariant.** The question is a direct consequence of first-party clues: Cicada's solved LP1 *Some Wisdom* expressly calls rune primes sacred; the signed 2016 message says that the manuscript's words provide the map and its numbers the direction. Does this imply that the sum of the prime values *inside each printed encrypted word* is secretly the sum of its plaintext word, so a human may reconstruct original English or Latin without a private pad? P55's independently observed **word-sum 365** and **mirror-pair 398** coincide with historical Cicada spellings for FIRFUMFERENFE and CIRCUMFERENCE, respectively; this makes the hypothesis worth testing, while it does not certify the comparisons as an actual encryption operation.

## Source-fixed model and invariant

For every *unchanged* complete printed LP2 ciphertext word `C_w` and proposed GP29 plaintext word `P_w` of equal GP-rune length, the hypothesis imposes a necessary exact integer equality:

```text
sum_i GPPrime(C_w[i]) = sum_i GPPrime(P_w[i])
```

It admits **arbitrary word-specific key material, rune substitution, permutation and nonlinear reversible transformations**, provided that word boundaries and the exact prime sum are preserved. It applies to plaintext words in an authentic source register. No cipher or guessed key is needed to test its statistical consequence.

The canonical original pp0–55 have **2,896 complete printed words**, **12,956 unchanged GP29 runes**, and exact combined GP-prime sum **668,182**, yielding **51.57317073 prime-value units per original rune**. The uniform 29-rune benchmark has mean **51.03448276**.

Two independently fixed *native plaintext* registers were used:

- **Cicada's own solved prose** from [LP1 and the solved p56/p57](../resources/liber-primus/lp1-plaintext-reference.txt), selecting the 13 independently recorded narrative sections (LP1 pp1/3/5/6/9–15 and LP2 pp56/57) and removing the final SHA-512-looking hex target and editorial continuation lines. It supplies **722 native-encoded words**. The exact GP29 transliterator reproduces **all 95 original p57 PARABLE runes verbatim** after including its printed heading, including the original single-rune ING and IO conventions. The solved source is editor-normalized, with some repeated quoted prose; this is a word-distribution control, not a claim of a perfect verbatim 2014 copy.
- A separately archived [Latin Vulgate New Testament GP29 word corpus](../resources/control/latin-vulgate-gp-wholewords.txt), with **39,835** source-native words and original word boundaries.

For *each* original word independently, draw a reference word **of exactly the same number of GP runes**. The expected total is the sum of the 2,896 length-specific reference means; uncertainty under that explicit matched-word sampling is the root sum of the matched variances. This compares the original text's **fixed word-length inventory** instead of conflating a shortage of long English words with a cryptographic effect.

| Fixed original target and source register | Original full sum | Mean prime units per rune predicted by matched native source | Source-matched expected sum | Sampling SD of total | Standardized gap |
| --- | ---: | ---: | ---: | ---: | ---: |
| Native solved Cicada GP prose | **668,182** | **45.08499630** | **584,121.21** | **3,405.44** | **+24.68** |
| Independently archived Vulgate GP Latin | **668,182** | **44.35913612** | **574,716.97** | **3,114.99** | **+30.00** |

In both source registers, original LP2 ciphertext exceeds the reference **at every GP-word length 3 through 12**, even after conditioning on all 2,896 original word lengths. A deterministic **2,896-word native positive plant** for each source samples those exact lengths, reverses the source rune order within each word, and preserves *every word's integer GP prime sum*. The same gate places these artificially sum-conserving ciphertexts at **−0.69** and **+0.75** source-standard deviations. This demonstrates that the test detects an arbitrary reversible per-word rune permutation that really maintains the sum.

## What this decides

For ordinary prose resembling **Cicada's own actually solved English**, or the independently pinned **GP29 Latin Vulgate**, the original unsolved book's exact integer word-sum inventory is grossly incompatible with a *word-sum-preserving ciphertext* under the fixed original word boundaries. The 24.68/30.00 figures are standardized discrepancies under the stated independent reference-word sampling experiment. They are not universal probabilistic bounds on all possible intended plaintexts: an author could write unusual high-prime-sum words, use non-native orthography, alter word boundaries, or encode content in a different register.

This closes the *simple* interpretation that every ciphertext printed-word prime sum is itself the unchanged sum of an underlying native English/Latin plaintext word. It **does not** invalidate using printed prime sums as a **navigation code, hidden metadata or externally supplied key coordinates**. In particular, the previously preserved p55 365/398 and 2016 signed word-address coincidences remain observations, with their interpretation conditional on an unsupplied original operation.

**Decision:** seek a source-fixed reversible **address/operand** or actual unknown plaintext; do not assume that all 2,896 ciphertext word sums are plaintext checksums or reconstruct sentences by conserving them. No unknown LP2 plaintext, private key, or destination was obtained.

**Reproduction:** [Windows Node22 single-file original-input test](../sims/lp2_wordprime_sum_conservation_sft.cjs), which checks the complete original rune transcription, source-native original p57 95/95 GP spelling, both source registers, complete length-matched means, and the two reversible prime-sum-preserving positive plants. No input rune is edited or omitted.
