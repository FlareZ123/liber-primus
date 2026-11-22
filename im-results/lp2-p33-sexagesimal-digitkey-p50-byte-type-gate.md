# P33 cuneiform numeral digits as a candidate p49–51 digit cipher: exact original byte-type obstruction

**Agent 10, 22 November 2026. Status: bounded original-data negative with complete invertible positive; no unknown plaintext.**

## What a reader sees and what it does not prove

The original physical p33–39 cuneiform header represents sexagesimal two-place integers **(17,13)₆₀=1,033** and **(55,1)₆₀=3,301**. The historically normal left-to-right Babylonian convention and all four digit identities are documented in [the primary original/period-source audit](issue344-cuneiform-historical-template-gate.md). The two integers are the sums of the authenticated historical 2014 magic squares. The actual 256-cell numeral table spans **physical p49–51, source scans 66–68.jpg**, in 32 rows and eight columns; its printed two-character alphabet is provisionally interpreted as the 60 digits `0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx`. All 256 source cells under that *conventional working interpretation* are bytes in 0–255.

The source provides **no authenticated instruction** that the p33 cuneiform should be used as a key for that table, how to map the decimal/sexagesimal numeral systems to runes, or which cipher operation to use. An earlier source-priority issue [#440](https://github.com/FlareZ123/liber-primus/issues/440) already established the missing direct p33→p50 link. Accordingly, this work freezes exactly one finite, 2013-era plausible *typed operation* without promoting that speculative handoff into a fact.

## One executable direct-digit use and precise failure

Read the cuneiform as **four literal base60 digit values [17,13,55,1]**. Those indices spell **`HDt1`** in the full printed table's conventional sixty-character alphabet. The standard historical Vigenère add/subtract operation in that same alphabet provides two direction alternatives, repeated over all **512 characters** of the physical table in reading order, beginning with its first printed cell. For digit position i, the two inverse candidates are `(printed_digit ± key[i mod 4]) mod 60`. Preserve token pairs and require each new pair to remain a byte (0–255); that type requirement is essential to claim one decoded 256-byte table.

The printed high digits of every original token are 0–4. With the source's alternating high-digit key **17,55**, the minus-reading high digits become only 5–9 or 43–47, and the plus-reading high digits only 17–21 or 55–59. All are strictly greater than four. Consequently **both candidate decoders produce 0/256 byte-valid cells**, independently of the source low digits.

| Source rule | Valid decoded bytes | Smallest two-digit interpreted value | Largest value | First four interpreted values |
| --- | ---: | ---: | ---: | --- |
| Original conventional table | 256/256 | 0 | 255 | 203, 231, 167, 186 |
| Subtract repeated [17,13,55,1] | **0/256** | 303 | 2,878 | 2,770, 530, 2,734, 485 |
| Add repeated [17,13,55,1] | **0/256** | 1,020 | 3,556 | 1,236, 3,532, 1,140, 3,487 |

The exact first original values above depend only on the canonical source table. In the script, the **original 95 solved p57 GP29 runes** are converted to 256 repeated 0–28-byte values, encoded as the same two-digit base60 transport, encrypted under the same source [17,13,55,1] digit key and decrypted exactly. This tests the actual inverse and byte-typing direction, rather than asserting an opaque transform must be wrong just because the original plaintext is unknown.

**Limit:** This is an exact rejection of a **single specifically frozen repeated-digit base60 Vigenère-style cuneiform-key consumer** if the 256-cell target is byte-serialized. It does not exclude another role for the cuneiform, a different non-byte intermediate representation, or any cryptographic consumer with an independently specified different operation. The original cuneiform spells two established square sums; there is still no source selecting the table's 60-symbol alphabet, key application, serialization, inverse or recipient. Do not launch an unconstrained key/direction scan to rescue it.

**Reproduce:** [Node.js22 CommonJS exact original-table test](../sims/lp2_p33_sexagesimal_digits_p50_key_original_type_sft.cjs) and [manual Windows CI run 45014307093](https://github.com/FlareZ123/liber-primus/actions/runs/45014307093). Inputs: `resources/liber-primus/base60-grid.json`, original p33 50.jpg and solved p57 reference `resources/liber-primus/lp2-corpus.json`.
