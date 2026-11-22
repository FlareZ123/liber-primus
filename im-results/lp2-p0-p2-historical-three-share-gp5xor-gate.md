# Three cross-framed LP2 pages: historically used XOR cannot directly yield GP29 plaintext

**Agent 1, 15 November 2026. Bounded original-input, all-fixed-relabeling exclusion.** Original GP29 p0–p2 do not recover unknown plaintext under the proposed direct three-share XOR. This is one specifically clue-motivated cipher transfer, not a claim about unrelated image sharing, modulo-29 arithmetic, changing symbol maps, binary payloads, or the actual unknown LP2 algorithm.

## Observable human route and competing explanation

The first three 2014-released LP2 scans `17.jpg`–`19.jpg` (physical p0, p1, p2) carry the same left/right triple-bar cross artwork. The [original-image registration](lp2-p0-p2-orthodox-cross-source-plate-gate.md) establishes both cross copies and their 180-degree relationship. Earlier in the historical 2014 puzzle, Cicada really used **three equal-length OutGuess ciphertext shares combined by a bytewise XOR** to recover a signed message. Its exact 991-byte historical reconstruction is summarized in [the solved-stage reproduction](../workplace/historical-solve-path-to-original-lp2.md). A 2014 player familiar with that procedure might inspect the new three cross-framed pages as possible shares.

This interpretation has two major **unsupported assumptions**: crosses were not explicitly labeled as XOR/share instructions, and the historical operation combined actual bytes, whereas these new pages are rendered **GP29 runes of unequal lengths**. The source-native, simplest test below freezes the standard GP rune ordinal as an unsigned five-bit number and aligns pages at their published first runes. It neither invents a secret key nor shifts the tapes to select output.

## Exact GP29 direct-three-share proposal

For original p0, p1, p2 ciphertext rune indices `A_i`, `B_i`, `C_i`, define

```text
P_i = A_i XOR B_i XOR C_i
for i = 0 ... 200, using original local rune position on each page.
```

The original physical lengths are **262, 266, 201**. Their aligned overlap therefore has **201** source-authentic positions; p0 and p1 tails are untouched. Each share rune is one of GP ordinals 0–28, so bitwise XOR yields a 5-bit value 0–31. A direct GP29 plaintext candidate requires every result to remain 0–28.

The original three streams produce **every one of the 32 possible 5-bit outputs** within the overlap. The exact frequency histogram for output labels 0–31 is:

```text
[4,6,5,5,8,6,4,6,6,4,3,1,7,7,5,8,
 9,7,7,2,5,13,10,9,8,5,4,11,4,8,10,4]
```

Specifically **22/201** outputs fall outside the GP29 alphabet. Their zero-based original aligned rune offsets are:

```text
[4,17,19,20,38,58,63,106,111,113,115,116,
 118,124,127,132,133,144,170,172,184,186]
```

At the **first invalid site, index 4**, the three exact source indices are `6 XOR 9 XOR 16 = 31`, outside the 29-symbol GP set. This is an unconditional failure of that proposed operation on unchanged original ciphertext. More strongly, because **all 32** outcomes appear, every **fixed bijection of the five-bit output alphabet**, including any constant XOR mask or relabeling of the 32 values, retains **32 distinct classes**. It cannot losslessly become a 29-symbol GP plaintext alphabet without three additional codewords, a variable-length escape scheme, or a noninjective mapping. The manuscript does not supply such a scheme for this specific hypothesis.

The result does not prove that any more elaborate three-share model fails. The original exact bytewise XOR operation could conceivably act on some independently recovered binary streams; a codebook or exception channel might change the output alphabet. Such additions require new creator-selected evidence, or they would rescue an already failed transfer by freely choosing encoding layers.

## Direct historical binary interpretation of the same frozen three-share XOR

The actual 2014 triple-OutGuess-share stage recovered **raw bytes of a signed message**, so testing only GP29 plaintext would leave a historically relevant alternative unresolved. Take the very same 201 original aligned XOR symbols, serialize each as an unsigned **five-bit** word in original MSB-first order, then pack eight successive bits per byte with **no free rotation, padding, keystream, header or phase**. This outputs precisely **125 full bytes and five residual bits** (`11011`). The first eight bytes are `0c404fb430cd5921`. Only **52/125** decoded bytes are printable ASCII/whitespace and the longest printable sequence has **six** bytes; the full record has no PGP signed-message header, PDF, or ZIP first bytes. It therefore does not directly recover the clear signed text or any recognizable byte-frame expected from the actual 2014 predecessor stage.

The added exact same-run positive packs a genuine historical PGP armor header `-----BEGIN PGP SIGNED MESSAGE-----` as canonical five-bit digits and recovers all **34** ASCII bytes exactly using the identical bit serializer, so the negative cannot be explained by a broken bit order. It is the straightforward, completely declared **binary interpretation**, not a claim that every possible 5-bit framing or encrypted binary payload is excluded. [Successful updated source-run 43772026311](https://github.com/FlareZ123/liber-primus/actions/runs/43772026311).

## Direct GP-prime byte-share interpretation (Agent 45, 16 November)

There is one **historically more literal byte operand** than the five-bit GP ordinal: the public Gematria Primus chart assigns each of its 29 runes a **prime value** from 2 through 109. Each fits in one unsigned byte. The authentic earlier 2014 three-share stage XORed *bytes*, so an original-player-motivated alternative is to take those three **same aligned p0/p1/p2 rune positions**, convert each rune to its chart **prime byte**, and compute the source-order bytewise XOR. This consumes no arbitrary key, bit packing, skipped rune, phase search or nonprinted numeral. The cross illustrations still provide only a hypothetical share selector.

The **201 unchanged original bytes** start with the exact hex prefix

`074f0725374f11406f634b410b5d79693d0a3f691549470b01732b617b15466b`

and contain **79 distinct** byte values (all lie in 0–127), **28 even bytes and 173 odd bytes**. Of 201, **155** are printable ASCII or tab/newline/carriage return; their longest contiguous printable span is **13** characters, while the longest contiguous alphabetic span is only **five**. The leading bytes are neither a signed PGP armor prefix nor conventional PDF/ZIP magic, and the continuous text has no six-letter ASCII word. A genuine plain signed-message transfer therefore fails at the original-byte level. The output might still be nontextual ciphertext under a separately supplied format, which this test does not rule out.

This negative is **not an alphabet-capacity impossibility**: exhaustively enumerating the **29³** possible triples of original prime-weight symbols covers **all 128 possible seven-bit byte outputs**. The SFT plants the authentic 34-byte historical PGP header `-----BEGIN PGP SIGNED MESSAGE-----` as three **valid GP-prime** rune shares and recovers all 34 bytes by the exact same XOR operation. Thus the actual source-format codec can transmit meaningful text with correctly chosen symbols; the original aligned pp0–2 simply do not reveal it. The 28/201 even-output count is a specific original-source parity observation, not a universal proof against unknown byte-level encoding or different stream boundaries.

The same original-corpus [SFT](../sims/lp2_p0_p2_three_share_gp5xor_sft.cjs) now contains both independent historical-encoding interpretations (five-bit GP ordinal and eight-bit GP prime) with full-source assertions and a valid native positive for each. **Decision:** retire the zero-phase direct bytewise GP-prime XOR alongside the previously excluded five-bit XOR; seek a separate original binary operand or explicit share alignment before applying a more elaborate XOR transfer. No unknown LP2 plaintext or independently selected LP2 cipher was recovered.
## Native positive and reproducibility

The single-file [original-input Node22 CommonJS SFT](../sims/lp2_p0_p2_three_share_gp5xor_sft.cjs), [passing original-source Windows run 43770722495](https://github.com/FlareZ123/liber-primus/actions/runs/43770722495) reads `resources/liber-primus/lp2-corpus.json` unchanged; asserts original page sizes, all 32 original XOR frequencies and 22 invalid rune offsets; and exhaustively checks all 32 constant XOR masks' failure to reduce output support. Its genuinely positive control takes the full **95-rune known clear p57 PARABLE**, constructs three valid GP29-symbol shares whose XOR gives those same runes, then restores all **95/95** exactly. That planted control demonstrates that the model could recover genuine source-native GP plaintext if it were applied to compatible original data. It is not a decrypted unknown LP2 page.

**Decision.** Retire the exact direct GP-ordinal three-share XOR hypothesis on aligned original p0–p2, including every fixed five-bit secret relabeling. The older direct shared-additive-pad family [was independently and more generously tested](lp2-p0-p2-orthodox-cross-source-plate-gate.md). The cross artwork remains a genuine visible page motif, while source evidence presently supplies no executable unknown-page decoder or plaintext. No established-results synthesis change is justified.
