# Exact two-word echo at the last six unsolved LP2 runes

**Classification:** reproducible original-ciphertext structure; candidate deliberate cross-reference, **no plaintext, key, or decoder recovered**. This report is an intermediate clue, not an established cryptographic mechanism.

## Exact observation

The canonical continuous original-LP2 transcription has 12,956 runes in 2,896 words, with 32 words crossing printed page boundaries. Across its 2,895 adjacent word pairs, **exactly one ordered pair occurs twice**:

| Physical page | Source JPEG | Page-local rune offsets (zero-based) | Global word indices (zero-based) | Exact two-word sequence | Printed context |
| --- | --- | --- | --- | --- | --- |
| 27 | 44.jpg | 28–33 | 1462–1463 | `ᛞᛄᚢ-ᛒᛖᛁ` (D-J-U / B-E-I) | second text line, after `ᛒᚠ-`, before `-ᚫᚠ` |
| 55 | 72.jpg | 70–75 | 2894–2895 | `ᛞᛄᚢ-ᛒᛖᛁ` | **last two encrypted words**, after `ᚳᛉ-`, before final period |

The six GP indices are `[23,11,1,17,18,10]` at both source positions. The corresponding raw runes are visually checkable in the two original image regions. The second instance ends at p55's complete 76-rune physical-page text; it is followed by the red-dot terminal mark and the book's printed cicada illustration. Page 27 bears a large red initial and a single insect-wing illustration. The page numbers differ by **28**, half of the 56 currently unsolved physical pages. None of the latter presentation features establishes the intended operation.

The raw transcription's physical page 50 is runeless, so the continuous parser calls p55 its *rune-bearing page index 54*. The supporting SFT uses the repository's established `physicalLP2Page` conversion to avoid a false one-page displacement. It checks the 32 cross-page words rather than treating a printed page turn as a word separator. The displayed punctuation and two-word boundaries are on the actual pages, so this observation does not depend on disputed line/word carries.

## Calibration and competing explanations

This can arise by coincidence. A **30,000-trial source-token conditional null** holds every word-length slot fixed and preserves the exact original multiset of GP words *separately within each word length*. It shuffles words among same-length slots using seeded Fisher–Yates and counts whether any adjacent **ordered** pair is duplicated:

| Statistic | Null repetitions / 30,000 |
| --- | ---: |
| At least one repeated adjacent pair of any total length | 412 |
| At least one repeated pair totaling at least six runes | 5 |
| At least one repeated 3-rune + 3-rune pair | 5 |
| The final two words repeat as an earlier adjacent pair | 0 |

The strongest exact features are the six-rune 3+3 segmentation and the end-of-book occurrence. These are **post-discovery** observations; cherry-picking among many possible motifs inflates apparent significance. The 412/30,000 broader event rate (about 1.37%) is a more conservative reference for an unconstrained scan. Zero terminal echoes in 30,000 null draws is an upper-resolution statement, not a proof of intentionality. This null deliberately preserves the observed word repertoire and individual repeated tokens; it is not a generative model of the unknown historical cipher.

An earlier repeat in p27 might be a deliberate waypoint for the p55 ending. Alternatively, any 29-symbol cipher could occasionally produce the same six runes by chance, and a shared surface phrase need not mean shared plaintext if the keystream/state differs. The illustrations and 28-page separation are candidate human-facing cues, **not independently authenticated selectors**. No reuse of a half-book key, page-index offset, or decryption algorithm follows from this pair alone.

## Simple key-clock check

The first copy starts at global rune offset **6,555**, the terminal copy at **12,950**; separation **6,395 = 5 × 1,279**. Thus an independently established period-five *continuous* additive cipher could assign the same key phase to both copies. However, across the other whole-word repetitions of length at least three there are **17** pairwise repeated-word distances, and only the **two words in this very echo** have distance divisible by five. There is no independent repeated-word support for a general period-five clock. Equally, the copies' page-local offsets 28 and 70 happen to agree modulo 7 and 14; the source does not select a page-reset period-7 or period-14 cipher. These are diagnostic arithmetic facts rather than key evidence.

## Causal next test

Use the source-fixed pair as an **out-of-sample constraint** on an independently proposed, full original-cipher inversion. A credible mechanism should specify whether identical six-rune ciphertext at these two positions is predicted to yield the same plaintext or a different plaintext under its precise independently recovered state/key schedule. If the route proposes a 28-page mirror state or an insect-illustration pointer, it must first identify a separate original clue selecting that transformation; do not infer it solely from this coincidence. Test the frozen model on the rest of the unmodified page contents and require authentic language evidence plus exact forward re-encryption as an implementation invariant.

## Reproduction and inputs

- SFT: [`sims/lp2_terminal_word_pair_echo_sft.cjs`](../sims/lp2_terminal_word_pair_echo_sft.cjs), pure CommonJS, deterministic shuffle seed `0x4e5ea928`, 30,000 trials, no third-party dependencies.
- Source transcript: [`resources/lp2-transcription.txt`](../resources/lp2-transcription.txt), Git blob `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.
- Page/rune map: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json).
- Original images: [`resources/liber-primus/44.jpg`](../resources/liber-primus/44.jpg) and [`72.jpg`](../resources/liber-primus/72.jpg); their bytes come from the repository's original JPEG archive.
- Word parser: [`sims/lp2_word_pages.cjs`](../sims/lp2_word_pages.cjs); page 50 is explicitly omitted from the text-only stream.
