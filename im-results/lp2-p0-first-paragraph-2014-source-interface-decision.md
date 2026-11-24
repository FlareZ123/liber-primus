# First unknown LP2 paragraph: period-authentic source interface decision

**Agent2 · 24 November 2026 · Director Issue [#2455](https://github.com/FlareZ123/liber-primus/issues/2455).**  
**Classification:** source-interface decision and one fixed historical-operation test. No unknown LP2 plaintext, key, or decoder recovered.

## Decision

The smallest public 2014-era packet does **not** determine a unique executable cipher for the first black-body paragraph of p0. It provides several genuine earlier Cicada operation precedents, but no source-visible selector binds any one of them to p0's black rune stream.

The only action selected by p0 itself is a **layout boundary**: exclude its 13 red heading runes and the large red 13-dot mark, then begin the black-body register at zero-based rune offset 13. That leaves 249 black ciphertext runes. The marker is not a cipher key, shift, or state-reset instruction.

A fixed, historically motivated Atbash-order/+3 transfer was applied once to those 249 original runes. It produces no recognizable plaintext. The subsequent p1 body was not used to choose or score the transform and remains an unscored holdout. Existing full-original tests already reject the strongest 2014 Vigenère-key and red-heading/OutGuess transfers; they are cited rather than repeated.

## Frozen original input

The source is physical LP2 p0, original scan resources/liber-primus/17.jpg:

- 2400 × 3600 RGB; 695,525 bytes; SHA-256 197e1e153958b9a2736b09c10eea7d8bb00e0632fd22a8d9606840becc79942e.
- The first heading word is eight red GP29 runes, SHEOGMIAF; an ordinary small red word divider follows.
- The second heading word is five red GP29 runes, SYENGC.
- The large red 13-dot mark follows rune 13. The first black-body runes are THJGAE-FJOE-.
- The black body is original offsets 13–261 inclusive: **249 runes** of the 262-rune page.
- The JPEG ends at its final FF D9 EOI marker; it has **no post-EOI suffix**. This differs from the 2012 first-image carrier, whose archived primary mirror has a 61-byte suffix.

The image adjudication and derived ink register are [p0 original-image adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md) and [physical-ink override](../resources/liber-primus/lp2-p0-physical-ink-override.json). The canonical rune source is [lp2-transcription.txt](../resources/liber-primus/lp2-transcription.txt).

## Minimal period-visible packet

A solver could have assembled the following without contemporary agent reports or modern structural hypotheses:

1. **Original p0 image and GP29 chart.** The original 2014 Onion7 index supplies the 58 images; the earlier Gematria Primus material supplies the 29-symbol rune/Latin mapping. The mapping tells a solver how to name a rune, not how to invert p0.
2. **2012 first-image precedent.** The preserved 2012 primary-image mirror has a 61-byte post-EOI suffix; ASCII Caesar −4 turns it into a decoy image, while OutGuess recovers the hidden message from the original JPEG coefficients. The signed 2012 “Chorus” message also names a literary source and supplies its text. These are real historical operations, but neither source says to apply its book coordinates or its carrier procedure to LP2.
3. **2014 post-square precedent.** The original Onion6-era pages 107 and 167 are reproducibly reconstructed with a 13-symbol Vigenère key, FIRFUMFERENFE, and a colon-marked non-consuming-F convention. This is a solver-reconstructed operation on those earlier pages, not a signed instruction to reuse the key on LP2.
4. **2014 LP2 delivery.** The signed Stage11 message says “Your enlightenment awaits you” and names ky2khlqdf7qdznac.onion. The contemporaneous participant-archive index has title 133, div id 331, and links 0.jpg through 57.jpg. It supplies the LP2 image set, but no cipher, key, alphabet convention, or first-page instruction.

The Stage10 form/response is also preserved: its form posts the three labeled magic squares and a participant onion address to /cgi-bin/squares; the surviving response says “Thank you for you submission” and links only to /107.jpg, /167.jpg, and /229.jpg. It is a static confirmation page, not a p0 cipher specification. The actual Stage10 private-reply and CGI-handler questions are separate active work and are not being reopened here.

## Rival readings and fixed outcomes

### A. Transfer the earlier Atbash-order/+3 rune operation

The fourth-Onion page-06 reconstruction gives a fixed GP29 transform. For ciphertext index c, use

\[
p=(28-c+3)\bmod29=(2-c)\bmod29.
\]

No key, phase, reset, F exception, or word-boundary adjustment is introduced. Apply it to p0 offsets 13–261 and stop after exactly 249 runes.

The historical direction check is positive: the same fixed transform reproduces the earlier page-06 line A-COAN.A-MAN-DECIDED-TO-/ (the later community transcription editorially normalizes COAN to KOAN). The original p0 output is not a recognizable instruction or prose. Its full-register IoC is 0.03436325948957119, exactly the input IoC, as expected for a one-to-one alphabet permutation.

The first transformed body line, preserving the original word separators, is:

    ᚠᛚᚫᚷ-ᚦᛚᚾ-/

This is a plausible historical transfer, not an LP2-selected operation: the Atbash/+3 implementation is in a community reconstruction, not a Cicada-signed p0 instruction. The exact original p0 body test gives no plaintext. The p1 continuation was not scored.

### B. Transfer the earlier 2014 Vigenère operation

The post-square pages give the reconstructed key FIRFUMFERENFE, with GP29 shift vector modulo 29:

    [0,19,25,0,28,10,0,11,25,11,20,0,11]

A completely fixed direct-transfer reading would use P_i=(C_i-K_(i mod 13)) mod 29, phase zero at p0 body offset 13, and stop after 249 runes. The 2014 source pages skip only F runes visibly preceded by a colon; p0 has no such colon marker, so no p0 F is skipped.

This is a stronger typed candidate than a free key search, but it still lacks a p0 selector. The existing [2014 Onion5→Onion6 chain and direct-transfer gate](2014-onion5-geb-onion6-chain.md) already tested the exact historical key across original LP2 p0–p55 under continuous/page-reset clocks, both additive signs, and F-skip/no-skip variants. None produces native prose. The 13-rune length match between the earlier key and p0's red heading does not rescue the transfer; the original full-corpus test is decisive for this direct-key family.

### C. Treat p0 as an OutGuess carrier

The 2012 first-image chain and the recovered 2013 Gematria JPEG demonstrate that OutGuess can be a genuine Cicada-stage operation. But the 2012 carrier's distinctive 61-byte suffix/decoy clue is absent from p0: p0 ends exactly at EOI.

The bounded original test [LP2 red-heading OutGuess gate](lp2-original-red-heading-outguess-source-gate.md) already ran pinned OutGuess 0.4 on p0's original JPEG with both natural red-heading password transports: Latin GP transliteration SHEOGMIAFSYENGC and literal rune bytes. Neither yields an authenticated payload. Fourteen nominal extraction headers were high-entropy noise; all 18 corresponding payload-free controls also produced apparently successful headers. This is not evidence for an LP2 payload or for a text decoder.

### Type-check failures: book code and BASE29/DH

The signed 2012 “Chorus” message selects a literary text, but p0 supplies no book-coordinate tuple or first-party instruction connecting that poem to its black runes. The 2014 GEB book-code route likewise had explicit GEB image/audio cues and a four-field coordinate grammar; p0 has neither.

The signed 2013 TCP challenge specifies BASE29 3301 → 3QO and a DH protocol. Its DH base and secret are participant-selected; NEXT stores client-supplied text. None of those commands defines a reversible transform from p0's GP29 stream to plaintext or supplies an LP2 session key. Treating 3QO, the toy DH result, or the prime display as a p0 key would add an unselected conversion and receiver.

## What is actually missing

The single missing information type is an **LP2-specific, first-operation selector/operand record**: an authenticated instruction or key-bearing companion message that binds the p0 black-rune input to one operation and fixes its key/operand, GP29 representation, initial clock, and stop boundary.

The realistic period source is a contemporaneous Cicada-signed companion text or a 2014 participant's preserved copy of the message delivered with the Onion7 58-image release. The surviving signed Stage11 message and static index do not contain it. This is a source-gap hypothesis, not a claim that such a message existed. If no such record was ever delivered, the public packet is genuinely underdetermined at this point and the next useful action is source recovery, not another p0 cipher sweep.

A recovered record would reopen the task only if it fixes the operation before inspecting output and supports a complete p0 inverse with an independently withheld continuation. No such record or decoder is presently established.

## Existing evidence used, not repeated

- [p0 original-image adjudication](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md): exact 13-red-rune heading, marker position, and 249-rune black body; p2 terminal-marker control shows the 13-dot mark is not a universal cipher-state reset.
- [2014 Onion5→Onion6 chain](2014-onion5-geb-onion6-chain.md): exact historical Vigenère/F-skip reconstruction and negative direct transfer to LP2.
- [red-heading OutGuess gate](lp2-original-red-heading-outguess-source-gate.md): p0 original-image extraction, real positive controls, and payload-free controls.
- [historical title-as-opcode gate](lp2-p0-red13-historical-title-as-opcode-gate.md): fixed earlier LP1/LP2 conventions do not turn the 13-rune heading into an instruction.
- [authenticated 2012–2016 operation contracts](cicada-authenticated-solvepath-operation-contracts-2012-2016.md): distinguishes signed operations, participant reconstructions, typed outputs, and LP2 transfer limits.
- Issues [#2442](https://github.com/FlareZ123/liber-primus/issues/2442) and [#2117](https://github.com/FlareZ123/liber-primus/issues/2117) remain separate: this report does not repeat the 27×27 first-node search or the blind multi-page transport exercise.

**Final disposition:** complete the bounded source-interface decision; do not promote either rival operation to an LP2 decoder. No unknown plaintext, authentic LP2 key, encryption mechanism, or final destination was recovered.
