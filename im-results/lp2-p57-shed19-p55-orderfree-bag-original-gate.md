# Original p55 order-free p57 source multiset: exact bounded inverse (Director #3280)

**Agent15, 28 November 2026 — conditional source hypothesis decisively negative for any stationary one-symbol chart, even after arbitrary word/order/spacing loss.** The source-authored original p57 PARABLE contains **95** GP29 runes in **20** genuine words, including heading PARABLE; its body has **19** words and literally says to shed one's circumference. Remove **one outer rune per body word**, preserving the seven-rune heading: two source-natural choices of first or last rune each give a **76-rune complete object**. Physical unknown p55 is **76 runes**, but has **25 different ciphertext rune types**. The two authentic source objects contain only **22** (shed-first) or **20** (shed-last) plaintext rune types. Therefore no stationary substitution, monoalphabetic permutation, fixed affine GP29 map, or direct Caesar shift can convert either 76-rune source bag to p55 ciphertext **even after arbitrary transposition, loss of all source word order or target decoy segmentation**.

This does not show that p55 plaintext really is a p57-derived text. It tests one exact source-motivated proposed plaintext object *as a complete unordered bag*, not the previously tested usage of the same source as a repeating numeric key. Neither a new plaintext value nor historical key is claimed.

## Source-selected object and reverse operation

The controls are the published, solved physical p57 GP29 original section `p57_parable` in `resources/external/relikd-solved-gp29-native-v1.json` and the original 76-rune physical p55 in `resources/liber-primus/lp2-corpus.json`. GP alphabet is the official `ᚠᚢᚦᚩᚱᚳᚷᚹᚻᚾᛁᛄᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᚪᚫᚣᛡᛠ`. Both word-shave choices are specified by the *visible solved phrase* before looking at any guessed unknown words:

- Source A: `PARABLE || (LIKE without L) || (THE without TH) || ... || (EMERGE without E)`.
- Source B: `PARABLE || (LIKE without E) || (THE without E) || ... || (EMERGE without final E)`.

In both cases the source has `7 + (88−19)=76` rune symbols and is a complete **authentic source plaintext multiset**. The p55 correspondence is a conditional transfer hypothesis: p57 does not explicitly state that the shaved content is p55 plaintext or which end to remove. Its 76-rune equality is source-motivated, but does not authenticate the transferred cipher.

The original p55 physical page begins with one rune **continuing a word from p54** and has 17 printed groups. Those target groups are deliberately **not** input to this test. The method works under the Director's H-shuffle and H-decoy models because it uses rune frequencies only, not lexical order or word cuts.

### Exact order-independent inverse

For a source bag `P`, observed ciphertext bag `C`, and unknown GP29 Caesar key `k` with `C=(P+k) mod29`, every one of the 29 possible keys is tested by the exact full-histogram condition

```text
count_C[v] = count_P[(v-k) mod29]   for v = 0,...,28.
```

A matching histogram identifies the additive key *without* plaintext ordering or segmentation; decrypting then recovers its unordered source rune bag. It does **not** reconstruct plaintext order. As a stronger model-independent obstruction, any stationary injective or noninjective rune substitution cannot increase the number of observed distinct types: `distinct(C)≤distinct(P)`. If this fails, no choice of substitution table or word permutation can rescue it.

## Positive controls and untouched original

The control source is actual solved p57, not generated English text. Each source bag is independently shuffled at whole-source-word granularity with a fixed xorshift32 shuffle, encrypted with each GP29 Caesar key `k=2,13,28`, then arbitrarily split under p55's *17 false target word lengths*. The receiver knows only the original source **multiset**, not the shuffled word order or any true target word cuts. The planted key is recovered **uniquely** in all **six** controls (2 shave choices × 3 keys), with exact 76/76 re-encryption and bag equality. Shuffling and decoy cuts are genuinely nontrivial but do not affect the histogram inverse.

| Exact original input or control | Shave first | Shave last |
| --- | ---: | ---: |
| Known source runes | 76 | 76 |
| Distinct source GP29 rune values | 22 | 20 |
| Actual p55 distinct ciphertext rune values | 25 | 25 |
| Original valid Caesar keys (of 29) | **0** | **0** |
| Minimum L1 histogram distance over 29 shifts | 68 | 56 |
| L1 distance between *sorted* histograms, granting any alphabet relabeling | **36** | **20** |
| Native shuffled/decoy planted keys recovered uniquely | 3/3 | 3/3 |

The sorted-histogram mismatch is stronger than the absence of a Caesar key: even a free arbitrary *bijective* 29-rune substitution cannot explain either proposed source bag because the equality partitions differ. The 25-to-22/20 type inequality excludes even a deterministic many-to-one stationary substitution. A cipher with multiple state-dependent alphabets, homophones, expansion/erasure, or changing rune counts is outside this exclusion.

A separate exact chart-identifiability calculation helps prevent overclaiming positive controls: a *matched* native output under an unrestricted static bijection and unknown order would admit **131,681,894,400** chart permutations consistent with the source first-shave histogram, and **37,623,398,400** for last-shave, counting absent-symbol relabelings. Full bag knowledge can identify a **one-parameter** Caesar key but not a 29-symbol substitution chart.

## What changes and what does not

- New exact exclusion: *authentic p57 single-edge-shaved 76-rune complete plaintext under any fixed one-symbol original p55 substitution, despite arbitrary word/rune order*. This does not rely on the 17 p55 printed groups being plaintext words and is stronger than the prior original p55 word-shape mismatch.
- Prior separate routes used the 76 shaved p57 source **as an additive key** for p55, or the 19 removed edges as a period19 repeated key, and were negative. This uses source as **hypothesized plaintext** with entirely lost order, so their key-negative results do not imply this structural theorem.
- The first-party author did not promise that p55 contains this source bag. Negative here rejects this **conditional recipient and simple receiver**, not all possible p55 plaintext or H-shuffle/H-decoy representations. Neither H-shuffle nor H-decoy is adjudicated globally; both lose the candidate because its only possible one-chart original inverse fails.
- For the Director's desired positive cross-page inference, the minimum missing source is a **first-party assignment of a complete plaintext bag to a named unknown interval** and a source-selected invertible receiver. A 76=95−19 cardinality coincidence and a general directive to "shed" are a human-readable reason to attempt, not an authenticated key/table/recipient.

**Reproduce:** `node sims/lp2_p57_shed19_p55_orderfree_bag_sft.cjs` (Node20+, stdlib). Its assertions pin native source word counts, original p55 length and symbol counts, exact original histogram and best shift distances, six planted source-native controls with independently shuffled words and p55-pattern decoy cuts, and the number of equivalent chart permutations. The script reads both fixed repository inputs and does not use any scored dictionary or fitted unknown plaintext.
