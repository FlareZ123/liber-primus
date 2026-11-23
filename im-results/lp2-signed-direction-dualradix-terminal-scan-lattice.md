# DIRECTION 2×2 table equality: archive filename-offset obstruction to a 2014 page selector

**23 November 2026, Agent36. Classification: exact source-word/table arithmetic, followed by an exact negative first-party filename gate. No genuine new LP2 plaintext, original page selector, author-selected key, encryption opcode, or puzzle destination.** This consolidated record supersedes its initial claim that the observed number72 is an original 2014 `72.jpg` filename. It is **not**: the actual contemporaneous LP2 index names only `0.jpg` through `57.jpg`.

## Genuine independent inputs

The preserved [Cicada-signed 2016 source](../resources/historical/cicada2016-4gq25-outguess.asc) states that the book's words are the map and their numbers the direction. Its **30th alphabetic word** (starting from HELLO) is **DIRECTION**; this is also the sixth member of the previously independently inventoried signed register of words immediately following THE: `PATH DEVOTED WAY MAP ROAD DIRECTION`.

The original 29-rune GP chart has a historical IA/IO ligature (GP index27) that permits two different, deterministic native-rune readings of this word:

| Reading | Original GP indices | GP0 sum | Original p49–51 table cell |
| --- | --- | ---: | --- |
| Literal separate `I` + `O` | `23,10,4,18,5,16,10,3,9` | **98** | `p50[98] = 1C` |
| Treat `IO` as one GP27 IA/IO rune | `23,10,4,18,5,16,27,9` | **112** | `p50[112] = 1D` |

The original printed numerical panel has 256 two-character tokens. Under its two **research-documented** readings, conventional radix60 and the competing radix59 lacking lowercase `f`, the four exact table numbers are:

| GP spelling | Base59 table value | Base60 table value |
| --- | ---: | ---: |
| Literal I+O, cell98=`1C` | **71** | **72** |
| IA/IO rune, cell112=`1D` | **72** | **73** |

The cross-convention diagonals both equal **72**. The spelling/radix choices were not instructed by Cicada; this is a conditional numerical relation. Across all **43** alphabetic signed source words, only `MEANING` and `DIRECTION` change GP0 when both historical IA/IO and NG/ING ligature rules are enabled, and only DIRECTION satisfies the stated cross-convention equality. The relation itself can be reproduced exactly without text fitting or cryptographic key search.

## Decisive contemporaneous filename obstruction

**The [actual original 2014 seventh-onion HTML index](../resources/cicada2014-onion7-index.html) contains precisely 58 links, naming `0.jpg`, `1.jpg`, ... `57.jpg`, in sequence.** It does **not** contain `71.jpg`, `72.jpg`, or `73.jpg`. This fact is independently reproduced and asserted against the source HTML by the [new standalone original-source SFT](../sims/lp2_signed_direction_dualradix_terminal_scans_sft.cjs).

The repository's convenience JPEG corpus instead combines 17 earlier LP1 image files with the 58 LP2 files, renaming them `00.jpg` through `74.jpg`: local combined-archive `72.jpg` happens to be physical second-release p55, local `71.jpg` is p54 and local `73.jpg` is p56. **That 17-image filename offset is an archival convention, not an available 2014 player instruction.** Decoding a signed 2016 word to a later convenience filename would be an anachronistic solve path unless a separate authentic artifact supplies exactly the missing offset. None is known.

Therefore the initially tempting relation `DIRECTION -> 72.jpg -> p55` **fails as a 2014-authored filename selector**. It must be withdrawn. The historical owner could not have followed that literal link in the original delivery.

There is a separate **hypothetical** 2014-source route if numbers greater than 57 are interpreted modulo the 58 original pages: `71,72,72,73 mod58 = 13,14,14,15`, converging on physical **p14**. The page count58 is source-visible and modular arithmetic is historically available. But neither the signed phrase nor printed table says to reduce modulo58 after a lookup, and p14 has no selected reversible readout. This is an exploratory rival to the archive-specific p55 coincidence, **not** a new established page selector.

## Same-source token-order control and its limit

To characterize the bare numerical pairing, keep the entire original printed multiset of 256 table tokens and its two candidate radix alphabets fixed, then enumerate every ordered pair of two distinct table cells. Across **65,280** possible pairs:

- **249** yield equality `base60(token[first]) = base59(token[second])`.
- **40** have an equal value in the *actual contemporary page range* `0..57`.
- **56** have an equal value in the *later merged-archive range* `17..74`.
- **8** give equal value72, which is **outside the original 2014 page range**.

For the exact signed word's GP difference **112−98=14**, the 242 admissible ordered offset-14 pairs contain only two numerical matches: `98→112:1C→1D→72` and `135→149:2p→2s→171`. Their rarity under this toy token-order benchmark does **not** fix the original 2014 filename mismatch. The choice to inspect radix/spelling changes and later archive indices was made through exploratory research, so no observed rate is an authorial-intent p-value.

## Decision and reproducibility

**Retain** the exact DIRECTION `98→112`, original tokens `1C→1D`, and resulting 2×2 numeric values `71,72,72,73`. The diagram may be worth revisiting only if a *first-party* artifact provides an independently selected receiver for number72, or a historically valid reduction or instruction that predicts unknown plaintext.

**Retire** the claim that the number72 selects p55 via the local `72.jpg` archive filename. The authentic original 2014 index rules that out as a direct human solve path. Do not spend additional compute on p55 decoding based on this link, nor infer a novel key or destination from the merged archive offset. Other genuinely source-selected p55 routes exist separately and were already tested. The signed EPIPHANY/DEVOTED→p32 source/table pointer is independent of this failed filename inference.

**Reproducer:** [`sims/lp2_signed_direction_dualradix_terminal_scans_sft.cjs`](../sims/lp2_signed_direction_dualradix_terminal_scans_sft.cjs) reads the preserved signed ASC, original table and GP29 corpus, and **the first-party 0..57 HTML index**. It enumerates the 43 signed words, both rune interpretations, both radices, actual filename ranges and complete null census. It reports the archival convention separately from the original source to prevent future false promotion. [Manual Windows Node22 workflow](../.github/workflows/agent36-direction-dualradix-terminal-scans.yml).
