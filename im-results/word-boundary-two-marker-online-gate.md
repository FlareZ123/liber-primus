# Original-cipher test: separate word-start and interior zero markers

**Evidence class:** reproducible source-conditioned exclusion of one online GP29 architecture. **No unknown LP2 plaintext or historical decryption key recovered.**

## Relation to established work and the actual novelty

This test is a **finer GP-English word-position corroboration** of the **already completed all-841-pair architecture** in [the previous dual-marker word-role source gate](dual-marker-wordrole-source-gate.md), which tested first/middle/end categories, all 841 source-language marker pairs, 3,000 complete-word simulations per candidate and a length-sensitive Latin extension. It does **not** establish a previously untested cipher family or claim priority over that stronger prior investigation. Its independent contribution is the 10 first-position and 45 interior word-length/position/terminal strata in three English literary controls, plus an independent online-key positive control. The Bernoulli-bin calibration below is **weaker than the earlier native whole-word resampling** in its ability to model within-word dependence. Treat the two reports as mutually consistent, and retain the older report as the main comprehensive architecture decision.

## The exact reversible hypothesis

A natural repair of the previously rejected *single* GP29 zero-marker model is to let printed word starts use a different transparent plaintext symbol than word interiors. For every noninitial original rune position `t`, consider

`C[t] = C[t-1] + K[t] · rank(P[t], m_class) (mod 29)`,

where `K[t]` is an arbitrary nonzero element of the 29-element field, `class` is **word first** or **word interior**, and `rank(P,m)` is a bijection of the 29 GP symbols to residues 0..28 with exactly one zero, at symbol `m`. Both class markers are unknown, independently selectable among all 29 runes: **29×29 = 841** model pairs. No key sequence, start state or period is fitted. An arbitrary distinct field-unit multiplier per original rune is allowed.

This family has the **exact, key-independent necessary condition**

`C[t] == C[t-1]  ⇔  P[t] == m_class`.

The original ciphertext therefore exposes the full location set where one of two fixed plaintext markers would have to occur, irrespective of every unknown nonzero multiplier. This supplies a test using the actual runes and genuine printed words without guessing plaintext.

## Original contract and discriminating result

The normalized original source `resources/liber-primus/lp2-corpus.json` and its cross-page whole-word parser yield exactly **12,956 ciphertext runes**, **2,896 complete words**, and **86 adjacent equal-rune events** among the 12,955 eligible predecessor pairs:

| Original location class | Eligible pairs | Equal-rune events |
| --- | ---: | ---: |
| First rune of a word, except first book word | 2,895 | **23** |
| Interior rune of a word | 10,060 | **63** |
| Total | 12,955 | **86** |

In the first 1,448 complete words the counts are **8 first / 32 interior**; in the second 1,448 they are **15 first / 31 interior**. A word-ending rune is included in the interior class for words of length at least two, while single-rune words are classified as starts.

The source test conditions each GP reference word on the observed original word length (lengths 10 and above pooled), printed position (position 8 and above pooled) and actual last-rune status. It uses a fixed, stated 0.25 pseudocount per GP symbol to avoid zero-frequency bins. There are **10 independent word-first strata** and **45 word-interior strata**. English is encoded to GP29 under the documented `QU→CW, V→U, K→C, Z→S` orthography, with longest-match GP digraphs. Sources are the repository's three pinned original English control files.

For each stratum, compute the binomial likelihood deviance between the observed duplicate count and the control's candidate marker prevalence. Minimize that deviance over **all 29 possible marker labels independently in each of the two classes**. The independent minimizations are equivalent to optimizing all **841** pairs, so no source-favorable pair is omitted.

| Native GP control | Best word-first marker / deviance | Best interior marker / deviance |
| --- | --- | --- |
| Shakespeare, 55,407 GP words | E / **54.9503** | P / **135.0999** |
| Gibran, 15,733 GP words | EA / **43.0329** | W / **121.0995** |
| Emerson, 77,932 GP words | EA / **42.3684** | B / **136.3601** |

**Finite null calibration:** for **each** of 29 possible underlying markers, generate **300** independent source-bin Bernoulli manuscripts conditioned on all original stratum counts, rescore each synthetic sample after reselecting the best of all 29 candidate labels, and count minima at least as deviant as the original. Run this independently for each of the two position classes and each of three source corpora. **Every one of the 29 true-marker calibrations produces 0/300 synthetic outcomes as extreme as the original in both classes across all three source corpora.** The least-favorable add-one Monte Carlo upper-tail *estimate* is therefore **1/301 ≈ 0.00332** for each class/source, subject to the declared source and independent-bin null assumptions. It is a finite Monte Carlo estimate, not an exact probability bound.

The best first/interior marker labels vary across reference genres, and the original deviations remain extreme even after allowing two independent markers. The event *locations across word lengths and positions* are the obstacle. Overall repeat frequency alone does not identify a cipher.

## Positive control, reproduction and scope

The exact [single-file SFT](../sims/lp2_two_marker_word_boundary_sft.cjs) constructs a genuinely reversible online GP29 cipher whose distinct markers are EA at starts and W inside words. For a native Shakespeare **8,016-rune** plaintext plant, its generated ciphertext has **50** equal-predecessor events, each matching its selected plaintext marker, and its inverse recovers **all 8,016 original plaintext runes exactly**. This guards against testing a nonsensical or uninvertible construction.

Reproduce locally using Node 22 and the repository's checked-in source files; the SFT default runs 300 simulations for every true marker in each class, with seed `0x48ac2026`. The standalone successful [manual GitHub Actions workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43007435621) ran the original-cipher test and the full planted inverse. Its workflow has **only** a manual `workflow_dispatch` trigger.

**Decision:** Retire the unchanged zero-marker hypothesis even when word starts and word interiors each receive their own independent secret marker, under native GP English word-preserving source controls. This result does **not** reject nonlinear state changes within words, non-GP source registers, non-English plaintext, cipher-generated word boundaries or hidden insertions. Reopening should require an independent clue that determines an additional state transition or a directly executable key, followed by held-out original plaintext evidence. Do not enlarge marker searches simply to accommodate the observed counts.
