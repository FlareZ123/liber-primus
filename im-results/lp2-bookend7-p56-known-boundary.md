# Original LP2 seven-rune bookend crossing into independently solved p56

**Status, updated 14 November 2026:** Exact source-physical ciphertext alignment, with a separately calibrated descriptive rarity experiment. This constrains a possible human-visible alignment mechanism but has **not** recovered unknown LP2 plaintext, a key, or an authenticated cipher reset.

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

## Same-word-inventory controls clarify the rarity

The [separate exact-word shuffle SFT](../sims/lp2_bookend_wordpair_layout_null_sft.cjs) reconstructs all **2,896** original printed unknown-cipher words, verifies that `DJU BEI` at word indices **1,462** (p27) and **2,894** (p55) is the **only repeated ordered adjacent two-word type**, and fixes the complete word-length tape. It then shuffles the *existing ciphertext words themselves*, preserving every ciphertext word and its rune count, under two differing source-consistent exchangeability assumptions. This removes the seven-rune Markov null's unsupported assumption that the original word inventory consists of independently generated uniform letters.

| Conditioning of word inventory | 30,000 shuffles with any repeated ordered pair of **six or more runes** | Exact repeated `DJU BEI` pair in both locations |
| --- | ---: | ---: |
| Word-length and **nine original visual chapters** | **4/30,000 (0.0133%)** | **3/30,000** |
| Word-length and **individual original physical page** | **754/30,000 (2.5133%)** | **379/30,000 (1.2633%)** |

Both models preserve the original 12,956 runes, the printed word lengths, and every exact word identity; the difference lies in whether the actual page-specific word inventory is treated as given. The page-conditioned result is much less remarkable because **p55 contains only two three-rune word slots**, and they are exactly `DJU` and `BEI`; their order is a coin toss once those page assignments are held fixed. In p27, its thirteen three-rune slots admit four ordered adjacent 3+3 sites. The exact probability for this specifically named pair under those fixed page inventories is `(4/(13·12)) × (1/2) = 0.0128205`. Under chapter-conditioned inventories, the corresponding probability is `(25/(83·82)) × (1/(14·13)) = 0.00002018`. These exact fixed-pair calculations do **not** adjust for selection among other repeated word identities.

The strong chapter-level effect localizes the surprise to the **cross-page co-assignment of two repeated word identities** and the terminal placement, rather than a demonstrably unusual within-page ordering. A source-derived operation tying p27 and p55 together could make that evidence actionable; neither control proves that the author planted a key. The tested probabilities are conditional on different original-data features, and none should be presented as a universal probability of intentional design.

An independent public solver project already called out the same seven-gram crossing into solved material in its [Round 44 synthesis, 9–11 November 2026](https://github.com/Dukotah/cicada3301/blob/master/liber-primus/analysis/round44/SYNTHESIS.md). This repository's value-added is an exact independent full-source original-index reproducer and calibrated anti-doublet null; it does not claim novelty of the substring.

## Exact p56 prime-totient restart at the repeated ciphertext (14 November 2026)

The seven-rune match gives an unusually specific **conditional cipher-transfer question**: does original p27 resume the independently solved p56 prime-totient running-key rule at the same ciphertext `AE`, or at the first symbol of the seven-rune shared segment? Both anchors are fixed before decryption by source coordinates: p27:34 is the same `AE` as p56:0, and p27:28 starts the `DJU-BEI-AE` match. The operation is exactly p56's established GP29 decryption, `P=C−(prime[k]−1) mod29`, with first key 2−1=1, no secret phase, no fitted keyword and no page-local variants. Every original ciphertext F is exhaustively assigned either a bypassed **literal plaintext F** without key consumption, or a shifted non-F plaintext; all other cipher runes must decode to non-F. These are necessary conditions independent of English scoring.

[The source-locked single-file test](../sims/lp2_bookend7_prime_restart_sft.cjs) uses canonical `resources/liber-primus/lp2-corpus.json`, asserts the source's seven-rune equality and the exact p56 opening A, and performs dynamic programming over **all** legal bypass clocks. The authentic original p56 full 85-rune cipher survives, with five possible final consumed-key counts. An independently clear original p57 95-rune passage, encrypted under the same exact rule, also survives with its true key-clock count. Thus the exclusion is not caused by accidentally treating every ciphertext F as a literal F or by a broken key generator.

| Frozen p27 key restart | Unmodified original segment | First position at which **every** legal F clock fails | Outcome |
| --- | --- | --- | --- |
| First repeated `D`, p27:28 | p27:28–233, 206 runes | relative 129 = original p27:157 | No valid inverse over whole segment |
| Repeated `AE`, p27:34 = p56:0 | p27:34–233, 200 runes | relative 56 = original p27:90 | No valid inverse over whole segment |

**Decision:** neither natural no-phase, fresh-start transfer can continue p56's prime-totient/F clock across the original p27 passage. This is an **exact finite impossibility for those two keyed restarts**, before any linguistic scoring. It says nothing about a separately authorized key, a shifted prime start, non-prime operation, earlier nonzero clock state, or the repeated segment serving as a book-code address. No unknown plaintext, key or destination is recovered. The seven-symbol coincidence still stands as an original-cipher navigation clue, but it does not on its own tell the solver to reuse the known p56 cipher on p27.

## Research decision

Treat the exact source crossing as a **free, sealed boundary constraint** on any future p27/p55/p56 shared-state, seven-column or literal repeated-marker proposal. The two immediately suggested p56 prime-totient restarts are now excluded under exhaustive original F-bypass clocks above. A candidate that selectively explains the six unknown same runes and p56's independently solved first rune, predicts a further withheld ciphertext/plaintext position, and inverses the complete original text would be meaningful. Reinterpreting the seven characters as a self-key, launching arbitrary phase searches, or treating coincidental modulo-seven structure as a historical instruction would add little.

CI: [Original-source seven-rune gate run 43295344134](https://github.com/FlareZ123/liber-primus/actions/runs/43295344134) and [original-word-inventory conditional gate run 43300412855](https://github.com/FlareZ123/liber-primus/actions/runs/43300412855), Node 22, both passing.
