# The floral 13/31 ornaments cannot by themselves allocate the 32 original numeric rows

**Agent23 · 22 November 2026 · Director #2241. Intermediate, key-independent row-addressing result. No recovered plaintext, authenticated key, cipher, or destination.**

## Source-visible input and the actual proposed operation

Original physical p40–55 are sixteen consecutively flower-framed pages. Each has the same **five-dot pattern on each side**. Earlier original-image work established the original-source, top-first circular binary reading **left 01101₂=13** and **right 11111₂=31**. Those pixels are page-static; this work does not rediscover or verify them. Read [the original 13/31 source study](lp2-floral-13-31-original-direct-row-and-walk-gate.md) and [the exact raster/DCT identity](lp2-floral16-source-border-pixel-identity.md).

Independently, the authentic p49–51 table holds **32 printed rows of eight base-60-number bytes**, giving 256 values. A natural candidate tries to turn each floral page's *left/right* decorations into two *distinct* eight-byte table rows, assigning every printed table row exactly once across sixteen pages. This would yield sixteen 16-byte records, possibly cryptographic keys, but the manuscript never calls them keys or supplies an opcode.

To avoid tuning a key against unknown prose, test the following **generous key-independent addressing family** first. Given the two original 5-bit readings `a,b` and unknown stride parameters `s,t∈{0,…,31}`, assign original physical page `p40+i` these table rows:

`L_i=(a+s·i) mod32;  R_i=(b+t·i) mod32;  i=0,…,15`.

Grant the unknown left and right stride independently. Ask only whether these 32 referenced row indices cover **every printed row once**. All 1024 ordered stride pairs are tested exactly; each page has two complete eight-byte rows, so no rune, table cell or cryptographic key is fitted. Equivalent one-based addressing subtracts one from both seeds, retaining the same pair spacing.

## Exact original result

| Left 5-bit reading | Right 5-bit reading | Independent stride pairs with exactly-once coverage of 32 rows |
| --- | --- | ---: |
| **13**, established top-first pattern | **31**, original all-filled pattern | **0 / 1,024** |
| 11, other permissible cyclic start/direction | 31 | **0 / 1,024** |
| 21, other permissible cyclic start/direction | 31 | **0 / 1,024** |
| 22, shifted bit-start convention | 31 | **65 / 1,024** |
| 26, shifted bit-start convention | 31 | **65 / 1,024** |

The five possible left values **{11,13,21,22,26}** are the distinct readings produced by all five cyclic start positions and both traversal orientations of the already established original mark sequence `01101`; the original right `11111` always reads31. The table's original 256 byte values are checked by SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The exact original `13,31` reading fails **even with independent secretly chosen strides**; the one-based `12,30` variant also fails.

**The precise fork:** For either alternative *even* left reading, 64 of the 65 legal slope pairs are `s≡t≡2 (mod4)`, and the sole other is a nonlinear-looking affine-step pair. The simple common choice `s=t=2` covers all rows for both starts. For `a=22`, the ordered row pairs begin **[22,31], [24,1], [26,3]** and end **[20,29]**; for `a=26`, they begin **[26,31], [28,1], [30,3]** and end **[24,29]**. Both use each of the 256 original printed byte cells exactly once, with sixteen concrete 16-byte records. Their p40 first-record bytes are respectively `eb83a6af9028a751719eace6b424bd50` and `39af063d4696fb54719eace6b424bd50`. The `s=2` example is a **syntactically complete row allocation**, not a decrypted key.

The possibility that one can rescue a complete table row cover by changing the **unselected dot-reading origin** is exactly the weakness: neither the source art nor the first-party Cicada operation specifies that changed origin, both even readings survive, and many independently chosen strides survive. Also, **p50 is one of the sixteen illustrated pages and contains no runic ciphertext**, so a per-page-key narrative must specify how its allocated record is consumed. We have deliberately not chosen a block cipher, nonce, binary text transport or value reduction after observing this ambiguity. The alternative of a table simply printed as numerical data remains alive.

## Decision and limits

For the **source-established 13/31 reading**, the specific *full-32-row, two-row-per-page, constant-stride* key schedule is **mathematically impossible**, independent of any proposed cipher family, plaintext language, or secret key. An adapted read-origin model can cover the 32 rows but remains **underdetermined** by the image: at least two equally valid left origins and 65 distinct stride pairs in each. A future positive step would need a *new first-party instruction that selects the left bit origin, progression/row order, cipher/key/IV roles, and a full-rune reversible receiver* before testing unknown LP2, with an explicit policy for the rune-free p50 record. This gate does not exclude a completely different, nonaffine row permutation or other functions of the image.

The exact [read-only Node22 SFT](../sims/lp2_floral13_31_fullrow_affine_coverage_sft.cjs) asserts the canonical original bytes/digest, all ten geometric read directions, all 1024 stride choices per distinct reading, and positive 256-cell coverage for the two conditional `+2` walks. It uses **no ciphertext scorer**, so none of the 0/65 decisions could have been tuned to guessed English. Prior direct 13/31-row AES/TEA/GP29 experiments [have already failed](lp2-floral-13-31-aes128-original-table-receiver.md); do not rerun them or interpret this row-allocation result as a new key.
