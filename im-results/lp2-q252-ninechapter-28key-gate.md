# Q252 as nine chapter-local 28-symbol repeating keys: original-cipher gate

**Agent24, 14 November 2026. Classification: bounded negative.** This tests one concrete interpretation of the source-derived 252-symbol quotient from the p49–51 table. It recovers no unknown LP2 plaintext, authentic key, or cipher mechanism.

## Causal premise and strongest rival

The original p49–51 table has 256 printed two-character cells. Under the conditional direct row-major base-60 reading, the 2013 signed BASE29 example 3301 -> 3QO supplies factor H=[3,26,24], while the original p39 red triad supplies G=[27,5,15]. Their product divides the original 256-coefficient GF(29) table polynomial exactly, leaving a 252-coefficient quotient Q252. The original images independently define nine top-level unknown chapters: p0–2, p3–7, p8–14, p15–22, p23–26, p27–32, p33–39, p40–53, and p54–55.

A possible human-readable bridge is 252 = 9 x 28, where 9 is the source-visible chapter count and 28 is the order of GF(29) multiplicative group. The frozen candidate was therefore: take Q252 in printed high-to-low coefficient order, split it into nine consecutive 28-symbol blocks, use block j as a repeating additive GP29 key for chapter j, and reset at each chapter boundary. This is not an authenticated author instruction. The strongest rival is that the factor quotient is merely an algebraic message or checksum operand and 9 x 28 is a post hoc factorization of its length.

## Frozen source and operation

- Original table bytes: 256 values from resources/liber-primus/lp2-grid-256.json; SHA-256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
- Factors: H=[3,26,24], G=[27,5,15], with low-order product [23,21,11,17,12]. The original polynomial remainder is exactly [0,0,0,0].
- Quotient: reverse the polynomial-division quotient into the original printed high-to-low coefficient order. Its first 14 values are [0,12,9,28,2,25,23,21,18,28,21,17,17,8]; its last 14 are [9,23,14,1,26,13,18,2,14,8,27,19,4,6].
- Chapter groups and original rune counts: 729, 1,145, 1,729, 1,903, 1,021, 1,433, 1,680, 3,008, and 308, totaling all 12,956 unknown runes.
- Each 28-symbol block repeats from phase zero within its assigned chapter. The only two arithmetic directions tested are P=(C-K) mod29 and P=(C+K) mod29. No phase fitting, reversal, per-page reset, altered alphabet, or F bypass is introduced.

## Results

The nine 28-symbol blocks are not permutations of GF(29) nonzero residues. Their unique-value counts are **16, 19, 21, 16, 19, 16, 18, 17, and 22**; each block contains duplicates and misses multiple nonzero values. This rejects the more specific interpretation of the blocks as nine direct 28-entry multiplicative S-boxes.

For the repeating additive-key interpretation:

| Direction | Full-book IoC | LP1-GP trigram nats/rune | One-coefficient wrong-key score |
| --- | ---: | ---: | ---: |
| P=C-K | 0.03449320 | -11.06495 | -11.06332 |
| P=C+K | 0.03444822 | -11.06188 | -11.05653 |

The native source reference has 412 held-out 238-rune windows, with scores from **-8.65816 to -8.09729** (median -8.41309). The best 238-rune window anywhere in the nine decoded chapters is only **-10.85605**, over 2.19 nats/rune below even the weakest native window. All nine chapter outputs remain nonlinguistic. A one-coefficient perturbation of each chapter key scores slightly better than the proposed key in both directions, so the candidate has no key-specific language advantage.

The standalone SFT also verifies exact forward re-encryption of every original chapter and exact recovery of synthetic native-GP plants under both signs. Those checks validate the implementation only: any chosen additive key round-trips by construction.

## Decision

Retire this exact source-derived consumer: direct high-to-low Q252, nine consecutive 28-symbol blocks, chapter-order assignment, chapter-reset repetition, additive GP29, and either sign. Do not rescue it with fitted offsets, reordered blocks, a new chapter clock, a guessed F-skip mask, or a different 28-symbol interpretation absent an independent original instruction. This does not reject other Q252 consumers or the conditional H/G table relationship itself.

Reproduction: sims/lp2_q252_ninechapter_28key_sft.cjs. The result is intermediate evidence; results/README.md remains unchanged because no established plaintext or cryptographic mechanism has changed.
