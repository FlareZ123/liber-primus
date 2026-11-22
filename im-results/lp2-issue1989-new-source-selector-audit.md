# Issue #1989 — no new source-selected reversible state model

**Decision:** negative at the source-selector gate. No new cipher model was frozen or scored. The observed lag-five and adjacent-doublet statistics remain constraints, not instructions.

## Scope and independent source cues

The issue concerns the existing counts of 86 adjacent-equal sites and 104 within-word lag-five equalities. Those statistics are not recomputed here. The task asks whether source evidence not already used in closed Issue #1981 selects a reversible state architecture.

Two additional source families were considered:

1. **Four LP2 apostrophe marks.** Original scans place the same raised apostrophe-like mark inside words on p4, p21, p35, and p41. The glyph also occurs in the solved LP1 p14 contraction “I DON'T”. That solved control supports treating the mark as punctuation and, if the LP1 key-clock habit were transferred, not consuming a key position at the apostrophe. It does not reveal the adjacent unknown letters, a key, a state update, or a reset rule. These are punctuation anchors, not known-plaintext cribs.
2. **LP1 p5 square and moth motif.** The original p5 5×5 square and the repeated moth imagery on LP2 p53/p55 motivate asking whether p5 text is related to a five-step transform of those pages. This is a plausible human observation, but the square does not name a difference operator, key clock, or receiver.

## The two closest source-motivated reversible candidates

These are audited from existing exact tests; they are not newly run or promoted to source-selected models.

### A. LP1 p5 five-step difference key

Candidate equation: derive a GP29 stream from solved LP1 p5 key K using Dᵢ = Kᵢ₊₅ − Kᵢ (mod 29), then subtract D from a moth-associated LP2 receiver. The source-visible motivation is the 5×5 square, p5's “totient” text, the moth repeated at p53/p55, and the 81-rune p5 length relation to p55 (76) or p53-red51 + p55-tail30 (81).

The existing exact test in lp2-lp1p5-moth-lag5-source-difference.md rejects the candidate: p55's candidate IoC is 0.03439 versus 0.03789 for its source, and the 81-rune composite candidate remains nonlinguistic. Exact forward reconstruction and a p57 planted control pass, but no plaintext appears. The weakest premise is decisive: no source says to difference p5 by five, choose these receivers, or use this key clock. The five-square/moth association does not specify the reversible operation.

### B. LP1 Vigenère key with apostrophe-transparent clock

Candidate equation: use the authenticated LP1 p14 key FIRFUMFERENFE and standard GP29 Vigenère subtraction, with the apostrophe not consuming a key position. The historical motivation is the 2014 “Let the text guide you” solve step and the solved LP1 p14 “I DON'T” key-clock control, combined with the four LP2 apostrophe marks.

The existing exact test in sims/lp2_lp1_vigenere_key_transfer_apostrophe_gate.cjs applies the key to the four LP2 anchors under book-, page-, chapter-, and word-reset clocks. It yields zero contraction matches across the 16 clock/site cases. The key and clock are authenticated for the LP1 page, not for LP2. No first-party instruction transfers that key to LP2 or selects an LP2 receiver.

The derived LIFE suffix proposal is weaker still: it assumes unknown apostrophe-adjacent letters are T, and its direct Vigenère consumers are already negative (lp2-four-source-apostrophes-life-key-gate.md).

## What Issue #1981 already covered — not repeated

The closed #1981 model already considered the p7 five-dot marker, five numbered passages, the 2014 five-value packet, the p50 32×8/base60 graph, the 2016 words/map/direction wording, and the 2013 BASE29/DH instruction. It found no complete source-selected state model. Those same clues are not recycled here.

The additional apostrophe and p5/moth observations do not repair that gap:

- The apostrophe glyph can at most motivate punctuation transparency. It does not choose a lag-five state update, key source, seed, reset, or output mapping.
- The 5×5 square and moth recurrence can at most motivate looking at a five-step relation. They do not specify subtraction, wraparound, a continuous clock, or which LP2 stream receives the transform.
- The observed 86 adjacent doublets and 104 lag-five equalities do not identify a reversible mechanism. A fitted feedback rule would be chosen from the statistics it is meant to explain.

## Why no p40–p55 holdout was run

No candidate passed the required source-selector gate. Running a blind p40–p55 language holdout without a source-frozen operation, key, clock, and receiver would turn this into post-hoc model selection. Existing local tests already reject the two closest source-motivated consumers. No new family, phase, reset, key, or language-score sweep was performed.

## Exact missing selector

A first-party source must connect the lag-five/doublet pattern to a specific state/update equation, identify the authentic key or seed, specify whether and how apostrophes affect the clock, define reset boundaries and output mapping, and select the LP2 receiver. The four apostrophes and the p5 square/moth motif do not supply those missing choices.

**Close Issue #1989 under its negative completion criterion.** Preserve the structural observations and prior tests, but do not commission another lag-five, doublet-feedback, or apostrophe-key consumer until independent source evidence selects the complete architecture. No unknown plaintext, authentic LP2 key, or destination was recovered.

### Existing evidence

- lp2-issue1981-crosssource-state-model-audit.md — prior source-selector audit
- lp2-apostrophe-four-source-cribs.md — original four marks and LP1 p14 control
- lp2-lp1p5-moth-lag5-source-difference.md — p5 difference-key negative
- sims/lp2_lp1_vigenere_key_transfer_apostrophe_gate.cjs — apostrophe-clock transfer test
- lp2-four-source-apostrophes-life-key-gate.md — LIFE suffix-key negative
- lp2-lag5-cipher-feedback-reset-invariant-gate.md — lag-five/reset invariants
