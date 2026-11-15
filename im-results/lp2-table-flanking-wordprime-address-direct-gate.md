# Keyless word-prime addresses on the complete sentences flanking LP2's numeric table

**Agent 10, 15 November 2026. Bounded original-input negative, no unknown plaintext.** This closes one direct, source-constrained attempt to read the 256-cell table as text, with neither a guessed key nor a downstream additive cipher. It does not establish the original table's intended function.

## Independent input and decisive question

The original LP2 p49–51 numeral table prints exactly 256 two-character tokens, provisionally read as bytes in row-major order. An independently signed **2016** Cicada clue says the words of *Liber Primus* are the map and their numbers are the direction. GP prime weights are an established component of the rune alphabet. A concrete later-clue interpretation is that an original rune word's **sum of GP prime weights** is a byte-table address, and the looked-up byte is the literal message character.

The relevant original sentences are the **complete** punctuation-bounded text on both sides of the table, respecting the words carried over p48→49 and p51→52:

| Original flanking sentence | GP29 runes | Printed words |
| --- | ---: | ---: |
| Before the table (p48–49) | 138 | 33 |
| After the table (p51–52) | 170 | 40 |

A human could try either a zero-based table offset `sum mod 256` or the one-based convention `(sum−1) mod 256`. Both are declared before reading any result. No other phase, byte encoding, source word tape, transposition, or cipher variant is fitted. This particular direct-word-byte consumer was not the earlier LP1 p05 11-cell arithmetic key or the p32 22-word repeating-GP29-key test.

## Full unedited original readouts

The two legitimate address origins produce four byte sequences:

| Source sentence | Address | Printable ASCII bytes | Longest contiguous ASCII letters/spaces | First 16 bytes (hex) |
| --- | --- | ---: | ---: | --- |
| 138 pretable runes | Zero-based | 11 / 33 | 2 | `9eaf9b8d81cda32e21348fb8c4949bed` |
| 170 posttable runes | Zero-based | 15 / 40 | 2 | `3a3359500448c0732f9666c1af0d56c6` |
| 138 pretable runes | One-based | 17 / 33 | 2 | `713900a90a4f14f5e74449236adb0061` |
| 170 posttable runes | One-based | 12 / 40 | 1 | `8e7c9fbdf78dc620104621c9a6e93bdc` |

Every complete 33- or 40-byte output is preserved as an exact hexadecimal regression in the linked source test, which also prints a readable ASCII preview. None contains a coherent sentence, authenticated page instruction, address, URL or long literal text field. The relatively high 17/33 printable count for one pretable reading is insufficient: its text characters are isolated among binary values, with at most two consecutive letters/spaces. The original byte table itself has high-entropy appearance; short incidental printability cannot select this map.

## Test contract, interpretation and next decision

The [single runnable CommonJS source test](../sims/lp2_table_flanking_wordprime_address_sft.cjs) reads the canonical transcript, GP prime table and unmodified 256 source bytes, asserts the original table SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`, checks both full-sentence lengths and word counts, and freezes all four complete hexadecimal outputs. Constructive controls overwrite **only a separate copy** of each directly addressed cell with ASCII `A` and recover every intended `A` from both original address lists; the real source is never altered.

This rejects a **literal table-byte message** under these two complete-word prime-sum address conventions. It does not reject using the selected bytes as a key for a different, independently instructed operator. The missing input remains an authenticated table-to-plaintext consumer, an original pre-encryption text, or an author-selected key or address scheme. Neither the source's 256-byte table nor either genuine flanking sentence yields such an instruction here.

**Reproduce:** `node sims/lp2_table_flanking_wordprime_address_sft.cjs` from repository root on Windows/Node22, no external dependencies.
