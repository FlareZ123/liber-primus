# Source-dated ABAAB floral selector: direct non-alphabet pickup decision

**Director #916, 14 November 2026, Agent 2.** Original-scan and authentic 2016 participant evidence admits a concrete *addressing mask* but no creator-authenticated subsequent key or value-changing opcode. The economical original-rune consumers, A-only pickup, B-only pickup and a complete reversible A-then-B reshuffle, fail directly on the nine consecutive floral pages p40–48. **No unknown Liber Primus plaintext or unambiguous flower-selected cipher operation has been recovered.**

## What the historical witness actually selects

Original February 16, 2016 #cicadasolvers lines 298219–234 record a solver describing berry positions clockwise as `ABAAB`, with color A enumerated by `floor((5N−1)/3)`. This is a fully specified five-position *sequence*. The speaker's context concerns XOR and addition experiments on OutGuess data. It does not give an author-signed instruction to read p40–48 GP29 by either berry color, select a packet/byte format, route into the p50 table, or initialize a secret cipher. [Exact dated-source audit](lp2-2014-2016-original-irc-later-witness-gate.md).

The floral illustration on all sixteen original pages p40–55 uses the same visual five-dot templates. The previously completed [original-template audit](lp2-floral-border-template-audit.md) shows pixel identity. An independent direct inspection of the maintainer's original 2400×3600 scans for this task confirmed that the entire RGB strips `x=0..399` and `x=2000..2399` are **pixel-identical across all sixteen images**. The source gives no per-page changing dot pattern that could act as a nonce, rotating key state, or source-selected phase. This identical-frame fact is **already established elsewhere**; its relevance here is that the historical observer's `ABAAB` must be supplied an external consumer.

## Fixed original-input direct consumers

The natural, finite non-alphabet tests are:

1. Take only original GP29 rune positions marked A in a repeating `ABAAB` mask, or only those marked B, preserving within-lane order.
2. Concatenate the A-lane and B-lane to form a **complete reversible transposition** whose known position mask restores every original rune. This is the simplest lossless two-lane consumer of a printed two-color pattern.

Use either (i) phase zero restarted at every original physical page because the original frame is drawn on each page, or (ii) one uninterrupted phase-zero clock across p40–48. Fix the literal 2016 A-first mark, both categories and source-order bytes. No key, phase optimization, substitution, word edits or value-changing postlayer.

| Original source p40–48, 2,408 GP29 runes | Page-reset `ABAAB` | Continuous `ABAAB` |
| --- | ---: | ---: |
| A-lane runes | 1,447 | 1,445 |
| Literal GP29 E in A lane | **54** | **46** |
| A-lane 29×IoC | 0.996197 | 1.000931 |
| B-lane runes | 961 | 963 |
| Literal GP29 E in B lane | **35** | **43** |
| B-lane 29×IoC | 1.008160 | 1.011049 |
| Reversible A+B total original E / 29×IoC | **89 / 1.004363** | **89 / 1.004363** |

For comparison, every same-length contiguous window of the pinned **Shakespeare** GP-native register contains at least **108 E** in either A-length (1,445–1,447), **66 E** in either B-length (961–963), and **196 E** in a 2,408-rune window. Every pinned **Gibran** window has corresponding minima **122, 76 and 224**. Thus no literal A stream, literal B stream or full A-then-B reordering yields any of those native GP prose windows; no output supplies coherent contiguous plaintext. No permutation of all 2,408 rune values can alter the **89 original Es**, the complete 29-symbol histogram, or its **29×IoC=1.004363**. The reversible A/B packed ciphertext is therefore too nearly uniform for the two fixed source-native prose registers unless a separately sourced **value-changing** step is added.

Positive controls use complete original page addresses to insert same-length GP-native Shakespeare and Gibran streams into both A/B lanes; each recombined 2,408-rune synthetic book re-extracts all runes exactly under both clocks. Consequently the negative is about the original text's absence of source-native prose structure, not an incorrect lane implementation.

## Decision and smallest missing rule

The floral mask is a **position selector**, with no authored way to choose whether A or B is data/key/filler and no original key or GP29 operation for converting the selected nearly uniform runes to natural text. Its exact repeat also supplies no unique independent page-phase marker. No independent historical source connects the dots to particular columns, a table cell order, cipher state, or a packet format. Therefore no source-selected non-alphabet decoder satisfying the issue's 100-rune + 40 withheld target can be frozen. A new run of guessed shifts, table positions or berry rotations would simply fit absent information to this random-looking ciphertext.

**Disposition:** close this narrow original-floral operation assignment. Preserve the five-site mask as source-observed geometry and require an *independent* consumer/key instruction before further testing. The negative covers only direct literal lane pickup and any full-rune permutation without value changes, and does not exclude a previously unknown stateful cipher using the dots for selection.

**SFT:** [`sims/lp2_flower_aba_ab_direct_pickup_sft.cjs`](../sims/lp2_flower_aba_ab_direct_pickup_sft.cjs) (one runnable Node22 CJS file, original canonical GP29 stream and pinned native controls). Successfully executed on Windows GitHub Actions [run 43620281672](https://github.com/FlareZ123/liber-primus/actions/runs/43620281672). The artifact produces each category stream, complete exact inverse, source-normalized statistics and two genuine fixed-size plaintext plants.
