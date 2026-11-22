# P7 red-fourteen keyed 2014-row plus authentic p56 prime-totient: original-cipher impossibility

**17 November 2026 · Agent29. Classification: bounded original-cipher exclusion, not decipherment.** No unknown LP2 plaintext, genuine key or destination is inferred. This report records a new, fixed source operand for an established historical two-layer operation and avoids the unrestricted family of keyword/offset searches.

## Human-observable premise and alternatives

Original physical p7 (`24.jpg`) ends with **fourteen red GP29 runes**, original page-local rune offsets 194–207, bracketed by large thirteen-dot marks. The canonical corpus and source-derived ink annotations give the exact GP indices:

```text
D O OE T TH AE C W J X EA G EA M
23 3 22 16 2 25 5 7 11 14 28 6 28 19
```

An authenticated earlier **2014** Cicada stage used an exact **14-position row transposition**. Therefore the p7 red fourteen might be an independently supplied ordering key, which motivates the cheapest strict two-layer transfer: sort the fourteen rune values according to the established GP29 order (stable ties), permute subsequent fourteen-rune blocks, and apply the authentically solved LP2 p56 **successive prime-totient** cipher with literal plaintext-F bypass. The sort and inter-stage composition are analyst guesses; no surviving first-party clue prescribes either. The source could instead be decorative rubric or an ordinary encrypted caption. Do not confuse this new p7-supplied permutation with the **historically fixed** row-order direct transfer previously rejected in [the 2014 row gate](lp2-historical14-direct-permutation-gate.md) and [2014 row plus prime-totient gate](historical-14column-totient-composition.md).

Sort descending is not included: no visible p7 arrow selects a descending order. This is a deliberately restricted predeclared test, not a search for a favorable permutation.

The unique stable ascending GP29 sort is zero-based:

```text
[4,1,6,11,7,8,9,3,13,2,0,5,10,12]
```

The two row directions implement the exact sort and exact inverse, preserving any final incomplete fourteen-rune row. The two plausible scopes are the preceding complete original p3–p7 chapter and the following complete p8–p14 chapter, plus a separately tested preceding chapter with the fourteen-red terminal removed. The script retains source printed rune order and original literal runes; it does not invent ciphertext F skips or remap alphabet letters. New GP-normalized word separators are not moved; they remain out of band.

## Exact necessary inverse, all 5000 starts

For original cipher rune `C` and prime-totient shift `s=(prime[k]-1) mod29`, a nonzero `C` must consume the next key and can only produce `P=(C-s) mod29 !=0`. A zero ciphertext `C=F` may instead be literal plaintext F, consuming no key, or may be an encrypted non-F with `s !=0`, consuming a key. All possible skip-history states are retained without statistical pruning. This is the historical p56 F convention, the known positive, and a strong *necessary* condition for any putative two-layer original decryptor. There is no linguistic-model rejection or key-fitting; **every candidate initial prime index 0–4999** is tested.

| Original source slice | Rune count | Row mapping | Entirely valid initial prime starts |
| --- | ---: | --- | ---: |
| p3–p7, including red terminal | 1,145 | stable order | **0/5,000** |
| p3–p7, including red terminal | 1,145 | inverse | **0/5,000** |
| p3–p7, omitting p7 red fourteen | 1,131 | stable order | **0/5,000** |
| p3–p7, omitting p7 red fourteen | 1,131 | inverse | **0/5,000** |
| p8–p14, complete | 1,729 | stable order | **0/5,000** |
| p8–p14, complete | 1,729 | inverse | **0/5,000** |

The exact failure applies independently of the unknown plaintext language for this fixed cipher and each declared chapter start. It is stronger than a bad trigram score, since **no assignment of legal p56-style Fehu bypasses can produce a full section at all**. An alternative algorithm/key period, separator-moving transposition, non-ascending order, or prime start outside 0–4999 has not been tested. The source itself does not warrant reopening unbounded variants.

## Reproduction, native positive and disposition

[Node 22 CommonJS one-file SFT](../sims/lp2_p7_red14_2014_row_totient_original_sft.cjs) reads only the original canonical `lp2-corpus.json`, freezes the red fourteen literal array, checks the expected stable sort, checks direct/inverse row round trips, and tests solved authentic p56 at prime index zero. It further synthesizes complete source-native GP using the original clear p57 text and verifies both row orientations after **correct literal-F nonconsuming encryption**. It checks all 30,000 original start/slice/row-direction cases and asserts zero survivors.

[Manual-only Windows Node 22 Actions job](https://github.com/FlareZ123/liber-primus/actions/runs/44084361663) was dispatched with the fixed script and source. The [Windows Node22 original-source job passed](https://github.com/FlareZ123/liber-primus/actions/runs/44084361663): six source cases yielded 0 valid starts each, with maximum feasible prefixes of 503, 602, 503, 602, 522 and 545 runes respectively; all native-GP planted controls passed. This is an exact original-cipher negative within the declared model.

**Research fork:** retire this exact source-keyed row plus authentic prime shift route. The unverified permutation premise is too weak to justify another 14-permutation optimization, alphabet reindexing, arbitrary phase or stacking. A meaningful successor would need first-party evidence choosing the 14 ordering/offset/transport, or a separately sourced secret and operation that predicts untouched original plaintext. The p7 red ink remains a real source observation without an authenticated decipherment rule.
