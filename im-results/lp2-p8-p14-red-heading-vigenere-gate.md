# LP2 p8–p14 red-heading Vigenère gate

**Decision:** bounded negative. The exact red-heading-as-Vigenère-key hypothesis does not recover plaintext. No source-selected reversible operation, key, or unknown-page receiver is established.

## Original-source observations

The original image archive maps LP2 physical page p to JPEG (p+17). Thus this region is resources/liber-primus/25.jpg–31.jpg (p8–p14), not 08.jpg–14.jpg; see the archive map in resources/liber-primus/README.md. The original scans were inspected directly.

Two observations define the region without importing a cipher candidate:

1. p8 begins with a visually distinct red 12-rune span, ᛉᛁᛉᛗᚢᛉᛗᚳᚦᛈᚩᛒ (GP indices [14,10,14,19,1,14,19,5,2,13,3,17]), followed by black body text.
2. p14 ends after 137 runes with a red 13-dot section mark. p8–p13 each have 12 printed text lines; p14 has 7.

The p8–p14 pages contain 1,729 runes in total; removing the p8 red span leaves a 1,717-rune body. This is a plausible section framing, not an executable cipher instruction. The existing p3–p22 artwork inventory is treated only as a control; it supplies no tree/insect traversal or key selector.

**Blindness limitation:** this invocation read the existing artwork inventory before inspecting the original scans. The observations above are directly visible in the original images, but they are not claimed as a pre-registered blind observation. No candidate cipher or numerical construction was taken from that inventory.

## Historical human-solve-path comparison

The signature-verified 2016 Cicada message says: “Its words are the map, their meaning is the road, and their numbers are the direction.” This supports attending to textual organization, words, and numbers. It does not name a cipher, select p8–p14, identify the red span as a key, define a key clock, or specify a receiver. See resources/historical/cicada2016-4gq25-outguess.asc.

Earlier solve paths are more constrained: the 2012 Tiberius cue selects ROT−4; explicit OutGuess instructions select OutGuess; book-code poems name texts and coordinate units; the 2013 signed TCP challenge names BASE29/DH/NEXT and supplies worked parameters; and the 2014 “Let the text guide you” step combines a runic image with already-solved LP1 text as a Vigenère key. In that last example, the source identifies the operation and the key is known plaintext. It does not establish that an encrypted red LP2 heading is a key or that Vigenère transfers to this section. See workplace/historical-player-solvepath-operator-contract.md and workplace/historical-solve-path-to-original-lp2.md.

## One finite candidate, frozen before scoring

**Human motivation:** a solver notices a conspicuous red heading at the start of a section and considers whether it is key material. The 2014 Vigenère precedent makes one direct test imaginable, but does not select it.

**Candidate:** treat the 12 red p8 runes literally as a repeating GP29 Vigenère key and decrypt the following body with

\[
P_i=(C_i-K_{i\bmod 12})\bmod 29.
\]

- Key: the p8 red span, GP indices [14,10,14,19,1,14,19,5,2,13,3,17].
- Operation and direction: standard Vigenère subtraction in GP29.
- Clock: begins at the first black body rune after the red heading; advances on each rune; no reset at word, line, or page boundaries; punctuation and layout consume no key.
- Receiver: p8 body through p14, ending at the red 13-dot mark.
- Holdout: p13–p14. No parameters were fitted to the holdout.

This is deliberately one fixed candidate, not a search over signs, phases, resets, keys, or cipher families.

## Reproducible result

Run from the repository root:

**node sims/lp2_p8_p14_red_heading_vigenere_gate.cjs**

The script reads the repository's canonical rune corpus, ink annotations, transcription, and LP1 plaintext reference; it checks the source span and terminal marker, performs the transform, and verifies exact forward re-encryption.

| Measure | Mean bigram log score |
|---|---:|
| Original p8–p14 body | -3.47743 |
| Candidate decoded body | -3.50262 |
| Candidate p8–p12 | -3.51033 |
| Held-out p13–p14 | -3.47521 |
| Clear p57 control, held out from model training | -2.53337 |

Scores use a 26-letter add-one-smoothed bigram model trained only on the LP1 text in lp1-plaintext-reference.txt; lower (more negative) is less language-like. The candidate is worse than the original ciphertext overall, and the held-out output remains far below the clear p57 control. Its initial transliteration is PEATHNPEAXNGUNGAETHWAEFUFWLJUIAYRUIARTHCOELTHIREAYNGEOEOXJWPPUMF..., with no recognizable plaintext. Exact re-encryption passes, as expected for a reversible modular transform; that invariant is not evidence for the key.

This score is a diagnostic rather than a proof that no other mechanism exists. It is sufficient to reject this exact frozen candidate.

## Decision and missing selector

The strongest rival is that the red span is simply a heading, while the 13-dot mark closes a section. That account requires no unobserved cipher machinery and is consistent with the historical solve-path pattern: earlier stages supplied a clue that selected the operation and its native operands.

The missing selector is exact: no player-visible source says to use Vigenère, to treat the encrypted p8 heading as its key, to subtract rather than apply another operation, to run one continuous 12-rune clock, or to decrypt the p8–p14 body as the receiver. The 2016 “words/map/meaning/numbers/direction” instruction does not supply those choices.

**Retire this candidate and close Issue #1990 under its negative completion criterion.** Do not reopen red-heading Vigenère with alternate phases, resets, or signs, and do not launch generic substitution/transposition/steganography menus. Reopen the region only if an independent source supplies the missing operation and receiver. No unknown plaintext, authentic key, original-cipher inverse, or destination was recovered.
