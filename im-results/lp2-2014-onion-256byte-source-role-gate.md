# 2014 third-onion 256-byte status: a timed page artifact, with a separate 1033→magic-square handoff

**Decision for Director #846 (14 November 2026):** No contemporaneous author-selected operation connects the January 2014 **third-onion 256-byte hex string** with the **May 2014 LP2 256-cell numeral table**. The directly observable cross-stage route at that point of the 2014 puzzle follows an *independently recovered five-by-five magic square*, a JPEG/OOB side-channel and later runic text. The preliminary and final 512-character hex strings are preserved without a historical decode. Retire this byte-count-based LP2 pairing unless an independent authored key/operand/clock instruction is discovered. This does **not** prove the 2014 bytes are random or meaningless.

## Exact contemporaneous reconstruction

The 2014 chain had **two separate 512-hex-character objects**, on distinct onion services; neither should be conflated with the much later 256-entry LP2 table.

| Historical screen | Authored-looking HTML marker | Preserved archived operand | 256-byte status |
| --- | --- | --- | --- |
| Second onion `cu343l33nqaekrnw.onion` | `<!--Patience is a virtue-->`, later `<!--761-->` | [`2014/003-second-onion/512.txt`](https://github.com/neuroretransmit/cicada/blob/main/2014/003-second-onion/512.txt), blob `5c35904f6ee36d3848b3a00ae857d3093bc80f8f` | 512 hex chars; begins `634292ba`; source explicitly says its later role is unknown |
| Third onion `fv7lyucmeozzd5j4.onion` | `<!--1033-->`, later `<!--3301-->` | [`2014/005-third-onion/512.hex`](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/512.hex), blob `946b0820d4669d307c4f9c5b7ae8b081c680ef20` | 512 hex chars; begins `87de5b7f`; source explicitly calls it a "loose end" |

Both archival files normalize to exactly 512 hex characters / 256 bytes. Their **aligned bytes match at only two of 256 positions**, and they differ already in their first byte. An Uncovering Cicada retrospective says the third-onion string “matched the growing string from the previous onion”: this must **not** be cited as byte identity. At most it may describe the same incremental-release format. Exact archived bytes decisively refute literal equality.

The historical sequence in [second-onion README](https://github.com/neuroretransmit/cicada/blob/main/2014/003-second-onion/README.md) and [third-onion README](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/README.md) is source-specific: each short hexadecimal object grew by one byte per update; the second was replaced by a **much longer**, bit-inverted JPEG carrier; the third was replaced by a separate long binary/JPEG-bearing page and server-status data. The creator-authenticated status of the reconstructed server captures is unproven: these are participant archival witnesses and contemporaneous retrospective descriptions, **not signed author-specified decryption algorithms**.

## Positive handoff demonstrated in the 2014 material

The original third-onion marker **1033** has a concrete independently readable in-stage referent: source-page images and an **out-of-bounds comparison of a forward JPEG and a reversed JPEG** encode this 5×5 square, also repeated as words in the rune-bearing manuscript page:

```text
272 138 341 131 151
366 199 130 320  18
226 245  91 245 226
 18 320 130 199 366
151 131 341 138 272
```

**Every row, every column, and both diagonals sum to 1033** (direct calculation). The word-square version includes **MOBIUS**. The source-visible marker and the recovered square therefore form a positive author-plausible `1033 → 5×5 square` cross-modal handoff. It was extracted from images and OOB ASCII, **not** from applying the 512-character status string to the later LP2 table.

The [archive's original-stage decoder](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/decode.sh) documents the actual reversible binary steps used in the 2014 page chain: hex→bytes; reverse the appended JPEG bytes; compare mirrored images; extract the appended difference data; decode runes/Vigenère in the next stage. The resulting `03.jpg`/ `04.jpg` texts and `05.jpg` wisdom/magic-square images are stage-relevant positive outputs. The stage evidence does **not** state to XOR, add, permute, or hash the 256-byte status string with another 256-byte table.

[Contemporaneous-community retrospective](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_(2014)) records the staged capture and magic-square OOB extraction. It separately records that two image files emerged on 11 January and led to a **`WELCOME`** runic Vigenère stage. This places the 256-byte status string within a **time-gated publication and clue-assembly process**, with independent downstream files.

## LP2 transfer gate and bounded tests already performed

The LP2 pp49–51 array has **256 two-character printed numerals**. Its only publicly derived 256-byte file, `sexagesimal.bin`, was converted from participant transcriptions, **not distributed by the creator as a byte key** ([upstream audit](cicada2014-sexagesimal-upstream-transcription.md)). It appeared with the May LP2 release several months after the January third-onion stages. Equal cardinalities give no operation, endpoint, start position, bit order, or printed-source instruction.

A preceding [exact original comparison](../communications/broadcast/20261114T070300Z_agent8_2014-third-onion-p50-negative.md) found that the third-onion status bytes and the source-derived table bytes align at **1/256 positions**. Exactly two historically documented byte operations, direct XOR and reversal followed by XOR, produced 105/256 printable bytes apiece and no text/signature. Those are narrow arithmetic negatives. They do not exhaust hidden roles for the status string.

**Decision:** the original third-onion stage itself exhibits a successful `1033→magic square` marker relationship, but no first-party instruction consumes its 256-byte waiting-state string. This closes the **specific equal-length bridge** in #846 as *unsupported*. A new source-first instruction selecting that exact 2014 byte stream, target, serialization and operation would be required to reopen it. No novel LP2 plaintext or original key was recovered.

**Original-source paths:** [second-onion 512](https://github.com/neuroretransmit/cicada/blob/main/2014/003-second-onion/512.txt) · [third-onion 512](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/512.hex) · [third-onion decoder](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/decode.sh) · [third-onion README](https://github.com/neuroretransmit/cicada/blob/main/2014/005-third-onion/README.md) · [p50 provenance](cicada2014-sexagesimal-upstream-transcription.md).
