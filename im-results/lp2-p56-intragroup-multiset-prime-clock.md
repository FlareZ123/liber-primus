# p56 prime-clock transfer under intragroup rune-multiset matching

**Agent29 · Director Issue #2730 · 25 November 2026.**  
**Decision: reject this frozen p54–55 transfer model.** The authentic p56 prime-minus-one clock is exactly reproducible on p56 and recovers planted absolute intervals in native-text controls after within-word permutation. On original p54–55, however, only 3/8 long p54 groups match in either direction and 0/2 long p55 holdouts match. The five missing p54 long groups exceed the OOV allowance; both p55 long groups fail. The surviving p54 intervals also cannot fit inside a 222-rune page window. No contiguous tiling or plaintext continuation is possible under this model, so the more expensive tiling search was correctly gated off.

## 1. Frozen hypothesis

This tests the #2710-style intragroup-anagram model with the **source-derived p56 key schedule**, not a new cipher search:

- GP29 rune indices are 0–28.
- Key stream: (K_j=(p_j-1)mod29), where (p_j) is the j-th prime, zero-indexed.
- Encryption hypothesis: (C_i=P_i+sigma K_jpmod{29}), for (sigmain{+1,-1}).
- Literal F (rune index 0) is transparent and does not advance the prime cursor. At ciphertext F, the inverse considers both a literal-F hold and a legal consuming branch; a consuming branch yielding plaintext F is rejected.
- No collision redraw, key reset, page reset, alternative prime list, alternate alphabet, or extra clock is permitted.
- A decrypted group is compared to the frozen lexical register as a **rune multiset**; within-word order is not required. Each candidate group occupies a contiguous absolute interval of the prime stream. The candidate start range is 0–3301; p54 and p55 are one continuous chapter, with p55 held out.
- The tested multiset interpretation preserves the per-position key alignment while ignoring the decrypted word's internal order. It does not grant an arbitrary post-encryption permutation that also reassigns key phases.

The moment filter is a safe relaxation: length and the first three power sums modulo 29 must agree before exact sorted-multiset lookup. Exact matching is then performed against the frozen register; the moment filter cannot create a match.

## 2. Source controls and frozen register

The implementation builds **35,944 ordered word forms**, **33,828 distinct rune multisets**, and **31,468 length/moment signatures** from the frozen solved-native, held-out donor, and TextBlob sources. Words are capped at 24 GP29 runes. The original p54–55 source frame is independently checked as 49 groups / 222 runes on p54 and 17 groups / 86 runes on p55; the chapter contains 308 runes, of which 8 p54 groups and 2 p55 groups have length at least 8.

The p56 source control is exact: the 85-rune solved p56 text re-encrypts to the original p56 ciphertext with **84 prime advances**, confirming the literal-F hold.

Six positive plants use 66-word native windows from held-out Gibran, Shakespeare, and Emerson text, split 49/17, with within-word permutations and shuffled group order. They are encrypted using the p56 prime stream at origins 0, 1033, and 3301, under both signs. The windows contain 285, 280, and 311 runes respectively; long-group profiles are 6/1, 8/2, and 8/3 (p54/p55). P54 has at most two held-out OOVs; p55 has none.

| Positive control | Sign | P54 true long intervals recovered | P55 true long intervals recovered | Unique true intervals |
|---|---:|---:|---:|---|
| Gibran, origin 0 | + | 6/6 | 1/1 | P54 5/6; P55 1/1 |
| Gibran, origin 0 | − | 6/6 | 1/1 | P54 6/6; P55 1/1 |
| Shakespeare, origin 1033 | + | 6/8 (2 OOV) | 2/2 | P54 4/8; P55 2/2 |
| Shakespeare, origin 1033 | − | 6/8 (2 OOV) | 2/2 | P54 4/8; P55 2/2 |
| Emerson, origin 3301 | + | 8/8 | 3/3 | P54 7/8; P55 2/3 |
| Emerson, origin 3301 | − | 8/8 | 3/3 | P54 5/8; P55 1/3 |

These controls show that the exact inverse can retain the true absolute interval and rune multiset for in-register native words, including held-out p55 groups. They also show that a true edge need not be unique from one group alone; the chapter-level interval constraint is important.

Two negative controls use the same kind of native plants but a different key source:

- **Ordinary cyclic q8:** key `[5,10,17,15,19,18,24,6]`, already used as a positive control in the #2710 multiset study. Under the p56 prime inverse, it produces only 1/6 p54 long-group candidates and 0/1 p55 candidates for the positive sign; 1/6 and 1/1 for the negative sign.
- **Independent per-group pads:** each word receives its own random 8-digit pad. The p56 inverse can still produce isolated p54 candidates (4/6 positive; 3/6 negative), but produces 0/1 p55 candidates in either direction.

These negative controls demonstrate why isolated group matches are insufficient. A successful model must also yield a contiguous chapter interval path and pass the held-out continuation.

## 3. Original p54 development result

Search parameters are frozen: all starts 0–3609 (origin 0–3301 plus the 308-rune chapter span), both signs, every legal literal-F branch, no collision redraw, and the full 35,944-form register. Only original groups of length at least 8 are counted as long anchors.

| Page | Sign | Long groups | Groups with any exact multiset interval | Missing |
|---|---:|---:|---:|---:|
| p54 | + | 8 | 3 | 5 |
| p54 | − | 8 | 3 | 5 |
| p55 holdout | + | 2 | 0 | 2 |
| p55 holdout | − | 2 | 0 | 2 |

The isolated p54 candidates are:

**Positive direction**
- group 1, 8 runes: **CHLORIDE**, interval [2733, 2741)
- group 2, 8 runes: **PROTEGEE**, interval [1048, 1056)
- group 47, 10 runes: **SLUGGISHLY**, interval [2146, 2156)

**Negative direction**
- group 2, 8 runes: **EIGHTIES**, interval [466, 474)
- group 2, 8 runes: **JUBILANT**, interval [1112, 1120)
- group 15, 8 runes: **RAPACITY**, interval [547, 555)
- group 39, 8 runes: **CRUMPLED**, interval [3444, 3452)

No other long p54 or p55 group has a dictionary-multiset match at any permitted start. These isolated words do not form meaningful original language.

### Why no tiling search is warranted

The page-local 5% OOV budgets are (lfloor0.05cdot49floor=2) for p54 and (lfloor0.05cdot17floor=0) for p55. P54 misses five long groups, and p55 misses both long groups. Even the looser three-OOV allowance used in the 66-group #2710 study cannot cover five missing p54 long anchors; p55 remains a strict held-out failure.

There is also a direct interval obstruction. All p54 groups must fit within a single contiguous page-clock window of at most 222 advances (literal-F holds can only shorten it). The positive-direction candidate intervals span from 1048 to 2741, a 1,693-position spread. The negative-direction choices span at least 2,897 positions. Neither set can fit in a 222-position p54 window. Thus no selection of the surviving isolated matches can form a nonoverlapping p54 tiling, before even considering the absent p55 anchors.

The issue's full interval-tiling search was therefore gated off by independent necessary failures: insufficient long-group support, no p55 holdout support, and incompatible p54 interval locations. This is not a case where a plausible tiling was found but left unverified.

## 4. Reproducibility and disposition

- Exact implementation: [`sims/lp2_p56_intragroup_multiset_prime_clock_sft.cjs`](../sims/lp2_p56_intragroup_multiset_prime_clock_sft.cjs)
- Manual CI workflow: [`p56-intragroup-multiset-prime-clock.yml`](../.github/workflows/p56-intragroup-multiset-prime-clock.yml)
- Successful workflow run: [45590980506](https://github.com/FlareZ123/liber-primus/actions/runs/45590980506)
- Preserved output artifact: ID `15011470509`, SHA-256 `c33df95d5cf5b610256ccd6ec61cf42f48172c7746a474d0c727ffa955179450` (artifact retention through 2027-02-23).

The prior [Agent9 absolute-prime/whole-group-order report](lp2-postshuffle-prime-clock-long-anchor.md) explicitly excluded intragroup permutations; this experiment covers that missing multiset extension. The prior [#2710 q8 anagram report](lp2-unknown-q8-group-anagram-exact.md) supplies the independent q8 control and the 5% lexical-register comparison.

**Conclusion:** the source-derived p56 prime-minus-one clock is authentic on p56, and the multiset inverse is demonstrably capable on native plants. Its transfer to p54–55 under the frozen intragroup-anagram model is rejected. Do not rescue it by widening the origin range, adding key schedules, increasing OOV allowance, or changing the F rule. A different model would need a new source-visible instruction selecting its additional operation or parameters. No LP2 plaintext, key, or continuation was recovered.
