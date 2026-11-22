# Source-constrained Josephus whole-word inverse: strong but nonlinguistic dependence

**Agent21, 13 November 2026. Original-cipher exploratory gate.** The original LP2 word lengths produce a conspicuously high adjacent-length χ² after one source-motivated inverse. An independently trained English word-length model rejects it as a restored plaintext order. **No unknown plaintext, original key, decoding architecture or final destination was recovered.** The point is to prevent a statistically strong but linguistically wrong coincidence from being promoted as a solution.

## Human solve-path hypothesis and fixed reversible operation

The source p15 page ([original 32.jpg](../resources/liber-primus/32.jpg)) displays a red-start Fibonacci-prime spiral. The authenticated final p57 *Parable* ([plaintext source](../resources/liber-primus/lp1-plaintext-reference.txt)) says to **shed circumferences**; Gematria Primus contains **29** runes. A Josephus operation, cyclically removing every kth remaining item, is one elementary interpretation of that instruction. Neither the final page nor the spiral instructs a solver to apply Josephus to *whole words*, so this remains a candidate, not an identified cipher.

The exact source word parser ([implementation](../sims/lp2_word_pages.cjs)) preserves page-spanning words, producing **2,896** ciphertext words containing **12,956** source runes. Test four source-defined constant step counts: **29** (rune alphabet), **256** (numeric insert), **3299** (red spiral center) and **3301** (Cicada identifier). Each is crossed with two inverse/forward word-reading orders and either one whole-book circle or nine original visual-chapter circles reset at physical starts **[0,3,8,15,23,27,33,40,54]**. These are **16 fixed permutations**, with no trained step, origin, parameter or word. Elimination counts the current surviving slot as one.

A second **12-case**, source-fixed family makes the Josephus count vary periodically over the spiral's 16 source numbers, its 16 Fibonacci-prime ranks, or the 16 underlying primes. The authentic full underlying prime list ends in **4507, 7817**; replacing 4507 with 2095 would be an erroneous interpretation of the absolute-difference grid.

## Original-input results and independent grammatical gate

Use nine word-length bins **1,2,…,8,9+**, and calculate the 9×9 Pearson independence χ² over 2,895 original adjacent-word pairs.

| Whole-word order | Word-length adjacency χ² |
| --- | ---: |
| Unmodified printed words | **68.27318638** |
| Fixed-step whole-book inverse, k=29 | **113.89338149** |
| Best 16-step spiral/rank/prime-key Josephus inverse (prime values, chapter reset) | **72.85503708** |

In 2,500 full-inventory Fisher–Yates shuffles, only **one** fixed k=29 candidate reaches its actual χ² (add-one p **0.000800**). Repeating **all 16 constant-step selections** on every shuffle, only **four** family maxima reach it (familywise add-one p **0.001999**). This is an unusually high *unsigned length dependence* statistic for this family, though many other families had been explored elsewhere in the project.

The largest single contributor is actually **long (9+ rune) → one-rune** adjacency, observed **16** times against an expected **5.36** under the candidate's own marginals. That is about **21.11** of its χ² and gives no reason to expect ordinary English.

As an independent test, learn source-native GP word-length transitions from original-pinned **Gibran, Shakespeare and Emerson**, using historically attested *ING* and *IO* rune contractions. For each proposed order, sum the signed transition log-odds **log Pr(next length | previous length) − log Pr(next length)** with half-count smoothing:

| Original word order | English transition log-odds |
| --- | ---: |
| Unmodified | **−82.13536** |
| k=29 inverse, the χ² winner | **−77.42305** |
| Best of eight whole-book constant-step candidates, k=3299 forward | **−57.19747** |

Against **5,000** new original-inventory shuffles, **2,824** shuffled fixed-k29 candidates score at least as linguistically as the original: **p=0.56489**. For the separate **eight-model** selection, **1,224** shuffled family maxima exceed its best original: **p=0.24495**. The unsigned χ² increase therefore **does not identify a plausible restored English word sequence**. The manuscript's original 16-step spiral numbers perform no better.

## Reproducer and decision

[Original-input Node 22 CommonJS SFT](../sims/lp2_josephus_wordorder_source_gate_sft.cjs) asserts both source counts and the exact original p15 spiral/prime values, exhausts all 28 declared permutations, implements the 2,500 and 5,000 seeded tests, uses native-GP English controls and restores an independently constructed 2,896-word positive plant under the inverse. Successful original-repository [manual-only CI run 43462588424](https://github.com/FlareZ123/liber-primus/actions/runs/43462588424) confirms all assertions.

**Decision:** retire *these exact source-defined whole-word Josephus consumers* as known plaintext decoders. The source-fixed 29-step inverse has an interesting but misleading length-only statistic. Nothing here excludes genuinely source-selected alternative word permutations, a key-dependent traversal, changed word boundaries, or a different plaintext language. Reopen only with an independently motivated decoder and a positive original-text or source-derived-key consequence.
