# Original LP2 p0 title: authentic 2014 GEB source as an additive running key

**23 November 2026, Agent5. Exact original-source negative, Windows Node22 PASS [45122686841](https://github.com/FlareZ123/liber-primus/actions/runs/45122686841).** No unknown LP2 plaintext, author-selected key or final destination recovered.

## Specific human route and rival

The genuine Fifth Onion in 2014 used `Gödel, Escher, Bach` (GEB), addressing exact characters by **dialogue title : exchange : word : letter**. Its first documented coordinate `3PI:6:1:3` resolves to **U**, inside `Your` in the Tortoise's *Three-Part Invention* dialogue. A contemporaneous edition is frozen at [the 2014 clue archive, commit ade9a0](https://github.com/neuroretransmit/cicada/tree/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2014/007-fifth-onion).

The original p0 red title prints two ciphertext words with exactly **8+5 GP29 runes**, indices `[15,8,18,3,6,19,27,0,15,26,18,21,5]`. The author-signed 2016 instruction contains the same-length adjacent phrase **EPIPHANY SEEKS**, and original solved p57 independently contains **DIVINITY WITHIN** of that shape. Both are *conditional* p0 plaintext cribs, not verified decryptions. An intended 2014 solver could have used a GEB passage as a running key. **Rival:** the book code was only a coordinate extraction mechanism for the prior Fifth Onion, with no LP2 running-key reuse.

For each of these two candidate original plaintexts, GP29 `C=P+K mod29` uniquely forces a complete 13-rune key. The opposite additive polarity is checked separately. A GEB-derived contiguous GP29 running key must occur as an exact 13-rune word-spanning substring in the entire externally fixed 2014 edition. Searching the *whole* edition is deliberately more permissive than choosing one dialogue or an unsupported initial offset.

## Original-input result, source not copied to repo

The pinned OCR's original text contains **1,951,562 UTF-16 characters**, with the historical `TORTOISE: Your argument is persuasive` anchor at source offset **87,816**. Its GP29 stream has **1,394,375 runes** under the orthodox greedy digraph reading. An independent source-spelling sensitivity branch keeps N and G as two runes instead of a single NG ligature.

| Original p0 plaintext candidate | Required p0 key `C-P` | Full pinned GEB matches |
| --- | --- | ---: |
| EPIPHANY SEEKS | `[26,24,8,19,27,24,18,3,0,8,0,16,19]` | **0** |
| DIVINITY WITHIN | `[21,27,17,22,26,9,11,3,8,16,16,11,25]` | **0** |

The complementary `C+P` key for EPIPHANY SEEKS is `[4,21,28,16,14,14,7,26,1,15,7,26,20]`; for DIVINITY WITHIN it is `[9,18,19,13,15,0,14,26,22,7,20,2,14]`. Each also occurs **zero** times. The alternative N+G tokenization gives **zero** occurrences for all four keys. Thus **none of eight** fully specified source/key comparisons matches, even with an unknown start location anywhere in the GEB book.

**Positive:** the pinned real GEB phrase `YOUR ARGUMENT IS PERSUASIVE` genuinely produces a discoverable first-13-GP-rune source key. That key encrypts thirteen unmodified genuine solved-p57 plaintext runes to a synthetic ciphertext; subtracting the same native plaintext recovers the identical source substring. Original GP29 red13, original solved p57's 95 runes, positive source occurrence and eight negative full-source tests are asserted in the test.

## Decision

The *literal contiguous-text GEB running-key* explanation cannot support either proposed p0 heading under ordinary additive GP29, either polarity and either predeclared NG source spelling. This does **not** disprove EPIPHANY SEEKS or DIVINITY WITHIN as cryptanalytic candidates, because the original title's plaintext and mode remain unknown. It does not exclude a GEB book-code with a new **independently specified sequence of four-field coordinates**, transpositions, character skipping or a different encrypted intermediate.

Reproduce: [read-only Node22 CommonJS SFT](../sims/lp2_p0_2014geb_two_crib_key_source_sft.cjs). It fetches the pinned historical OCR at runtime and never redistributes its copyrighted text. The result narrows a concrete historically authentic source-key route; there is no evidence yet for the missing LP2 coordinate sequence or cipher mode.
