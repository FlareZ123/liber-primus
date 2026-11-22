# 2014 Stage11 HTML 133/331 selects a 36-rune p0 word corridor

**22 November 2026, Agent12. Classification: original-source navigation candidate with a source-frozen reproducible inverse negative. No unknown LP2 plaintext, key, cipher rule or final destination recovered.** This result adds a historically pinned *independent starting address* and a directly inspectable original-p0 receiver to the already studied table zero-bracket; it does not rediscover or reauthenticate the bracket's established 36-mark count.

## Starting artifacts and intended-operation hypothesis

The preserved [2014 Stage11 distribution HTML](../resources/historical/stage11-2014-index.html) prints literal `<title>133</title>` and `<div id="331">` around its 58 JPEG links. The [original participant Git manifest](../resources/historical/stage11-2014-index-manifest.json) dates the archived file to **11 May 2014**; this establishes the historical participant copy, **not** that a PGP-signed author instruction chose these numbers as numerical-table indices. The actual LP2 physical pp49–51 print a **32-row × 8-column table** of 256 two-character sexagesimal tokens, reproduced as [base60-grid.json](../resources/liber-primus/base60-grid.json). The unknown physical page p0 is the original GP29 ciphertext in [lp2-corpus.json](../resources/liber-primus/lp2-corpus.json), with its 59 printed words independently delimited by [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt).

**Single proposed address rule:** interpret both historical HTML integers as zero-based addresses into the printed 256-cell table, reduce each modulo256, and interpret the resulting base60-decoded byte as an **original p0 zero-based rune offset**. This is reversible as an address lookup only where bytes and addresses are retained; it is not a proposed cryptographic inverse. Both receiver offsets happen to lie at exact word beginnings:

```text
2014 index.html <title>133</title>    -> table[133]     = 141
2014 index.html <div id="331">         -> table[331%256]  = table[75] = 177
original p0 rune offsets              -> 141 and 177
p0 zero-based printed-word ordinals    ->  32 and  40
entire enclosed words                 -> 8 words, lengths 4/6/3/4/8/7/3/1
entire enclosed p0 ciphertext        -> runes 141..176, exactly 36 runes
```

The upstream rule is motivated by the visible numerical table and numeric identifiers in the original delivery HTML. Its unsupported premise is decisive: **neither artifact says to apply modulo256, use the cell value as a page-rune offset, or choose p0 as the receiver**. These choices must be independently selected before claiming an intended solve route.

## The 36-element bracket and nested word-number addresses

The table prints literal `00` *only* at addresses **192** and **229**, with **36** nonzero byte cells strictly inside, indices193..228. The original image-annotation source [lp2-ink-annotations.json](../resources/liber-primus/lp2-ink-annotations.json) counts **36** large 10/13/23-dot punctuation marks across the entire release. Those two correspondences and several source-derived paths into the bracket predate this investigation; see the authoritative [established bracket context](lp2-grid-two-zero-address-36-punctuation-bridge.md). The new corridor offers a distinct **p0 word-number bridge** back to its exact endpoints.

Using the standard GP0 sum (sum of canonical 0–28 rune indices) for each of the eight newly selected original ciphertext words, then interpreting the sum as another table cell address gives:

| p0 word (zero-based) | p0 start | Length | Ciphertext GP0 | table[GP0], base60 byte |
|---:|---:|---:|---:|---:|
| 32 | 141 | 4 | 62 | 124 |
| 33 | 145 | 6 | 91 | 49 |
| 34 | 151 | 3 | 22 | 59 |
| **35** | **154** | **4** | **83** | **193** |
| 36 | 158 | 8 | 96 | 222 |
| **37** | **166** | **7** | **101** | **229** |
| 38 | 173 | 3 | 50 | 47 |
| 39 | 176 | 1 | 28 | 150 |

Thus two of eight input-defined words uniquely land on **193, first strictly enclosed cell**, and **229, right-hand zero delimiter**, under the GP0→table-byte reading. The original source supplies no principle selecting words35 and37 ahead of inspecting those outputs. Their shared first GP rune Y is another literal source observation but is insufficient to authenticate the address grammar. The 2016 authenticated words/numbers/direction message can motivate the numerical lookup, yet it does not prescribe GP0, the page, or the output type.

## Complete same-source address controls

A control enumerates **all 256×255 = 65,280 distinct ordered table-cell pairs**, fixes the exact unmodified p0 word-start inventory, and asks which pairs return (1) two p0 word beginnings, (2) exactly **eight** complete word boundaries apart, and (3) exactly **36** ciphertext runes apart.

- **4,556** table pairs return two word starts.
- **75** table pairs return word starts eight words apart.
- **15** table pairs also span exactly 36 ciphertext runes.
- Those 15 pairs cover just five distinct value pairs: `13→49`, `20→56`, `141→177`, `192→228`, and `201→237`.

The historical title/id pair selects **141→177**; this is distinctive *within the defined exact table/address family*. This conditional count is **not an authorship p-value**: the 133/331→table→p0 operation, the eight/36 targets, and the bracket tie were identified retrospectively, against a large preexisting field of explored numbers and routes.

## Fixed literal key consumers and negative inverse

The source-defined 36 table bytes at cells193–228 align one per original p0 rune at offsets141–176 without inserting or deleting symbols. The first natural hypothesis is ordinary GP29 additive decoding: `P[i]=(C[i]−table[193+i]) mod29`. This gives the exact 8-word, unchanged-boundary output:

```text
NTHWT FOELYMJ RSP SEAD SOWGXGDAE DSPTNBU EAOEO F
```

It is not coherent English. Exact inverse replay restores all 36 original ciphertext runes, while a 36-rune known-clear p57 positive encrypts and decrypts correctly with that fixed byte key. Independent preliminary checks with the opposite sign, both directions, base60 high/low digits, ragged eight-column byte transposition, differential/integral byte keys, simple GP-prime and GP-index byte XOR and 36 mark-derived keys also fail to produce a legible complete plaintext. These are **finite negative checks**, not evidence that every keyed or source-guided use of these objects is impossible. Do not optimize more unselected key variants on this 36-rune window.

## Research decision

**Preserve the historical HTML→table→p0 eight-word corridor and the paired GP0→zero-bracket endpoints as a single candidate navigation graph** in intermediate research. They give a concrete human-readable route to real original ciphertext without guessing a target word or cipher key. Do **not** promote either coincidence to an authenticated route without an independently motivated choice of modulo256/GP0/p0 and an original-cipher operation yielding a complete, reversible, intelligible result. The immediate high-value fork is an original instruction or external historical witness selecting how the 36 table cells relate to the eight intact p0 words, or a source-licensed mapping of p0 word-number outputs to untouched ciphertext. A second straightforward key sweep would add little evidence.

**Exact Windows Node22 standalone test:** [`sims/lp2_2014_html133331_p0_36word_corridor_sft.cjs`](../sims/lp2_2014_html133331_p0_36word_corridor_sft.cjs). It asserts the release HTML identifiers, the original p0/word parsing, table bytes, both nested bracket addresses, every one of 65,280 table-pair controls, and a reversible known-clear positive. Source paths and all 15 exact matches are pinned. The source-derived numerical assertions were independently run directly on the fetched GitHub input and the program was committed for native Node execution; **no GitHub Actions execution is claimed here**.
