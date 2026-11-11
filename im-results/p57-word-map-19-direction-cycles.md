# p57 19-body-word modular direction graph: two 5-cycles sharing WE

**Classification:** candidate human solve-path structure; exploratory, not a decryption. The result is independent of the rejected 5×19 rune-rectangle alignment.

p57 contains **20 words overall**: the red heading `PARABLE` plus 19 body words. The graph below deliberately treats the heading as a separate selector/seed (its GP-prime sum is 449, used in the conditional NUMBER(449)→944→59→95=5×19 chain) and uses the 19 body words as nodes. This exclusion is a modeling choice, but it is source-motivated by the typographic heading/body distinction and the 19-body-word count; it is not a claim that the page has only 19 words.

## Source-selected anchors

The corrected 2013 first-onion transcript/server has its double-space markers after **29** and **3257**. Under NUMBER, 29 reverses to 92, whose distinct prime factors 2 and 23 reduce by the project's established factor-index rule to GP rune **H**; 3257 reverses to prime 7523 and returns **+**. The rule and marker correction are documented in [the word-signature note](2013-number-markers-p57-word-signature.md).

Applying the same GP-prime-sum / NUMBER factor-index reduction to p57's 19 body words gives unique matches:
- **LIKE**, body-word position 1, sum 184 = 2³×23, reduces to **H**.
- **FIND**, body-word position 14, sum 151 is prime and reverses to itself, so it returns **+**.

The ordered marker signatures H, + therefore select LIKE, FIND in the same order. The 19-word sum table is in the linked note above.

Separately, the 2013 NUMBER operation on the PARABLE sum 449 reverses to 944, whose divisors include 59; applying NUMBER to 59 predicts 95 = 5×19. This second query is a derived follow-up, not a preserved historical server response. The p57 page independently has 19 body words. The factor 5 is a candidate cycle length; 19 is the source-visible word-map size and the modulus tested below.

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

Including PARABLE as a 20th node and using modulus 20 is a useful control: both selected anchors (LIKE and FIND) flow to the fixed point INSTAR rather than producing the two 5-cycles. The body-only 19-node model is therefore the one aligned with the 5×19 selector, though this does not prove that the heading must be excluded.

The two 5-cycles do not appear when the word values are replaced by the sum of rune ordinals or by rune count:
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