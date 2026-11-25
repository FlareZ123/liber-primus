# Nonlinear word-local second-difference permutation: exact original-key recovery gate

**Agent8, 25 November 2026. Decision:** no source-native plaintext or key for the stated receiver on either original pp0–2 or the complete p54 training words, even permitting 5% arbitrary out-of-register groups. This is a finite-register cryptanalytic exclusion, not a discovered historical cipher or new LP2 plaintext.

## Receiver and independent motivation

The signed 2016 instruction emphasizes words, numbers and direction; the 2015 participant-derived prime/difference register motivates examining a second difference, but is not itself a first-party cipher instruction. The previously tested [word-local additive polynomial ramps](lp2-wordaffine-twofree-second-difference-allsecret-original-gate.md) preserve an ordinary second difference; [stationary nonlinear substitution of first plaintext differences](lp2-plaintext-difference-nonlinear-allsecret-original-gate.md) is a distinct receiver. Test a genuinely different, reversible nonlinear extension of the former:

```text
D2(X)[j] = X[j+2] - 2 X[j+1] + X[j] mod 29
D2(C)[j] = h(D2(P)[j])
```

Here h is one arbitrary shared bijection of all 29 GP values. The first two plaintext and ciphertext runes of each complete printed group are independently unconstrained; singletons are wholly free. Thus the model grants nonlinear curvature remapping and independent word initial value/slope, not a fixed affine map. No original source yet selects this law, and the adjacent-repeat suppression is not independently explained by it. An unrelated cipher, a changed segmentation, or time-varying h is a viable rival.

## Constructive all-key attack

The source parser reconstructs 2,896 complete physical LP2 words (32 page carries) and 12,956 original runes, exactly matching the canonical page indices. The frozen dictionary contains 36,715 distinct GP forms, compiled from three pinned literary sources, the frequency register, both deterministic spelling variants, the exact 740 solved-source tokens, and all singleton runes. All file blob identifiers are in the output.

For any proposed plaintext word, the equality pattern of its second-difference sequence must equal that of the ciphertext second-difference sequence. This is necessary and sufficient for a local partial bijection. Index the dictionary by length and that pattern, deduplicate identical difference sequences, and retain every actual word. Each candidate gives a set of pairs C-difference → P-difference. The inverse map and its reverse enforce injectivity in both directions; any compatible union extends to a complete permutation.

DFS chooses the remaining anchor with the smallest compatible domain, branches over all compatible tuples, and permits an explicit missing-group branch up to the prespecified OOV allowance. Empty domains force a missing group. A true admissible global key has a branch through every in-register anchor, so exhausting the tree with no leaf is an exact exclusion independent of any ranking heuristic. The additional completion procedure enumerates missing bijection entries and uses **all fit groups only** to retain full keys within budget. Holding a partial state is not proof that all its word candidates share a complete key; full-key enumeration addresses that distinction in the controls. Final ranking of multiple full keys uses training OOV count and a deterministic key order; no held word influences it. Exact forward encryption uses the original two C seeds and the selected inverse key, and every returned full-key lexical candidate is checked.

## Blind key recovery and held-out words

Use the actual terminal group lengths: 49 complete p54 fit words / 222 runes and 17 held groups / 86 runes. The held group containing the physical p54→p55 seam includes the 10-rune p54 prefix, so the 86-rune holdout includes the complete untouched 76-rune p55 and its 10 preceding carry runes. The independent plaintext controls are native-GP spellings sampled by length from Gibran, Shakespeare and Emerson (dictionary fallback if a length is absent); these are not continuous authored passages. Three independently permuted secret maps are hidden during fitting. A fourth control deliberately replaces the two longest fit anchors with out-of-register random words and allows two arbitrary OOV groups.

| Control seed | OOV budget | Partial states | Full keys | True key retained | Held true words present in frozen full key | Held unique true words / runes |
|---|---:|---:|---:|---|---:|---:|
| 3301 | 0 | 1 | 1 | yes | 17/17 | 8 / 62 |
| 1033 | 0 | 1 | 1 | yes | 17/17 | 9 / 66 |
| 729 | 0 | 1 | 1 | yes | 17/17 | 8 / 62 |
| 20261125 | 2 | 1 | 4 | yes | 15/17 | 6 / 45 |

All three strict controls recover the exact full 29-entry key uniquely, retain all 51 independently held words (258 runes) and uniquely recover 25 words (190 runes). The two-OOV control leaves four full keys, 26 common forced entries, and the true key among them. The deterministic first key is **not** the true key; its weaker holdout illustrates the genuine ambiguity rather than a successful robust unique recovery. All searches complete within their caps. The model's free initial plaintext pair means even the right full key does not necessarily identify a word, especially short groups.

## Untouched original decisions

| Fit scope | Complete groups / runes | OOV allowance | Anchor length | Anchor count | Exact search nodes | Admissible anchor leaves |
|---|---:|---:|---|---:|---:|---:|
| p54, complete before carry | 49 / 222 | 2 | ≥7 | 9 | 1,429 | 0 |
| pp0–2 | 158 / 729 | 7 | ≥8 | 21 | 1,750 | 0 |

Every individual original fit group has a locally compatible dictionary candidate. The incompatibility arises only from the shared permutation: all allowable combined anchor states die. Thus the terminal fit requires at least three out-of-register groups among those nine anchors, and the opening at least eight among those 21, already exceeding their **entire** fit allowances. No original key is available to freeze, so no original p55 lexical fit, language score, or proposed plaintext is reported.

This excludes even independent chapter-private choices of h for these two fit scopes under the finite same-length word assumption. It does not exclude altered boundaries, higher OOV rate, a different language, different curvature relation, or private per-word/per-position maps. The latter would need independent constraints on their hidden state. Do not tune or extend this exact rejected receiver merely to manufacture plausible words.

## Reproduce

[Read-only Node22/CommonJS SFT](../sims/lp2_wordlocal_nonlinear_second_difference_sft.cjs) and [complete raw output with pinned inputs](lp2-wordlocal-nonlinear-second-difference-output.json). Executed the exact experiment function in connected V8; the standalone Node wrapper has not been separately executed in CI. No new workflow. The 2015 solver-derived difference mechanism is only motivation, not authenticated key provenance.
