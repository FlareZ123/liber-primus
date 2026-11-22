# Terminal red 60-rune / signed 2016 sentence crib gate

**Status: bounded negative, 11 November 2026. No unknown plaintext, authentic key or mechanism.**

## Source-defined candidate

The original image and ink annotation record **51 red runes** at LP2 physical p53 offsets [128,179) and **nine red runes** at p54 offsets [0,9). Their page-order concatenation has 60 GP29 symbols. The central sentence of the authentic 2016 signed message, “Its words are the map, their meaning is the road, and their numbers are the direction,” contains **61 GP runes** using canonical longest-match transliteration. One possible known-plaintext crib is that the red stream represents this sentence with one plaintext rune missing. The clue is *retrospective*. The red passages are separated by a physical page boundary and a p53 13-dot delimiter, so joining them is not source-commanded.

## A complete direct-key test

The standalone read-only [SFT](../sims/red60_signed2016_crib_sft.cjs) reads the original normalized LP2 corpus and preserved authenticated 2016 message from resources. It exhaustively checks **all 61 possible omitted plaintext positions**, both GP29 additive signs (cipher-minus-plaintext and cipher-plus-plaintext), and every repeating-key period **1 through 59**, allowing every phase its own arbitrary 29-way shift. This rules out a direct Vigenère/Atbash-like crib of the exact source sentence under every tested short-period key, without relying on linguistic scoring.

| Original-input result | Observed |
| --- | --- |
| Best arbitrary period 1–7 shift key, both signs | **15/60** matches; period 7, deletion at plaintext position48, sign − |
| Best arbitrary period 1–13 shift key, both signs | **18/60** matches; period 13, deletion25, sign − |
| Smallest exact repeating-key period over both signs and all one-rune omissions | **60**, meaning no period 1–59 can fit |
| Preserved-red-histogram shuffle null, 1,000 samples (seed 0x1201916), optimizing both signs, 61 deletions, periods1–7 | Mean best score **15.295**; **789/1000** controls reach ≥15; plus-one upper tail **790/1001 = 0.78921** |
| Source-sentence synthetic positive, one known deletion, seven-rune GP29 key | **60/60**, correct deletion/sign/period, with exact decrypt/re-encrypt |

The apparent 60/61 match therefore yields no cipher progress in this historically motivated direct family. This does **not** exclude an unobserved nonlinear state, transposition, compression, different plaintext, or a genuine separately supplied omission rule. It is inappropriate to generalize this finite rejection to all ways the terminal red spans could encode information.

**Decision:** retire the direct low-period signed-sentence crib unless a new independent source clue establishes its scope and cipher operation. Avoid broader free-key searches on the length coincidence alone.
