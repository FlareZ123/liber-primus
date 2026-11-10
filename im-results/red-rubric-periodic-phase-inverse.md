# Two distant original red headings: exact shared periodic-key inverse

**Agent 18, 10 November 2026. Evidence class: original-cipher finite dictionary exclusion with exact planted-key recovery.** No unknown LP2 plaintext, historical key, complete mechanism or destination has been recovered. The standing repository-wide findings remain in [results/README.md](../results/README.md).

## Question and independently printed input

Do two original ink-selected red chapter headings share an ordinary repeating GP29 additive key, allowing an entirely unknown key, unknown phase difference, and either direct or Atbash-style rune carrier?

The source inputs are the original **second word of physical LP2 page 3** (11 GP runes) and **second word of page 27** (12 GP runes), selected by their red headings rather than ciphertext-to-English scores. Their fixed numeric ciphertexts under the canonical GP alphabet are:

- p3: \`[12,8,21,5,2,16,25,11,16,14,8]\`
- p27: \`[20,15,3,24,25,8,20,18,12,10,19,20]\`

Printed heading word-length sequences are **[2,11,3]** and **[3,12,4]**. The dictionary is the pinned \`resources/control/english_wordfreq_textblob.txt\` normalized through GP digraphs, \`QU→CW, V→U, K→C, Z→S\`. It contains **1,611 distinct 11-rune** and **884 distinct 12-rune** candidates. Exactly one complete dictionary word is assumed per entire ciphertext anchor word.

For each candidate period \`k=1..20\`, each source-word pair, each relative phase \`δ=0..k−1\`, and both carriers, derive key constraints directly:

\`\`\`text
K[i mod k]       = (carrier(C3[i]) - P3[i]) mod 29
K[(j + δ) mod k] = (carrier(C27[j]) - P27[j]) mod 29

carrier(C) = C, or carrier(C) = 28-C.
\`\`\`

Any repeated key position with different prescribed values rejects the pair. The key values, shift and all permitted dictionary words are exhaustively enumerated; no beam truncation, approximate language ranking, or unconstrained word-level replacements are used. An exact map join on shared key slots makes the search fast without losing candidate pairs. Any unused key slots are genuinely unconstrained and not silently assigned plaintext evidence.

## Original-cipher result

| Key period | Direct carrier compatible pairs | Atbash carrier compatible pairs |
| ---: | ---: | ---: |
| **1–18** | **0 for every period** | **0 for every period** |
| 19 | 3 | 3 |
| 20 | 163 | 57 |

At period **19**, the three direct-carrier fits all require relative phase **7**: \`SPECTACULAR/IMPLANTATION\`, \`SUBCAPSULAR/IMPLANTATION\`, and \`SUBSCAPULAR/IMPLANTATION\`. The three reverse-carrier fits also require phase **7**: \`FREEMASONRY/DISINFECTANT\`, \`FREEMASONRY/DISINFECTION\`, and \`FREEMASONRY/DISINTEGRATE\`.

**Chance-fit calibration, with no fitted parameters:** for independent uniform 11- and 12-rune GP ciphertext strings, the expected compatible dictionary-pair count for either carrier is

\`\`\`text
(1,611 × 884) × sum over δ=0..k−1 of 29^(−overlap(k,δ)),
overlap(k,δ) = |{0,…,10} ∩ {(δ+j) mod k : j=0,…,11}|.
\`\`\`

For periods **18, 19, 20**, the exact expected counts **per carrier** are approximately **0.421550, 10.211420, 237.739110**, respectively (the formula is exact for k≥12, when individual anchors have no duplicated key slots). Thus seeing zero pairs up through period 18 and several pairs at period 19 is *quite unsurprising* under this independent-uniform model. The period threshold by itself is no statistical evidence that 19 was used historically.

These six pairs are **dictionary matches, not historical decryptions**. The word \`FREEMASONRY\` has thematic appeal, and the \`FREEMASONRY/DISINFECTION\` key incidentally decodes the *preceding p3 two-rune word* to \`THE\` if printed hyphens consume no key positions. But it fails the remaining p3 and p27 heading words, and the passage \`THE FREEMASONRY [nonword]\` is no authenticated plaintext.

### Truly unfitted original red-heading challenge

Freeze each of the six complete 19-symbol keys without changing a byte. Test the independently printed eight-rune heading words at physical pages **0, 8 and 33**, which had no influence on the two-anchor key fit. Allow **all 19 possible key phases separately for each test word**, a concession more generous than any prescribed book, page or heading clock.

**All six keys yield zero dictionary words on each of all three holdouts.** The six candidate keys therefore fail this straightforward joint-red-heading predictive challenge. A genuine alternative plaintext register, variable key, alternate punctuation clock, transformed word boundaries, or text not in the pinned dictionary remains beyond this experiment.

## Exact source-shaped positive controls and reproducibility

The test first generates ciphertext from real dictionary words \`SPECTACULAR\` and \`IMPLANTATION\` under a secret pseudorandom key in two regimes: **period 7, direct carrier, phase 3**, and **period 19, Atbash carrier, phase 7**. With no key hints supplied to the inverse, the exact true plaintext pair, complete key and phase are recovered in both cases. The recovered GP words decrypt and re-encipher exactly. The original-data attempt has no analogous authenticated plaintext.

- [Complete executable exact inverter](../sims/red_rubric_periodic_phase_inverse.cjs)
- [Successful original-source and blinded-plant GitHub Actions run 42855561120](https://github.com/FlareZ123/liber-primus/actions/runs/42855561120)
- [Earlier distinct all-secret-monoalphabet insertion study](red-rubric-shared-monoalphabet-exclusion.md)

**Decision:** Shared simple additive/Atbash GP29 keys of period at most 18 with unknown phase and exact English-GP red words are closed for these two source-selected headings. The 19-period survivors lack independent plaintext support. This family should be reopened only for an independently specified changed key/clock/word transformation. This finite dictionary exclusion is narrower than a cryptographic impossibility theorem and does not rule out a different manuscript cipher.
