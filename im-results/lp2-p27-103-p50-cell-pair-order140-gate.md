# Source-selected order-140 field element from the p27 → p50 handoff: direct consumers fail

**Status: bounded negative.** The source-navigation hypothesis is preserved; the proposed direct field-stream consumers do not recover plaintext.

## Source-derived candidate

The original p27 repeated-footer study identifies the next complete printed word after the copied six-rune marker as AE.F. Its two GP prime values sum to 103. The p50 256-cell table's 103rd and 104th row-major entries are 0W and 3Q, whose sexagesimal values are 32 and 206. Both reduce to 3 modulo 29, giving the H-field element

g = 3 + 3α, with α² = 11α + 18.

This element has exact multiplicative order **140**, with g^70 = −1. The p33–39 chapter has 1,680 runes = 840 adjacent pairs = **six complete 140-pair cycles**. This is a more specific candidate than an unconstrained field-element search: the two coefficients come from the table cells selected by the proposed p27 word-address.

The selection itself is not authenticated. The p27 address 103 was noticed after the repeated-footer navigation clue, and the source does not explicitly instruct the solver to reduce those two table cells modulo 29 or interpret them as a field element. The experiment tests the resulting concrete hypothesis; it does not promote the address chain to fact.

## Frozen candidate family

Using the source H quadratic and g = 3 + 3α, the p33–39 original ciphertext was tested under:

1. **Pairwise additive stream:** Pⱼ = Cⱼ − g^(phase ± j). Since g^70 = −1, all 140 phases cover both additive signs.
2. **Pairwise multiplicative stream:** Pⱼ = Cⱼ · g^(phase ± j), covering multiplication and inverse multiplication through the two exponent directions.
3. **Scalar field readouts:** the trace, norm, first coefficient and second coefficient of g^j, each used as an additive GP29 key stream.

The pairwise search includes both conjugate roots, all 140 phases, both exponent directions, both coefficient orientations, and page-reset, page-continuous and global pair framing. The scalar search includes both roots, every phase of each actual scalar period (140 for trace/coordinates, 14 for norm), both directions, both signs, and continuous/page-reset clocks.

**Total: 13,664 configurations** (6,720 pairwise and 6,944 scalar). No language-fitted phase or arbitrary key is introduced.

## Results on original p33–39

| Measure | Result |
|---|---:|
| Original chapter runes | 1,680 |
| Original chapter pairs | 840 |
| Original IoC | 0.03436002 |
| Best pairwise additive/multiplicative IoC | 0.03526476 |
| Best scalar trace/norm/coordinate IoC | 0.03505701 |
| Best phase-zero pairwise IoC | 0.03482231 |
| Known solved-p57 plaintext reference IoC | 0.06270997 |

The best pairwise output begins:

> C E D OE B J P W R TH T J IA N J AE A A S O E OE OE B I C NG O L EO X TH U NG E S N R N M F E Y EO G U T S A OE AE I EA D L IA IA U D NG C S OE EO N J AE A A N OE J J H A AE J E NG B H X P I A B AE AE W EO M TH B NG M NG G OE S Y

The best scalar output begins:

> TH B O L L C I O A H Y N B G A G E B Y R T AE W G IA Y U IA E W I C R EA T Y E B W M G TH O T T U Y T AE EO TH IA M IA L L L I TH B

Neither is coherent GP29 plaintext. The best scores remain close to the uniform 29-symbol baseline and far below the solved-p57 control. The exact source-derived period alignment therefore does not select a direct additive, multiplicative, trace, norm or coordinate decoder.

## Decision

Reject these direct field-stream consumers of the p27-selected p50 cell pair. Do not continue phase, sign, direction or framing tuning for this same element and these operations.

Preserve the p55-footer → p27 → word-sum-103 → p50-cell-103/104 sequence as a possible navigation clue, with its postselection caveat. It may point to a location without specifying how to consume the following ciphertext. No unknown plaintext or key was recovered.

## Reproduction

Run:

    node sims/lp2_p27_103_p50_cell_pair_order140_sft.cjs

The script reads the canonical LP2 corpus and p50 grid, verifies the selected cell values and the exact field-element order, exhausts the finite pairwise and scalar families, and prints the best candidate outputs.
