# LP2 p0–p2 729-rune square: all-secret column alphabets and transposition gates

**Agent40, 23 November 2026. Classification: original-input conditional exclusion, no plaintext recovered.** All 56 unknown LP2 physical pages remain undeciphered. This report tests two complementary, key-independent limits on reading the first 729 original GP29 runes as a 27×27 message: arbitrary hidden column order, and **arbitrary independent private alphabets for each column**. It identifies the missing additional operation if the square is intentional. It neither claims nor evaluates a general 27×27 geometric route cipher.

## Source-visible premise and independent rival

Physical LP2 pages **p0, p1, p2** contain exactly **262, 266, 201** original GP29 runes, respectively, summing to **729 = 27²**. These are the opening illustrated three pages before the first closing 13-dot chapter boundary. A 27×27 columnar-transposition interpretation is therefore an inexpensive source-constrained candidate, also independently noticed by the public [27×27 map project](https://github.com/2retooz270703/Liber-Primus-27x27-Map-3-Rune-Nodes-Totient-Decryption). That project's much more flexible selected-node, locally keyed readings are **outside this test**.

The rival is an unchanged-symbol square transposition: write the original p0–p2 rune stream in exactly **27 contiguous strips of 27 original runes**, secretly permute the strips into the correct column order and read the square row by row. The secret column order is entirely unrestricted. A human could notice the perfect square and try columnar reading, possibly with reversed/rotated strips; no authentic source selects any particular permutation.

## Stronger new theorem: every private alphabet for each of the 27 strips

Before optimizing *any* plaintext reading order, count unordered **same-symbol pairs inside each original consecutive strip of 27 ciphertext runes**. For one strip with GP29 symbol frequencies `n[0..28]`, the count is `Σ binomial(n[k],2)`. Sum this over all 27 strips. This count depends only on whether two source signs are equal: arbitrary within-strip row shuffling, any secret permutation of the strips, or **a different and entirely unknown 29! monoalphabetic permutation for each strip** leaves the total exactly unchanged. Even if a strip-specific deterministic alphabet is non-injective, equal plaintext signs cannot become unequal ciphertext signs: **M_original ≥ M_plaintext** is necessary. A cyclic shift of strip positions also preserves this statistic.

An ordinary readable native-GP29 plaintext written as 27 rows and then transposed into 27 consecutive source strips places 27 plaintext signs per strip at offsets 27 apart. Its frequencies retain the relatively unequal GP29 letter distribution. The existing original source instead has much less within-strip repetition.

| Frozen 729-rune register | Within-strip equal pairs (27 strips × 27 runes) |
|---|---:|
| **Original unchanged p0–p2 ciphertext** | **337** |
| 25 disjoint Blake-native plaintext windows, transposed into 27 strips | **530–662** |
| 29 disjoint 2013 Book-of-Law-native plaintext windows, transposed into 27 strips | **at least 510** |
| Positive native Book-of-Law transposition after independent per-strip secret shifts, reversal and column reorder | **exactly unchanged from planted plaintext** |

The same original-vs-native separation persists even when every column has a different arbitrary unknown substitution alphabet, the plaintext column order is secret, and every column can have its own **arbitrary row permutation**; the within-column equality count survives all these transformations. This is a stronger conditional source-native negative than an optimizer failing to find the right order. It applies to one GP29 plaintext sign for each original source glyph, no changing-state cipher **within** a strip, and the specific fixed 27-consecutive-rune division. It does **not** mathematically exclude arbitrary plaintext distributions, changing state keyed by row position, polygraphic mixing, different reblocking, altered alphabet with homophones, or a separate reversible encrypting layer.

## Independent keyless optimization: any secret column order

For a candidate adjacent pair of original source strips `i,j`, the corresponding 27 plaintext row-adjacent symbol pairs contribute a fixed weight

```text
w[i,j] = Σ_(r=0..26) log P(C[27i+r], C[27j+r])
```

where `P(next rune | current rune)` is a predeclared smoothed GP29 bigram model. Every secret ordering of 27 strips is a Hamiltonian path of 26 edges in this complete directed weighted graph. Adding one dummy end node with zero-weight edges and solving the **maximum-weight assignment** while *dropping subtour constraints* produces a mathematically valid upper bound for **every possible secret column order**, even if the assignment itself is disconnected.

The second test independently evaluates readable GP29 bigram transitions between strips. Two deliberately generous relaxations allow (a) each individual strip to be reversed, and (b) each original strip to be independently cyclically shifted by 0..26 **at each edge**. The second relaxation is *more permissive* than an actual whole-square decryption because the same strip may be assigned mutually inconsistent phases or orientations on its left and right interfaces. Thus if the resulting optimistic score is poor, every genuine globally consistent order, flip and cyclic phase under this family is also poor.

The model is fitted **only to external source-native 2013 Book of the Law chapters I–III** (21,611 GP runes), with longest-GP-token romanization, original reference vocabulary, historical V→U and K→C. Authors are used as language controls, not as authenticated LP2 plaintext. The test retains **27×26 = 702** row-internal rune bigrams and deliberately excludes artificial row-wrap bigrams. Its native holdout is 25 disjoint 729-rune windows from the project-bundled 2012-relevant William Blake reference (18,563 encoded GP runes); this is an independent author, not a universal English model.

## Original and independent controls

| Exact 729-rune input | Score: sum log P of 702 horizontal bigrams |
|---|---:|
| Original p0–p2, **best possible secret column order upper bound** | **−2,986.161921** |
| Original, allowing **any per-strip reversal**, optimistic assignment upper bound | **−2,940.462966** |
| Original, allowing **any per-strip reversal and cyclic shift**, independent per-edge optimistic upper bound | **−2,752.647792** |
| Planted native Book-of-Law 729-rune plaintext, true score | −1,770.237643 |
| Same plant ciphertext transposed into 27 strips, recovered exact upper-bound score | **−1,770.237643** |
| **25 disjoint Blake-native held-out 729-rune windows**, true score range | **−1,919.368308 to −1,794.577832** |
| Blake holdout median | −1,870.771801 |

Even the **optimistic**, physically inconsistent original-column assignment stays more than **833 log-score units below the worst** of all 25 native Blake windows, despite the artificially generous shifts/flips and overfitted assignment cycle cover. The no-secret positive plant saturates the assignment optimum exactly within floating-point precision: the scoring and assignment implementation can identify a genuine native transposition under its stated model. Other independently planted Blake positives were also run in the investigative V8 script; their fixed-score upper bounds exactly match the authentic plain native score.

The decisive evidence consists of **two all-key mathematical restrictions**: within-strip plaintext equality is preserved under any private per-column alphabet, and the assignment optimum bounds every strip ordering. Neither relies on guessing a representative key. This is a **conditional source-native prose rejection** of exact same-rune columnar reading. It is not a proof that no unusual English passage, different alphabet, homophonic layer, interrupted/variable strips, individually encrypted strips, source-selected geometric subset, altered word boundaries or other algorithm could use the 729-rune 27×27 grid. The 27² length could also be coincidental. The decoder is not a plaintext decryptor.

## Reproduce and next causal decision

[Read-only standalone Windows Node22/CJS SFT](../sims/lp2_p0_729_27square_allcolumn_assignment_original_sft.cjs) requires only the existing canonical `lp2-corpus.json` and the two bundled external author sources. It checks the **source image-derived p0–p2 lengths and first 13 original title runes**, the 29-rune model, the 25 disjoint holdouts, the positive transposition and the three assignment bounds. It never edits a source file or requires an external dictionary or fitted secret key. **[Windows Node22 CJS SFT PASS (22:45Z, 23 Nov 2026)](https://github.com/FlareZ123/liber-primus/actions/runs/45282516700).**

This result removes *arbitrary secret 27-column order*, even with local strip reversals and cyclic starts, as a sufficient explanation of chapter-one ciphertext under this straightforward same-symbol route. The new within-strip theorem additionally removes any **per-strip private monoalphabetic mapping**, regardless of its actual unknown alphabets or the column order, for the tested source-native prose controls. Any further 27×27 effort needs a **specific original-visible operation that changes rune values, changes which cells are consumed, or specifies nontrivial local state**, plus an independently predicted untouched original plaintext segment. Searching another 27! plaintext column order alone cannot improve the finite original optimum; avoid rerunning that key space.
