# Two solved p57 clause words partially match two original unknown-page openings

**23 November 2026, Agent 1. Classification:** new source-level navigation/crib *hypothesis*, not a decipherment. The matches below are literal original-cipher facts. The empirical tail is **conditional on a post-observation, selectively chosen prefix family**; it is not a discovery-wide p-value and does not establish Cicada authorship or intent. No unknown plaintext, key, algorithm or continuation has been recovered.

## A short, source-defined candidate

The authentic clear GP29 p57 **PARABLE** contains the sequence “WE MUST **SHED** OUR OWN **CIRCUMFERENCES**”. Look for **three-rune or four-rune prefixes** of *every* complete p57 word at the starts of the original 55 rune-bearing unknown physical pages p0–55, skipping the original p50 runeless table. Include the visible p57 PARABLE title when defining words.

Exactly two pages produce a match among the 15 unique p57 three-rune word prefixes; only one also matches one of the 12 unique four-rune prefixes:

| Unknown original page | Source opening, GP | Solved p57 word | Strict literal limitation |
|---|---|---|---|
| p0 | `S H E O ...` | `S H E D` (SHED), first three only | Fourth original rune **O**, while p57's fourth rune is **D** |
| p12 | `C I - R C W ...` | `C I R C U M ...` (CIRCUMFERENCES), first four only | **CI-RCW** straddles a *printed original word boundary*; fifth original rune **W**, while p57's fifth rune is **U** |

The exact three-rune `S H E` occurs only once in the *entire* 12,956-rune unknown ciphertext, at **p0 offset0**. The exact four-rune `C I R C` likewise occurs once, at **p12 offset0**. The p57 clause's two outer conceptual words `SHED` and `CIRCUMFERENCES` therefore select the two page openings by recognizable partial spellings. Their position at the starts of the pages, rather than at arbitrary internal offsets, is the only quantitative concentration being tested.

**Important original-layout failure:** p12 prints `CI-RCW`. A rule that preserves original word boundaries **cannot** treat the four runes as an intact source word `CIRC`, even though they are contiguous after glyph-only normalization. This distinction precludes any direct “already visible plaintext word” claim.

## Typed cross-round lookups using the original 2014 source table

A second, *conditionally defined* link reuses **the existing proposed table receiver**, rather than changing a ciphertext to make words appear. The original p49–51 numeric register has 256 two-character cells; original base60 alphabet "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwx" contains lowercase **f** at alphabet position **41**. The historically hypothesized "SHED" operation excludes this letter to yield radix59. This interpretation has not been authored as a command to decode LP2.

| Original opening | Canonical GP0 sum | Original p50 cell at that zero-based address | Base59 result | Independently attested referent |
|---|---:|---|---:|---|
| p0 \`SHE\` | **41** | cell41 \`1O\` | **83** | \`EMERGE\`, a complete solved p57 word with GP0=83 |
| p12 \`CIRC\` | **24** | cell24 \`1n\` | **107** | \`107.jpg\`, named in the original 2014 Stage10 post-magic-square response |

The preserved 2014 Stage10 response in \`resources/external/2014-stage10-post-square-response.html\` **literally lists only \`107.jpg\`, \`167.jpg\` and \`229.jpg\`**. The original LP1 page corresponding to image **107.jpg** starts the first-release koan and includes exactly the earlier solved line **“THE I IS THE VOICE OF THE CIRCUMFERENCE”**, in \`resources/liber-primus/lp1-plaintext-reference.txt\` section14. Thus the p12 prefix chosen by solved p57 **CIRCUMFERENCES** reaches a historical page that directly discusses the **circumference**, rather than an arbitrary unrelated digit. The cell output **107** occurs exactly once in all 256 tokens under the f-shed base59 reading.

A finite multiple-target check grants **all 20 solved p57 words**, their first **3**, first **4**, and **complete** GP0 word sums as original table addresses (where legal), and **both** base60/base59 interpretations for every addressed token. Across that whole frozen family, exactly **one hit** reaches **any** of the three original Stage10 source image filenames: the **four-rune CIRC** prefix of **CIRCUMFERENCES**, GP0 address24, base59 output107. The same check requires the p0 \`SHE\` address to recover clear p57 **EMERGE** independently, though that second target is word-selected. All statements are asserted against immutable committed source inputs in the common SFT.

**Countercontrol against the wider lookup grammar:** ignore the special p57 prefix-spelling coincidence and give **all 55 original physical page openings** their first3 and first4 rune GP0 sums as table addresses, with both radices. Among **220** resulting page-opening/radix/lookups, **34** point either to some complete p57 word sum or to a Stage10 filename, and **six** point to historical Stage10 filenames (across five original pages). Thus **p12→107 is one of several numerical page-start pointers under this flexible grammar**; its only special feature is the independent same-page literal `CIRC`/solved-source match and the 107.jpg koan's circumference content. The numeric pointer count by itself is not compelling or an independent decryption discriminator. The SFT now asserts both broad-count controls to prevent future narrative exaggeration.

This cross-round path is **retrospectively selected** from many plausible numeric grammars. It simultaneously assumes prefix extraction, deleting word separators at p12, GP0 addition, zero-based table indexing, f-excluded radix, and interpreting a resulting integer as a historical filename. The coincidence **raises a better-grounded question about authorial navigation** but does not supply a prescribed decipherment operator or even specify that 107.jpg should become a key. Existing direct LP1 solved-text and printed-rune running-key tests already failed to uncover new LP2 prose in their broad allowed-offset family; see \`im-results/lp2-lp1-solved-plaintext-direct-runningkey-original-gate.md\`. Do not simply repeat them with another guessed offset.

### One executable source-selected receiver and holdout

The new p12→107.jpg path makes a concrete direct cipher test cheaper than speculative additional addressing: treat the **entire already-solved LP1 107.jpg / physical p14 koan** (315 GP29 runes) or its unique quoted **THE I IS THE VOICE OF THE CIRCUMFERENCE** sentence (28 GP29 runes) as a starting-at-zero native GP29 additive key. These two source-text operands are selected from **the reached original 107.jpg**, with no fitted key phase or guessed third source. Decode every original rune on **physical p12 (261 runes)** and independently **p13 (272 runes)** with a page-local reset, under both ± original GP29 Vigenere signs. Original punctuation remains a visible interpretation constraint, and exact re-encryption and planted known-English inverse checks pass for every receiver.

| Source-register key | p12 IoC, inverse minus/plus | untouched p13 IoC, minus/plus |
|---|---|---|
| all of 107.jpg p14 koan, 315 runes | **0.03457 / 0.03510** | **0.03381 / 0.03495** |
| quoted circumference line, 28 runes | **0.03442 / 0.03422** | **0.03470 / 0.03427** |

All eight outputs are visibly nonlinguistic in the canonical GP29 alphabet and near the 29-symbol random IoC ~0.03448. The p12 source itself is IoC 0.03395; p13 source 0.03343. The exact full-source inverse therefore **fails** to supply page12 plaintext and fails untouched p13 under these two natural key choices, even though the cross-round navigation coincidence is verified. This is a bounded negative for a particularly short human-plausible decoding step. It does not exclude using 107.jpg as a non-additive key, as a source of a separate operation or as a clue to a different source.

[Deterministic whole-page and quotation SFT](../sims/lp2_p12_107_circumference_native_key_sft.cjs) · [Windows Node22 PASS 45155022653](https://github.com/FlareZ123/liber-primus/actions/runs/45155022653)

## Fixed conditional rotation control

Against the canonical `resources/liber-primus/lp2-corpus.json` and `lp2-transcription.txt`, the standalone SFT asserts all 12,956 original rune positions and every page's original transcription. It parses all20 clear original p57 words and fixes their 15 distinct length-three and 12 distinct length-four prefixes *before* randomization.

Each of **200,000 seeded trials** circularly rotates the complete rune tape of each of the **55 original physical pages independently**, preserving every original page's rune inventory and internal order. This disrupts the special coincidence of source word prefixes *at the original page starts*. A rotate wrap can create one artificial terminal-adjacent triplet; this approximation is small and can be tightened by rejecting offsets in each page's final three glyphs if a future decision hinges on the p-value.

| Event (any p57 words, any original page openings) | Trials satisfying |
|---|---:|
| ≥2 page-opening matches to p57 distinct three-rune word prefixes | **111/200,000** |
| ≥1 page-opening match to p57 distinct four-rune word prefixes | **788/200,000** |
| Both observed thresholds simultaneously | **22/200,000** |

The empirical joint plus-one upper tail is **23/200,001 ≈ 0.000115**. The full number-of-three-prefix-hits distribution is `[192546, 7343, 109, 2]` for 0,1,2,3 matches. The statistic treats every p57 word as a possible source without special scoring of SHED/CIRCUMFERENCES semantics.

**Calibration against other solved source passages:** the same page openings were independently compared to the checked-in nine-record solved GP29 plaintext corpus `resources/external/relikd-solved-gp29-native-v1.json`. Across **34 consecutive, nonoverlapping 20-word blocks**, only the p57 block has ≥2 three-rune opening matches. Two earlier solved blocks each have one four-rune match, both associated with **CIRCUMFERENCE**, which also appears explicitly in earlier solved philosophical text. This is a small descriptive comparison, not a holdout correction for choosing this route among many research ideas.

## Intended-path hypothesis versus actual decryption

One possible human observation is that the **first and last** semantic words of the p57 phrase `SHED OUR OWN CIRCUMFERENCES` appear, partly, at the openings of the unknown p0 and p12 streams. This could point a solver to page starts or suggest removing original word boundaries. The author would still have to specify exactly what to read, which symbols to change, what key or operation to use, and what independent output follows.

The **first unrecovered rune after each matched prefix already disagrees** with straightforward literal plaintext extension; p12's separator complicates the word analogy. There is no justified inference that p0 or p12 begins SHED/CIRCUMFERENCES as plaintext, and no reusable deciphering mechanism has been recovered. Many alternative clues have been examined in this project, so the conditional tail alone must not justify a dependent cipher hunt or promotion to `results/README.md`.

**Next discriminating action:** obtain independent first-party evidence selecting page-opening prefixes as a navigation or typed cryptographic operand, then freeze a prediction on an *untouched* different page or an explicit plaintext fragment **before** investigating matches. In its absence leave this as a source-level curiosity, with no claimed effect on the canonical unsolved status.

**Reproduction:** [Windows-compatible deterministic CommonJS SFT](../sims/lp2_p57_pageopening_unique_prefix_sft.cjs), [original-opening PASS 45150579489](https://github.com/FlareZ123/liber-primus/actions/runs/45150579489); [full original Stage10 and koan-crosscheck PASS 45155184503](https://github.com/FlareZ123/liber-primus/actions/runs/45155184503). Original source scans: `17.jpg` (p0), `29.jpg` (p12), and clear `74.jpg` (p57).
