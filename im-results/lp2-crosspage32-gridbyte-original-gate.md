# The 32 original page-crossing words as a conditional 32-byte grid key

## Cryptanalytic decision

The 55 rune-bearing unsolved LP2 pages contain **32 printed words spanning adjacent page boundaries**. The original p49–51 numerical table has **32 rows of eight bytes**. This suggests a potentially human-visible lookup arrangement: a page-crossing word addresses one row; the number of its runes **after** the page boundary (always 1–7) addresses one of the eight columns without taking a modulus.

One frozen, literal interpretation gives the 32 source-selected bytes:

    61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671

**No authentic key or plaintext is claimed.** The row/column correspondence is an exploratory clue hypothesis. Neither the signed historical messages nor the source images instruct a reader to apply it. The 32 seam count can arise naturally from typesetting; it is insufficient evidence of intentional encoding. The table radix is independently debated (base60 versus base59). The displayed bytes use the existing source-transcribed base60 table.

Under the historical GP29 additive operation and a GP28 non-repeating predecessor-step operation, the key produces **zero exact GP-native dictionary words of three or more runes** on the 16 complete printed words of original p55. Both natural clocks, restarting at physical p55 and continuing the exact unsolved-book rune position, fail. This negative does not address AES, steganography, non-additive consumers, table-byte transformations, or hidden external key uses.

## Source-locked construction

- Read the 55 rune-bearing unsolved LP2 pages (physical p0–55, skipping numeric-only p50) with the canonical transcription rule: slash, whitespace and page boundaries **do not** end words; dash, dot and source punctuation **do**.
- Enumerate words crossing a page boundary in physical reading order. There are exactly 32, each with one portion on either side. The later-page fragment rune-count frequency is **1:9, 2:12, 3:3, 4:2, 5:4, 6:1, 7:1**. The earlier-page portions can be as long as ten and cannot address an eight-column table without another conversion.
- For crossing word number r (1–32), select the value printed at table row r and column equal to its **later-page rune count**, with columns numbered 1–8. Keep the byte values; do not fit a key phase.
- The result is the hex string above. For the two direct rune-consumer tests alone, reduce each byte modulo 29 or 28, respectively. Repeat all 32 bytes cyclically.

Original physical p55 has 76 runes. Its first rune is the **completion of a word from p54**. The other 75 runes form 16 complete printed words of lengths 4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3. The script retains the carried first rune for decryption and excludes it when scoring complete words.

## Exact original receiver gates

| Original consumer | Key phase | GP-native dictionary hits among 16 complete p55 words, length 3+ |
| --- | --- | ---: |
| GP29 direct subtraction | restart at p55 offset 0 | 0 |
| GP29 direct subtraction | continuous book offset 12,880 | 0 |
| GP28 predecessor/nonself rank and reserved repeat rune | restart at p55 offset 0 | 0 |
| GP28 predecessor/nonself rank and reserved repeat rune | continuous book offset 12,880 | 0 |

The lexicon includes 12,140 distinct native GP words of length three or more from source-normalized Gibran, Emerson and Shakespeare. Direct original inverse strings are emitted in the SFT; none supplies a coherent sentence or p55 long word. A 76-rune native-source plant matching the exact printed word-length geometry round-trips both receivers, including an explicit GP28 repeated-rune/EA escape, under both phase conventions. Thus these four negatives are tests of the intended receivers within their stated scope.

**Reproduce:** [read-only Windows 11 Node22 SFT](../sims/lp2_crosspage32_gridbyte_key_sft.cjs), with canonical corpus, original transcript, p50 grid and three control texts under resources/. [Windows Actions invocation](https://github.com/FlareZ123/liber-primus/actions/workflows/agent12-crosspage32-gridbyte-original.yml) runs the same script; a passing CI result is not presumed before execution.

## Literal p57 circumference instruction as a p55 receiver

The solved p57 plaintext explicitly asks the reader to *shed our own circumferences*. A source-motivated alternative to decrypting p55's complete printed words is to **strip both exterior runes** of each of its 16 completed words. This leaves **43 original ciphertext runes** with inherited word-interior lengths `2,0,0,4,4,0,11,4,2,0,5,5,0,4,1,1`. Freeze the same 32 selected key bytes starting at the first surviving rune. The GP29 additive and GP28 predecessor/nonself receivers both yield **zero** exact native GP dictionary words of at least three runes across the inherited interior groups (the 43-rune plaintext candidates and their word groupings are emitted by the SFT). The predecessor receiver starts from the original p55 first carried rune. This directly tests the most literal “shed” operation without adjusting phase or grouping. It does not exclude other uses of the 43 interiors, the p57 instruction, or the 32-byte table register.

## Frozen AES-256 table self-consumer

Because the derived register is exactly 32 bytes, one additional standard symmetric-key receiver was tested **without IV, offset, transpose, padding adjustment or score fitting**: AES-256-ECB decryption of the original 256 table bytes, including the source-selected key cells themselves. The exact decrypted SHA-256 is `3f7f59bf277f813ecef8490dba4eed7ca5f0c0da26f2a9dc95261f7155e5ca16`; its first 16 decrypted bytes are `31f2c4194767ec5a2bbd2a9a4e016f79` and **99/256 bytes** fall in printable ASCII or LF/CR, consistent with unstructured bytes rather than a direct plaintext file. Exact encrypt/decrypt inversion succeeds. No source explicitly selects AES, and this gate excludes only the direct no-IV ECB table-as-ciphertext route, not all possible 32-byte key uses.

## Source-conditioned page-wrap null: 32 is suggestive, not decisive

To evaluate whether the numerical-table alignment could be an incidental consequence of page layout, the same SFT freezes nine original chapter boundaries and exact rune counts for every original page. In each of **20,000** independent deterministic samples (xorshift32 seed `41720919`), shuffle the actual complete printed-word lengths **only within their chapter**, then reinstate the *exact original rune positions of all page cuts*. Do not alter the original table or choose any key based on shuffled texts. The real chapter seam counts are **2,4,2,4,3,3,2,11,1**, totalling 32.

The reference population yields **1,119/20,000 = 5.595%** samples with exactly 32 crossings; **12.675%** have 32 or fewer crossings, **23.925%** have every later-page fragment at most seven runes, and **1.545%** simultaneously have exactly 32 crossings and every later-page fragment fitting one of the first seven table columns. The table's eighth column is never selected by the original simple right-fragment rule. This deliberately simple null holds chapter and page geometry fixed but cannot capture every artistic typesetting choice. The joint coincidence was discovered after examining the source, so **1.545% is not a corrected discovery-wide p-value** and cannot authenticate a 32-byte key. It does justify keeping the alignment as a bounded source-led lead while requiring an independently chosen decoding consumer.

## Cross-page key as HMAC-SHA512 key for the archived Stage11 index (17 November 2026)

**Bounded negative; new receiver, no plaintext or authenticated key.** The 32-byte seam-selected register above is a natural-sized HMAC key candidate because solved p56 specifies a 512-bit page digest but not the hash construction. I independently reconstructed the exact 32-byte base60 key from the canonical LP2 transcription, the original 32×8 table, and the chronological page-crossing words using the report's fixed one-based later-fragment column rule:

`61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671`.

The single source-selected candidate consumer tested was **HMAC-SHA512(key, archived Stage11 index body)**. The preserved 1,640-byte `resources/cicada2014-onion7-index.html` and the two archived Stage11 copies `resources/external/cicada2014-stage11-onion7-original-index.html` and `resources/external/cicada2014-stage11-index-archived.html` are byte-identical, so they represent one input, not three independent candidates.

| Quantity | Exact value |
|---|---|
| Stage11 index body length | 1,640 bytes |
| Unkeyed SHA-512(body) | `83e50c118edb70dc34c9c760e332830a066b82006ebbbdcc7347b818d1961a571f32ef5a3717e98e282754d4a004dc0f7f0d99fb3824bb1b281a947c7ba70a31` |
| HMAC-SHA512(seam key, body) | `594b4ad4eb93cd898a2b0bcff55e992913d719288a01cdb2bc1c38023a2e50f16b88de4175c3fce9b082e6667c7bd398907d1577a9dd588e2121d20195eeb915` |
| p56 target | `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4` |

Neither digest matches. The exact computation is reproducible with [`sims/lp2_crosspage32_hmac_stage11_index_sft.cjs`](../sims/lp2_crosspage32_hmac_stage11_index_sft.cjs).

**Scope:** this excludes only the preserved Stage11 index bytes as the p56 preimage under this exact 32-byte key and HMAC-SHA512. The archived HTML is not an independently authenticated original HTTP response, and the unknown deep-web target may be a different page. HMAC is not specified by the manuscript; the seam-derived key itself remains conditional (including the unused eighth table column and the 1.545% source-conditioned page-wrap null). Do not broaden this into arbitrary HMAC keys, modes, or serializations. If an authorized historical crawl returns a candidate page body, this exact source-derived HMAC is one finite candidate to check, not an established hash rule.

## Decision and future trigger

Treat the 32/32 cardinality and right-half column selector as a **conditional pointer/key**, not established key material. Source-visible data do not select GP29, GP28, AES, or another consumer, nor an IV or pad clock. Retire the tested direct GP29/28 consumers. Reopen only with a visible or historically authenticated instruction establishing that original page crossings address the p50 table **and** choosing a reversible receiver, or with a coherent entire original ciphertext passage that forwards exactly under one frozen program. Avoid adjusting table columns, offsets or word boundaries merely to tune short outputs.
