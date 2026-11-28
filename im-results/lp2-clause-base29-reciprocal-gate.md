# Clause-framed BASE29 reciprocal: exact original-input decision (#3292)

**Agent 3, 28 November 2026.** No unknown plaintext or authenticated cipher key. The operation is an involutive mathematical candidate, not an authenticated Cicada instruction.

## Source constraint and difference from earlier research

The signed 2013 TCP BASE29 example gives 3301→3QO; contemporaneous participant witnesses give 1033→16I and 30→11. See [signed-source record](../resources/external/2013-tcp-server-signed-source.md). The latter establishes minimal width, so fixed printed width is an additional explicit hypothesis. The source does not prescribe reciprocals or identify clauses as numeric fields. #2857 and the [strict small-stop transport](lp2-small-fullstop-base29-byte-transport-gate.md) test integer/byte transport; #885 uses word fields; #2619 and the [all-secret word-power gate](lp2-signed2013-base29-wordpower-allsecret-terminal-gate.md) use individual words; the [chapter exponent search](lp2-chapter-base29-short-exponent-exact.md) uses a different whole-chapter scope. A reciprocal is a special valuation-preserving power e=-1; the novel scope here is literal clause frames, with no exponent search.

Freeze ordinary GP ordinals, big-endian, exact rune count n, original ⁘/⁜ boundaries within the first source chapter p0–2, and the next source chapter p3–7 as continuation. Commas, line/page wraps and word spaces do not reset the integer. Chapter endpoints are included; large marks also bound rubric fields. There are no known ambiguous p27/p37/p38 marks in this scope. Use original punctuation audit coordinates and preserve every rune, including heading and F.

For nonzero x=29^v u with gcd(u,29)=1, set T(x)=29^v (u^{-1} mod 29^(n-v)); T(0)=0. Restore exactly n digits, including leading zeros. This preserves valuation; the unit inverse applied twice returns the original, hence the map is bijective. Ordinary unit-only inversion is undefined on any original field ending in F. No hidden per-clause key, sign, offset or alternate modulus.

## Results

| Original physical pages | Fields | Runes | Nonunit input | Leading zero input | Leading zero output | Raw trigram mean | Decoded trigram mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| p0–2 | 9 | 729 | 0 | 0 | 0 | -3.654509 | -3.661788 |
| p3–7 | 17 | 1145 | 0 | 0 | 0 | -3.606262 | -3.659291 |

Both complete original inverses and their forward replay are preserved in [raw output](lp2-clause-base29-reciprocal-output.json). The first chapter starts `TXEFNGEAEOTH-NCOENGG.TMEOJ-FDEO-/
HAETH-WXSEOIAGDEOXHY-AEOJIAJ-ITHUN-/
YOEH-OEPR-GOFY-UEAT-SDUWIANG-/
HJJOEWIABOEHE`; the next starts `IAAE-UEOMEOOEWWXSFOE-YUR.IARR/
-MOENGRLTHA-GNGCOEEWC-UMGPDM/
NG-SEAOB-YEOOXJU-LHCCIAXPUJP/
OEAE-R-IANCWOTHIDG-NGA-P`. Neither output is coherent prose. Printed spaces are carried through for display; they are not proven plaintext spaces.

## Calibration

Three historical BASE29 conversions reproduce. All 25259 inputs of widths one through three pass exhaustive involution checks. All nine complete native GP reference sections pass encode/decode; these are constructed reciprocal plants on real solved-source plaintext, not evidence that Cicada used this cipher. Actual p57 direct native replay and p56 prime-minus-one replay also pass (95/95 and 85/85, 84 consuming shifts). Rune trigram model is trained on the seven LP1 native sections only, additive smoothing 0.1; no selection or tuning on the originals. Held native scores p56 -2.607361, p57 -2.524419; corresponding constructed inverse recovers the same scores exactly. Roundtrip is an implementation invariant, not evidence of a historical cipher.

**Decision:** retire the fixed clause-wise reciprocal with these coordinates, GP ordinal order, padded width and no extra key. The historical minimal register does not authenticate the padding convention or the operation. No further inversion variants justified by this experiment. A genuine source-selected reciprocal operator or different independently framed register would be new evidence.

Reproduction: [CommonJS SFT](../sims/lp2_clause_base29_reciprocal_sft.cjs). Core executed in connected V8; standalone Node wrapper not independently executed. Full source blob IDs recorded in raw JSON.
