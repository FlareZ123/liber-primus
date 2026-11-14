# The historical repeated-rune WWW marker: a fixed literal-URL crib gate

**14 November 2026, Agent 32. Evidence class:** original-input cryptanalytic necessary-condition result and exploratory source-chapter-conditioned null. **No unknown LP2 plaintext, authentic cipher key, hidden URL or destination has been recovered.** Tested reproducer: [sims/lp2_doublet_www_url_crib_sft.cjs](../sims/lp2_doublet_www_url_crib_sft.cjs).

## A human-accessible prior clue

On **13 September 2016**, participant *mortlach* independently proposed that the unusually few identical-adjacent-runic pairs might carry a hidden message, observing a late **WWW** run in their *89*-event full-manuscript list and wondering about a URL: [contemporaneous post](https://calypne.boards.net/thread/75/3-ways-progress-liber-primus). This is participant conjecture, **not** authenticated Cicada instruction. It supplies an independently dated reason to consider the sequence, the literal three-letter WWW marker and an HTTP prefix without searching other motifs.

The canonical original LP2 pp0–55 (p50 has no runes) contains **12,956 runes** and **86** identical-adjacent events when page text is concatenated in its printed order. Extract just the *value of the repeated glyph* at each event and do not reset the previous glyph between physical pages. The resulting 86-symbol list has exactly two adjacent equalities, at event indexes 80 and 81 (zero-based). Both are W-to-W, so event glyphs 79, 80, 81 are **W W W**. They occur on original physical pages **47, 48 and 51**, separated by text and a runeless numerical page. The seven event glyphs at indexes 75–81 are **E O E P W W W**. Event indexes 74–81 are **X E O E P W W W**. The original last four events are Y, NG, G and TH.

**Independently useful original-page geometry.** Of all 55 rune-bearing unsolved physical pages, **p51 alone begins with an identical GP29 pair**: its first two rune values are W W, followed by P F IA L. The actual image, scan **68.jpg**, places this doublet as the **first text directly below the last nine printed rows** of the 32×8 numeric table spanning pp49–51. This is the **third W** in the terminal event WWW run; the previous two doublet events occur on pp47 and p48. These observable facts give a human solver a specific table/text junction to inspect. An intentional cipher linkage remains unproved, and the table's base60 byte interpretation is conditional.

The 2016 author's 89 includes three repeats from the independently *solved* p56–57, producing W, D and N after the 86 unknown-page events. Those solved-page repeats are not part of this experiment's unknown ciphertext stream. Previous research tested raw event-value, gap and other residue channels without obtaining native GP plaintext ([prior narrower original events study](doublet-exception-channel.md)). The fixed *literal-URL* crib below addresses a distinct prerequisite of an externally proposed key-length-five/six search; it does not suggest repeating that general search.

## Repeated-key contradiction on unchanged original symbols

Suppose the extracted 86 event glyphs themselves form a GP29 Vigenère ciphertext, with each event advancing one key step. Let C[i] be each actual repeated symbol, P[i] its proposed plaintext and k[i mod L] an arbitrary repeating additive key of period L, so **C[i] ≡ P[i] + k[i mod L] (mod 29)**.

Apply two **fixed, historically intelligible** crib hypotheses to the visible WWW near the end:

| Proposed literal plaintext on original events | Zero-based event indexes | Minimum possible additive-key period | Exactly forced minimum-period key, clocked from crib start | Full 86-event inverted IoC |
| --- | --- | ---: | --- | ---: |
| HTTPWWW | 75–81 | **7** | [10,16,2,0,0,0,0] | **0.032558139535** |
| HTTPSWWW | 74–81 | **8** | [6,2,16,5,27,0,0,0] | **0.032284541724** |

For **HTTPWWW** under L=5, source event 75 is E (GP index18) and proposed H (index8), forcing a shift of **+10**. Event 80 is W (index7), and proposed W (index7), forcing shift **0**. Positions 75 and 80 share the same modulo-five key clock, an exact contradiction. Under L=6, source positions 75 and 81 share the same residue and have the same contradiction. The SFT checks *all shorter periods* exactly, with no probabilistic score.

For **HTTPSWWW** with L=7, events 74 and 81 share a key residue: X (index14) to H (index8) requires shift +6, while W to W requires zero. Its shortest possible period is eight. The full inverses for periods seven and eight were computed without fitting a single symbol outside the proposed crib; they produce no sustained readable message, and their coincidence rates remain near 1/29. This is a **bounded negative**, not a proof against English by any conceivable plaintext register. Both candidates are checked with full 86-symbol original-rune re-encryption and independent 86/86 recoverable source-native plants.

This test only excludes the **particular literal HTTP(S)WWW prefix under an event-clock periodic additive cipher**. A shorter key may decrypt a *different* event-stream message. A cipher clock running across **all original 12,956 ciphertext positions**, including the thousands omitted by event extraction, would be a different hypothesis. Arbitrary per-phase substitutions, nonadditive operations, key shifts, or a nonliteral WWW marker also remain open.

## One finite control for the original WWW placement

A count of three Ws is not a decoder. To test whether the motif is a generic consequence of observed repeated-glyph marginals, freeze the 86 original event locations, the nine original image-chapter assignments, the number of events per chapter and each chapter's exact repeated-rune glyph inventory. Uniformly shuffle only event identities **within each original chapter**. These nine original chapter event counts are:

[4, 6, 9, 10, 11, 13, 12, 18, 3].

The fixed 250,000-trial xorshift32/Fisher-Yates control, seed 0x3301a5c3, yields:

- Exactly one triple of any rune and no other adjacent identical event glyphs: **2,938 / 250,000**.
- Exactly that isolated-triple pattern, with rune **W** and its start inside the **last seven unknown-page event positions**: **274 / 250,000**; add-one Monte Carlo tail **0.001099996**.

This is conditional on the specified chapter inventory and the historically motivated specific marker/terminal location. The marker, symbol, endpoint window, nine-chapter partition, and hypothesis class have not been familywise adjusted against every pattern explored in the broader cryptanalysis literature. Page-level dependencies may further change the null. The 2016 post independently motivated the WWW motif, but it does not authenticate an event-channel URL. Use this as a constrained **candidate selection signal**, rather than a probability that the creators intentionally hid WWW.

## Decision and next useful operation

A literal **HTTPWWW/HTTPSWWW** prelude cannot justify exhaustive key-length-five/six GP29 additive brute force on the 86-event subchannel. Testing that specific hypothesis is complete, and the unique period-seven/eight candidates also fail to supply plaintext. A future decoder should begin with an **independently selected event-to-letter or event-to-address rule**, perhaps from a signed 2014/2016 historical instruction. Demand a meaningful original-input readout whose mechanism also works on held-out events, rather than optimizing arbitrary short keys or numerological patterns.

The script reads the canonical original corpus directly, asserts every source count and terminal glyph position, derives the exact contradiction, prints full inverse streams, verifies complete positive controls, and executes the fixed conditional null. It is standalone, read-only CommonJS for Node.js 22.
