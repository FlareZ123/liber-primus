# Joint location of LP2 lag-five identity and lag-six affine echoes

**Status:** original-ciphertext conditional test, 2026-11-10, Agent 18. The two input features were historically selected after inspecting LP2. This is an exploratory **mechanism-discrimination result**, with no recovered unsolved plaintext, key, cipher architecture, or puzzle destination.

## What can the two echo families actually imply jointly?

Within a true, whole LP2 rune word define two previously observed event classes at zero-based word position \(i\):

- **L5:** \(C_i=C_{i-5}\), valid for \(i\ge5\).
- **T6:** \(C_i=(24-2C_{i-6})\bmod29\), valid for \(i\ge6\).

The original **2,896 complete ciphertext words** have **104 L5 rune events** and **80 T6 events**. The 559 words long enough for T6 contain 95 L5 events in 84 words and all 80 T6 events in 74 words. **Eighteen distinct words** carry at least one event of *each* type. Across those jointly affected words, there are six cases of an L5 event and a T6 event on the same position, six with T6 immediately before L5, and three with T6 immediately after L5. Counts can overlap because one word can contain multiple hits.

The notable question is whether the 18 shared words are evidence for **one coupled repair event**, beyond the already established separate L5 and T6 excesses. A plain within-word rune shuffle alters the occurrence rates of both families and therefore cannot answer that question without confounding.

## Exact-marginal conditional test

Keep **every actual word's complete L5 event-position vector and complete T6 event-position vector**. Under the null, reassign whole T6 event vectors among words of the same **word length**; optionally constrain exchanges to the same **section and length**, or the same **physical starting page and length**. Neither event family is synthesized or recomputed from a new ciphertext. This preserves all observed individual event totals and positional clustering, so only their association is randomized.

For a stratum of \(n\) words with \(n_5\) words having at least one L5 event and \(n_6\) having at least one T6 event, the **exact expected number** of jointly hit words is \(n_5 n_6/n\). Sum over strata. Each finite null uses 10,000 independently seeded Fisher–Yates re-pairings of complete word vectors; seeds are set in the source.

| Conditioning of whole event patterns | Strata | Exact E[joint words] | Observed | Simulated mean | Unadjusted one-sided empirical p |
|---|---:|---:|---:|---:|---:|
| Word length | 8 | 14.32452 | 18 | 14.2834 | **0.13539** |
| Section + word length | 51 | 13.08865 | 18 | 13.0854 | **0.04600** |
| Physical starting page + length | 212 | 13.87619 | 18 | 13.8845 | **0.03370** |

Additional site-location comparisons use the same exact-marginal null:

| Position association | Actual events | Length-only p | Section+length p | Page+length p |
|---|---:|---:|---:|---:|
| Same rune position | 6 | 0.22458 | 0.11689 | 0.12449 |
| T6 one rune before L5 | 6 | 0.03990 | 0.04940 | 0.26877 |
| T6 one rune after L5 | 3 | 0.80212 | 0.59874 | 0.25757 |

All p-values are **exploratory**: the two relation families were identified from the same original ciphertext, the word-level overlap and positional offsets were inspected after seeing that ciphertext, and three different conditioning choices are reported. The smallest of the twelve one-sided p-values is 0.03370, whose elementary twelve-test Bonferroni adjustment is 0.40436; this is only a within-reported-tests correction, not an accounting of the broader historical motif search. As a result, the **18 joint hit words do not establish a separate coupled cipher channel**, even though both individual motifs are independently unusual under their own prior null models. The site-offset results likewise provide no stable, held-out directionality.

## Decision impact and limitations

A prospective decoder should model **both** the 104 L5 identities (and their 11 S-specific events), 80 T6 affine events and their observed clustering. It currently lacks evidence that an L5 hit forces a T6 event in the same word, on the same rune position, or at one fixed lag. A model with separate rare mechanisms is still compatible with these conditional co-location measurements, but it must satisfy the already documented forward and invertibility tests.

This test cannot distinguish a real shared hidden key from two independent mechanisms with word-specific state if both yield the same observed marginal hit vectors. Reassignment within the very small page-length strata also conditions heavily on the observed layout; its nominal p-value must not become a new selected key hypothesis.

**Reproduction:** [Node.js 22 CommonJS source](../sims/lag5_t6_joint_hitpatterns.cjs) uses the exact canonical parser and verifies all 2,896 whole words, 12,956 original runes, 104 and 80 individual hits, and 18 shared words. It ran successfully in the existing dispatch-only [lag-five workflow, run 42773671776](https://github.com/FlareZ123/liber-primus/actions/runs/42773671776), with 10,000 nulls for each of the three stratifications. The executable prints all exact expectations, counts, seeds and empirical tails as JSON.

**Further work with decryption potential:** require a source-derived reversible key/state and an independently predicted original LP2 plaintext interval. These conditional statistics merely protect that key hunt from mistakenly treating a post-selected joint-position coincidence as an authenticated transformation.
