# P55 SHED arithmetic: 43-rune interior is eight times a prime; 32-rune circumference is divisible by 43

**Agent1, 23 November 2026. Classification: exact original-source arithmetic and a source-motivated candidate for a prime parameter. There is no recovered unknown-page plaintext, creator-selected decipherment key, or demonstrated downstream receiver.**

## The human-visible proposal

The solved p57 closing parable instructs the reader to shed circumferences and find divinity within. This motivates a literal word-local operation on the immediately preceding unsolved terminal page p55 (original 72.jpg): discard each complete word's first and last rune, retaining its middle. The 2013 Cicada BASE29 transport and the original Gematria Primus index order motivate reading the resulting runes as left-to-right base-29 digits 0–28. The first printed p55 single-rune fragment is a **carry from p54** and is excluded: it is not a complete p55 word.

Exactly **16 complete p55 words** supply **43 interior runes** and **32 circumference runes**, from 75 page-local runes after excluding the one-rune carry. The source has 76 p55 runes total. The GP0 indices of the interior, as independently regenerated from the full original transcription, are:

~~~
19 10 12 6 23 2 27 24 17 5 28 0 14 10 19 1 5 13 8 21 20 15
23 27 13 8 12 18 10 6 14 6 15 12 2 2 18 28 10 19 5 11 18
~~~

The GP0 sum is **576**. The 43-digit left-to-right base29 integer is:

~~~
N = 510043531279477768552291351270111060625364732293226050492113768
  = 8 × 63755441409934721069036418908763882578170591536653256311514221
  = 8 × P
~~~

**P is a mathematically certified 206-bit prime.** The accompanying single-file Node22 SFT includes a complete 42-node Lucas-Pratt witness tree and verifies that each witness's factors recursively prove the prime. The top-level witness is generator 2 with complete factorization:

~~~
P−1 = 2² × 5 × 41 × 49477 × 15535963
      × 101149063843788281988908603592862658065019147521
~~~

The 32 boundary runes, taken as first, last for each original complete word in printed order, form a second base29 integer:

~~~
E = 54546906948733185277568038540584540814742666891
  = 43 × 1268532719737981052966698570711268391040527137
~~~

Thus the removed circumference's integer is divisible by exactly the **43-rune interior count**. The 2016 independently authenticated signed clue contains 43 natural-language words; the common number43 is a possible route cue, without selecting a specific cipher operation. The factor8 also equals the public DH value A=8 in a previously studied p28 worked example, but a **direct transplant of the original worked-example group (g=5, A=8) to modulus P is mathematically impossible**. Specifically P ≡ 5 (mod 8), 5 is a quadratic residue modulo P, and 8 is a quadratic nonresidue. Thus no exponent a satisfies 5^a ≡ 8 (mod P). This falsifies the most immediate source-derived DH interpretation without relying on plaintext or chosen parameters. A different creator-specified group/operand would still require first-party evidence.

## Original-input controls

The extraction is defined on the original p55 physical text, preserving every rune and original word boundary. The source code embeds the verbatim 76-rune p55 text and, in a checkout, checks it against resources/liber-primus/lp2-transcription.txt.

Using the same page-local physical-word interior extraction and the same GP0-forward numeral rule on **all 57 rune-bearing physical LP2 pages** (55 unsolved and solved p56–57) yields exactly **one** page whose base29 interior number has a prime odd cofactor: **p55**. This is a family-specific, post-discovery control. Other page word fragments crossing page boundaries are treated as physical fragments, so this census is not a claim about every conceivable canonical whole-word segmentation.

For p55, three natural alternative readout conventions do not reproduce the prime: GP0 reversed has three factors of two but composite odd cofactor; GP1 forward and reverse give odd composite integers. The GP0 forward operation is independently motivated by the original BASE29 convention.

A finite **200,000-trial matched null** permutes the sixteen genuine p55 complete words as intact units. Every trial preserves each word's actual first/interior/last runes and the entire source word multiset, while reordering the words. The committed SFT uses seeded Mulberry32, seed 0x3301A855:

| Predicate | Matched permutations |
| --- | ---: |
| E ≡ 0 (mod 43) | 4,592 / 200,000 |
| N = 8 × probable prime | 806 / 200,000 |
| **Both simultaneously** | **16 / 200,000** |

A second independent 200,000-trial Python Mersenne-Twister word-permutation control with the same literal seed gives 4,607 / 793 / 18, respectively. These are descriptive conditional frequencies under the disclosed null and are **not an unconditional discovery p-value**. The extraction, radix, direction, small factor8, shell divisor43 and source association were recognized through exploratory analysis. Searching many original numerical/word structures can produce isolated rare arithmetic relationships.

## Interpretation and missing cipher

There is a compact potential player action: solved **SHED** clue → complete p55 word interiors → standard original BASE29 reading → a directly checkable 206-bit prime, with circumference integer independently carrying the number43. This is more operationally specific than a generic p55 prime-sum coincidence, but it **does not yet decode a rune**. A creator-authored rule must still explain why one should factor out eight, what the resulting prime is for, and how the circumference's 43 divisor directs an actual receiver. The 2013/2016 references and any interpretation as a DH key remain conjectural.

The next decisive experiment should seek a first-party, independently selected **consumer of P and E/43** that converts one original p54–55 ciphertext segment to sustained intelligible plaintext, with an exact reversible map and an untouched holdout. Test a historical, concrete algorithm supplied by the puzzle rather than fitting arbitrary modular exponentiation, hashes, key offsets, or ciphertext word addresses after the fact. If no such consumer emerges, retain this as a candidate mathematical signal with substantial look-elsewhere risk.

## Reproduction

Execute the read-only SFT:

~~~text
node sims/lp2_p55_shed_prime_shell_sft.cjs
~~~

The test reconstructs the two integers from the original runes, verifies the complete Pratt prime certificate, checks both source readout alternatives, runs the frozen word-permutation null, and, when executed inside a repository checkout, scans all 57 rune-bearing pages for independent controls. The source transcript and first-party message are at resources/liber-primus/lp2-transcription.txt and resources/historical/cicada2016-4gq25-outguess.asc. No novel plaintext is asserted.
