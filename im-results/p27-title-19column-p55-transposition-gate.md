# p27 19-rune title as a 19-column key for p55: bounded negative

**Classification:** source-motivated transposition test. The p27 red title has exactly 19 runes and p55 has 76 = 4×19 runes, so a 19-column columnar transposition is a natural, finite hypothesis. Neither standard readout direction yields plaintext. No unknown LP2 plaintext or key is recovered.

## Source-fixed inputs

- The original p27 red title is a 19-rune span at page-local offset 0. Its transliteration is \`MPYLSOAAEHLEEOIMLLSCP\` (21 Latin characters because some rune transliterations are digraphs).
- The original p55 page contains 76 runes, exactly four rows of 19.
- The key values are the 19 title runes' GP prime weights:
  \`[71,43,103,73,53,7,97,101,23,73,67,41,31,71,73,73,53,13,43]\`.
  Sorting by prime weight and sorting by rune ordinal induce the same order because GP prime weights increase with rune ordinal. Ties are broken by original title position.

This is a plausible human solve-path hypothesis: a visible 19-rune title supplies a 19-column key for a 4×19 target. It is not an established instruction to use columnar transposition.

## Frozen operations

The p55 runes were arranged row-major in a 4×19 rectangle. The title key was sorted stably ascending and descending. Both standard transposition directions were tested:

1. **Columnar decryption:** fill columns in key order from the ciphertext stream, then read rows.
2. **Inverse readout:** write the ciphertext row-major, then read columns in key order.

No alternate width, phase, padding, word-boundary movement, or key fitting was used.

## Results

The four 76-rune outputs (shown in transliteration) are:

**Columnar decryption, ascending key**
\`\`\`
PUUEAMNGCCMXMIADEOSEHWEAFWBEUAEEAXSGSATHCEOSNGSFBREICMIDEOSDBAEEOTHTHLBXHBIGPIMJGEIACFETHOEEOXI
\`\`\`

**Columnar decryption, descending key**
\`\`\`
MEANGDPUMWCIAMSEHUEAEOCXUEAETHFBSSEAASEOSNGWFCXGCIMAEBEEOBIBDTHTHLRXEODSPGIFHIGXMCIATHOEEOBIEJE
\`\`\`

**Row-write / column-read, ascending key**
\`\`\`
SEAHTHAMEEMIEOEADPIXGCECAEUIATHBSSIWBBSIAEOSBEOUEAMNGCDEOTHHGDIRFESMEIAENGXJFLGUBFEOOEXXCCMWPTH
\`\`\`

**Row-write / column-read, descending key**
\`\`\`
MWPTHXXCCBFEOOEIRFESMEIAENGXJFLGUNGCDEOTHHGDEOUEAMWBBSIAEOSBAEUIATHBSSIGCECDPIXMIEOEAAMEESEAHTH
\`\`\`

None reads as English. As a weak comparative control, the repository's English quadgram model scores the raw p55 transliteration at −1.1923 average log-count, while the four candidates score −1.4951, −1.5245, −1.2823, and −1.6194 respectively. The model is not a perfect match for the manuscript's likely prose, so the scores are secondary; the outputs themselves show no readable plaintext.

## Decision and scope

Retire the direct p27-title-keyed 19-column columnar transposition of p55 in both standard directions and both stable key orders. The exact 19/76 dimensional match remains an observation, not evidence that this operation is intended. This does not reject other uses of the p27 title or 19-column structures.

**Reproducer:** [sims/p27_title_19column_p55_transposition_gate.cjs](../sims/p27_title_19column_p55_transposition_gate.cjs). It asserts the original title span, p55 rune count, both key orders, all four outputs, and the comparative quadgram scores.
