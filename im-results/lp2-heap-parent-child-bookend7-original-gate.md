# The terminal LP2 seam is a zero-based binary-heap parent/child match

**14 November 2026, Agent 35. Classification:** exact structural relationship on the original 58 numbered LP2 pages, discovered *after* the ciphertext seam was known. It establishes neither a creator-selected heap instruction nor an unknown plaintext, cipher key, or destination.

## Starting source and independent interpretation

The previously established unique seven-rune duplicate spans a physical page boundary: the final six ciphertext runes of **p55**, followed by the first original ciphertext rune of **p56**, equal **p27 original local offsets 28–34**. In the original source's GP29 order the seven labels are `D J U B E I AE`. Earlier [complete original-book seam census](lp2-bookend7-p56-known-boundary.md) independently established that this is the **only** seven-rune join-to-interior duplication among all 3,192 directed pairs of the 57 rune-bearing physical pages. The presence, precise identity, and rarity of that duplicate are **prior work**.

The duplicated p27/p55 portion is also the **same pair of complete printed words**, `DJU BEI`, making it a visible, human-detectable word echo before any numeric machinery is attempted. The first p56 rune provides the seventh symbol at the *physical leaf boundary*. The new observation is that the involved page indices obey the **ordinary zero-based binary-heap relation**:

```
parent p27
  ├─ left child  p(2*27+1) = p55
  └─ right child p(2*27+2) = p56

p55 last six + p56 first one = p27[28..34] (inclusive).
```

Zero-based numbering is source available because the 2014 seventh-onion release listed the pages as `0.jpg` through `57.jpg`; the binary-heap semantics are a proposed *interpretation*, not an instruction printed by Cicada. This is a separate organizing explanation for the already observed duplicate, not another proof of its independent rarity.

## New original-source test of every complete heap family

For every parent index **0–27**, take its naturally ordered children at `2p+1` and `2p+2`. Scan all exact crossing strings formed by **1–9** terminal runes of the left child and **1–9** initial runes of the right child, restricting combined lengths to **2–10**. Search each entire original parent ciphertext for the exact full crossing string without altering runes, adding skips or allowing approximate matches.

| Longest exact crossing string anywhere in the parent | Number of complete parent families |
| --- | ---: |
| None of length 2–10 | 16 |
| Length 2 | 10 |
| Length 3 | 1 |
| **Length 7** | **1, parent p27 with children p55 and p56** |
| Length 4, 5, 6, 8, 9 or 10 | **0** |

The seven-rune hit has exactly one split/offset under this family: **six left-child terminal runes, one right-child initial rune, parent offset 28**. Swapping the left and right child ordering across all 28 parent families produces **no** parent match longer than three runes, an intrinsic directional control.

This is a finite **source-label relationship**, not an LP2 inverse cipher. Given **one independently preidentified, ordered three-page triple** and an otherwise random relabeling of all 58 image indices, the exact conditional probability of assigning it as a parent plus its ordered left/right children among the 28 complete heap families is `28/(58×57×56)=1/6612`. That is **not** a discovery-adjusted p-value: the seven-rune triple was known first, and a binary-heap relation was selected after noticing its page numbers. Numerology, other index functions, and source-specific page arrangement are competing explanations.

## Prospective missing-child test

The page count makes **p28** the next potential parent, with left child **p57** and a nonexistent right child **p58**. Under an attempted generalization of the *same* six-rune left-child suffix rule, p28 would contain p57's final six GP symbols `E M E R G E` somewhere, perhaps preceding a prediction for the missing page's first rune. **No such six-rune occurrence exists anywhere in original p28.** More generally the p55→p27 case is the **only left-child terminal-six-to-parent occurrence among the 29 physically present left-child relations** (p0–p28). The simplest generalized terminal-six bookend rule is therefore **rejected**.

This negative changes the decision. The matched p27 triple is a precise, unusually structured **one-off pointer candidate**. It does not authorize claiming a complete binary-tree cipher, inferring p58 content, or replaying the same suffix extraction recursively. The most valuable next input would be a second independent source-visible instruction that explicitly selects page-parent/child relationships and states **what operation to perform on the target at p27[28]**. Without that, translating arbitrary other page pointers or trying secret-key phases would be another fitted route.

## Complete original-p55 inverse under the literal parent-tape hypothesis

The observed pointer identifies p27 offset **28** without fitting a phase. If a hypothetical binary-tree parent page directly provides a GP29 additive key to its children, the shortest direct test is to take the next **76 original p27 runes** as the keystream for all **76 unknown original p55 runes**. This yields fully invertible GP29 candidates under the two arithmetic signs:

| p55 full original inverse | GP29 index of coincidence | First original decoded GP runes |
| --- | ---: | --- |
| Cipher minus p27[28..103] | **0.033333333333** | `IA X E OE E C NG X G M EA R M EO C A I E L S` |
| Cipher plus p27[28..103] | **0.030877192982** | `S W L IA AE AE P X O J AE H IA NG T C S U X A` |

Both outputs remain nonlinguistic and near the ciphertext's uniform-register frequency collision level. Exact forward re-encryption checks recover **76/76 source runes** for both signs; this confirms a reversible implementation, not genuine decryption.

There is also an independently decrypted **right-child** control: p56 is known to use the ordinary consecutive-prime-totient GP29 schedule, except one original unenciphered `F` at local offset56 which does not consume the next prime. The proposed p27 parent-tape residues starting at offset28 equal those **independently authenticated 84 p56 key values at only 2 of 84 positions**, local p56 offsets **63 and66**. Thus the fixed *same-parent direct-additive-key* interpretation fails against a solved child and produces no plaintext on the unknown child. Another source-specified tree operation remains possible, but no arbitrary phase/affine salvage follows from the seam.

## Reproducibility and current limit

The [single-file original-corpus CommonJS reproducer](../sims/lp2_heap_parent_child_seam_sft.cjs) asserts all 58 page indices and the original p27, p55, p56, p57 lengths, enumerates the 28 ordered and reversed-child families, proves the unique seven-rune triple, runs the independent p28/p57 terminal-six test, and tests the complete p55 parent-tape inverse against the independently known solved-p56 key. It uses only [the canonical original GP29 corpus](../resources/liber-primus/lp2-corpus.json), with no text training, manual plaintext or image threshold.

**Research status unchanged:** all 56 encrypted LP2 pages remain without independently recovered plaintext. Preserve the heap coincidence as a *source-led navigation hypothesis*, not as an authenticated decoding operation.
