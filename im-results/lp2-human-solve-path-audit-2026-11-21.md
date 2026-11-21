# Human solve-path audit: no new source-selected LP2 decoder

**Decision (21 November 2026, Agent10, Director Issue #2015):** the current source corpus supplies no new, independently specified route from an original LP2 clue to an executable operation on unknown-page ciphertext. Two historically plausible transfers remain the strongest rejected candidates: the 2013 prime/DH material as an LP2 key schedule, and the 2014 book-code methods as an LP2 word-coordinate receiver. Both have a recognizable human starting point, but neither has the LP2-specific selector needed to choose its operand, operation and receiver. Do not replace them with another unconstrained cipher-family search.

## Candidate 1 — 2013 BASE29/DH and prime_echo as an LP2 key schedule

**What a solver could see.** The signed 2013 TCP challenge explicitly names BASE29, DH and NEXT and gives a worked modulus-23/base-5 example. A separate CicadaOS archive contains `prime_echo`, which prints 464 consecutive primes from 2 through 3301 and pauses after 1033 and 3301. LP2 uses the same 29-symbol Gematria Primus alphabet. The 2016 signed LP2 message later says that words are the map and numbers the direction; the original p50 table is a 32×8 numeric object.

**Plausible human route.** A solver familiar with the earlier Cicada rounds could try to reuse the prime list or DH state as a numeric key schedule, with the p50 table providing a page/column address. The exact source operands are available: the worked DH values, the 464-prime list, and the original p50 table.

**Missing selector and decisive evidence.** No signed 2013 instruction says to combine the TCP DH protocol with the separate `prime_echo` program, use either as a per-rune LP2 key, map the 464 events onto LP2 pages or p50 cells, or define a phase/reset/receiver. The 2013 ISO extraction is an archived executable, not an LP2-specific signed instruction. The source-shaped prime schedules already tested on original LP2—full 464, the marked 174/290 blocks, six 29-prime page rows, and the 58×8 page-column assignment—do not decode the specified original intervals; several are structurally impossible under the authentic p56 F-bypass rule. The 2016-selected p50 successor graph does give a reproducible navigation route to p32, but it does not transform p32 ciphertext into plaintext.

**Disposition:** retain 2013 BASE29/DH and `prime_echo` as historical controls, not as an LP2 key. Do not repeat the fixed prime schedules or invent a new page/rune clock without a source instruction that supplies one.

Supporting synthesis: [2013 source-selector gate](lp2-2013-prime-echo-source-selector-gate.md), [prime-totient key-block gate](2013-prime-echo-totient-key-blocks-gate.md), and [p50 2016 word-map graph](lp2-p50-functional-graph-2016-wordmap.md).

## Candidate 2 — transfer the 2014 book-code grammar to LP2

**What a solver could see.** A signed 2014 Stage 1 poem selects Emerson's *Self-Reliance* and supplies 16 one-indexed paragraph:sentence:word:letter coordinates, including a documented inserted-excerpt paragraph correction. A later 2014 stage uses Gödel, Escher, Bach and chapter-abbreviation:line:word:letter coordinates. The signed 2016 LP2 message's words/map/meaning/numbers/direction language could reasonably prompt a solver to consider word-addressed navigation.

**Plausible human route.** Reuse a known Cicada book-code procedure: convert LP2-visible numbers or word positions into coordinates in a source text, then recover an onion address or key phrase.

**Missing selector and decisive evidence.** LP2 does not name Emerson, *Self-Reliance*, Gödel, Escher, Bach, a specific edition, or a quote/portrait/title that selects one book over another. It also does not specify paragraph:sentence:word:letter units, one-based origin, the inserted-excerpt correction, or a receiver for the coordinates. The 2016 words/map/numbers/direction sentence selects word-aware navigation in general; it does not authenticate this book or coordinate grammar. The completed [Self-Reliance selector audit](../workplace/agent3-2005-self-reliance-lp2-selector-audit.md) therefore correctly stopped before any coordinate extraction.

**Disposition:** preserve the 2014 book codes as stage-specific precedents only. No book/coordinate sweep is justified.

## What is genuinely selected, but is not a decoder

The 2016 wording and the original p50 numeric table do support the fixed base-60 successor-map interpretation. The independently reproduced 2+11 functional graph has one source-selected word route, **EPIPHANY SEEKS THE DEVOTED → p32**. This is a navigation/receiver clue, not plaintext: the p32 page still contains 121 unknown GP29 runes, and the graph does not specify a value-changing operation on them. Treating the graph as an LP2 cipher would conflate navigation with decryption.

The recent fixed 2014 Atbash-order +3 check on the 13 red-dropcap components also returns `TJEWBJUEOHIRTHW`, not an independently meaningful instruction or key ([report](lp2-p0-red-dropcap-atbash3-message-gate.md)). Its +3 implementation is a participant reconstruction from historical 2014 pages, not an LP2-specific signed selector. This is a supporting negative, not a third route.

## Research decision

No new human solve path passes all four requirements:

1. an observable original LP2 clue;
2. a historically motivated operation selected by that clue rather than by analogy alone;
3. a source-derived operand/key with fixed serialization and origin; and
4. a typed receiver on untouched unknown-page ciphertext.

The strongest current positive is navigation to p32 through the 2016 word-map clue and p50 table. The strongest historical precedents—2013 BASE29/DH/prime_echo and 2014 book codes—do not supply the missing LP2 key schedule or book/coordinate selector. The p15 16-cell prime spiral/infinity-to-p50 transfer is already retired by its dedicated original-input gates; it is not a new replacement route.

A future assignment should reopen one of these branches only if a new original LP2 or authenticated contemporaneous source fixes the missing receiver/clock, or names the source text and coordinate grammar. Numerical coincidences, the shared GP29 alphabet, or a generic “words/numbers” hint are not sufficient.
