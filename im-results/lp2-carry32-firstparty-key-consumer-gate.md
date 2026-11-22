# Thirty-two carried-word table bytes: historically selected key-consumer gate

**Agent29, 14 November 2026; Director #837. Verdict: missing independently authored cryptographic consumer.** The original-input coordinate extraction supplies 32 reproducible candidate bytes; it does **not** establish a 256-bit cryptographic key, key derivation, IV, ciphertext framing, or authentic recovered unknown-page plaintext. No unrestricted algorithm/nonce brute force is warranted.

## Frozen candidate and the competing ordinary-layout explanation

The [source-verified extraction](lp2-pagecarry-grid32-source-packet.md) addresses row `i` of the manuscript's original p49–51 32×8 table with the `i`th of **32 genuinely carried complete rune words**, and column `right-fragment rune length - 1`. It excludes two page breaks with a following-page separator but no right fragment. The 32 fragment lengths are 1–7, so no modulo or fitted column is needed. The original-image base60 alphabet's corresponding byte sequence is fixed:

```text
61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671
```

This is an attractive **size match**, but an ordinary editor's page-break distribution also creates many carried words; the signed instructions do not identify carried words as selectors, nor say a table cell is one byte of a key. Its 32 rows alone do not prove an intended key.

## Relevant period-authentic cryptographic precedents, with exact missing operand roles

| Period-artifact or solved method | What the first-party text actually fixes | What remains missing for this 32-byte operand |
| --- | --- | --- |
| [Signed 2013 TCP challenge](../resources/external/2013-tcp-server-signed-source.md) | `BASE29 3301 → 3QO`; a DH exchange modulo 23; participant's `NEXT` text; command framing | No 32-byte key, transport from this table, IV, encryptor, or GP29 ciphertext length rule; the DH secret is participant-generated |
| [2014 magic-square form](../resources/external/cicada2014-onion6-magic-form-and-response.json) | Submit order5/order7/order5 prime-based squares and a Tor service address to a CGI endpoint | A form POST is no table-key cryptographic primitive |
| [Signed May 2014 LP2 release](../resources/cicada2014-may2-signed-message.asc) and archived [stage11 HTML](cicada2014-sexagesimal-upstream-transcription.md) | A Tor service address and 58 page images; original HTML has `133` and `331` tags | No attached 256-byte table decoder, 32-byte key extraction, 16-byte IV, nonce, binary field framing, or page-to-plaintext operator |
| [Solved 2014 three 256-byte service objects](external-historical-repos-byte-identity-256-stream-gate.md) | Bytewise XOR is attested for three fixed 256-byte objects, *distinct* from the LP2 table | The historical XOR involves three complete sources; it neither supplies a 32-byte block key nor selects carried words |
| [Signed January 2016 instruction](../resources/cicada2016-4gq25.md) | “Its words are the map, their meaning is the road, and their numbers are the direction.” | Neither cross-page fragments, byte-length 32, a cryptographic algorithm, nor the receiver's nonce or 29-rune encoding is identified |

These are the strongest nearby first-party candidates for an authorial interface. No one source specifies a complete `32 bytes → cryptographic key → invert original GP29` circuit. The real 2014 OpenPuff and signed TCP examples require inputs which are not supplied by this byte extraction. The source review is bounded to the named surviving period artifacts; missing historical private material is a possible rival, not established absence of a puzzle key.

## Independent 2014 participant transcription changes one chosen byte

The historical participant `sexagesimal.bin` is **a transcribed 256-byte file**, produced by converting 256 manually copied two-character LP2 table entries with Perl `pack 'C'`. It is *not* a distinct Cicada generator or a creator-signed interpretation. The [upstream transcription audit](cicada2014-sexagesimal-upstream-transcription.md) pinpoints **ten divergences** from original source-image entries at zero-based table positions `25,45,50,165,170,172,175,182,199,246`. Three had already been corrected in an annotated 2014 numeric transcription, but the machine-readable top token lines remained wrong.

**One of these ten lies exactly on our frozen 32-cell selector:** carried-word packet **4**, table **row4, column2** at zero-based position **25**. The **original printed token is `3I`**, giving decimal **198 = 0xC6**; the May 2014 participant byte list instead has **224 = 0xE0**, a case-sensitive I/i reading difference. Thus the 32-byte operand produced from original images differs from the historical participant's derived stream in precisely its **fourth byte**:

```text
Original-image key-like sequence:   61f9cac6505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671
2014 participant-derived variant:  61f9cae0505456feff728edc483f49ed780ad221c0f0839c007f063b446a1671
```

A high-entropy keyed cipher would change its entire decoded output under such a one-byte key difference. Therefore the 2014 solver-derived binary cannot authenticate a candidate **original key**. The source image decides the cell but still supplies no key consumer.

## Bounded direct mathematical consumer, and completion decision

For a minimally motivated historical *alternative* we froze one repeating GP29 Vigenère interpretation: each of the 32 source bytes reduced mod29, key phase zero at each independently printed terminal page, both signs. It is an **explicitly speculative byte-to-key map**. Across complete original **p54 and p55**, neither convention gives language-like output. The respective GP29 index-of-coincidence pairs are:

| Original terminal page | Ciphertext IoC | Key subtraction IoC | Key addition IoC |
| --- | ---: | ---: | ---: |
| p54 (232 runes) | 0.0331393 | 0.0373563 | 0.0338857 |
| p55 (76 runes) | 0.0378947 | 0.0333333 | 0.0308772 |

Both orientations reencrypt exactly, which verifies the arithmetic but proves no key authenticity. The author-chosen cipher, byte transport, nonce and framing remain absent, so no meaningful blinded p56 prediction can be made without free fitting.

**Decision:** #837 fails the **authenticated consumer prerequisite** and closes at this gate. Preserve the 32 original-image bytes as a provisional source-addressed operand, distinguished from its historically mistranscribed fourth byte. Reopen only for a new independent creator-era instruction fixing *all* of byte interpretation, cipher mode, IV/framing, and GP29 transport, or an original-input decoder predicting ≥100 held-out plaintext runes without choosing parameters after reading the ciphertext. No asserted unknown-page plaintext or new established cipher is promoted.

**Reproduce:** [`sims/lp2_pagecarry_grid32_packet_sft.cjs`](../sims/lp2_pagecarry_grid32_packet_sft.cjs) (Node.js22), using the canonical source table, original carries, and the 2014 participant `decimal_values`. The SFT asserts the entire ten-position disagreement and the one selected packet4 difference, plus the 32-byte candidate, direct Vigenère diagnostic and 32-byte positive extraction control. All source-input assertions and planted controls passed in [GitHub Actions run 43568528581](https://github.com/FlareZ123/liber-primus/actions/runs/43568528581).
