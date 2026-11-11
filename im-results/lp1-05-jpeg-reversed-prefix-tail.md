# An exact reversed-prefix trailer in original LP1 archive 05.jpg

**Evidence class:** source-byte observation, confirmed against all 75 pinned repository JPEGs. It is an unselected clue hypothesis, not LP2 plaintext, a key, or a cipher.

## Original-image test

The archive's LP1 `05.jpg` (the 5×5 runic/numeric magic-square page) is 673,066 bytes. Its **last JPEG EOI marker** `FF D9` begins at zero-based byte offset **600,364**, leaving exactly **72,700 bytes after the EOI**. The entire trailing byte string is *byte-for-byte the reverse of the first 72,700 bytes of that same file*. The final four file bytes are consequently `FF E0 FF D8`, reversing the usual first four JPEG header bytes `FF D8 FF E0`. No extraction key or pattern fitting is involved.

- Full original 05.jpg SHA-256: `2db94921ae5216d8a589890495fa5432446cd3227c45fbeb4934cbb0525112f7`.
- Trailer SHA-256: `3e95593e226980e3bf743ce9d12f38cf41b96dc7797587f9ff7470788719803f`.
- The other **74** original archive JPEGs terminate exactly at their last EOI marker and have no suffix.
- The source remains an ordinary decodable 2400×3600 JPEG. Everything after EOI is ignored by normal image rendering.

A minimal complete source test is [`sims/lp1_jpeg05_reversed_tail_sft.cjs`](../sims/lp1_jpeg05_reversed_tail_sft.cjs). It reads all 75 original files from `resources/liber-primus/`, checks their JPEG SOI and final EOI, asserts the one 72,700-byte suffix and exact reversed-prefix equality, and verifies both SHA-256s. This passed over the matching files supplied in the maintainer's original JPEG ZIP.

## Source-fixed original-cipher key experiment

The hidden trailer is **72,700 actual source bytes**, enough to supply one GP29 key step per rune for all **12,956** unsolved LP2 runes, without guessing the key length. This makes one inexpensive, literal cipher test possible before dismissing the observation. Freeze the source stream from trailer byte zero, without searching phase, key offset, or segmentation. The only two source-visible directions are the physical trailer order and its reversal (the original JPEG prefix). Decode GP29 ciphertext under the simplest byte/key map, `P_i=(C_i ± (byte_i mod 29)) mod 29`, for each of the four choices.

| Source key byte order | GP29 sign | Whole-book decoded IoC | Opening p0 decoded IoC |
| --- | ---: | ---: | ---: |
| Physical trailing bytes | − | 0.034481293393 | 0.033254365184 |
| Physical trailing bytes | + | 0.034495020346 | 0.033137375333 |
| Trailer reversed to header-prefix order | − | 0.034469401468 | 0.034658243397 |
| Trailer reversed to header-prefix order | + | 0.034483199915 | 0.035389429967 |

The raw 12,956-rune unknown text scores **0.034478397865**; original native-GP English controls from the [all-key transposition gate](./pure-transposition-ioc-original-gate.md) have whole-book minimum **0.0584959050**. Every frozen variant remains at ciphertext-like frequency dispersion and gives no readable plaintext. The exact [full-manuscript source-key SFT](../sims/lp1_jpeg05_trailer_original_key_sft.cjs) also checks source bytes and a planted 95-rune historical solved-p57 implementation control.

**Decision:** neither a bytewise additive read of the JPEG suffix nor its reversed-image-prefix form directly decrypts original LP2 under this fixed GP29 interpretation. This is a finite negative, and it does not rule out a source-specified nonlinear or changing-state use of the unique file feature.

## What it establishes and what it does not

This is a **unique raw-file construction in the supplied LP1/LP2 corpus**, not a novel 72,700-byte cipher payload: its suffix adds **no independent content** because every byte is already present earlier in the same image. The coincidence with a page showing a symmetrical magic square makes a deliberately visible reverse/mirror production rule conceivable, but it can also be a distribution or file-editing artifact. There is no independent proof of when or why the suffix was appended.

An earlier 2014 Cicada stage already required reversing a third JPEG byte stream to recover an image (see [documented contemporaneous solve sequence](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282014%29)). Thus byte reversal is historically an available player operation. Neither that prior stage nor the 05.jpg trailer identifies a specific **LP2 ciphertext interval, key/state, or lossless inverse**. A bare reversal of GP runes preserves the manuscript-wide low index of coincidence and cannot itself produce ordinary GP English under the existing finite English-control tests.

**Research decision:** preserve the exact source feature as possible contextual evidence for a *future independently selected* reverse-key or reverse-traversal operation; do not initiate broad phase/order permutations or assert it decodes LP2. A productive successor would need an original source instruction connecting the LP1 magic-square page and this raw-byte construction to a particular LP2 input, and a prediction fixed before the target ciphertext is scored.
