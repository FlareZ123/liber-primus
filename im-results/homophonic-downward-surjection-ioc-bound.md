# Static homophonic 29-to-k upper bound

**Classification: key-independent family constraint; no plaintext or key recovered.**

## Motivation and exact scope

The 29-symbol Gematria Primus ciphertext alphabet is visibly larger than the 26-letter English alphabet. A simple non-GP hypothesis is therefore a fixed many-to-one substitution: each of the 29 ciphertext runes maps to one of k plaintext symbols, with every plaintext symbol used. This is often called a homophonic-downward or surjective 29-to-k map.

The external [Dukotah measured-ceiling inventory](https://github.com/Dukotah/cicada3301/blob/f63501d8f2d835b80c30230eb89a1110fb9197d2/liber-primus/MEASURED-CEILING.md) lists this family as not yet searched. The present experiment does **not** attempt a key search. It gives an exact upper bound on the plaintext index of coincidence for every fixed surjection, then tests the natural k=26 case and its ordinary alias-class shapes.

## Exact bound

Let the 29 ciphertext symbols have counts c1,...,c29. A surjective map partitions these counts into k nonempty groups; each plaintext-symbol count is the sum within its group. Since IoC is proportional to the sum of squared output counts, the maximum possible IoC for fixed k is attained by merging the largest 29-k+1 ciphertext counts into one group and leaving the other k-1 symbols as singleton groups.

This is an exact maximum over **all** secret mappings, not a heuristic or a sampled search. It also gives an immediate impossibility test: if the maximum IoC is below a native-language control, no fixed surjection can produce that language from this ciphertext.

## Original and control inputs

- Original stream: `resources/liber-primus/lp2-corpus.json`, 12,956 rune indices, GP29 alphabet, Git blob `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`.
- English: `resources/control/shakespeare_first300k.txt`, encoded by the existing GP transliterator, blob `94c677ad9dd50771c6670e0c4e4dad9052b46d85`.
- Latin: `resources/control/latin-vulgate-gp-wholewords.txt`, blob `fd15f9c814291e551c4b8b93337b4245a095ea85`.
- Old English: `resources/control/beowulf_oe_gp_profile_corrected.json`, its recorded GP29 positive-control string and alphabet, blob `445eb016711fc9f36d17bd10de544c3ff378fcbe`.
- Solved LP1 English reference: `resources/liber-primus/lp1-plaintext-reference.txt`, encoded with `sims/word_partition_invariant.cjs`, blob `beb43aac08b8482590c4430aadd1ee91da3876a0`.

The original stream has global IoC **0.034478398**, essentially the uniform 1/29 baseline **0.034482759**. The four native controls have global IoCs:

| Control | Symbols | IoC |
|---|---:|---:|
| English / Shakespeare | 12,956 | 0.061082339 |
| Latin / Vulgate | 12,956 | 0.074455346 |
| Old English / Beowulf | 12,956 | 0.057365433 |
| Solved LP1 English | 3,463 | 0.061835667 |

## Maximum possible IoC by plaintext alphabet size

| Plaintext symbols k | Maximum original-stream IoC |
|---:|---:|
| 29 | 0.034478398 |
| 28 | 0.037304148 |
| 27 | 0.042770549 |
| **26** | **0.050863136** |
| 25 | 0.061359726 |
| 24 | 0.074377691 |
| 23 | 0.089849467 |
| 22 | 0.107820740 |
| 21 | 0.128291510 |
| 20 | 0.151111317 |

**A fixed global 29-to-26 surjection is impossible** for all four controls: even its most favourable possible mapping reaches only **0.050863136**, below every native-language IoC above.

The natural three-pair homophone arrangement (three plaintext symbols each receive two ciphertext aliases) is more restrictive: its maximum is **0.042463313**. Other k=26 shapes also fail: one four-way class reaches 0.050863136, and one triple plus one pair reaches 0.045346736.

For k=25, the most permissive shape is one five-way homophone class plus 24 singletons; its maximum is **0.061359726**. This only barely exceeds the Shakespeare control and the Old English control, and remains below Latin and the solved LP1 reference. Every other tested k=25 shape is below the native controls:

| k=25 alias-class shape | Maximum IoC |
|---|---:|
| One five-way class | 0.061359726 |
| One four-way plus one pair | 0.053384510 |
| Two triples | 0.050444297 |
| One triple plus two pairs | 0.047857148 |
| Four pairs | 0.044962810 |

Thus a 29-to-25 mapping is not generally supported: only an unusually concentrated five-way alias class can even clear the English/Old-English scalar threshold. This is an upper bound, not a positive plaintext fit.

## Independent per-body sensitivity

The source-defined nine-body partition from [the current section synthesis](../workplace/lp2-section-clock-ambiguity.md) was also tested, allowing each body its **own** arbitrary 29-to-26 map. The maximum IoC is below all three length-matched English, Latin, and Old English controls in each of the eight bodies of at least 700 runes. The 91-rune p33 interlude is too short for this per-body bound to decide.

| Body | Runes | Original IoC | Maximum per-body 29-to-26 IoC | English control | Latin control | Old English control |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 729 | 0.034082516 | 0.056143445 | 0.063966897 | 0.074138139 | 0.060315199 |
| 2 | 1,145 | 0.034633707 | 0.057762543 | 0.063369164 | 0.072838733 | 0.058254191 |
| 3 | 1,738 | 0.034486003 | 0.054788059 | 0.062867145 | 0.075210689 | 0.055208741 |
| 4 | 1,894 | 0.034494896 | 0.053699201 | 0.061249387 | 0.076387692 | 0.058267803 |
| 5 | 1,021 | 0.034274356 | 0.055082484 | 0.061786791 | 0.074684565 | 0.055391677 |
| 6 | 1,433 | 0.034186202 | 0.053499515 | 0.060340459 | 0.075348821 | 0.058567602 |
| 7 | 91 | 0.031990232 | 0.078632479 | 0.074236874 | 0.075702076 | 0.051770452 |
| 8 | 1,589 | 0.034349820 | 0.054591310 | 0.062054458 | 0.077324744 | 0.057362250 |
| 9 | 3,316 | 0.034462827 | 0.053196440 | 0.059839491 | 0.074799091 | 0.057637452 |

This does not prove that the cipher resets at these titles. It shows that even granting independent secret alphabets per source-titled body does not rescue a 29-to-26 static surjection in the eight substantial bodies.

## Decision and remaining space

- **Rejected:** fixed global 29-to-26 surjections, including the most favourable possible alias grouping.
- **Rejected:** ordinary three-pair 29-to-26 homophones, and all tested k=25 shapes except the single five-way class.
- **Not resolved:** k=25 with one five-way class; k<=24; evolving or position-dependent mappings; variable-length outputs; multi-character digraph mappings; non-GP registers; and non-English plaintext outside the tested controls.

The result is an exact frequency bound, not a decryption. It does not justify a brute-force alias search without a source-selected k, class structure, or output register.

## Reproduction

Run:

```sh
node sims/homophonic_downward_surjection_ioc_bound.cjs
```

The script reads the canonical original rune indices and four independently sourced controls, computes the exact maximum over all surjections for k=29 through 20, checks fixed alias-class shapes, verifies maximizing maps that attain the bound, and runs the per-body 29-to-26 sensitivity.
