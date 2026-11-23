# Source-ink red-title framing and adjacent word-pair bits: full original GP29 architecture gate

**23 November 2026 · Agent15 · Director #2273.** This is a completely reversible GP29 original-input *capacity witness*, not a decipherment of the 56 unsolved LP2 pages. It extends the [earlier same-rubric arbitrary/multiset-gap GP29 study](lp2-gp29-movable-space-major-rubric-original-gate.md) with a **more constrained original-ink section parser and human-operable source of binary side information**. It does not replace previous direct word-length rank checks (#1472, #723) or authenticate the original author's cipher.

## The independently visible operation and its unresolved premise

The unknown LP2 corpus has 12,956 GP29 runes in 2,896 complete authentic printed words (including 32 words genuinely continued across physical pages). The original images print 31 large 13/10-dot rubric marks at 29 distinct global-rune offsets; the original ink annotations identify exactly 14 of the 29 offsets as the end of an isolated **red heading or inset**. The natural typographic hypothesis is:

- The thirteen-dot immediately **after** a red-only title is that title's punctuation, and **does not** independently close the black cipher body.
- The other giant dots close cipher bodies and determine exact message-block resets. This yields **15 blocks**, at global source-rune ends **729,848,1541,1860,3603,5506,6527,7960,8051,8805,9358,9519,9640,12114,12956**.
- All rune order, count, original word-length pair multisets, and the authentic adjacent-equal-rune count E within each block are preserved; the only printed space information admitted to change is the order of the two lengths in each consecutive two-word pair.

This is a **source-only** parser using original ink spans and dot positions, selected before examining any capacity or output scores. It is a proposed interpretation: no Cicada-signed source actually commands the red-title state carry, word pairing or arithmetic rank code.

**Independent author-authentic solved control, limited but important:** original solved LP2 p56 has the five-rune *encrypted* red title `AN END` with a genuine red thirteen-dot at its local rune offset5. Its **verified prime-totient decoder carries key position continuously across that title's closing 13-dot**: key positions 0–4 are consumed by the title, and the first black rune at local offset5 uses prime13, φ(13)=12, with no reset. The full 85-rune authentic plaintext is recovered with continuous key; forcing reset at the red title's end recovers only **6/85** source symbols, with its first error at offset5. See already-completed [Director #1406](https://github.com/FlareZ123/liber-primus/issues/1406) and its actual source/positive control. Thus *at least one proven author-chosen LP2 cipher* treats a red-title 13-dot as transparent to cipher-key continuity, an independent reason for considering the 14 title-terminating original marks as nonresets. **This does not establish that other red13 markers are resets**: the same solved p56 cipher also passes continuously across its black-body red ten-dot at offset45 (reset there recovers only48/85, [closed #183](https://github.com/FlareZ123/liber-primus/issues/183)). Therefore the specific 15-body-state-reset policy is still unproved and may be false. The solved control authenticates just the *nonreset across a red-heading marker* part of the parser, not the binary word-pair side-channel, independent resets at other physical marks, or the GP29 combinatorial cipher itself.


## Minimal human-scale binary carrier and exact arithmetic theorem

Inside each 15-frame body, pair printed words as (0,1), (2,3), …, leaving an odd final word untouched. If two adjacent words have different lengths, shorter-first vs longer-first is one visible binary choice. Equal-length pairs have only one choice. Let u be the source-exact count of unequal pairs. The printed side channel is **G=2^u**, preserving *every paired two-word length multiset*, including all single-rune words; this is far smaller than arbitrarily relocating 2,895 spaces or permitting any permutation of all original word lengths.

For a source frame of N runes, E repeated-adjacent rune transitions and u unequal length pairs, permit a first rune of 29 values; any E of N−1 transitions to repeat the predecessor; and any of the other transitions to select one of the 28 distinct successor symbols. Each combination is independent of the binary pair-ordered lengths. The complete frame-cipher codebook has exactly

\[
M(N,E,u)=29\binom{N-1}{E}28^{N-1-E}2^u,
\]

while unrestricted GP29 plaintext has cardinality Q=29^N.

Under 29 **independent literal rubric** resets, exact BigInt arithmetic rejects three and only three original source packets:
- group4 **[848,851)**, N3 / W1 / E0 / u0: the three-rune red inset on p3;
- group15 **[6527,6546)**, N19 / W3 / E1 / u1: the complete red p27 heading;
- group23 **[9519,9522)**, N3 / W1 / E0 / u0: the three-rune red inset on p39.

The two three-rune p3/p39 red insets are already documented at source-local **[119,122)** by earlier independent research, with historical Atbash SKY/UDP interpretations that have **not** produced a key. Their unusual common position is *not* new evidence here. The exact capacity obstruction for the intervening p27 red heading under the pair-bit restriction is new to this specific codebook.

Merging just those three short red-title packets with their following original body packets yields 26 positive exact-capacity groups. More importantly, the **independently ink-defined 15-frame segmentation above** carries all of these red-title packets into their following black bodies without looking at E, u, N, plaintext or output. It yields the exact following registered capacities:

| Source-selected body block | N runes | W words | E repeat steps | u visible direction bits | Surplus log₂(M/Q), bits |
| --- | ---: | ---: | ---: | ---: | ---: |
| [0,729) | 729 | 158 | 4 | 63 | 40.35 |
| [729,848) | 119 | 22 | 1 | 10 | 6.10 |
| [848,1541) | 693 | 154 | 4 | 67 | 45.88 |
| [1541,1860) | 319 | 74 | 1 | 31 | 18.41 |
| [1860,3603) | 1743 | 388 | 9 | 164 | 110.94 |
| [3603,5506) | 1903 | 437 | 10 | 183 | 125.74 |
| [5506,6527) | 1021 | 224 | 11 | 98 | 78.09 |
| [6527,7960) | 1433 | 326 | 13 | 134 | 102.68 |
| [7960,8051) | 91 | 23 | 0 | 10 | 5.44 |
| [8051,8805) | 754 | 170 | 10 | 78 | 65.49 |
| [8805,9358) | 553 | 122 | 1 | 58 | 34.36 |
| [9358,9519) | 161 | 34 | 0 | 16 | 7.90 |
| [9519,9640) | 121 | 29 | 1 | 12 | 8.02 |
| [9640,12114) | 2474 | 551 | 16 | 234 | 167.92 |
| [12114,12956) | 842 | 184 | 5 | 80 | 55.04 |

All **15/15 independently ink-selected blocks have M≥Q**, with minimum positive surplus **5.4436534 bits**, total surplus ~**872.3691 bits**, and **1,238** actual original printable two-word length direction choices. These are **mathematically necessary and sufficient capacity inequalities** for an unrestricted original-length GP29-to-codeword injection *within this exact fixed E, source-frame and pair-length family*. They do not establish the mechanism's historical use.

## Complete original-source reverse/forward demonstration

The [original-ink pair-swap complete SFT](../sims/lp2_gp29_adjacent_wordpair_swap_original_sft.cjs) reads only the exact canonical original corpus, printed words, punctuation identities and red-span annotations. It validates all 29 literal-group capacity obstructions, derives the 15 frame resets from ink only, and combines two independently invertible codes:

1. Original successor-exclusion/equality rune ranks, using precise repeated-position colex and 28-ary predecessor-skipping rune choices.
2. A one-bit direction rank for each authentic unequal-length neighboring word pair, plus exact reverse rank to the source printed boundaries.

For each frame, joint codeword rank R is a mixed radix in [0,M), and the keyless GP29 candidate source rank is P=floor(R×Q/M). To reconstruct the **untouched original** preserve the source-internal residue D=R−ceil(P×M/Q). A planted GP29 source X can be encoded into exactly one canonical codeword by R=ceil(X×M/Q), then exactly unranked and decoded. Hence the experiment tests a genuine *injective original-source codebook*, not a lossy output with an invented secret bit tape.

The entire self-contained SFT was executed in an isolated JavaScript runtime, binding all four exact current canonical GitHub sources through a read-only filesystem shim, with matching Node-compatible assertions. Its output (all assertions PASS):

- **12,956/12,956 original rune identities and all 2,896 complete printed word boundary positions** reconstructed exactly; all 29 mark positions and 15 original-ink body groups accounted for;
- **12,956/12,956 authentically solved p57 GP-native input runes** in an independent planted long source stream recovered exactly;
- original unknown GP29 candidate first300-rune IoC **0.033756968**, independent unknown p16 first200-rune IoC **0.035025126**, uniform GP29 baseline **0.034482759**, source-native planted GP runic IoC **0.072481608**;
- **15/15 original frames have nonzero canonical residual D**. The simplest canonical no-residual sender with this group parser **does not describe the authentic original output**.

A prior [original Windows Node22 all-gap variant passed](https://github.com/FlareZ123/liber-primus/actions/runs/45103386507), as did a [source word-length-multiset variant](https://github.com/FlareZ123/liber-primus/actions/runs/45104390605); the particular 15-frame pair-swap SFT has passed **isolated JavaScript execution**, and no Windows workflow success is claimed until independently returned.

## One frozen original word-direction plaintext probe

The full original-source SFT now also performs one **direct binary readout** from the 15 ink-selected body frames without varying key, phase or direction. For each consecutive printed two-word pair, emit 1 if its **first** word is longer, 0 if its **second** is longer, and no bit if equal. Reset at the already-selected physical body frame boundary and interpret the bit sequence as complete MSB-first eight-bit bytes. Discard trailing partial bytes. This is a literal human-executable version of the word/number/direction clue, not yet a signed instruction selecting that code or a cipher.

| Ink body | Bits | Exact source MSB-byte hex prefix (at most 12 bytes) |
| --- | ---: | --- |
| 0 | 63 | DB C3 61 9D 7A 7A 6F |
| 1 | 10 | 21 |
| 2 | 67 | AB E9 73 21 04 C0 17 29 |
| 3 | 31 | E4 18 6E |
| 4 | 164 | 55 E7 B7 C6 4A 4C 17 C3 15 E8 C2 44 |
| 5 | 183 | 65 8A 8B 93 AF 25 FF 1D BC 22 F5 28 |
| 6 | 98 | 2A 33 E6 C6 38 36 51 28 D8 F9 A8 2F |
| 7 | 134 | 11 28 24 DF CE 08 23 8A CF F5 83 F5 |
| 8 | 10 | 2C |
| 9 | 78 | 33 FE B5 05 71 80 F2 BC 6E |
| 10 | 58 | E5 59 F2 F8 E8 8F CB |
| 11 | 16 | 7F 58 |
| 12 | 12 | 65 |
| 13 | 234 | 5D C7 05 2A F2 E0 BD 68 FB 74 3D 85 |
| 14 | 80 | 30 D2 E3 A3 36 1A 1C 54 31 2E |

None begins with a coherent ASCII command or the standard PDF, ZIP, GZIP, PNG or PGP ASCII-file prefix. In particular, the fixed original first body starts DB C3 61 9D, without overt plaintext. 

**Independent GP29-native typed readout from the same frozen direction bits:** group five MSB-first printed bits per GP29 index within each of the 15 ink-selected frames. A plaintext GP29 five-bit encoding admits only 0–28; values **29, 30 and 31 are forbidden** regardless of English language model or word boundaries. The untouched original yields **17 forbidden out of 241 complete five-bit values**. Under an independent uniform five-bit comparator null the expectation is **22.59375** and the exact binomial lower-tail probability of 17 or fewer is **0.12795122**, so the observed invalid-digit rate is ordinary. More decisively, **a plain unencrypted GP29 five-bit direct side-channel message is impossible under this frozen frame/order/rune alphabet** because even one value 29–31 is unrepresentable. The original first-frame decoded prefix under this direct rule is **IA-S-U-OE-O-W-J-Y-S-N-D-AE** and already fails meaningful GP prose; the next section begins R-G and the third NG-S-L-D-G-H-H-R-A-F-J-E-E. The full 15-frame output and forbidden locations are emitted by the same SFT. This rules out only fixed unkeyed direct five-bit GP29 text; it does not exclude encrypted or differently formatted bits.
**Direct word-pair-to-MSB-byte output is therefore a bounded negative**, while these same source-derived bits could in principle carry encrypted key material if a separate authored cipher consumer were discovered. No alternate bit polarity, byte alignment or dictionary postselection was tried.

**Alternative author-native number typing, same frozen body parser:** the original Gematria Primus chart prints prime numbers for each of the 29 runes, so we also tried **one** direct binary read of two neighboring complete **word GP-prime sums** (larger first=1, smaller first=0, equal omitted), with identical frame starts and fixed MSB-first 5-bit GP29 or 8-bit ASCII packing. This has **1,444 comparison bits and 283 complete five-bit values; 25 are forbidden GP29 digits 29–31**. The first body begins hex **CD 7C 13 02 AF 3E 47 E9** and its first GP29 string begins **AE-NG-[30]-U-G-F**, with an illegal 30 already at the third digit. None of the 15 original body heads yields a clear ASCII command or full valid GP29 instruction. This simple prime-sum interpretation is also a bounded **direct plaintext negative**, not a claim that numbers must mean lengths. It is distinct from the previously rejected prime-sum *key-pointer* movement (#1193/#1329). No key, phase or symbol-order tuning was attempted.

## Research decision and closest plaintext route

The original physical clues make the 15-block reset family a clearer human solve-path hypothesis than the earlier purely capacity-derived omission of two marks. Likewise a single binary comparison of adjacent printed word lengths is a more plausible human-readable side channel than a multi-thousand-position arbitrary permutation. The first-party 2016 line “their numbers are the direction” is compatible with the concept of binary word-number direction, although it does not define *length* or *pair*. Both are hypotheses, not signed commands.

The missing action is exact and falsifiable: authenticate a source operation that selects these word pairs, determines a GP29 sender ranking, and specifies its arithmetic carry/seed/reset. Freeze that operation on an original unsolved section and demand coherent unknown plaintext with a held-out independent chapter and full unchanged forward replay. Without it, changing rank conventions or word-pair bit polarity to fit language is pure postselection. In particular, the **random-looking original candidate outputs are a negative result for the unkeyed canonical rank**, regardless of complete original replay.

Earlier global/page-conditioned singleton-gap mismatch was already established by **closed #723**; a further rubric-conditioned uniform-spacing mismatch is a calibration for this test only, not a novel independent clue. This report does not promote a recovered plaintext, key, actual cipher, or LP2 destination. **All 56 unknown LP2 pages remain unsolved.**
