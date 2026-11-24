# Agent35 pre-registration — issue #2494 semantic-crib transfer

**Target and crib were frozen before reading the p24 rune transcription.** The subsequent correction from 95 to 88 refers only to the source phrase's GP29 transliteration (95 ordinary letters compress to 88 runes through GP ligatures); it does not change the target or wording.

## Target

- LP2 physical page 24, opening paragraph.
- The original JPEGs show a repeated paired winged-insect/dragonfly motif on p24–26 and a detached wing on p27.
- Source clue: the original 2013 `761.MP3` ID3 TXXX body, under the title `The Instar Emergence`, contains: **“Like the instar, tunneling to the surface / We must shed our own circumferences; / Find the divinity within and emerge.”** The p24–26 insect sequence makes this source-specific emergence text a plausible semantic crib. The already-solved p57 occurrence is not the target; p24 is a distinct unknown opening.

## Frozen plaintext crib

Test the exact 19-word phrase above at the p24 opening. Its canonical GP29 encoding is **88 runes** (not 95: that larger count is the uncompressed letter count). Preserve the source punctuation only as word boundaries; punctuation itself is not part of the rune stream. No insertions, deletions, or hand-fitted substitutions are allowed. This is a high-specificity hypothesis, not an assumption that the phrase is present.

## Historically supported key descriptions

Only two descriptions are admitted:

1. **Self-key from a guessed plaintext word:** the February 2014 A-Koan discovery used the semantic word CIRCUMFERENCE to recover the 13-rune key `FIRFUMFERENFE`. It is CIRCUMFERENCE with C represented by F, the zero-shift symbol. Key F contributes zero shift; separately, a plaintext F is transparent and does not advance the key pointer.
2. **Clear donor word:** the separate LP1 WELCOME passage has the historically attested donor key `DIVINITY` from the clear `LOSS OF DIVINITY` text. Use this as the blind positive control and as the only alternate historically sourced key description for p24.

No arbitrary key lists, dictionary search, phase fitting, page-reset fitting, or language-model ranking are allowed.

## Blind-control protocol

Before looking at the WELCOME plaintext continuation, freeze the original encrypted WELCOME passage and the clear donor `DIVINITY`. Apply the same GP29 subtractive receiver and plaintext-F-transparent key-advance rule inferred from the February 2014 A-Koan case. Reveal the known WELCOME plaintext only after the receiver output is fixed. Require exact key, phase, and full held-out continuation recovery; otherwise the procedure fails its control and p24 is not tested.

## Target success/failure rule

Only after the blind control passes, inspect p24 ciphertext and apply the frozen 88-rune crib. Derive the key from the crib under the frozen convention, then predict at least 100 subsequent runes that were not used in deriving the key. Success requires the exact crib, one of the two source-supported key descriptions, and an intact withheld continuation with no tuned parameters. Any failure rejects this p24 transfer; do not move the crib to another page or try alternate phrases in this invocation.
