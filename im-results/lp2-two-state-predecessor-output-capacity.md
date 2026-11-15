# Two-state predecessor rotor: all-key GP29 plaintext-capacity bound

**Agent 43, 15 November 2026. Source-exact, Windows-tested finite architecture exclusion. No unknown LP2 plaintext, authentic creator key, original cipher or continuation URL is recovered.**

## Why this family warrants an all-secret test

The unsolved LP2 print suppresses adjacent identical rune glyphs (86 same-page doublets among 12,901 consecutive pairs), while its 29-symbol unigram distribution remains nearly flat. This invites a simple source-motivated explanation: a reversible rotating alphabet conditioned on the previous published rune, with one extra binary state selecting between two substitution tables. The visible distinction between black and red ink is one possible binary selector; an internal alternating/key-dependent bit is another. The original artifact **does not prescribe this cipher**. Instead of tuning one two-state rotor, this experiment grants **every possible state-transition policy and every possible pair of secret GP29 permutations**, and asks whether the complete family can carry ordinary source-native English.

This result is distinct from the earlier [single fixed predecessor S-box, top-*k* majorization gate](lp2-firstorder-gp29-majorization-allkey.md) and from the [one fitted two-state affine GP28 rotor](lp2-two-state-parity-rotor-blind-original-gate.md): here the two GP29 alphabets per preceding rune are **completely arbitrary** and the state may change adversarially at every position, including in dependence on unknown plaintext. The numerical top-two row statistic was available in earlier first-order work; the new contribution is its **necessary-condition interpretation covering all two-state direct bijective output rotors**, with a source-native positive model.

## Exact 29×29 original-source theorem

Let `C[i]` be the original GP29 ciphertext symbol, `P[i]` the hypothetical GP29 plaintext and `s[i]∈{0,1}` a hidden state with *any* update function. Assume at each non-initial position within a physical page:

```text
C[i] = pi[C[i-1], s[i]](P[i]),
```

where every `pi[r,s]` is a **fixed but unrestricted permutation of all 29 symbols**. All **55** first positions of the 55 rune-bearing pages are permitted to contain any plaintext rune, with an arbitrary page initialization; thus the proof is generous about physical-page resets.

For any selected plaintext rune `t` and previous ciphertext rune `r`, the two permutations send `t` to **at most two possible next-ciphertext values**, regardless of how often the hidden bit switches or how its transition depends on prior data. Let `N[r,c]` count exact original within-page occurrences of adjacent ciphertext values `r,c`. Therefore

```text
count_plaintext(t)
 <= 55 + sum_{r=0}^{28} (largest K entries of N[r,*]),
```

for any architecture with at most `K` stationary GP29 output permutations for each preceding glyph and completely unconstrained switching. This is exact and key-independent. No language score, candidate key, synthetic fit, clock phase or guessed plaintext positions enter the original-source matrix.

The original `resources/liber-primus/lp2-corpus.json` yields:

| Distinct output alphabets allowed per predecessor (K) | Sum of row-top-K successor counts | Including 55 free page starts | Maximum frequency of *any one* plaintext GP29 rune |
| ---: | ---: | ---: | ---: |
| 1 | 714 | 769 | 5.9355% |
| **2** | **1,359** | **1,414** | **10.9139%** |
| 3 | 1,971 | 2,026 | 15.6375% |
| 4 | 2,564 | 2,619 | 20.2146% |

The exact within-page count is 12,901 pairs from 12,956 source runes, and all 29 predecessor rows are included. Adjacent same-symbol ciphertext cases are retained; the proof does not rely on the near absence of repeated ciphertext symbols.

## Original-language consequence and scope

The independently pinned, historically relevant native-GP **Blake** control already analyzed in [the first-order capacity study](lp2-firstorder-gp29-majorization-allkey.md) gives **at least 1,607 E runes** in **every one of 5,623** complete 12,956-rune windows. The new completely unrestricted two-state model permits **at most 1,414 E**, a deficit of **193 occurrences even with all physical page starts gifted**. Therefore, every single one of those matched-length Blake-English plaintext candidates is **mathematically impossible** under **all** 29×29×2 stationary secret output mappings and all binary state histories. The solved LP1 English E frequency, 406/3,287 (12.35%), likewise illustrates why a 10.91%-maximum architecture is implausible for ordinary text in the established GP29 register.

The unconditional statement is the source ciphertext's **1,414 maximum for any chosen plaintext rune** under the declared two-state family; excluding generic English is an inference from independent native-GP language controls. A deliberately low-E text or a non-English/encoded plaintext may still fit. A cipher that uses at least **three output alphabets per predecessor** also passes this particular E-capacity necessity test, because its maximum rises to 2,026. Independently rekeying a full pair of S-boxes per chapter or per physical page, using extra unobserved state, variable-width output, inserted/deleted nulls or a nonbijective/escape register is outside this proof.

**Research decision:** do not search arbitrary keys or binary transition logic within a *globally stationary* two-state predecessor GP29 rotor, even if the key schedule depends on the plaintext; it cannot reproduce Blake-like original-rune prose. Any viable predecessor-state route must first identify an independently motivated third output alphabet, a changing chapter key, or a different symbol register. An extra bit alone, regardless of update rule, cannot solve this model's language-frequency obstruction.

## Reproducibility

The [standalone CommonJS original-input SFT](../sims/lp2_two_state_predecessor_capacity_sft.cjs) asserts 55 original nonempty pages, 12,956 rune values, 12,901 within-page transitions, the exact top-1 through top-4 capacities, and the two-state maximum of 1,414. An independent **12,956-rune** positive test repeats the actual clear p57 PARABLE runes over the unchanged original physical page lengths, encrypts under 58 entirely source-independent affine field permutations `pi[r,s]` with a **plaintext-parity-updated hidden bit**, decodes **12,956/12,956** runes with the true hidden key, and checks its own two-state occurrence bound. This authentic-source-native positive has **2,045** of its chosen GP rune18, below its generated ciphertext's **4,843** two-state capacity; a genuine valid rotor does not spuriously fail the theorem. An original-source re-encryption of arbitrary hypothetical plaintext would not validate a guessed historical key, and no such claim is made.

The SFT **passed on Windows, Node.js 22** under the repository's existing read-only CI runner: [GitHub Actions run 43743632913](https://github.com/FlareZ123/liber-primus/actions/runs/43743632913). This single exact original-input test adds a reusable no-key architectural constraint, rather than a candidate plaintext or a reason to increase the state size by blind parameter fitting.
