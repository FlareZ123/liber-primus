# p57 19-body-word modular direction graph: two 5-cycles sharing WE

**Classification:** candidate human solve-path structure; exploratory, not a decryption. The result is independent of the rejected 5×19 rune-rectangle alignment.

p57 contains **20 words overall**: the red heading `PARABLE` plus 19 body words. The graph below deliberately treats the heading as a separate selector/seed (its GP-prime sum is 449, used in the conditional NUMBER(449)→944→59→95=5×19 chain) and uses the 19 body words as nodes. This exclusion is a modeling choice, but it is source-motivated by the typographic heading/body distinction and the 19-body-word count; it is not a claim that the page has only 19 words.

## Source-selected anchors

The corrected 2013 first-onion transcript/server has its double-space markers after **29** and **3257**. Under NUMBER, 29 reverses to 92, whose distinct prime factors 2 and 23 reduce by the project's established factor-index rule to GP rune **H**; 3257 reverses to prime 7523 and returns **+**. The rule and marker correction are documented in [the word-signature note](2013-number-markers-p57-word-signature.md).

Applying the same GP-prime-sum / NUMBER factor-index reduction to p57's 19 body words gives unique matches:
- **LIKE**, body-word position 1, sum 184 = 2³×23, reduces to **H**.
- **FIND**, body-word position 14, sum 151 is prime and reverses to itself, so it returns **+**.

The ordered marker signatures H, + therefore select LIKE, FIND in the same order. The 19-word sum table is in the linked note above.

Separately, the 2013 NUMBER operation on the PARABLE sum 449 reverses to 944, whose divisors include 59. Earlier work then chose 59 for a derived follow-up, obtaining 95 = 5×19, but **59 was not independently selected from the many divisors of 944**.

A p55 route now supplies that missing selector with fewer interpretive steps. The p55 ornaments lead conditionally through 13+31=44 to the 44th prime **193**, the unique base60 table value occurring 44 cells apart. Historical NUMBER(193) reverses to **391 = 17×23**. Under the project's already-established distinct-prime-factor/index reduction, factors 17 and23 have zero-based GP-prime indices 6 and8, summing to GP index **14 = X**. Among the 19 solved p57 body-word signatures, **X occurs uniquely at DIVINITY, position16**.

The solved wording then supplies a literal p55 check. After “shed our own circumferences,” p55 contributes exactly **43 strict word-interior runes**. GP index23 is D, and D occurs in that interior stream exactly at one-based positions **5 and23**. There are **17 runes strictly between them**, their position difference is **18**, and the inclusive D…D span contains **19 runes**. Thus both NUMBER(193) factors are physically realized: 23 is the second D position and 17 is the count between the D markers. The same geometry supplies **5×19 = 95**; reversing 95 gives **59**, so NUMBER(59) returns factors 5 and19 without concatenating page-segment labels. This independently selects the formerly free divisor59 of 944.

The 19-rune D…D span has one more exact fold relation: outer-to-inner equality bits are **100000000₂ = 256**, with D/D as the only equal pair; its center rune is **I**, whose GP prime is **31**. The p27 title route independently supplies outer equal P/P with P at GP index13. Together those selected runes give a plausible **PI** circumference mnemonic matching the ornament values 13 and31. That mnemonic is interpretive and is not treated as a π-derived cipher key.

The p57 page has **19 body words**, and the graph below has the two candidate **5-cycles**. Carrying the ornament pair's historical **+** marker into the graph from the newly selected DIVINITY node yields **DIVINITY → OWN → SHED → FIND → CIRCUMFERENCES** before entering the plus circumference cycle. The minus map from DIVINITY stays immediately on the five-cycle containing DIVINITY/WITHIN/SURFACE. This gives the sign choice a source-derived semantic interpretation, conditional on carrying the earlier + marker forward.

The 2016 signed message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” This is compatible with treating the 19 words as map nodes and their GP-prime sums as step sizes, though it does not explicitly specify the modular operation.

## Reproducible map operation

Number the 19 body words 1–19 in source order. Let S_i be the sum of the GP prime weights of word i. Use the source-selected modulus 19 and the directed step (with residue 0 represented by position 19):

[
f_{+}(i)=i+S_i\pmod{19},qquad
f_{-}(i)=i-S_i\pmod{19}.
]

The marker-selected LIKE and FIND anchors produce:

- **LIKE (1) under +:** (184\bmod19=13), so 1→14, landing exactly on **FIND**.
- **FIND (14) under +:** (151\bmod19=18), so 14→13, landing on **CIRCUMFERENCES**.
- Continuing the + map gives the 5-cycle:

[
	ext{FIND}_{14}\to
	ext{CIRCUMFERENCES}_{13}\to
	ext{WE}_{8}\to
	ext{AND}_{18}\to
	ext{TO}_{5}\to
	ext{FIND}_{14}.
]

The opposite direction from LIKE gives a second 5-cycle:

[
	ext{LIKE}_{1}\to
	ext{SURFACE}_{7}\to
	ext{WE}_{8}\to
	ext{WITHIN}_{17}\to
	ext{DIVINITY}_{16}\to
	ext{LIKE}_{1}.
]

The cycles are both length 5 and share exactly one node: **WE**, position 8. Thus the 19-word graph has a figure-eight structure around WE under opposite directions. The positive path from LIKE feeds directly into the FIND cycle.

The two cycles' word meanings are strikingly consonant with the parable's key phrases (“like ... to the surface”, “we ... find the divinity within”, “shed ... circumferences”), but this semantic reading is interpretive, not a recovered plaintext.

## Alternative numeric controls

### All-20-word map (heading included): a competing route

If the red heading PARABLE is included as a 20th node and the total-word count 20 is used as modulus, the selected anchors converge to **INSTAR** under both directions:

- In the + map, LIKE (position 2, 184 mod 20 = 4) and FIND (position 15, 151 mod 20 = 11) both land on **TO** (position 6). The shared path is TO → OUR → OWN → SURFACE → CIRCUMFERENCES → TUNNELING → INSTAR.
- In the − map, LIKE → WITHIN → THE → SHED → AND → INSTAR, while FIND → INSTAR directly.
- INSTAR is a fixed point because 280 mod 20 = 0. EMERGE (300 mod 20 = 0) is another fixed point, but neither selected anchor reaches it.

A separate 100,000-permutation null fixes LIKE/FIND positions and sums and shuffles the other 18 word sums. Both anchors reach INSTAR under both signs in 604/100,000 (0.604%); under the − map alone the frequency is 2.867%, and under the + map alone 2.344%. This is an exploratory null, not a formal p-value; word sums are not guaranteed exchangeable.

The 20-node map is at least as interesting as the body-only 19-node cycles. The source-visible total word count supports modulus 20; the heading/body distinction plus conditional 95=5×19 chain supports a separate 19-body map. No independent clue yet selects which map is intended, or whether both are nested layers.

### Alternative numeric controls

The two 19-node 5-cycles do not appear when the body-word values are replaced by the sum of rune ordinals or by rune count:
- With ordinal sums, the negative walk from LIKE reaches the fixed point TO, and the positive walk from FIND reaches the fixed point WITHIN.
- With rune counts, the negative walk from LIKE has a different 4-cycle (DIVINITY → WE → THE → TUNNELING), while the positive walk from FIND has a different 5-cycle (FIND → AND → THE → TUNNELING → OUR). They do not form the observed pair of 5-cycles sharing WE.

This supports the specificity of GP-prime word sums as the tested numeric representation, but it does not independently prove that this is the intended representation.

## Permutation null

The reproducible script [`sims/p57_word_map_19_direction_cycles.py`](../sims/p57_word_map_19_direction_cycles.py) fixes the two marker-selected anchor sums at LIKE position 1 and FIND position 14, shuffles the other 17 word sums, and tests all four sign assignments for 100,000 permutations (seed 20261112).

- Both selected nodes lie in 5-cycles for some sign assignment in 24,721/100,000 permutations (24.721%): not rare by itself.
- Both lie in 5-cycles that intersect at exactly one node in 860/100,000 (0.860%).
- Both lie in 5-cycles whose shared node is specifically WE in 32/100,000 (0.032%).

The conservative relevant frequency is **0.860%**, because the sign assignment and shared-node identity were not independently fixed before observing the graph. The 0.032% WE-specific frequency is descriptive and post-selected. This is a simple permutation diagnostic, not a formal p-value: word sums are not guaranteed exchangeable, and the 5-cycle length was motivated by the conditional 5×19 factorization.

## What remains unselected

- The 2013 markers select LIKE and FIND, but the available sources do not yet specify why LIKE should use the minus map while FIND uses the plus map. The H/+ marker outputs may be relevant, but no source-grounded mapping from H to a negative direction has been established.
- The 2016 message supports the broad map/road/direction interpretation but does not explicitly prescribe GP-prime word sums modulo 19.
- The graph reveals a structured word route, not a destination, an unknown-page key, or recovered ciphertext plaintext.

## Next decision

Seek one independent clue that fixes the sign/orientation or explicitly selects the 19-word modular walk. In particular, test whether the 2016 “path lies empty” / “Seek and you will be found” wording supplies a rule for the plus anchor FIND and whether the H anchor has a source-defined opposite direction. Do not search arbitrary moduli or sign conventions. If no such selector exists, retain this as a promising but unconfirmed word-map structure rather than expanding it into a cipher search.