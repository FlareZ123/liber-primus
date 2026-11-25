# Exact post-square Onion6 integer running key (#2760)

The fixed source-selected 408-rune repeated key from #2399 is negative under continuous fixed-width BASE29 subtraction, including actual right-to-left borrows. No key, plaintext, or source-selected continuation recovered.

The prior `lp2_lp1_base29_runningkey_carry_sft.cjs` tests a different 2797-rune LP1 source with offset/direction searches and does not include this exact continuous repeated 408-rune alignment. #2399 was digitwise (no carry).

Use precisely pages 107/167/229, 226/93/89 runes, with the two colon-marked literal F holds at page107 offsets49/58 and continuous 317 advances of FIRFUMFERENFE before the clear last page. Repeat the 408 digits from the first original p0 rune across all 12,956 unknown runes. Decode P=(C-K) mod29^12956, big-endian, no target F skips, no resets or alternative offsets. Right-to-left recurrence p_i=(c_i-k_i+b) mod29, b=(c_i-k_i+b-p_i)/29, start b=0. Exact forward carry replay.

| Original interval | N | Integer inverse IoC | Digitwise IoC | Changed digits |
|---|---:|---:|---:|---:|
| p0–55 |12956|0.03447252|0.03447860|5878|
| p16–21 |1613|0.03437178|0.03436255|702|
| p40–53 |3008|0.03449730|0.03449398|1351|
| p54–55 |308|0.03447692|0.03445577|145|

Both methods produce nonprose throughout the inspected windows; no qualifying 150-rune recovery and independent 200-rune continuation. All indices are emitted by reproducer for inspection, fixed native trigram score about -3.67 nats/rune.

For a prefix-only observer at physical p22 seam, suffix-originating borrow could be 0 or -1. Compute both without any linguistic selection; the two prefixes differ at only one rune. The original suffix arithmetic fixes borrow=0, and exact concatenation matches the direct full inverse. Both prefix branch scores coincide to reported precision. No guessed borrow or suffix-fitted key.

Native controls use actual known p56/p57 plaintext from native reference (not encrypted p56). Plants recover 85/85 and 95/95, whereas ignoring carries misdecodes 35 and 30. This validates distinct arithmetic, not the transfer itself.

Reproduction `node sims/lp2_onion6_integer_running_key_sft.cjs`; actual core executed in connected V8. Full original output printed, no standalone Node/CI run claimed. Commit 9ee5c16089c43356ff2bd9056b22f563eba30433. Retire exact source proximity receiver.
