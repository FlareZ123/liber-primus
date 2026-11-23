# 761.MP3's three title sums and the 409-rune p13–p14 mayfly pair: one complete original-cipher decision

**Agent21 · 23 November 2026. Intermediate exploratory source link and negative fully specified receivers, not recovered plaintext.** Reproduction on the [original-corpus Node22 SFT](../sims/lp2_761_instar_409_twopage_group_shamir_original_sft.cjs), Windows GitHub Actions [initial PASS #45114488903](https://github.com/FlareZ123/liber-primus/actions/runs/45114488903), [full extended original-source PASS #45116943888](https://github.com/FlareZ123/liber-primus/actions/runs/45116943888).

## A plausible human-noticeable pairing, not a proved author instruction

The author-era 2013 `761.MP3` contains source-verified ID3 title **THE INSTAR EMERGENCE** and ID3 user text **Parable 1,595,277,641**, with the exact text later printed unencrypted on LP2 physical p57. Its GP rune-prime title word sums are **72, 280, 409**; their total **761** equals the original file basename. The 2013 original-byte frame inventory and exact source hash are recorded in [the audio inventory](audio761-original-id3-frame-inventory.md). This is a genuinely authenticated naming relationship; it says nothing about a second cipher.

On the **untouched** second-release pages, physical p7 has **208** GP rune glyphs; physical p13 contains **272** runes in two complete 136-rune halves; physical p14 contains **137**, with the exact whole printed second GP word **FOLD**, its initial F at p14 zero-based offset **2**. P14 carries the side-profile mayfly illustration and the end of the seven-page alternating stalk section. The following exact numeric relationships are therefore source grounded:

| Audio title value | Original LP2 physical object |
| --- | --- |
| INSTAR − THE = **280 − 72 = 208** | p7 exactly **208** runes, the page preceding the stalk section |
| EMERGENCE = **409** | p13+p14 **272+137 = 409** runes, closing the stalk/mayfly section |
| EMERGENCE − INSTAR − THE = **409−280−72 = 57** | LP2 **p57**, the clear PARABLE quoted already in the 2013 audio user tag |
| EMERGENCE − 1 = **408** | p13 first136 + p13 second136 + p14 excluding the printed F of FOLD 136 = **3 × 136 = 408** |

The arithmetic is exact; **authorial intent is not established**. In particular, selecting differences and deciding that the special F should be omitted are hypotheses suggested *after* noticing the independent source objects, not instructions in the audio. A generic page length matching a constructed number is insufficient for a decryption. The connection is nevertheless unusually specific about its physical recipient (the mayfly pair), number of equal source strips and an actually printed F flag; it is worth testing once before discarding.

## Field-group clock: source-named full period

The value **409 is prime**; the value **280 has multiplicative order exactly 408 modulo 409**. This permits a *complete, not fitted*, 408-step group orbit from the three individual title sums:

`s[0]=72; s[i+1]=(280*s[i]) mod 409`, with the 408 states all distinct and nonzero and `s[408]=72`.

This is mathematically suggestive of the **Diffie–Hellman modular arithmetic** used in Cicada's genuine 2013 instructions. It does *not* follow that the 2013 author intended the p13/p14 runes as messages modulo409 or that the GP29 projection `s mod29` is authorized.

As the cheapest fully reversible GP29 original receiver, freeze `k[i]=s[i] mod29` and try the two historically known additive signs on the **complete 408 original p13+p14 runes except the single literal F of FOLD**:

`plain[i]=cipher[i] − k[i] mod29` and `plain[i]=cipher[i] + k[i] mod29`.

No shift, state seed, source phase, F-mask family, or different recipient is tuned. Reinserting the unchanged F reproduces the full **409/409** original glyphs. The 95-rune authentic clear p57 plant passes exact encryption/decryption. Actual unknown results:

| Complete 408-rune candidate | GP29 rune index of coincidence |
| --- | ---: |
| Original ciphertext minus the one F | **0.0337476514** |
| Source-title group clock, subtract | **0.0355783591** |
| Source-title group clock, add | **0.0342294166** |
| Minimum of **2,572** authentic solved-GP 408-rune sliding controls | **0.0560172472** |
| Actual clear solved p57 (95 runes, contextual) | **0.0627099664** |

Neither original inverse has a coherent long original plaintext passage. The lower-bound comparison is an empirical native-GP calibration, not a universal proof that any natural sentence must have this IoC. The unchanged one-F round-trip verifies mechanics, not the author's cipher.

## Second specific decoding architecture: three 136-rune source shares

The same source object supplies exactly **three source-printed 136-rune strips**: p13 lines1–6, p13 lines7–12, and p14 excluding its FOLD F. A mathematically natural, different reconstruction for a three-share puzzle is quadratic Shamir interpolation over **GF(29)**, using the **three title sums as share coordinates** reduced modulo the GP29 field: `x=[72,280,409] mod29 = [14,19,3]`.

The zero-point Lagrange coefficients are exactly **[19,23,17]**. A resulting full-length reconstructed 136-rune secret is

`plain[i]=(19*upper[i]+23*lower[i]+17*p14_without_F[i]) mod29`.

Retaining upper/lower as side information makes this mapping to the third strip reversible: the entire original p14 third strip is reconstructed exactly, and an independently seeded authentic native p57 plaintext plant with arbitrary per-rune quadratic coefficients recovers **136/136** original secret runes.

Yet this specific source-title Shamir candidate has **IoC 0.0355119826**, below the **0.0505446623** minimum over 2,844 native 136-rune windows, and is not recognizable GP prose. A simpler positional x=1,2,3 Shamir variant was independently attempted as a diagnostic (IoC **0.0363834423**), also nonlinguistic. Neither original output is a recovered plaintext.

## An independently reversible whole-source base conversion, not a key

The three original p13/p14 strips also define exactly 136 *triple-digit* base29 packets `N[i]=29²*upper[i]+29*lower[i]+p14_without_F[i]`, each in `[0,29³−1]`. Division by the independently titled modulus 409 gives a **lossless**, complete `(quotient[i],remainder[i])` where `quotient=floor(N/409)∈[0,59]` and `remainder=N mod409`, with `N=409*quotient+remainder`. Since `29³=24,389` and `60×409=24,540`, all outputs lie in the proposed 60-symbol numeric alphabet of the original p49–51 table. This is an exact coding-capacity relationship, **not** a first-party instruction that the p50 table is a byte alphabet. The competing 59-symbol table interpretation remains unresolved.

One unfitted original readout maps these 136 quotients to the conventional base60 character alphabet. Its first 40 characters are `E50OECZKegQvGIpED7HpXIOthXvi361td3aX1S87U`; the full string is nonlinguistic. The **136 complete original remainders match zero of the first 136 source-derived generator states**, rejecting the simplest two-part `N=409*plaintext_digit+known_state` encoding before looking at any English. Exactly one original quotient is 59 (source triple `EA,D,X` at index77), so *under this unselected model only*, the full 60-symbol quotient alphabet is necessary; this cannot settle the independent source ambiguity of p50's radix.

The mathematically natural third-root element `ω=280^136 mod409=53` has order3, with `ω²=355`. The direct 3-way GF409 Fourier channel `top+ω*bottom+ω²*p14` places only **14/136** original values in the GP29 rune range `[0,28]`, and the remainder are not directly GP runes. Thus this exact unselected first-order Fourier projection is not a 136-rune original plaintext readout. The field identities and full original decoding are asserted by the same source-input SFT; no fit, key or external receiver is inferred. This closes only these specific human-executable arithmetic readouts, not arbitrary compression or source-hidden ciphers.

## Authentic XOR and exact 409-GP5/256-byte historical table gate

The 2013 audio was **historically used as an exact bytewise XOR operand** in the prior Cicada Twitter stage, so XOR is a genuinely first-party-known operation, unlike the conjectured Shamir receiver. The original GP29 glyph indices range0..28, making them unambiguous **five-bit numbers**. Another source-full physical p13/p14 readout therefore has two cheap, distinct known receiver tests, *without choosing keys by scoring unknown text*.

**Three original 136-rune strips to the already solved 85-rune p56 control.** XOR the indices of upper p13, lower p13 and p14 without the one literal F of FOLD at each of 136 matching positional columns. The results range0..31 and form **136 five-bit symbols = 680 bits = 85 bytes**, exactly the length of the solved p56 *rune* ciphertext and independently decrypted genuine 85-rune plaintext. Byte order is unambiguously source column order, groups of five bits MSB-first, then eight-bit bytes MSB-first; no marker or phase is fitted.

The 85 source bytes are binary-like (**31/85** printable ASCII). Treating each byte residue modulo29 as a proposed p56 moving key produces exactly **3/85** matches to p56's *known true* key `C_i−P_i mod29`, essentially the uniform 85/29≈**2.93** chance expectation. Only **8/85** bytes are in the direct native GP29 index range0..28. The 85-byte mapping, full XOR reconstruction of 136 five-bit values and source p56 word/key correspondence are asserted by the same original-source SFT. This is a decisive negative for the **one fixed three-way GP XOR→p56 prime-totient key** consumer, but does not rule out other source-specified byte operations or a hidden instruction.

**Original whole p13+p14 to entire 256-token p50 table.** The complete **409 unmodified GP29 symbols** occupy **409×5=2045 bits**. Appending the ordinary **three zero pad bits** yields **exactly 256 bytes**, the source count of the printed 32×8 p49–51 two-character numerical table. No F skip is needed: the first `F` of FOLD contributes its actual five zero bits. This is an exact natural-width coding relationship, not proof of a connection—five-bit GP29 encoding wastes three codewords per group, and a 409-symbol original cannot reversibly encode **every** possible arbitrary 256-byte object. The actual original p13+p14 packed bytes begin `3080b3162a9d19c3a72730d188257aac37508c1a98630034`, whereas original p50 base60 bytes begin `cbe7a7ba61ed7eb75cf99cdef704b7d479ca0f2166893b57`.

Under either source-compatible numeric table radix (**base60 or omitted-f base59**), only **1/256** same-position original bytes equal the p13/p14 packed stream. An independent **reverse-code admissibility** gate is stronger: parse every original 256-cell p50 byte stream into 409 five-bit groups, leaving exactly the last3 bits as padding. Any correctly packed GP29 text must have **zero** five-bit values29..31. The untouched p50 table has **30 invalid** groups under radix60 (despite its last3 bits being `000`), and **36 invalid** under radix59 (whose last3 bits are also nonzero `111`). Hence **neither unchanged source table byte stream is the direct 5-bit encoding of any 409-rune GP29 sequence**, regardless of which page plaintext, rune order or specific symbol positions are hypothesized, so long as the no-extra-transform direct encoder is required. The original p13/p14 stream re-decodes all409 values exactly as a positive control. This rejects the direct p13/p14↔p50 identical-byte-stream hypothesis without searching rotations, fitted XOR pads or English.

The genuine historical Cicada **bytewise XOR** can also be tested with exactly those two original 256-byte objects: `mixed[i]=packed_p13p14[i] XOR table_byte[i]`. Both directions are automatically reversible given the table as retained key. But on the untouched source there is **no standard plain file header** (PNG/JPEG/ZIP/PDF/GIF/gzip/ELF/ID3/RIFF), and the full original base60 mixed stream has only **95/256** printable ASCII bytes and **21/256** GP29-index-range bytes; base59 has **98/256** and **20/256**. These numbers are close to a binary output, without an interpretable source-selected decoder. An unknown encrypted binary payload would not be ruled out, but no original source supplies its file format, key, or destination. This tests the **literal** 2013 XOR operation with fully original operands, not a fitted keystream or unmotivated offset search.

These are finite original-source **keyless admissibility** decisions. They do not authenticate that the author combined 761.MP3, the illustrated FOLD pages and the numbered table. A true breakthrough still requires an independently typed source instruction or cross-page binary key receiver.

## Issue #2370: first-party INSTAR→mayfly opcode requirement

This **historical operand audit** addresses the independent *human solve route* rather than proposing another arithmetic decoder. The exact original 2013 source survives as [`2013-instar-xor-source.md`](../resources/external/2013-instar-xor-source.md): archived `761.mp3` (4,010,732 bytes, ID3 tag206 bytes) and the 64,167-byte Twitter binary were successfully combined by the contemporary participant's **offset-zero bytewise XOR, shorter-file truncation** to produce an authentic JPEG and then an authentic Cicada-signed OutGuess message. **This operation is proven by successful source-output recovery; a signed literal “XOR” imperative has not survived.** The audio ID3 TXXX contains the complete 2013 parable, and the book's clear p57 reproduces that parable *verbatim*. That creates a real author-to-author cross-era reuse, but its only typed, full original binary receiver was the **Twitter-derived file** in 2013. It is not a directive that the p14 mayfly drawing is the new XOR receiver.

The independent 2014 original authenticated Stage11 delivery index contains only 58 image references; the surviving signed Stage10/11 text and this 2013 original source provide **no byte serialization from GP29 runes** and no instruction connecting the audio operand to the p13/p14 double rooted-stalk leaves. See [2013 source](../resources/external/2013-instar-xor-source.md), [earlier original insect-art attribution and p8–p14 stalk placement audit](lp2-p14-mayfly-root-stalk-source-gate.md), [original 2014 signed Stage10 form](../resources/historical/cicada2014-stage10-original-form.html), and [original Stage11 index](../resources/external/cicada2014-stage11-index-archived.html). The **period participant** material records the audio title sum and 2013 recovered JPEG / OutGuess path, but not the p13/p14 fold operand or a second 2014 XOR. No cited source explicitly maps a page scan, Rune string, drawing, numerical grid, or 2013 audio bytes to a complete 409-rune ciphertext decoder. This is stronger than merely “the arithmetic failed”: it identifies the **missing human-visible byte-operand rule**.

The rival explanation is substantial: `instar/emerge/circumference` is a global Cicada thematic motif (including the clear p57), while the original p14 mayfly and the original p23–26/p57 illustration families have different outlines. The seven p8–p14 stalk images alternate left/right *without reflection* (original-pixel p10→p11 translation IoU≈0.969, reflected IoU≤0.103), so a direct physical vertical paper-fold overlay is not selected by the artwork. Earlier physical p13 line pairing and 761 source-group clock tests failed to produce authenticated text. A positive revisit needs a dated source selecting a **second operand, byte layout, phase, length and output receiver**; otherwise further XOR/OutGuess permutations or runic alphabet sweeps amount to fitting an unstated cipher. **Issue #2370 is closed as no historical opcode recovered, not as proof the thematic link is accidental or that an unknown keyed route is impossible.**

**F-bypass sensitivity is a serious source objection.** In the untouched original p13+p14 stream there are **14 GP `F` runes**: p13 has 12 (positions 2,30,36,50,60,90,93,125,138,143,187,247), p14 has **two** (positions 2 and98). Only one of these 14 is the initial `F` of the visibly literal `FOLD` word. The **408-state** congruence arises only when a human singles out that **one of 14** to bypass; applying a generic solved-page F-transparent convention to **all** F runes leaves **395**, not 408, active runes. The literal text `FOLD` offers an explicit anchor for a special one-F interpretation, but the archive does **not** instruct treating that F differently from the other13. This strengthens the missing-selection caveat and prevents using the period408 identity as automatic evidence of an intended global F-skip cipher.

There is a fully **F-inclusive** source-number rival: with **all 409** original p13/p14 runes, the additive progression `s[i]=(72+280*i) mod409` visits every residue exactly once and does not choose any one of the 14 printed F runes to exempt. Its GP29 `s mod29` modular subtraction/addition produces respective IoCs **0.0341938731 / 0.0339062275** on all 409 glyphs, versus original **0.0337384342**, and no deciphered passage. Full409/409 inverse passes. Thus the original title supplies at least *two* distinct source-complete mathematical clocks with equal reversible capacity—one ordinary full409 additive, one one-F-specific full408 multiplicative—and no source rule ranks them. A valid human decode must select the state transition (and F policy) before measuring a preferred text outcome.

## Decision and re-entry condition

The **new usable object** is a complete **408-state primitive-root clock** with three source-identifiable operands plus an exact printed 3×136 segmentation. The audio's genuine GP sum arithmetic makes this more constrained than choosing a random private pad, but **does not uniquely select** the original p13/p14 receiver, the F bypass, a modulo29 projection, or Shamir instead of another combination. Both direct one-step architectures failed original-native plaintext recovery. Do not multiply arbitrary modular log, phase, order and sign options to rescue an output.

Future priority only if independent creator-era evidence says *how* `761.MP3`'s numbers are to be applied to the printed mayfly/stalk pages, or a decoding of an independent, previously withheld source passage makes a locked, discriminating prediction. Otherwise record this as a potentially interesting numerical alignment with negative concrete consumers, **not as evidence of LP2 solved pages, a new authenticated key or a destination**.

**Files:** original JPEG `resources/liber-primus/30.jpg` (p13), `31.jpg` (p14), original `lp2-corpus.json`, exact rune/word transcription `lp2-transcription.txt`, native `relikd-solved-gp29-native-v1.json`, pinned audio frame inventory linked above. The SFT is read-only, requires Node 22, asserts the title sums, exact original source glyph lengths, word FOLD offset, exact period408 and full-group uniqueness, 409/409 encryption replay, full136 quadratic inverse and source-native positive controls.
