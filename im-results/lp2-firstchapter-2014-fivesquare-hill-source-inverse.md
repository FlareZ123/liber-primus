# Original 2014 five-by-five magic-square Hill inverse against LP2's first 729 runes

**Agent40, 15 November 2026. Bounded complete original-cipher negative. No recovered unknown plaintext, authentic key or continuation.** The two 2014 five-by-five source matrices do not yield native GP29 prose when used as Hill matrices on the first 729 unsolved LP2 runes under a participant-inspired one-rune prefix convention. [Exact source-input reproducer](../sims/lp2_firstchapter_2014_fivesquare_hill_source_sft.cjs).

## Operational hypothesis and limits

The historic Cicada fifth-onion stage supplied three exact numerical squares, with 5×5 squares summing to **3301** and **1033**. These 25-element matrices are naturally readable as length-five Hill operators over the 29-symbol Gematria Primus alphabet. The independently published first three LP2 physical pages have **729** ciphertext runes (262 + 266 + 201). An original **February 2015 participant's** hypothesis introduced a fictitious preceding F when testing prime-difference operations on those 729 runes. Retaining that prefix gives **730 = 146×5**, enough for a complete five-vector Hill operation on unchanged real input. The added F is declared synthetic and dropped from the decrypted output.

This is a **new proposed composition**, not a historical source-selected encryption instruction: the 2015 participant did not propose Hill5, and the 2014 signed square challenge concerned entering three numerical squares in an earlier-stage form. The length equality alone cannot establish authorial intent. Consequently this is a bounded discriminating screen of one plausible five-rune operator, not a claim about all matrices, keys, clocks or different plaintext registers.

## Frozen matrix and source registers

Read the original [2014 three-square text](../resources/cicada2014-openpuff-magic-squares.txt). Reduce the first and third 5×5 matrices modulo29, without totients, byte hashing, extra keys or altered entries. Their determinants are respectively **10** and **3** modulo29; both are invertible.

For each source matrix K, test **K and its inverse**, with either **column-vector** or **row-vector** Hill convention, on the same original 729 runes. The complete case prefixes a zero-index **F=0** to the real ciphertext, performs 146 blocks of five, then removes the one fictitious output slot. This gives exactly **eight full-coverage candidate decryptions of 729/729 authentic runes**. As an unpadded phase control, also process the source's first 725 ciphertext runes in 145 blocks, explicitly leaving the original last four uninterpreted. There are **16** fixed model cases total. No free matrix coefficients, crib, phase fitting or post-selected positions.

Every case is exactly invertible: multiplying each decoded block by its corresponding encryption matrix reconstructs the unchanged source input. Separately, for every case, a 730- or 725-rune plant made only from the **actual clear p57 GP29 runes** is encrypted and recovered exactly, establishing that the inverse can preserve genuine source-native plaintext if supplied.

## Complete original-input decision

| Measure | Exact result |
| --- | ---: |
| Original pp0–2 ciphertext IoC, all 729 | **0.034082515563997044** |
| Full-coverage eight candidates, smallest IoC | **0.03394308023937653** |
| Full-coverage eight candidates, largest IoC | **0.03514147032665551** |
| Best full case | 2014 third/1033 square, row vectors, forward K, prefixed F |
| Best full case first 30 recovered GP indices | `[20,9,26,28,17,23,24,7,4,6,25,7,9,2,0,12,1,13,0,13,1,5,2,6,19,26,10,7,4,28]` |
| Best partial 725-only candidate IoC | **0.03521813678795961** |
| Independently clear p57 source IoC, 95 runes | **0.06270996640537514** |

Every full output is still essentially uniform over GP29, without contiguous legible original-language text. The best partial output also fails to show source-native structure and does not cover the full ciphertext. Exact roundtrip validates only the matrices, since any invertible wrong matrix also reencrypts its own output.

The first-page source data and square values were read directly from the repository's original-derived corpus and 2014 square text; the result was also calculated independently in the connected JavaScript runtime. The standalone CJS SFT reads those same files and asserts all source lengths, matrix inverses, original forward replay and p57 native control.

## Research decision

Do not pursue the specific **2014 first/third five-square Hill5 plus fictitious initial F** as a decoder for the complete first chapter. This is a source-derived, reversible construction that fails the essential plaintext test under every fixed conventional orientation. It does **not** refute other cipher families, an author-selected five-dimensional transformation with an external key, real F-bypass behavior, or the possibility that the published 2015 hypothesis is unrelated to LP2 authorship.

Further action requires a physically marked instruction selecting a source matrix and its consumer, or a different high-value historical input that predicts authentic unknown text without fitted exceptions.
