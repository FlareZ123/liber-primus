# LP2 p55: outer 76-cell table ring under p15 prime-index and solved-p56 totient

**Agent 44, 13 November 2026. Status: a new, bounded original-cipher negative. No decrypted unknown rune, authentic p55 key, or continuation.**

## Why this specific composition merits one test

Three separately visible original clues supply independent pieces of a prospective, executable operation:

- Physical LP2 pp49–51 print a 32×8 table containing 256 two-character numerical tokens. The published conventional-base60 interpretation makes each token an integer byte 0..255. Its **outermost clockwise circumference contains exactly 76 cells**, the exact original length of physical p55's ciphertext.
- The original p15 red-seeded Fibonacci spiral was independently decoded as `|3301-prime(f_n+1)|`. Thus **one-based prime indexing** is genuinely used in the original mathematical manuscript, although p15 does not instruct its use on the later numeric table.
- The authentic solved p56 cipher uses Euler totients of consecutive primes as a GP29 additive pad; solved p57 explicitly says to **shed circumferences**. The earliest complete p55-targeted reading is therefore to combine the numeral table's **outer perimeter**, p15's **prime-of-index** and p56's **totient** into one 76-position key.

This cross-page transfer is an **exploratory, analyst-proposed composition**: the manuscript supplies the individual operations and geometry, but no authenticated instruction directly says to apply their composition to p55. Its merit is a fully specified, reversible, source-derived experiment with *zero fitted offsets or alphabets*, not an asserted solve path.

## Exact frozen original-input inverse

Keep all original p55 **76 GP29 ciphertext symbols**, including its first rune continuing a word from p54. Traverse the perimeter of the 32×8 table **clockwise from its upper-left cell**: eight cells along the top, 31 cells down the right edge, seven along the bottom toward the left, then 30 up the left edge, totaling **76 distinct cells**. Let `b_i` be the source-printed base60 byte at perimeter position `i`, using the original published numerical order.

The key is

`K_i = phi(prime_(b_i+1)) mod29 = (prime_(b_i+1)-1) mod29`,

with **one-based** prime indexing, p1=2; the maximum `b_i=255` accesses the 256th prime 1619. The first twelve key indices are **1, 8, 10, 14, 27, 13, 12, 23, 26, 21, 2, 12**. Attempt the two predetermined arithmetic directions `P_i=(C_i-K_i) mod29` and `P_i=(C_i+K_i) mod29`. Both maps are exactly invertible; no reconstructed plaintext-F exception or unknown clock is added.

| Reading on 76 untouched original runes | GP29 index of coincidence | Original GP beginning (space-delimited rune labels, not plaintext words) |
| --- | ---: | --- |
| Original p55 ciphertext | **0.037894736842** | source unchanged |
| Prime-indexed-totient subtraction | **0.029473684211** | `L B N AE N TH C L OE D I D EO M M J O IA EO O EA W P EO ...` |
| Prime-indexed-totient addition | **0.037192982456** | `OE R F A C EA F H T W X E C X TH E OE NG OE W O W A OE ...` |
| Genuine solved p57 first 76-runic plain reference | **0.059649122807** | original clear GP text |

Neither original candidate yields readable GP-native English or the clear-text frequency characteristic of the length-matched solved reference. Both arithmetic signs re-encrypt **76/76** original symbols exactly by construction; a separate 76-rune slice of authentic solved p57, **artificially enciphered with these same 76 key symbols**, recovers **76/76** in each direction. That positive plant validates the inverse, but does not authenticate the mechanism.

This is distinct from the earlier outer-ring **`K=1+(byte mod28)` ciphertext-feedback** screen and the direct **`byte mod29`** additive pads. Prime-of-byte followed by Euler totient is a separate source-motivated nonlinear byte-to-GP conversion.

## Decision

The most direct composed `phi(prime(byte+1))` perimeter key does **not** decrypt p55. The negative is specific to the original physical p55 ring order, one-based byte-to-prime map, unskipped 76-symbol direct GP29 arithmetic and the two signs. The independently solved p56 literal-F bypass is a distinct source rule; applying it to p55 would require a new source-selected emission clock and 76-position transport, so none is inferred here.

Do not retune the ring origin, prime-index convention, alphabet phases or F-mask to rescue this result. Source-selected plaintext recovery remains unresolved.

[Exact standalone CommonJS SFT](../sims/lp2_outer76_primeindexed_totient_sft.cjs) reads unchanged `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`, asserts all original lengths and values, and prints both full 76-symbol readouts.
