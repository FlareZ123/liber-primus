# P27 border-affine 179×8 state decomposition

**Evidence class:** exact source arithmetic and finite structural hypothesis. **No unknown LP2 plaintext, historical key, cipher mechanism, or destination is claimed.**

## Source-selected inputs

A separate source path, documented in [the p55 fold selector report](p55-fold-fragment18-p27-title.md), selects the red title at physical p27 and therefore the canonical `$` section beginning there. The facts used here are fixed by the original corpus and already-visible artifacts:

- selected section length: **1433 runes**;
- 1433 is prime, so **φ(1433)=1432**;
- enlarged first title rune: **M = canonical GP index 19**;
- printed numeric-table width: **8 columns**;
- five-dot border values: **13** on the left and **31** on the right;
- signed 2016 clue word **WORDS**: canonical GP-prime sum **179**;
- provisional signed-message/page-50 branch: selected byte **193**, whose one-based prime ordinal is **44**.

The last item remains conditional on the existing provisional 2016 base-58 word-address interpretation. The other arithmetic below can be reproduced from the selected p27 section plus original visible values.

## Exact multiplicative relations

Modulo the selected prime section length:

`ord_1433(19) = 1432`.

Thus the first title rune is a primitive root and its powers visit every nonzero section position.

Use the source-visible table width:

`h = 19^8 mod 1433 = 992`.

Then:

- `ord_1433(h)=179`, exactly the GP-prime sum of **WORDS**;
- `-h^{-1} mod 1433 = 13`, exactly the left border value;
- `h^44 mod 1433 = 31`, exactly the right border value;
- equivalently, `31 = 19^(8×44) mod 1433`.

The right-border exponent 44 is already selected in the provisional page-50 branch because 193 is the 44th prime. This is a consistency relation inside that branch rather than an independent authentication of it.

## Literal border affine map

Apply the visible border numbers directly:

`T(x) = 31x + 13 mod 1433`.

It has the unique fixed point **525**. Its complete cycle decomposition is:

- one cycle of length **1**;
- eight cycles of length **179**.

Hence:

`1433 = 1 + 8×179`.

After translating by the fixed point, `y=x-525`, the map becomes

`y -> 31y`.

Because `31` generates the same order-179 subgroup as `19^8`, the eight nontrivial cycles are exactly the eight cosets of that subgroup. The first title rune supplies canonical coset representatives `19^c`, `c=0..7`; in original position coordinates the canonical starts are

`525 + 19^c mod 1433 = [526,544,886,219,443,400,1016,1256]`.

This gives a parameter-free **179×8 affine state space** over every non-fixed p27-section position.

## Direct readout gates

Several immediate interpretations were tested and are negative:

- concatenate/interleave the eight 179-cycles using minimum-element starts, forward and inverse;
- concatenate/interleave the canonical translated cosets above, forward and inverse;
- place the 32×8 grid cells on the first 32 rows of the earlier multiplicative coordinate map and apply grid-byte or byte-prime-ordinal mod-29 add/subtract/Beaufort transforms.

The best canonical-coset read order has GP trigram score about **-13.8615**, versus **-13.9040** for chronological ciphertext, with the same near-uniform IoC. It is not native GP plaintext. The grid-cell transforms are likewise random-like. These gates reject a bare transposition or direct table pad.

The surviving decision is narrower: the source values specify a natural 179×8 state space, while the manuscript's numerical table has **32 rows × 8 columns**. A useful successor must explain, from source evidence, how those 32 rows select or advance within the 179 row states. Free row phases or language-selected step rules are not justified.

## 2016 word-address convergence, bounded

The frozen signed-message word-address rule supplies two additional exact observations on the selected title:

- source word **Its**, GP-prime sum 143, maps directly to physical **p27 word 2**, `LSCP`, the title's third word;
- the unique literal GP word **TWO** at p54 has GP-prime sum 85 and maps directly to **p27 word 1**, the 12-rune middle title word.

However, `TWO` is reached from the existing FOLD component only by continuing recursion past the solved p56 **END** marker. A fixed lexicon of words present in at least two of Emerson, Shakespeare, and Gibran finds only FOLD/OF/TWO among the 102 unique nodes reachable from the 16-word clue sentence, and 20,000 deterministic random-start controls give a tail probability about **0.40** for at least three such literal nodes. Therefore no hidden English pointer phrase is claimed.

## Reproduction

Run [`p27_border_affine_179x8_sft.cjs`](../sims/p27_border_affine_179x8_sft.cjs). It asserts the section length, prime/totient relation, primitive-root order, 179 relation, both border identities, affine cycle partition, canonical coset starts, WORDS prime sum, and the two exact p27 title word-address hits.
