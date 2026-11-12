# Original p55's 75 complete-word runes under the LP1 Wisdom-square inverse

**Decision:** Two fixed, source-led transfers from the LP1 p05 SOME WISDOM square to original LP2 p55 are now bounded negatives: the 5×5 Hill inverse and a 25-period Euler-totient additive key. Both are exactly reversible on all 75 complete-word runes, but neither yields native GP plaintext. The inherited p54 rune remains outside both models; no authentic unknown plaintext or historical key is recovered.

## Human-visible premise and uncertainty

The original LP2 p55 has a moth illustration also seen on solved LP1 p05 **SOME WISDOM**, where the authentic 5×5 GP-prime square sums to **1,033** per row. The moth also appears at LP2 p53, so it does not uniquely designate p55 or a cipher operation. At original p55 one initial rune **ᛝ** is the continuation of a word from p54; the remaining 75 runes form 16 complete printed words of lengths **[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]**. The **75 = 15×5** match is source-constrained, while excluding the inherited rune and applying a Hill matrix are hypotheses.

The original LP1 p05 source matrix, in printed row-major order, is

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

Its determinant is **3 mod29**. Its exact modular inverse is

```text
23 22 15  2 17
24 25  4  2 24
20 28 12 28 20
24  2  4 25 24
17  2 15 22 23
```

Starting with p55 rune index1, apply the inverse to successive **15 five-rune column vectors**, without phase, shift, guessed key or row reordering. Keep rune index0 as the unchanged p54 fragment. The authentic other LP1 square (5×5/3301) is a wrong-source control.

## Original result and controls

The original p55 75-rune source, without its inherited ᛝ, is

```text
AEMIWSBXMSEOGDTHAEFIAABCUWRBEAFXIMUCPHNGLEOMSDIAPFBHEOCEOEEAEIGXGSESEOTHTHESTHOECEAIMCXDJUBEI
```

The proposed Hill inverse yields the following **complete 16-word output**, displayed with exactly the original word boundaries:

```text
LIAA / IF / NGAE / SMEADNJ / OITIXAE / NS /
OETEOSUBYPMAEEAJNG / APREAAED / NGOEOEJ / OEA /
SAITHDUB / WNGTHORPT / LS / THNJILJ / EJA / AENY
```

Gibran-trained GP29 trigram scores (mean log score per rune):

| Test | Score |
| --- | ---: |
| Original p55 75 runes | −6.178724221 |
| Fixed Wisdom 1033 inverse | **−5.773447379** |
| Wrong authentic 3301-square inverse | −5.925491918 |
| 151 separate 75-rune solved-Cicada LP1 controls | **−3.811507205 to −1.977153780** |
| One real 75-rune solved-Cicada native positive plant | −2.327503356 |

The proposed output is below **every** compared native solved passage; its 16 words lack coherent GP-language content. All 75 original ciphertext runes reconstruct exactly after forward multiplication by the frozen matrix, and the unchanged first rune reproduces all **76** source runes. A separate 75-rune positive plant from editor-normalized solved LP1 text survives encryption and the same inverse with **75/75 exact recovery**. This demonstrates algorithmic invertibility, not that the source p55 used this operation.

## Source-named totient as a 25-cell repeating key: bounded negative

The p55 moth is reused from LP1 p05 **SOME WISDOM**, whose source text explicitly says “THE PRIMES ARE SACRED / THE TOTIENT FUNCTION IS SACRED / ALL THINGS SHOULD BE ENCRYPTED.” Its 5×5 square supplies 25 printed numeric cells, while p55 has exactly **75 complete-word runes** after its inherited p54 NG: three 25-rune cycles. This gives a distinct, human-motivated candidate beyond the Hill inverse above.

Freeze the p05 square in printed row-major order:

`[272,138,341,131,151, 366,199,130,320,18, 226,245,91,245,226, 18,320,130,199,366, 151,131,341,138,272]`.

For each cell (s_i), calculate Euler's `φ(s_i)`, reduce modulo 29, and repeat the resulting 25-symbol key three times over p55's 75-rune body. Use the subtractive direction from solved p56's totient inverse. The source-authenticated literal-F exception is not a pass-through for every ciphertext F: it applies only when the current key symbol is also F/0, in which case the F is transparent and the key counter does not advance. None of the 25 `φ(s_i) mod 29` key values is zero, so that exception cannot trigger here; every one of the 75 body runes consumes a key symbol. No rotation, phase, offset, alternate modulus, key permutation or word-boundary tuning is used.

The exact key is:

`[12,15,10,14,5,4,24,19,12,6,25,23,14,23,25,6,12,19,24,4,5,14,10,15,12]`.

The decoded complete words (original boundaries) are:

`PRFOE / IP / MF / OGIFBTH / RNGEOIAIY / THM / WPBTHANTFNPTHHG / DNGNRBD / CEBU / WR / EOIADEAAEU / PJBEOMEOM / HH / JORWSM / MGT / WOIA`.

The raw 75-rune ciphertext scores **−6.178724220**; the fixed totient-key output scores **−6.023560953** under the existing Gibran-trained GP trigram model. That is still below the minimum **−3.811507205** among 151 frozen, source-native 75-rune control windows (median **−2.406472148**). The inverse forward-encodes all 75 original runes exactly and recovers an independently selected 75-rune native-GP positive plant exactly; these are implementation checks, not evidence for the historical cipher. The reproducer is [`p55_wisdom_totient25_sft.cjs`](../sims/p55_wisdom_totient25_sft.cjs).

**Decision:** retire this exact p05-cell-`φ` / 25-period p55 transfer. The p55/p05 image reuse and 75=3×25 alignment remain observations, but neither selects another key schedule. The moth also occurs on p53, and no source says to apply `φ` to each square cell or repeat the key. Do not expand this family without a new independent selector or a withheld original-cipher prediction.

### Full-page and body frequency-preserving invariant

The physical p55 page-local sequence has **76** rune segments (including the inherited p54 `NG`); the actual p55 body has **75**. Their GP29 IoCs are **0.03789474** and **0.03855856**, respectively. A fixed bijective monoalphabetic substitution preserves the symbol histogram; a pure transposition preserves it as well; their composition therefore preserves IoC on either fixed input.

| Input scope | Native stride-23 windows | Minimum IoC | Median IoC | Maximum IoC | At/below p55 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 76 page-local runes | 151 | **0.04631579** | 0.06035088 | 0.08526316 | **0** |
| 75 actual body runes | 151 | **0.04612613** | 0.06090090 | 0.08540541 | **0** |

| Input scope | All overlapping windows | Minimum IoC | 1st percentile | 5th percentile | Median IoC | At/below p55 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 76 page-local runes | 3,461 | **0.04561404** | 0.04771930 | 0.05228070 | 0.06070175 | **0** |
| 75 actual body runes | 3,462 | **0.04540541** | 0.04756757 | 0.05189189 | 0.06054054 | **0** |

Thus neither a fixed monoalphabetic substitution nor a pure transposition of the complete 76-glyph page or 75-rune body can yield ordinary GP29 English consistent with the native LP1 controls. This also excludes any composition of those two operations, including a whole-body 5×5 rank-order/route permutation. It does **not** exclude polyalphabetic, homophonic, position/context-dependent or non-bijective substitutions, mixed transforms, subset transposition, or deliberately non-English plaintext.

The counts are reproduced by [the corrected 75-body transfer SFT](../sims/p55_corrected_75body_transfer_sft.cjs).


## Exact minimum symbol-change budgets for the complete original body

**Decision on [Director #598](https://github.com/FlareZ123/liber-primus/issues/598):** the complete 75-rune p55 body and the page-local 76-rune sequence have a much stronger obstruction **if the source's printed word boundaries are preserved**. Even granting arbitrary transposition *inside each word* and an **entirely unknown, free global bijection on all 29 rune identities**, reproducing any GP-native English target from the pinned control corpora requires at least **23 identity changes on the 75-rune body**, or **23 on 76-with-carry**. Among all 3,462 overlapping native solved-LP1 75-rune windows, at least **27** changes are necessary. This is a finite-corpus necessary condition, not an identified historical operation or an exclusion of all English.

The exact optimization is independent of which alphabet bijection is chosen. For total ciphertext inventory \(c_i\) and a target inventory \(t_j\), granting any position permutation gives the minimal edit count

\[
E_{\mathrm{whole}}=\tfrac12\sum_{i=1}^{29}|c_{(i)}-t_{(i)}|
\]

where counts in parentheses are separately sorted. To preserve the physical p55 word partition, define \(c_{wi}\) and \(t_{wj}\) as GP29 symbol counts in source/target word segment \(w\), then build \(M_{ij}=\sum_w\min(c_{wi},t_{wj})\). The **exact** bound is \(E_{\mathrm{word}}=N-\max_{\pi\in S_{29}}\sum_i M_{i,\pi(i)}\), solved as a 29×29 maximum-weight assignment. Unlike fitting a cipher key, this exhaustive calculation allows every possible fixed output-alphabet relabeling. Row/column maximum bounds prune a candidate only when they mathematically cannot improve the current optimum; every surviving window gets an exact Hungarian solution.

| Frozen GP-native control | Original targets examined, 75 / 76 | Minimum changes with any position permutation, 75 / 76 | Minimum with 16 printed body-word boundaries preserved, 75 / 76 |
| --- | ---: | ---: | ---: |
| LP1 editor-normalized solved reference | 3,462 / 3,461 | **4 / 5** | **27 / 28** |
| Shakespeare first 300k | 217,570 / 217,569 | **1 / 2** | **25 / 26** |
| Gibran *The Prophet* | 62,622 / 62,621 | **3 / 3** | **25 / 26** |
| Emerson essays | 323,009 / 323,008 | **3 / 3** | **23 / 23** |

For the 76-rune case, a separate one-rune p54 **NG** carry is preserved as its own segment before the 16 complete p55 body words. Target windows are optimistically cut into segments with **the same GP-rune lengths as the original print**, even when those positions are *not real English word breaks*. This relaxation makes the figures necessary edit budgets only for the specified controls; enforcing authentic target-language word boundaries could tighten them. No universal English claim is justified, and no supplied corpus contains a verified unknown p55 plaintext.

The reproducer [full-body exact assignment SFT](../sims/p55_fullbody_min_symbol_changes_sft.cjs) checks all **606,663** available 75-rune windows and **606,659** 76-rune windows, proves a nontrivial global-substitution-plus-wordwise-transposition planted GP-native passage is exactly invertible with **zero** required identity changes, and uses an adversarial all-one-symbol target that correctly requires **69/75** changes. The unrestricted whole-body low minima show why frequency/IoC alone is a weak estimate of the *amount* of change, even though its pure-permutation exclusion still holds. The wordwise minimum is new but remains a quantified strengthening of the same finite-language premise: without a source-selected changing-state, additive, or other non-permutation operation capable of affecting a substantial fraction of p55 runes, further rearrangement/key hunts cannot recover its printed words. The already tested LP1 25-cell Wisdom transfer and solved-p56 prime-totient direct transfer remain negative; this bound supplies no replacement key.

## Reproduction, scope and next decision

[Self-contained CommonJS SFT](../sims/p55_wisdom5_hill75_sft.cjs) consumes the original `resources/liber-primus/lp2-corpus.json`, literal p05 square values from the authenticated 2014 magic-square source, and heldout GP control passages. The script constructs GF29 matrix inversion, exact forward reencryption, the other-square control, word-boundary display and complete solved-native positive plant.

**Conclusion:** The literal artwork-to-p05 5×5 Hill inverse is a bounded negative. The visible 75-rune divisibility and cross-round moth remain observations; neither supplies a complete decoder for 76 runes or a withheld p54 prediction. Further work should require a source-selected transform rather than tune five-symbol block starts.
