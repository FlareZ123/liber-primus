# Original LP2 seven-rune bookend crossing into independently solved p56

**Status, 12 November 2026:** Exact source-physical ciphertext alignment, with a separately calibrated descriptive rarity experiment. This constrains a possible human-visible alignment mechanism but has **not** recovered unknown LP2 plaintext, a key, or an authenticated cipher reset.

## Source observation and why the solved boundary matters

The previously catalogued unique repeated unsolved adjacent word pair `ᛞᛄᚢ ᛒᛖᛁ` (`DJU BEI`) appears at global rune offsets 6,555 and 12,950. Its strongest *complete LP2* extension spans one rune into the separately solved p56 source image:

| Original source run | Physical coordinates | Continuous GP29 offsets | Exact original ciphertext | Printed boundary |
| --- | --- | --- | --- | --- |
| First | p27:28–34 | 6555–6561 | `DJU-BEI-AE` | The third rune-word continues on p27 |
| Second | p55:70–75, then p56:0 | 12950–12956 | `DJU-BEI-AE` | The last unknown chapter ends; p56 starts its own solved title |

The original p56:0 rune is GP index 25 (`AE`), whose established p56 prime-totient inverse recovers GP index 24 (`A`). It is therefore important to compare **original ciphertext to original ciphertext**: comparing p27 unknown ciphertext with p56 **decrypted** text would wrongly erase the seventh-symbol match.

An exact sliding-window census of **all 13,136** source GP29 rune indices, including p0–57 and ignoring purely visual page breaks as the original continuous-rune hypothesis demands, gives **one repeated length-seven window** and **zero length-eight repeats**. The only length-seven pair begins at the two offsets above. On unsolved physical pp0–55 alone (**12,956** runes), no seven-symbol window repeats; the related two overlapping six-symbol windows are consequences of the one quoted six-rune pair.

The start offsets within their respective original pages are **28 and 70**, each divisible by seven, and their physical page difference is **28**, also divisible by seven. An authenticated 2014 Cicada stage used a period-seven columnar transposition, so a contemporary human could reasonably notice the alignment. **There is a decisive phase caveat:** the seventh rune is at p27-local offset **34 ≡ 6 mod 7**, whereas its paired rune starts a new physical p56 page at local **0 ≡ 0 mod 7**. Hence the seven symbols align to one 0–6 phase cycle only if the second run continues across the p55→p56 page boundary. A page-local key restart destroys seventh-position phase equality, and the actual p56 ciphertext is independently solved under a page-local prime-totient key. The 2014 source does **not** specify applying that columnar rule to these LP2 pages, what the key order would be, or why the separately encoded p56 opening must share ciphertext state with p27/p55. A period-seven cipher on its own cannot turn an encrypted repeated fragment into plaintext. The alignments are prospective constraints on a stronger source-derived operation, not independent selection of a decoder.

## Rarity control and limits

The [SFT](../sims/lp2_bookend7_p56_source_sft.cjs) asserts the original seven positions, full-runic sliding-window census, p56 first rune, modulo-seven alignment, and a positive planted seven-run repeat. For a descriptive null, it generates 3,000 separate length-12,957 GP29 strings with first-order anti-doublet transitions: a repeat of the preceding symbol occurs at the observed **86/12,956** rate, and other transitions are uniform over the 28 alternative runes. Under the fixed generator seed `0x33012026`, **10/3,000** strings contain at least one seven-rune repeat anywhere; the mean simulated adjacent-repeat count is **86.156**, versus the source's **86**. The zero-to-one seven-run event is unusual under this simple null.

This is **not** a post-selection-corrected probability for a deliberately authored clue. It ignores higher-order source statistics, original word boundaries, cross-page selection, and the enormous collection of other mathematical and cryptographic patterns agents have considered. The word-pair repeat was previously known; once its six symbols and second occurrence were selected, the extra matching rune is roughly a **1/29** extension under an independent uniform-following-symbol null. The seven-divisibility observations were also recognized after seeing the match. A source-derived prediction or plaintext inverse is required before promoting intentionality.

An independent public solver project already called out the same seven-gram crossing into solved material in its [Round 44 synthesis, 9–11 November 2026](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md). This repository's value-added is an exact independent full-source original-index reproducer and calibrated anti-doublet null; it does not claim novelty of the substring.

## Research decision

Treat the exact source crossing as a **free, sealed boundary constraint** on any future p27/p55/p56 shared-state, seven-column or literal repeated-marker proposal. A candidate that selectively explains the six unknown same runes and p56's independently solved first rune, predicts a further withheld ciphertext/plaintext position, and inverses the complete original text would be meaningful. Reinterpreting the seven characters as a self-key, launching arbitrary phase searches, or treating coincidental modulo-seven structure as a historical instruction would add little.

CI: [Original-source gate run 43295344134](https://github.com/FlareZ123/liber-primus/actions/runs/43295344134), Node 22, passing.
