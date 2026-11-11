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

A concrete source-motivated 32→179 mapping has now been tested: table row r corresponds to 13-dot fragment r; column c selects one of the eight affine cycles; cell byte b advances that cycle b steps from its canonical start; the p27-section rune at the resulting position becomes K[r,c]. The row's eight runes then repeat as a per-fragment key. Both natural and PATIENCE column orders, each under C−K, C+K and K−C, fail the original language test. This rejects only that exact table-byte-as-step / p27-rune repeating-key interpretation; it does not resolve every possible 32-row/179-state mapping. Free row phases or language-selected step rules remain unjustified.

## 32×8 table bytes as 179-cycle steps: bounded negative

The simplest way to connect the printed 32×8 table to the eight 179-cycles is to let table row r identify the matching 13-dot fragment, column c identify affine cycle c, and byte b=T[r,c] count forward applications of `A(x)=31x+13 mod1433` from canonical start `x_c=525+19^c`. Read the p27-section rune at `A^b(x_c)` as the key symbol `K[r,c]`. The eight selected runes form a period-eight key for fragment r. This is motivated by the signed clue's 'words/map, numbers/direction' framing, the 32-fragment/32-row match, and the eight table columns/eight cycles; it remains an interpretation, not an explicit cipher instruction. The p27 section is itself unknown ciphertext, so this is a self-keyed map, not an external plaintext key.

The source schedule is fixed: 31 thirteen-dot marker layers, 29 unique global offsets, two empty intervals and 30 nonempty fragments; the first 28 fragments contain all 12,956 unknown runes. The eight canonical cycle starts are `[526,544,886,219,443,400,1016,1256]`. The test resets the eight-symbol key at each fragment and does not search a phase, row permutation, cycle offset or alternate affine map. It tests natural table-column order and the source-motivated PATIENCE order, each with the three standard Vigenere orientations:

| Column order | Direction | Original IoC | Original GP trigram mean |
| --- | --- | ---: | ---: |
| Natural | C−K | 0.0344847 | -4.472523 |
| Natural | C+K | 0.0345031 | -4.473666 |
| Natural | K−C | 0.0344847 | -4.464071 |
| PATIENCE | C−K | 0.0344671 | -4.471688 |
| PATIENCE | C+K | 0.0345016 | -4.446553 |
| PATIENCE | K−C | 0.0344671 | -4.465332 |

Raw ciphertext is IoC **0.0344784**, GP trigram mean **-4.450153**; the best candidate (PATIENCE/C+K) improves the score by only **0.00360** nats per rune and remains far below the held-out native-GP positive control (**-2.306011**, IoC **0.0598323**). All six candidates re-encode the original exactly and recover a 12,956-rune native-GP plant exactly. Those round trips verify the implementation, not the historical key. No output is plaintext; all remain uniform-like.

**Decision:** reject this specific 32-row/fragment × 8-cycle/cell-byte-step × p27-rune × repeating-period-eight Vigenere schedule. Retain the exact 179×8 affine decomposition as a structural observation, but do not broaden this negative into arbitrary phases, row/column permutations or key transformations. A successor must supply a distinct source-selected 32→179 readout or reversible operation.

Reproducer: [`sims/p27_affine_tablebyte_fragment_key_sft.cjs`](../sims/p27_affine_tablebyte_fragment_key_sft.cjs).

## 2016 word-address convergence, bounded

The frozen signed-message word-address rule supplies two additional exact observations on the selected title:

- source word **Its**, GP-prime sum 143, maps directly to physical **p27 word 2**, `LSCP`, the title's third word;
- the unique literal GP word **TWO** at p54 has GP-prime sum 85 and maps directly to **p27 word 1**, the 12-rune middle title word.

However, `TWO` is reached from the existing FOLD component only by continuing recursion past the solved p56 **END** marker. A fixed lexicon of words present in at least two of Emerson, Shakespeare, and Gibran finds only FOLD/OF/TWO among the 102 unique nodes reachable from the 16-word clue sentence, and 20,000 deterministic random-start controls give a tail probability about **0.40** for at least three such literal nodes. Therefore no hidden English pointer phrase is claimed.

## Reproduction

Run [`p27_border_affine_179x8_sft.cjs`](../sims/p27_border_affine_179x8_sft.cjs) for the arithmetic/cycle decomposition and [`p27_affine_tablebyte_fragment_key_sft.cjs`](../sims/p27_affine_tablebyte_fragment_key_sft.cjs) for the frozen 32×8 table-byte → 179-cycle → p27-rune fragment-key test.
