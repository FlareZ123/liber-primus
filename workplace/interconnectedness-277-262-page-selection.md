# 2014 Interconnectedness time scales as selectors for LP2 pages 0 and 29

**Status (Agent 1, 11 November 2026): historical source-to-page selection hypothesis with its simplest shared-clock original-ciphertext inverse now conditionally excluded; no plaintext, key, or authenticated author intent recovered.** This is a proposed *human solve path* from archived music to specific physical pages. Treat any statistical confidence in the link cautiously: the page lengths and published audio timings were noticed retrospectively in a large research search.

## Exact original printed page data

The repository's canonical `resources/liber-primus/lp2-corpus.json` has 55 rune-bearing unsolved LP2 physical pages, 12,956 runes and 2,896 complete rune words. Reading each page's `indices.length` directly, without line/word joining or excluding any visible rune:

- **Physical p0** (archived original `17.jpg`): **262** runes.
- **Physical p29** (`46.jpg`): **277** runes, the **maximum** length of any unsolved rune-bearing page.
- Each value occurs **once** among all 55 original page lengths. The closest to 277 outside p29 are p43 and p47, both 274. The closest to 262 outside p0 are p4 (261) and p5/p10 (263).

Both numbers occur independently in the archived **2014 Cicada Interconnectedness MP3** at the precision of completed seconds:

1. The decoded audio lasts **approximately 277.159 seconds** (the source's title `INTERCONNECTEDNESS` has established GP-prime sum **772**, whose digit reverse is **277**).
2. Its original opening waveform is repeated near the end, with the previously published sample-aligned displacement **11,559,607 / 44,100 = approximately 262.122608 seconds**.

These audio measurements and the 772 ↔ 277 observation were published in [SECRA's original-artifact audio report, 15 October 2026](https://secra.tech/research/liber-primus-strongest-findings/), specifically its section “The MP3 repeats its own noise.” The 277-second duration is **not exactly 277.000 seconds**; the 262-second alignment is **not exactly 262.000 seconds**. Both require flooring or taking whole seconds, an analyst choice that must not be omitted. The file must not be confused with the distinct **2013** `AUDIO/761.MP3` artifact and its pre-LP2 `PARABLE` metadata. The 2014 MP3 is also archived under `media/audio/index.mp3` in pinned historical repository [krisyotam/cicada3301, commit 76d3ee8](https://github.com/krisyotam/cicada3301/tree/76d3ee8c762f60025822c8c05edbf31351636469/media/audio).

## How the route could advance an original-cipher solution

Under a **specific, source-preferred interpretation**, the full recording's whole-second duration chooses **p29** and the start/end audio-echo displacement chooses the book's initial **p0**. The latter is the first ciphertext page, not a fitted p0 location. The former is already singled out by an independent original-source arithmetic observation in [the p29 marked-quadratic report](../im-results/lp2-page29-marked-quadratic-crosslink.md): p29's entire 277-symbol polynomial and the printed 256-byte grid share exactly the double-root `(X−24)^2` extracted from red p39 indices [27,5,15]. That fact was discovered without using the 2014 MP3 and is not an audio-derived cipher.

This gives a finite intended-route hypothesis:

1. Notice the original audio's 2014-title/whole-second **277** reversal and its **262**-second repeated-noise displacement.
2. Match both source numbers to **unique** LP2 page rune counts, yielding **p29 and p0** with no arbitrary page parameter.
3. Seek an independently motivated **lossless** relation between their rune sequences, the marked p39 quadratic and/or the page-50 table. A candidate must yield real original ciphertext plaintext or an unambiguous next key, not just an attractive numerical equality.

An alternative hypothesis is one *audio second per GP rune*, on 277-rune p29 and 262-rune p0. This remains only a **test-design proposal**, because no known original instruction chooses PCM versus compressed bits, amplitude versus spectrum, an extractor/quantizer, sign, offset or clock. Do not manufacture a successful cipher by optimizing those freedoms. The repeated waveform is reportedly equal only after gain adjustment; this does **not** prove an exactly repeating rune-key sequence under arbitrary extraction.

## Completed gate for the simplest 262-rune audio tape

The first direct cryptanalytic test assumes that p0 and p29 start with the **same arbitrary additive GP29 tape** at their first symbol. Every possible secret key then cancels from the full 262-symbol aligned difference sequence. [The completed all-secret original-source inversion gate](../im-results/interconnectedness-262-277-sameclock-invariant.md) scores that actual difference sequence below all **12,000** English-GP and **10,000** Latin-GP matched native reference pairs under independently trained unigram and first-order difference models. Both synthetic source-planted common-key controls recover the **262/262** original plaintext differences. This is a conditional rejection of a directly shared clock under the two tested prose registers. It leaves the 262/277 source-to-page selector, other cipher operations, separate keys and non-GP encodings open.

## Decision and boundaries

The exact unique length correspondences are source-corpus facts; the original audio timing and title reversal have separate published support. Their intentional relationship is **unproven**, with no familywise search calibration. Do not promote this route to `results/README.md` without an actual cryptographic prediction. Its value is that it nominates p0/p29 as a small *historically constrained target pair* for a new reversible cipher design rather than another free scan across every page and key.

No original unknown LP2 runes were deciphered by this observation.
