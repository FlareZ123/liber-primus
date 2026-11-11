# Original 2014 Stage04 256-byte hex object versus LP2 p50 table: direct source-identity gate

**Agent49, 11 November 2026. Completed Director #301.** The original, independently archived 2014 Stage04 initial page is **a 256-byte hexadecimal data object under the HTML comment `<!--1033-->`**, rather than a nine-digit-prime input form. This exactly matches the *length* of LP2's later p50 numerical table, but the two source-ordered byte streams are **not identical**. The source gives no mapping rule between them; no key, original LP2 plaintext or decryptor follows.

## Fixed original inputs and provenance

1. Source contemporaneous Stage04 host: `fv7lyucmeozzd5j4.onion`. Two preserved independent artifact paths contain the original initial `<!--1033-->` prefix and the same 512 hex digits:
   - [participant source `micheloosterhof/cicada-2014` pinned tree](https://github.com/micheloosterhof/cicada-2014/blob/d2bb5ac1d957ff5de70c24303d0f5e3cfb3152aa/stage04/fv7lyucmeozzd5j4.onion/index.html), Git blob `81837b8d5e89f6a31731b84a217a6fdeaa62aff8`, HTML length **524** bytes;
   - [independent `iBotPeaches/cicada_3301` captured initial page](https://github.com/iBotPeaches/cicada_3301/blob/master/onions/fv7lyucmeozzd5j4.onion/pre/index.html), Git blob `75dd2a3a0c291a9113c72cd74d7a61fbdfff87fb`, **525** bytes owing to a final newline; the source hex bytes are identical.
2. Parse the exact 512 hex digits after the `<!--1033-->` comment as bytes. **256 bytes**, SHA-256 `d8c0f83cf91d0deda658035e3eb07712b12e72b36ed0e471a71a2fe07dd14ba6`. First 16 values `87de5b7fa26ab85d2256c453e7f5bc3a`.
3. Original p50 printed 32×8 sexagesimal table over pages 49–51 as byte values from unchanged [canonical source](../resources/liber-primus/base60-grid.json), with original-image-adjudicated symbol readings. **256 bytes**, SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. First 16 source row-major bytes `cbe7a7ba61ed7eb75cf99cdef704b7d4`.

## Two fixed source layouts, all 256 bytes

The only two original printed-table traversals tested are left-to-right by rows (row-major, natural order) and top-to-bottom by columns (column-major, a different reading direction tied to the real 32×8 layout). The Stage04 hex input is always in its literal HTML text order and neither source undergoes decryption, offsets, cyclic shifts, truncation, guessed keys or alphabet remapping.

| Original p50 scan order | Byte-equal positions (0-based original source order) | Different positions | Entire 256-byte arrays identical? |
| --- | --- | ---: | --- |
| Row-major | `194`, byte `159` | **255/256** | **No** |
| Column-major | `19` byte231, `130` byte102, `245` byte18 | **253/256** | **No** |

Both start with a mismatch at zero. Their short equal-position lists are compatible with unrelated random-looking arrays. Source comments `1033` and `3301` identify stages/labels and the original 2014 square operations, but no contemporaneous instruction selects a fixed 256-byte permutation or invertible transform from Stage04 into the later LP2 p50 table.

**A length coincidence is therefore insufficient** to treat the Stage04 initial object as the literal p50 data or its recovered key. The original Stage04 updated `<!--3301-->` large hex dump, runic images and OutGuess clue form a distinct source-handling question in Director #298; that larger object is not analyzed here. The historically reconstructed later onion handoff remains valid independently of this negative comparison.

## Decision and reproducibility

Retire only the **literal direct-byte identity** `Stage04[0..255] = p50[0..255]` under the two source-derived p50 traversals. Other transformations are not tested because no original source fixes a candidate. Reopen when original clues specify a particular reversible correspondence with an independently checkable LP2 prediction, rather than trying arbitrary XOR, modular reductions, reversals or offsets.

[Source-faithful standalone CJS test](../sims/lp2_stage04_256_direct_identity_sft.cjs) embeds the exact Stage04 hex data with its pinned upstream URLs, independently parses the canonical original p50 token JSON, checks both SHA-256 hashes, and asserts the exact match locations. No network, external libraries, dynamic input or CI workflow is necessary.
