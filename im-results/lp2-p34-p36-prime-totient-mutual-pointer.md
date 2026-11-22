# p34 ↔ p36 prime/totient mutual page pointer

**Agent 19, 18 November 2026. Evidence class: exact source-only structural relation. No unknown plaintext or key recovered.**

## Discovery

The existing DH/Wisdom route has a conditional one-based selector that lands on LP2 p36: candidate DH exponent 1661 gives φ(1661) mod 29 = 21, Wisdom cell 21 is 151, and 151 is the 36th prime.

Inspecting the canonical p36 transcription reveals a visibly isolated suffix:

- the first p36 clause is 99 runes;
- the original page places a red 10-square separator exactly at rune offset 99;
- after that separator comes numbered **item 1**;
- item 1 contains **34 rune-words and 139 runes**;
- **139 is the 34th prime**;
- **φ(139) = 138**.

The word count therefore points from p36 to p34 by the same prime-ranking vocabulary already explicit in the Wisdom material.

On p34, period-delimited clause 3 contains:

- **36 rune-words**;
- **138 runes**.

Its word count points back to p36, while its rune count is exactly φ(139). The value 138 is also an explicit number in the historical 5×5 Wisdom square, at one-based cells 2 and 24.

This gives the compact reciprocal structure:

[
	ext{p36 item 1}: (34 	ext{words},139 	ext{runes})
quadstackrel{139=p_{34}}{longrightarrow}quad
	ext{p34}
]

[
	ext{p34 clause 3}: (36 	ext{words},138 	ext{runes})
quadstackrel{138=arphi(139)}{longrightarrow}quad
	ext{p36}.
]

## Global census

The reproduction script maps every LP2 p0–p57 page to master-transcription part `p+16` by exact rune-count equality, then inventories all period-delimited units on unsolved p0–p55.

There are **212** such units. A mutual page-pointer pair is defined before looking at rune arithmetic: for units on pages `a` and `b`, the unit on page `a` must contain `b` words and the unit on page `b` must contain `a` words.

Exactly **8** mutual word-count page-pointer pairs occur:

- p4 ↔ p23
- p4 ↔ p22, twice because p22 has two matching clauses
- p5 ↔ p12
- p9 ↔ p47
- p11 ↔ p25
- p16 ↔ p29
- **p34 ↔ p36**

Only **p34 ↔ p36** additionally satisfies the locked prime/totient condition that one unit has a prime rune count whose prime rank equals its own word count and whose Euler totient equals the partner unit's rune count.

Thus the p34↔p36 relation is unique in the complete p0–p55 census under this exact compound rule.

## Direct operation test

The same numbers suggest an attractive reversible position map:

- modulus 139 from the p36 item length;
- Wisdom center `FORM` has GP prime sum **91**;
- **34 × 91 ≡ 36 (mod 139)**;
- gcd(91,139)=1.

This makes multiplication by 91 a permutation modulo 139, and it naturally permutes the 138 nonzero residues used by the p34 clause. Both gather/scatter orientations were applied to the p34 138-rune clause and to the p36 139-rune item. Neither produced readable plaintext or an obvious instruction. Direct first/last truncation additive coupling between the 139- and 138-rune units was also nonlinguistic.

Do **not** treat the modular-91 permutation as a recovered cipher. Its arithmetic closure is noteworthy, while the direct plaintext consequence failed.

## Decision

Treat p34 and p36 as a source-selected **paired receiver** worth prioritizing. The relationship is exact, visually grounded on p36 by the red separator and item number, and uniquely combines mutual page pointers with the prime/totient operations explicitly emphasized by the solved Wisdom material.

The next useful step requires an independent clue that says how these two ciphertext units interact. Avoid broad permutation/key sweeps around 139: the direct 91-multiplier and direct additive pairings have already failed.

Reproduction: `sims/lp2_p34_p36_prime_totient_mutual_pointer_sft.cjs`.

Windows Node 22 PASS: Actions run **44402926263**, job **135150481064**.
