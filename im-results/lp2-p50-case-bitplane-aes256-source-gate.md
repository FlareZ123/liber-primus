# P50 numeric-table letter-case bitplanes: direct AES-256 original-source gate

**15 November 2026, Agent37. Original-source, bounded negative.** The original pp49–51 numerical table has precisely 32 rows and eight printed two-glyph tokens per row. Reading second-glyph letter case as eight row-aligned bits gives a natural, lossless *candidate* 256-bit key. Eight source-fixed bitplane/bit-order keys were checked as both direct AES-256 decryptors of the original 256-byte table and full-book additive AES-256-CTR pads on all **12,956 original unknown GP29 runes**. **No unknown plaintext, key schedule, authenticated AES instruction or destination was recovered.**

## The independent, human-visible input

The original 32×8 printed base60 table has the mixed-case source tokens verified in [the three disputed glyph audit](lp2-p50-three-glyph-case-byte-gate.md); its canonical 256-byte parse hashes to SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The visible row width of **eight** and height of **32** make one candidate byte per row and a resulting **32-byte AES-256 key**, without guessing bit positions or regrouping tokens. The table itself gives no instruction that case is a second message or an AES key; this is an exploratory interpretation of the literal printed typography.

Freeze four predicates over the 256 source tokens in row-major order: whether the **second** character is lowercase ASCII, uppercase ASCII, or decimal digit, and whether the **first** digit is odd. Read each eight-cell row from left to right as MSB-first, or with the eight bits reversed. The four printed-order 32-byte keys, in hex, are:

| Source predicate | 256-bit key |
| --- | --- |
| Second glyph lowercase | `6c300aa0d80c3649039a4a5a84110cd249261498c854b64a2f80c05e43c924f4` |
| Second glyph uppercase | `8081755b26f3c9a47c65b4a57b2ae22da6916264362b4935506d0fa12824db01` |
| Second glyph decimal digit | `134e8004010000128000010000c411001048890301800080801230009412000a` |
| First digit odd | `dd9349c4e4df095c1d6933ecad55a161a2206190f846811416fc1940a2e8139b` |

The reversed-within-row bits are the other four source-fixed keys and are emitted in full by the executable SFT. The 214 source tokens with an alphabetic second character also support a simple five-bit Bacon-style stream, but direct lowercase/uppercase grouping in printed or column order did not produce language under ordinary five-bit letter maps. That independent diagnostic was not promoted into an AES clock or an author instruction.

## Original-cipher inverse and outcomes

For every candidate 32-byte key, AES-256 decrypts all 256 original table bytes directly in **ECB, CBC, CTR**, with the one explicit all-zero 16-byte IV/counter for CBC/CTR and padding disabled for block modes: **24 complete direct-table outputs**. The first 16 bytes of the lowercase, printed-row-order ECB output are `9a110755963e5341a046888d9e3cfc96`; of its CTR output `c90337c7e99c97979bf262729c13b33d`. The highest printable-byte count among direct AES variants was **120/256**, without a coherent unencrypted text or recognizable file start. The direct-table test is strictly limited to these source-fixed keys and block/stream mode conventions.

For the GP29 manuscript, generate AES-256-CTR keystream from each same key and a zero counter; convert output bytes to GP rune-index pads by (a) byte modulo29, (b) `floor(byte×29/256)`, or (c) rejection of bytes 232–255 followed by modulo29 (232=8×29). Use both additive signs, and let the pad run book-continuously, reset at each physical rune-bearing page, or reset at each of the nine original visually separated chapters. This gives **8 keys × 3 source-natural GP projections × 2 signs × 3 clocks = 144 full-length candidates**, all with exact original rune positions and no tuned offset, IV, hidden alphabet, plaintext fitting or external text key.

| GP29 register | Index of coincidence |
| --- | ---: |
| All original unknown pp0–55, 12,956 runes | **0.03447839786450569** |
| Best of all 144 candidate complete decryptions | **0.03452849170705016** |
| Independent solved p57 control, 95 runes | **0.06270996640537514** |

The best original score belongs to **uppercase / reversed row bits / byte-mod29 / page-reset / ciphertext minus pad**. Its p27–32 chapter IoC is **0.034581902248281726** and p55 IoC **0.028070175438596492**. Both remain inconsistent with a recognizable long ordinary GP-English plaintext. Other tested outputs did not show a native-GP whole-book frequency profile. A 95-rune native solved-p57 positive control exactly encrypts and recovers all 95 plaintext runes under every 256-bit key and each projection; a frozen AES-256-CTR known-answer block and the complete original-table byte SHA also pass.

**Decision.** Retire these 144 direct source-case-bitplane AES256-CTR GP29 pad consumers and 24 literal source-table AES block decryptions. The 32×8 source typography yields well-defined bytes; it does not authenticate AES or a hidden binary channel, and a source-chosen nonce, independent key schedule, different cipher or actual plaintext would be required before changing this route. Do not tune offsets or additional keys against the unknown ciphertext.

**Reproducer:** [single-file Node22 CJS original-source test](../sims/lp2_p50_case_bitplane_aes256_original_sft.cjs) · [successful GitHub Actions run 43683622491](https://github.com/FlareZ123/liber-primus/actions/runs/43683622491), including source exactness, all 144 full-book outputs and positive controls. The targeted workflow is the existing [Agent37 manual gate](../.github/workflows/agent37-q238-and-terminal-hash-sft-manual.yml).
