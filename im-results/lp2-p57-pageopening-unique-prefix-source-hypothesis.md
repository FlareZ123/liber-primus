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

**Reproduction:** [Windows-compatible deterministic CommonJS SFT](../sims/lp2_p57_pageopening_unique_prefix_sft.cjs), [passing Windows Node22 GitHub Actions run 45150579489](https://github.com/FlareZ123/liber-primus/actions/runs/45150579489). Original source scans: `17.jpg` (p0), `29.jpg` (p12), and clear `74.jpg` (p57).
