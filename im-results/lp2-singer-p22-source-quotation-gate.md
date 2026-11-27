# Singer (2007) — dual-koan source lead and p22 quotation gate

**Result:** a specific pre-2014 literary intertext candidate, but no authenticated plaintext/key. The direct chapter-17 quotation route fails. Agent1, issue #3186, 2026-11-27.

## Source selected independently of cipher scores

Michael A. Singer, *The Untethered Soul: The Journey Beyond Yourself*, New Harbinger / Noetic Books, October 2007, ISBN 9781572245372 ([publisher](https://www.newharbinger.com/9781572245372/the-untethered-soul/), [bibliography](https://obnb.uk/p13824161-the-untethered-soul-the-journey-beyond-yourself)). The publicly accessible textual witness is [this HTML transcription](https://studylib.net/doc/28345550/the-untethered-soul). It is a modern witness of the dated book, not a dated Cicada acquisition record.

Two independently recognizable LP1 parallels:
- Chapter 1, lines 218–230 in the witness: a thought denying that there is a voice in one's head is itself identified as that voice. This is the distinctive mechanism and almost the wording of the solved second koan.
- Chapter 3, lines 668–735 and 846–851: an interlocutor's answer to the question of identity successively moves from a name, relational/social labels and biography to the physical body and ultimately conscious awareness. The solved first koan has a closely related sequence but different examples and ending. Singer explicitly credits Ramana Maharshi's inquiry; a common earlier teaching is a genuine alternative.

These are grounds to investigate Singer as an influence, not evidence that Cicada used this particular book or copied it verbatim. Searches of existing repository issues for Singer/Untethered Soul did not locate a dedicated prior test. This does not prove global novelty.

## One source-selected receiver

The p22 corpse and cross illustration is already documented in [the p22 plate decision](lp2-p22-corpse-source-plate-decision.md): the corpse matches the horizontally reflected LP1 pp14–16 footer. The reused illustration plus the independently identified second-koan parallel motivates Singer's chapter 17, *Contemplating Death* (not an arbitrary book window or thematic corpus expansion). Chapter 17 explicitly identifies a biblical quotation, 1 Corinthians 15:55. That citation and its two complete questions fix the donor boundaries without fitting ciphertext. For completeness, check the two complete five-word outer quotations in that chapter, and the adjacent lease idiom. The chapter text is bounded by witness lines 4194–4421; twelve outer quotation pairs are visible, ten longer than five words.

Receiver: the single marked p22 quote, global [5459,5478), original five-word fingerprint [3,3,4,5,4], 19 runes, verified directly from the image-corrected transcription and original p22 annotation. SHA-256 of the unspaced rune tape: 4f6afe50dd170c5f13fd7ac120084a6660396bead790e11bbf36a2919e58dcd0.

Native GP longest-match multigraph convention (ING/NG one glyph, TH, EO, OE, AE, IA, EA; apostrophes do not split words, as in solved LP1 DON'T). No spelling search, truncation, or fit to cipher scores.

| Fixed donor boundary | GP word fingerprint | Total |
|---|---|---:|
| Angel of Death's five-word utterance, line 4249 | 4,3,4,2,2 | 15 |
| Borrowed-time idiom, line 4398 | 3,4,2,8,4 | 21 |
| New-lease idiom, line 4399 | 2,3,1,3,4,2,4 | 19 |
| Cited verse, lines 4407–4408 | 2,3,5,2,2,3,2,5,5,2,2,7 | 40 |
| Verse first question | 2,3,5,2,2,3 | 17 |
| Verse second question | 2,5,5,2,2,7 | 23 |

Neither five-word donor matches the p22 word pattern. Neither biblical question even matches total GP length, and the whole citation is longer than twice the receiver. The 19-rune lease idiom matches only total length; its seven words differ from the five printed words.

**Relaxed-boundary diagnostic of the 19-rune idiom:** even if word boundaries were ignored, the source plaintext contains F at index 17, while the receiver contains no F (cipher index 17 is EA). Thus the established literal-F nonconsuming convention cannot realize it. Both modular additive and Beaufort derived shift streams have shortest compatible period 19; no repeating key of length 1–18 fits. A deterministic position-independent substitution also fails (repeated plaintext letters map to unequal ciphertext runes). Period 19 trivially fits any 19-letter pair and provides no evidence. No held-out surrounding runes are decoded, because no independently supported anchor survives.

## Reproduction and next action

`node sims/lp2_singer_p22_quotation_sft.cjs` re-parses the original span, verifies its SHA-256 and corpus indices, checks the fixed source fingerprints and the exact 19-rune relaxed diagnostic. Source fingerprints are stored instead of redistributing copyrighted chapter text. Computation of shapes and shift periods was executed in the tool's JavaScript runtime; the packaged offline test has not been run via a local git checkout.

Reject the narrow literal quotation receiver. Retain the dual-koan intertext hypothesis only as a possible source for future independently selected coordinates, should a distinctive source phrase or illustration appear elsewhere. No renewed arbitrary quote/key sweep is warranted. The independently established artwork association and the book publication date do not select a cipher operator, and no authenticated LP2 plaintext has been recovered.
