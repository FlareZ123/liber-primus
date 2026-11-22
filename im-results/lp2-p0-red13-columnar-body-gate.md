# P0 red13 as a pure 13-column transposition key: original-body gate

**Agent 27, 21 November 2026. Classification: bounded original-input negative.** No unknown plaintext or authentic key was recovered. This tests the direct, source-visible columnar interpretation of p0's own red heading.

## Human-visible premise

The original p0 image has 13 red GP29 runes, followed immediately by a red marker containing 13 dots. The source-adjudicated override fixes the 13-rune heading at offsets 0–12 and the black body at offsets 13–261, a total of **249 runes**. The body length has an immediate geometric fit:

~~~text
249 = 13 × 19 + 2
~~~

A human solver could therefore treat the red heading as a 13-symbol column key and the 13-dot marker as the column count. This is a standard, recognizable columnar-transposition hypothesis. It does not require assuming the red heading's plaintext.

The exact raw red key is:

~~~text
[15, 8, 18, 3, 6, 19, 27, 0, 15, 26, 18, 21, 5]
~~~

## Frozen operation

Rank the 13 raw GP29 key values stably, preserving left-to-right order for ties. Test the two natural rank directions (ascending and descending), each with both possible transform directions:

- row-write into 13 columns, then read columns in key order;
- the exact inverse, filling columns in key order and reading rows.

For 249 symbols, the row-write rectangle has 20 rows and fixed column lengths **[20,20,19,19,19,19,19,19,19,19,19,19,19]**. No arbitrary column permutation, tie reversal, rotation, phase, second cipher, or word-specific reset is permitted.

This is distinct from the existing p0 combined columnar-plus-additive test, which derives an additive key from the unverified EPIPHANY SEEKS title crib, and from the p0 global-dropcap test, which uses a book-wide dropcap sequence rather than p0's local red heading. Here the local original red heading alone supplies the rank key, and the only operation is a pure transposition.

## Results

The standalone Node 22 SFT is **sims/lp2_p0_red13_columnar_body_original_sft.cjs**. It verifies the original 13-rune key and marker, all 249 body runes, the ragged rectangle, both exact transform round trips, and planted clear-p57 positive controls. Language evaluation uses the pinned 300,000-character Shakespeare reference mapped through the fixed GP29 transliteration routine, a four-rune model trained on the first 150,000 characters, and 300 fixed held-out windows of 249 runes each.

| Key rank direction | Transform applied to original body | IoC | GP4 mean log score |
|---|---|---:|---:|
| Unchanged body | — | 0.0343632595 | −14.1708061057 |
| Ascending stable | Inverse columnar | 0.0343632595 | −14.1657722515 |
| Ascending stable | Forward columnar | 0.0343632595 | −14.1537511549 |
| Descending stable | Inverse columnar | 0.0343632595 | −14.2133458679 |
| Descending stable | Forward columnar | 0.0343632595 | −14.1659781527 |

The 300 held-out English windows have GP4 score range **−11.4543172973 to −9.6825863609**, with median **−10.7432118275**. The best transposition candidate remains more than 2.7 score units below even the weakest held-out window. All four outputs remain nonlinguistic; IoC is unchanged, as a pure transposition must preserve symbol counts.

**Scoring limitation:** this is an English-register screen using Shakespeare mapped through the fixed GP29 transliteration, not a multilingual adjudicator. It rejects these exact receivers as English plaintext candidates; it does not exclude a different language register.

## Decision

Retire the exact direct receiver **p0 raw red13 → stable 13-column rank order → pure columnar transposition of the 249-rune black body**, for both rank directions and both transform orientations. Do not expand it into arbitrary permutations or additional cipher layers without a new first-party selector.

Reproduce from the repository root with:

~~~sh
node sims/lp2_p0_red13_columnar_body_original_sft.cjs
~~~

Sources: **resources/liber-primus/17.jpg**; **resources/liber-primus/lp2-p0-physical-ink-override.json**; **resources/liber-primus/lp2-corpus.json**; **resources/control/shakespeare_first300k.txt**.
