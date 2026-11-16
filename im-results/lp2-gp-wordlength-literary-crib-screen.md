# LP2 source-crib search through intact printed word lengths

**Status:** finite negative screen and reusable search method. No unknown LP2 plaintext or cipher key recovered. This work asks whether an identifiable historical text could supply a *plaintext crib* without requiring any conjectured keystream. It is independent of the additive, PRNG, red-ink and table256 key hypotheses.

## Source-visible premise

The printed 2,896 whole LP2 p0–55 rune words preserve **12,956** rune values, and the historical known-page cipher preserves word lengths even with literal F transparency. A word-length passage is therefore a possible source-independent clue if the unknown manuscript kept genuine plaintext word breaks. This premise is unproved on unknown pages: the author might have altered boundaries or generated original prose rather than copying an available source.

Input is `resources/liber-primus/lp2-transcription.txt`, parsed by the repository's canonical `-.'` delimiters while retaining words across line/page breaks. Normalized English source words use the same GP-native `QU→CW, V→U, K→C, Z→S` and greedy `ING, TH, EO, NG, OE, AE, IA, EA, IO` contractions already used in other local source-native controls. The suffix automaton searches the entire authentic unknown word-length sequence with no source offset or chapter fitted. Project Gutenberg front and end licensing blocks are excluded; other edition front matter remains possible.

## Exact full-text scan

All positions and counts below are exact for the pinned GitHub blobs, on the defined spelling and punctuation treatment. Maximum is the longest consecutive match in **GP29 rune word lengths**, not decrypted rune values.

| Text (source file) | Git blob SHA | Body words | Maximum consecutive match |
|---|---|---:|---:|
| Repository Shakespeare 300k-character control, `resources/control/shakespeare_first300k.txt` | `94c677ad9dd50771c6670e0c4e4dad9052b46d85` | 55,407 | 9 |
| Repository Gibran *The Prophet*, `resources/control/gibran_prophet_58585.txt` | `df260a07d56bf5998d40a6360b6132c35c252d10` | 12,679 | 9 |
| Repository Emerson *Essays*, `resources/control/emerson_essays_2944.txt` | `a92be8ba5b3511a003a22ba31523c14397aaa83a` | 74,943 | 9 |
| [Walden 205.txt](https://github.com/GITenberg/Walden-and-On-The-Duty-Of-Civil-Disobedience_205/blob/master/205.txt) | `ef740fbc0f9bf70ce68534ff40f151f597ca580b` | 117,162 | 9 |
| [Paradise Lost 26.txt](https://github.com/GITenberg/Paradise-Lost_26/blob/master/26.txt) | `e792b429a8533f2696136af342bdaee87698e035` | 81,148 | 10 |
| [Blake's *Marriage of Heaven and Hell* 45315.txt](https://github.com/GITenberg/The-Marriage-of-Heaven-and-Hell_45315/blob/master/45315.txt) | `44149cc32fa8a46501a95059283526a8a3429705` | 4,758 | 8 (edition front matter) |
| [*The Mabinogion* 5160-0.txt](https://github.com/GITenberg/The-Mabinogion_5160/blob/master/5160-0.txt) | `fd9db1c7bc90e11d41433b7cc2ec3b7e1ccb0cd7` | 108,227 | 11 |
| [Blake's *Songs of Innocence and of Experience* 1934-0.txt](https://github.com/GITenberg/Songs-of-Innocence-and-Songs-of-Experience_1934/blob/master/1934-0.txt) | `6d379eb7000a853d7cf2652e84a503ee8323131d` | 5,665 | 8 |

The longest candidate is *The Mabinogion* text **“one but the man who would fight with him Lady said”**, matching LP2 whole-word indices **1654–1664** (zero-based). It matches only word lengths. No source selector or cipher mechanism identifies those words as genuine unknown plaintext.

## Avoid the coincidence trap

For the 108,227-word Gutenberg-body *Mabinogion* source, the LP2 original produces **five** exact 10-length windows, **one** 11-length window and **zero** 12-length windows. A fixed-seed directional null sampled **400** uninterrupted 2,896-word windows from the same Shakespeare, Gibran and Emerson control texts (cycling sources, xorshift32 seed `0xBAD319`; source word-length windows scored against the same Mabinogion 10/11/12-gram sets). At least one 11-gram match appeared in **344/400** literary controls, conditional empirical upper-tail `(344+1)/(400+1)=0.86035`. The original's single 11-gram match is not distinctive under this null. The actual null mean was **2.4375** 11-gram windows per sample, and mean **10.475** ten-gram windows, both greater than the original. These nulls are descriptive rather than a global test of every historical text.

**Decision:** The eight texts supply no credible original plaintext crib by exact contiguous length matching. A new period-authenticated book or independently constrained source paragraph can be screened efficiently with the same operation. Do not promote isolated 8–11-word matches to recovered plaintext, or revive them through tuned alternate spelling tables without an external clue.

## Reproduction and next action

`sims/lp2_wordlength_source_crib_finder_sft.cjs` is read-only Node22 CommonJS. Its default three in-repository source controls are asserted at exact maxima 9/9/9 and were executed against the original GitHub-file contents with the same code and standard-library adapters on 16 November 2026. Additional locally acquired source text files can be supplied as arguments. The five external Gutenberg books above were scanned directly from the pinned GitHub blobs using the same algorithm. Its strongest future use is as a **pre-registered crib-discovery tool** against an actually named 2012–14 text or archival recovered page, with exact source body, spelling and window length fixed before inspecting the ciphertext.
