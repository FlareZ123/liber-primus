# Onion2 eight-byte rows against the 32 source-delimited LP2 fragments: fixed base29 direct inverse

**11 November 2026: bounded original-input negative.** The exact historical 2014 Onion2 256-byte stream admits a natural no-padding **32×8** reshape, and the **31 original thirteen-dot marks** delimit exactly **32 rune fragments** across LP2's 58 physical pages. A single declared key transform built from the independently Cicada-signed **2013 BASE29 numeral operation** and the established GP29 additive rune alphabet fails to decrypt the **12,956 original unsolved runes**. This negative covers only the named transform; no authenticated source instructs a solver to apply the 2013 BASE29 operation to the 2014 Onion2 bytes.

## Human-visible premises and weakest association

- [Original 2014 Onion2 256 bytes](../resources/cicada2014-onion2-timing.json): ordered, copied without permutations, offsets or seeded generators. The newer independent interarrival split of bytes 190–191 is irrelevant to the fixed row ordering.
- [Original LP2 13-dot marker annotations](../resources/liber-primus/lp2-ink-annotations.json): **31** separate 13-dot events in their original page/position order, 32 fragment intervals from book start through page57 end. Marker positions are measured in *runes*, with two pairs of adjacent markers sharing a global rune coordinate. Consequently fragment **8** and fragment **11** are **empty**; this source-derived boundary detail cannot be silently discarded to obtain 32 non-empty fragments.
- [Cicada-signed 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) authenticates `BASE29 3301 -> 3QO`. This means conventional radix-29 digits, for example 3301 = 3×29² + 26×29 +24. It does **not** authenticate interpreting those digits as GP rune indices, the 2014 byte stream as an LP2 key, or a per-fragment byte-to-rune key schedule.

The declared **exploratory model** converts each row of eight bytes to 16 conventional base-29 digits using `floor(byte/29)` then `byte%29` (always width two), maps each digit numerically to the corresponding GP rune index, repeats those 16 digits within the matching fragment, and decodes each original index with `P=(C−K) mod29`. The additive convention is standard Vigenère arithmetic and is known from the already-solved LP pages. Fragment clock resets at each original thirteen-dot mark; no attempt is made to tune sign, offsets, phases, row order, omitted/leading-zero policy or ciphertext-dependent state.

**Caveat:** fixed two-digit width and use of the signed BASE29 operation on Onion2 byte values are model assumptions. A source-fixed transfer instruction has **not** been recovered, so this is a bounded falsification of one simple cross-round construction, not an elimination of all 32×8 key hypotheses.

## Original-source result

The standalone [CJS test](../sims/onion2_rows_32fragment_base29_sft.cjs) reads three pinned resources directly and prints their source-byte counts, fragment lengths and the exact corpus-wide statistical comparisons. Both decoded and wrong-row controls are computed from original, never language-fitted, ciphertext.

| Sequence, over original unsolved p0–p55 (12,956 runes) | Coincidence index | Adjacent same-rune rate |
| --- | ---: | ---: |
| Original unknown ciphertext | **0.034478398** | **0.006638364** |
| Exact row-matched fixed base29/Vigenère inverse | **0.034468258** | **0.032960247** |
| Wrong-row shifted-by-one negative control | **0.034502253** | **0.033577769** |
| Native solved p57 source rune text (95 runes; separate positive language baseline) | **0.062709966** | **0.010638298** |

The original and decoded IoCs remain near the uniform 29-symbol floor (1/29≈0.03448), while native solved GP text is substantially nonuniform. No fragment of **300 or more runes** has a decoded IoC above **0.0353** under the fixed row schedule. Applying the declared cipher to a *planted* native solved p57 message and reversing it with the exact source row recovers every rune; the wrong-row transform does not.

**Independent test:** 32 rows of exactly 8 bytes, 31 original marker events, 32 fragments, two empty fragments, 12,956 unsolved rune output; exact re-encryption of all original output; seeded positive control is deterministic and uses the original solved source text. No English-looking original decode or common key was recovered.

## Research decision

The equal count 32 and the older signed BASE29 instruction motivate a precise experiment, yet neither supplies a Cicada-authenticated **key transfer, conversion, polarity, row-to-fragment assignment or reset rule**. The tested natural direct inverse is negative on untouched original material and fails against a solved-text baseline. **Retire this particular source-composite model and do not tune its variants.** Reopen the row-key hypothesis only upon an independent original clue specifying a complete, reversible 2014 byte-to-LP2 operation or source-selected keystream state. Unknown LP2 plaintext remains unrecovered.
