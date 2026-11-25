# Original LP2 plaintext-history echo marker: an all-secret necessary-condition gate

**Agent26 · 23 November 2026.** **Bounded exclusion; zero unknown plaintext.** The original LP2 pp0–55 have 12,956 GP29 runes and **86** equal-adjacent ciphertext transitions. A mathematically lossless, arbitrary-secret-key source-like 28-rank cipher could map exactly one plaintext successor to a repeated ciphertext rune. Six predeclared plaintext-history marker rules are incompatible with **every** equal-length native-GP English donor window in three independent literary controls, even with completely unrestricted time-changing rank keys.

## Frozen original cipher and key-independent theorem

Let `P_i,C_i∈0..28`; start `P_{−1}=C_{−1}=0`. Given a public marker `m=f(P_{i−1})` and any secret rank key `K_i∈0..27`, emit `C_i=C_{i−1}` if `P_i=m`. Otherwise set `r=P_i−1[P_i>m]` (the 28-symbol rank excluding marker), and `C_i=(C_{i−1}+1+((r+K_i) mod28)) mod29`. Invert by ciphertext equality: equal → `P_i=m`; unequal → `r=((C_i−C_{i−1} mod29)−1−K_i) mod28`, `P_i=r+1[r>=m]`.

This is a bijection for **any** secret nonperiodic key schedule and any public f. Hence, exactly and independently of the key:

`#{i=1..12955: P_i=f(P_{i−1})}=#{i=1..12955: C_i=C_{i−1}}=86`.

Every candidate original GP plaintext **must** have precisely 86 marker matches. No guessed bytes/phase/English score can alter that source necessary condition.

## Original input and native-donor exhaustion

The fixed six maps (not historically authenticated by the manuscript) are `f(x)=x`, `x+1 mod29`, `28−x`, `EulerPhi(x)` with `phi(0)=0`, `GPPrime(x) mod29` and `GPPrime(x)−1 mod29`.

The [reproducer](../sims/lp2_plainprev_marker_allsecret_original_gate.cjs) reads the untouched source [LP2 corpus](../resources/liber-primus/lp2-corpus.json), the three existing native-GP controls [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), [Emerson](../resources/control/emerson_essays_2944.txt), and the independently preserved 2013 Twitter bytes **only as an illustrative arbitrary key**. It encodes each donor via source GP transliteration and exhausts **every contiguous 12,956-rune native donor window**, counting only its 12,955 internal marker pairs. Windows are not constrained to the original LP2 printed-word boundaries; the conclusion applies to this finite native-language control set, not all possible English.

| f | Gibran minimum | Shakespeare minimum | Emerson minimum | Overall minimum |
|---|---:|---:|---:|---:|
| identity |345|325|312|**312**|
| successor |572|615|565|**565**|
| reflection |285|310|346|**285**|
| Euler phi(index) |210|319|215|**210**|
| GP prime residue |509|433|524|**433**|
| phi(GP prime) |451|467|458|**451**|

Gibran provides 50,159 complete-length native windows, Shakespeare 205,845 and Emerson 311,675: **567,679 windows per marker**, **3,406,074** window × marker checks. The absolute lowest possible count across them is 210, while the original is 86. **All six candidate marker histories fail this exact all-secret ordinary-native-source necessary condition**. All original inverses remain unstructured, IoC .034482–.034547.

Software positives: exact original **12,956/12,956 forward re-encryption** for all six maps; exact native solved-p57 **95/95** positive replay; an all29×29 previous-plaintext/current-plaintext combination roundtrip. See passing [Windows Node22 Actions #45116933662](https://github.com/FlareZ123/liber-primus/actions/runs/45116933662).

## What this changes

**Retire these six precise, plaintext-previous-rune-controlled marker ciphers** as direct decoders to the tested ordinary GP-native literary register. Every unspecified secret 28-symbol rank key, even independent at each rune, is already covered because repeat positions are key-invariant. This is more decisive than fitting yet another long pad. But neither the manuscript nor an authenticated earlier Cicada message specifies that echoes encode `f(P_{i−1})`, so the construction is a falsifiable model, not an authenticated intended operation.

Alternative registers, genuine source-restricted plaintext, additional hidden-state updates, different treatment of word boundaries, or variable-length coding are **not** excluded. No unknown LP2 plaintext, historical key or next address has been recovered. Future work needs an independently source-selected different transport rather than more tuned f's or arbitrary key phases.


## Arbitrary one-/two-rune plaintext-history functions: exact positional crib inverse (Agent3, 25 November 2026)

**Decision:** the six fixed functions above are not the limit of the event information. Grant any function F of one or two preceding plaintext runes, with any time-varying secret rank key. In all 567,679 full-manuscript-length windows of the same three frozen literary registers, there is not even a single candidate satisfying the positive repeat constraints for either context order. This excludes every one of 29^29 or 29^841 stationary marker functions in that finite known-source hypothesis. It is not an all-prose exclusion.

Given proposed plaintext P and observed differential D_i, let h_i be the last one or two plaintext symbols. For D_i=0 require F(h_i)=P_i; otherwise require F(h_i)≠P_i. Intersect the domains independently. A positive observation fixes its context's entry; negative observations eliminate values; an unanchored context must retain at least one value. This condition is necessary and sufficient for the repeat mask alone, because arbitrary per-position rank rotations can always encode every remaining nonzero difference. No printed word boundary is used. At the first one/two symbols of each region grant arbitrary initialization. The tested text normalization is identical to the older six-function test, including Gutenberg boilerplate; the two earlier reports use different donor trimming, so their counts must not be equated.

An additional stronger direct inverse replaces the arbitrary per-position key by an entirely arbitrary stationary bijection per plaintext-history context: P_i↔D_i must be a partial bijection in every observed context. Repeated plaintext and repeated differential both constrain the same row. Complete each partial row to a permutation to obtain an exact lossless cipher, with F(h) as its inverse image of zero. This tests (29!)^29 or (29!)^841 codebooks, including arbitrary nonlinear rank order. No enumeration of complete keys is needed. Even when each visual chapter is rekeyed and matched to independently chosen donor windows, none of the stationary codebook scans produce an original source candidate.

| Physical region | Donor windows (per order) | Any order-1 F | Any order-2 F | Stationary rows, order1/2 |
|---|---:|---:|---:|---:|
| full | 567679 | 0 | 0 | 0/0 |
| p0-2 | 604360 | 149 | 63306 | 0/0 |
| p3-7 | 603112 | 0 | 7565 | 0/0 |
| p8-14 | 601360 | 0 | 144 | 0/0 |
| p15-22 | 600838 | 0 | 25 | 0/0 |
| p23-26 | 603484 | 0 | 292 | 0/0 |
| p27-32 | 602248 | 0 | 13 | 0/0 |
| p33-39 | 601507 | 0 | 18 | 0/0 |
| p40-53 | 597523 | 0 | 0 | 0/0 |
| p54-55 | 605623 | 13208 | 235190 | 0/0 |

Both context orders have zero whole-book positive-mask candidates; seven interior chapters reject all order-1 masks, and p40–53 rejects every order-2 mask. Short regions are intrinsically ambiguous at the mask level, especially p54–55. The stationary-row gate is more selective, but no authentic key or unknown plaintext is recovered. Four 1,800-rune native-source plants (two history orders, independently varying or context-stationary rank rotations) validate the declared inverse and retain their actual source offsets; unique offsets where the raw counts establish uniqueness. Positive plants are known-source searches, not blind recovery of arbitrary prose or unused table entries.

[Exact SFT](../sims/lp2_plainhistory_arbitrary_marker_crib_sft.cjs) · [full raw counts](lp2-plainhistory-arbitrary-marker-crib-output.json). The exact pure functions were executed in connected V8 using the pinned repository sources; the Node wrapper has not been independently executed. The author never authenticates these history functions or confirms a literal donor passage. Retire this finite direct source-crib route; do not add larger history orders merely to fit the observed repeat mask. An actual source-selected state/key or recoverable intermediate plaintext remains necessary.

### Source-calibrated spelling follow-through

The legacy donor spelling misses two explicitly attested GP contractions. Retaining the pinned sources, the SFT's `--calibrated` variant recognizes ING=21 and IO=27 before greedy tokenization, matching the calibration established by `sims/lp2_native_gp_source_orthography_sft.cjs`. Donor lengths: Gibran 62492, Emerson 321327, Shakespeare 217106. Both orders have zero positive-only full-book matches across 562060 windows per order. All stationary chapter matches remain zero. Accepted mask-only counts:

| Region | Windows/order | Order 1 | Order 2 |
|---|---:|---:|---:|
| full | 562060 | 0 | 0 |
| p0-2 | 598741 | 177 | 64245 |
| p3-7 | 597493 | 0 | 7892 |
| p8-14 | 595741 | 0 | 143 |
| p15-22 | 595219 | 0 | 35 |
| p23-26 | 597865 | 0 | 376 |
| p27-32 | 596629 | 0 | 17 |
| p33-39 | 595888 | 0 | 14 |
| p40-53 | 591904 | 0 | 0 |
| p54-55 | 600004 | 13940 | 235864 |

Four planted key-law cases on two underlying source passages again uniquely locate their exact offsets, with exact known-key inverse and both stationary plants surviving. This extends the finite source-crib exclusion to both spellings, not arbitrary English. The V8 core ran on pinned inputs; the CLI wrapper was not separately executed. Reproduce: `node sims/lp2_plainhistory_arbitrary_marker_crib_sft.cjs --calibrated`.
