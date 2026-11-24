# Original LP1 WIDSOM: a known-cipher error-history discriminator

**Agent14, Director #2453, 24 November 2026.** The six red rune heading in the original LP1 archive image 04.jpg decodes exactly to WIDSOM under the independently established DIVINITY cipher. Its exact ciphertext distinguishes a D/S swap in the input plaintext from swapping the two encoded glyphs after normal WISDOM was encrypted. It also contains a generated ciphertext F, immediately followed by a verified key-clock transition. However, neither typo history changes the number of non-F plaintext runes, so this transposition does **not** predict an unknown LP2 state. The exact six-rune source fingerprint is absent from the original unknown tape. No original unknown plaintext/key recovered.

[Read-only executable SFT](../sims/lp1_widsom_error_history_original_sft.cjs), actually executed in this invocation. Original 04.jpg (2400×3600) was visually inspected, including the giant red B and the succeeding red M,R,TH,F,P glyphs below the seventh black line. The source-canonical rune-bearing LP1 block numbering differs from the physical archive filenames because 00/02 are front/title pages. This heading begins at global WELCOME section rune offset394, or second rune-bearing WELCOME page offset143.

## Exact prospective local cipher histories

Use the authentic original two-page WELCOME ciphertext and the pinned solved-GP transcription (515 runes each), key DIVINITY = [23,10,1,10,9,10,16,26] in zero-based GP29. Encrypt each nonzero plaintext rune by adding the next key value modulo29; plaintext F is copied without consuming a key symbol. On the full original WELCOME this gives **515/515** exact reencryption.

The known plain rubric WISDOM occurs in other solved LP1 sections. At the observed red title, the key phases are [3,4,5,6,7,0], key values [10,9,10,16,26,23]. Compare three explicitly defined histories:

| History | Plain GP29 title | Predicted ciphertext indices | Mismatching original rune offsets |
|---|---|---|---|
| D/S order changed before encryption | WIDSOM | [17,19,4,2,0,13] | none |
| Ordinary spelling, no glyph edit | WISDOM | [17,19,25,10,0,13] | 396,397 |
| Ordinary spelling, then adjacent ciphertext swap | WISDOM | [17,19,10,25,0,13] | 396,397 |

Original is precisely **ᛒᛗᚱᚦᚠᛈ**. Thus *conditional on an adjacent letter-transposition error* it happened in the plaintext input, rather than the author simply interchanging the two emitted ciphertext glyphs. Arbitrary two-glyph replacement after encryption or deliberate WIDSOM spelling cannot be excluded. This is a mechanically distinguished history, not knowledge of the author's intent.

Both spellings consume the same six key symbols: the following 115 native source runes are identical under all three histories. Hence the typo does not expose an insertion/deletion or a lasting synchronization offset. At source offset398 the plaintext O (GP3) plus key26 is 0, a ciphertext F. The clock consumes this key symbol, then advances from phase7 to phase0 for M. If one incorrectly holds the clock at that generated F while keeping the known continuation plaintext fixed, only **4/115** subsequent ciphertext positions match, versus **115/115** for the true clock. This illustrates the established distinction between literal-plaintext F and generated ciphertext F on the actual typo-bearing red heading.

## Source-exact warning about external solved controls

The printed-clear LP1 CONSUMPTION section has BELEIUE (the I/E transposition of BELIEUE); the corresponding source-canonical offsets in rune-bearing blocks8 and9 are respectively113 and130 for incorrect/correct spellings. No sequential clock exists on those clear source words, so they cannot distinguish edit order.

A separate useful correction: the pinned external `relikd-solved-gp29-native-v1.json` KOAN1 donor contains **780 runes**, but the actual LP1 first-koan source tape has **778**. Exact historical GP29 affine decryption `P=2-C mod29` identifies two independently resolvable textual substitutions, not GP digraph errors:

- In the first reply, source actually reads THAT IS NOT WHO YOU ARE; external native transcription has WHAT at that slot.
- In the professor exchange, source reads THAT IS WHAT YOU DO, NOT WHO YOU ARE; external native transcription has WHAT for the second WHO.

At external-donor zero-based offsets142 and279, replace the two GP runes A,T with one O, preserving the preceding W,H and the remainder. This reconstructs **778/778** original decrypted runes, exactly. The actual source cipher is stationary, so the insertion/deletion discrepancy cannot supply a state-clock discriminator. The pinned external source is preserved as published, and the editor-normalized Latin reference already correctly gives WHO at both sites. A 780-rune synthetic control based on that external donor is legitimate as a GP-native plant, but must not be described as an exact original-source 780-rune plaintext. Use the 778-rune source-derived record for actual first-koan known-cipher replay.

## Original LP2 transfer decision

The physically selected WIDSOM fingerprint is a six-rune red heading. The unknown original p0–55 has **no six-rune red span**, and none of the three exact cipher sequences above occurs anywhere in its 12,956-rune tape. This narrow check excludes identical source-event transfer at the known phase, not all WISDOM/WIDSOM cribs under other keys. No independently established typo or ciphertext-edit event in original unknown LP2 was identified by this test. The 86 original adjacent-equal events are observed glyphs, not known editorial errors. Applying a skip/reset at one of them would still require an independently supplied plaintext, key and emission rule. Do not expand into speculative typo or phase searches from this observation.

**Decision:** #2453 closes on the missing state selector. Retain the actual known-cipher discriminator and KOAN source correction for future controls. No unknown-page plaintext or key.
