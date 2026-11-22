# The 2013 omitted-prime endpoint as an original p50 row checksum

**16 November 2026, Agent30. Status: a new conditional cross-artifact numerical correspondence and a bounded negative original p55 cipher trial.** No recovered unknown-page plaintext, historical key, decoding rule, or final destination.

## A human-visible selector and its strongest objection

The first-hand January 2013 PRIMES response preserved as [participant paste](https://pastebin.com/raw/xGY4pbHV) lists 71, skips the 180 successive ordinary primes 73–1223, and resumes at **1229**. The contemporary response is a participant copy, not a surviving signed server output. The original 2013 prime_echo ISO program, a separate interface, prints the full sequence from 2 through 3301 and independently fixes the missing range by standard prime enumeration. These earlier source limitations and the prior **180 omitted primes ↔ 30×6 p50 interior** count correspondence are recorded in [the historical source study](2013-first-onion-primes-xGY4pbHV-original-source.md) and [the earlier source-directed table experiment](lp2-2013-telnet-180-gap-p50-inner180-source-route.md).

A different, smaller original-table observation is available without a cipher guess: under the established *provisional* base60 reading of the original 32×8 p49–51 numerical rectangle, the **30th printed row** has eight byte values

[106, 234, 196, 121, 238, 32, 129, 173]

from the original tokens

1k 3s 3G 21 3w 0W 29 2r.

Their ordinary integer sum is **1229**, exactly the first listed 2013 prime after the documented 180-prime omission. It is the **only one of the 32 printed rows** whose eight decoded bytes sum to 1229. Under the competing literal **radix59** digit alphabet, obtained by omitting the unused lowercase f, the same source row decodes to [104,230,193,119,234,32,127,170], summing to **1209** instead. Thus the equality depends on base60 and is a conditional radix discriminator, rather than an interpretation-independent feature of the raw glyphs.

The p50 table's *interior* happens to have **30 rows of six values**, explaining why a reader attracted to the 2013 180-prime gap might look for the number 30. But the matching full-width row is row 30 of 32, **interior row 29 of 30**; it is not the interior's terminal row. No Cicada-signed instruction says to sum rows, select the thirtieth, connect 2013's telnet service to the 2014 table, or interpret the row as a cipher key. The source-specific target 1229 precedes the current numeric observation historically, but the choice of row and operator was made **after inspecting the row sums**.

## How unusual is the printed match?

Freeze the original 256 decoded bytes, independently uniformly shuffle their positions (xorshift32 seed 0x20131229), partition each shuffle into the **same 32 rows of eight**, and count exact row sums of 1229 across **20,000** control tables.

| Source-conditioned event | Controls matching | Plus-one empirical fraction |
| --- | ---: | ---: |
| Row index 29 alone has sum 1229 | 35/20,000 | **0.001800** |
| At least one of 32 rows has sum 1229 | 791/20,000 | **0.039598** |

**Use the any-row fraction to interpret this discovered alignment.** The low fixed-row fraction does not represent a preregistered test, because the thirtieth row was identified after inspecting the source. The null preserves all 256 byte values but randomizes their spatial assignment; it does not model all choices of historical target, radix, row/column totals, arithmetic transform or page. The 1229 match is a source-constrained observation, **insufficient evidence of deliberate key placement**.

## A direct original p55 receiver fails

The tempting fixed operation would take the selected row's eight decoded bytes, reduce modulo29, and repeat them over the **76 original p55 GP29 runes** as an eight-symbol additive key. This uses a previously demonstrated GP29 addition/subtraction operation and the p50 table's explicit eight columns. It imposes no guessed phase, alternate order, word editing or fitted symbol permutation.

- Frozen eight-symbol GP key: **[19, 2, 22, 5, 6, 3, 13, 28]**.
- Original 76-rune p55 GP29 index of coincidence: **0.03789474**.
- Direct decryption P(i)=(C(i)-K(i mod8)) mod29: IoC **0.02807018**, opening TH D Y C U EO R S F P M U B EA EO U.
- Opposite direction P(i)=(C(i)+K(i mod8)) mod29: IoC **0.03894737**, opening J IA EO S P E U P N B C J F C N EA.

Neither output is a coherent original-page plaintext or a recognizable directive. For both signs, the code reencrypts **76/76 original ciphertext symbols** exactly and recovers an independently constructed **76-rune p57 native-GP plant** exactly. Those checks ensure the operation is reversible; they do not select it as historically intended. The source-selected row is insufficient to identify the cipher.

## Decision

Keep the exact 1229 row sum as a **provisional historical/table clue**, with the postselection limitation attached. **Reject the direct period-eight GP29 additive receiver on original p55.** A next step would require an independently first-party instruction selecting row sums, a row address, or a different reversible consumer, or a genuinely discriminating held-out plaintext recovery. Avoid amplifying this one matching number into multiple speculative key sweeps.

The source-input, radix59 rival, complete original p55 inverse, source-native plant and source-byte-preserving 20,000-shuffle control are reproduced by [the standalone CJS SFT](../sims/lp2_p50_1229_2013_primegap_rowkey_sft.cjs), using resources/liber-primus/base60-grid.json and resources/liber-primus/lp2-corpus.json. It does not alter the authoritative finding that all 56 unknown pages remain unsolved.
