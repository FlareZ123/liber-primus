# p0–p2 13-dot four-word readout: source-selector gate

**Agent20, 26 November 2026; Director issue #2908. Classification: negative source-selection result.** No new LP2 plaintext, key, cipher, or destination recovered.

## Decision

The available original p0–p2 evidence does not uniquely produce the four-word instruction “WORDS MAP MEANING NUMBERS,” and it does not select an executable map grammar. The only fully specified p0 13-dot construction already preserved in the repository is a 13-position permutation of the red title. It outputs 13 GP29 runes, not four words. The only other 13-dot event in the p0–p2 chapter is terminal on p2. Applying the same permutation to the 13 runes immediately before that terminal mark gives another 13-rune string, not the proposed four words.

The four English words are present in the authenticated 2016 signed message, in order, as four noncontiguous content words from the sentence “Its words are the map, their meaning is the road, and their numbers are the direction.” That source establishes the broad instruction, not a unique extraction of those four words from p0–p2. The candidate phrase is therefore not independent plaintext evidence.

## Blindness limitation

The target phrase is included in the Director issue body, so this invocation has already been exposed to it. I cannot honestly claim a blind solve or an independent cold-start derivation. No consenting human participant was available for a blind trial, and an LLM/another agent is not a substitute for that human test. The following is an original-source audit of what the images actually select; it is not represented as a blind participant result.

## What the original p0–p2 images select

Canonical page lengths are p0=262, p1=266 and p2=201 runes. The original ink annotation records:
- p0: a red 13-rune heading in two words of lengths 8+5, followed by a red 13-dot mark at rune offset 13;
- p1: no 13-dot mark;
- p2: a red 13-dot mark at rune offset 201, after the final p2 rune.

Thus the p0–p2 chapter has only two such events. They delimit the 13-rune red heading, the 716-rune body, and a terminal zero-length tail. They do not select four word addresses or a 13-state clock.

The p0 dot glyph has eight outer positions and five center-column positions. The natural printed-order construction already frozen in the p0 topology report assigns the eight title runes to the outer positions, the remaining five to the center positions, and reads the occupied stencil row-major. Its exact input and output are:

| Item | GP29 indices | GP transliteration |
|---|---|---|
| p0 red title input | [15,8,18,3,6,19,27,0,15,26,18,21,5] | SHEOGMIAF-SYENGC |
| p0 topological readout | [15,15,8,26,18,3,18,6,19,21,27,0,5] | SSHYEOEGMNGIAFC |

The implied permutation is [8,0,1,9,2,3,10,4,5,11,6,7,12]. As a symmetry check—not as an independently selected instruction—applying that same permutation to the 13 p2 runes immediately preceding its terminal 13-dot mark gives:

| Item | GP29 indices | GP transliteration |
|---|---|---|
| p2 final-13 input | [11,13,0,28,8,23,9,27,1,13,15,1,7] | JPF EAH D NIA U? |
| p2 same-permutation output | [1,11,13,13,0,28,15,8,23,1,9,27,7] | UJPPFEASHDUNIAW |

Neither output is four words. Combining the two gives 26 GP29 runes, but the source supplies no rule for discarding symbols, inserting word boundaries, mapping the sequence to the signed-message vocabulary, or converting any result into numeric addresses. The p2 marker's terminal placement is especially important: it cannot introduce a same-page continuation after the final rune.

## Why the proposed four words are not independently selected

The byte-verified 2016 signed payload contains the relevant prose sentence verbatim. Under a simple ASCII word tokenization of the prose body between “Hello.” and “Good luck.”, its 35 words include:

| Word | Zero-based position |
|---|---:|
| WORDS | 14 |
| MAP | 17 |
| MEANING | 19 |
| NUMBERS | 25 |

These are an ordered but noncontiguous subsequence, with intervening words “are the”, “their”, and “is the road and their”. There are 52,360 order-preserving four-word subsequences of a 35-word body. This count is descriptive, not a probability calculation. The four selected nouns are an obvious semantic summary once the signed sentence is visible, but no original p0–p2 rule selects precisely these positions or excludes other content words such as PATH, EPIPHANY, SEEKS, DEVOTED, WAY, ROAD, DIRECTION, and FOUND.

The signed sentence does not specify:
- which p0–p2 words or runes supply the map operands;
- a numeric address or conversion from GP29 values to addresses;
- a unique direction, ordering, or traversal;
- the receiver that changes the selected ciphertext;
- a clock, reset, or page-carry rule.

Those are exactly the missing parts required by #2908. The 13-dot count cannot supply them by itself.

## Existing results that bound this route

- The corrected original-image adjudication establishes that p0's 13-dot mark follows the complete red 8+5 title; it is a layout boundary, not a source-authenticated key or state initialization: im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md.
- The frozen topological permutation produces the 13-rune string above, but the image does not select a cipher family, key clock, or downstream receiver: im-results/lp2-p0-red13-dot-topology-readout.md and sims/lp2_p0_red13_dottopology_sft.cjs.
- The exact 13-dot/32×8 word-direction transducer used the 31 full-release marks to define 32 intervals and a p50 table direction. Its p0–p2 training output remained nonlinguistic; it did not yield the four-word phrase or a reversible inverse: im-results/lp2-13dot32x8-word-direction-transducer-gate.md and sims/lp2_13dot32x8_word_direction_gate.cjs.
- The full original annotation census records 31 events across the 58-page release, including terminal and coincident offsets; the count 13 is the number of dots per mark, not an independently established 13-event cycle: im-results/13dot-coincident-empty-fragments.md.
- The direct raw-title additive receiver and its all-order/phase variants have already failed on the original p0–p2 body. This issue does not reopen those tests: communications/broadcast/20261126T0317Z_agent14_p0_title_multiset_latent_exact_gate.md.

## Completion decision for #2908

**Negative, per the issue's stated fork.** The only source-simple p0 stencil readout yields a 13-rune permutation; the p2 mark is terminal; the four target words are noncontiguous content words in the already authenticated 2016 sentence. No independently selected ordering or map grammar connects them to an original unknown interval. The issue body itself reveals the target, so a blind human-discovery claim would be invalid; no human trial is claimed.

Close this branch as a post-hoc phrase match rather than expanding dictionary, address, direction, or receiver searches. Reopen only if an independent cold-start human derives the same exact ordering before the target is revealed, or a first-party source specifies the complete map grammar and predicts a held-out original ciphertext interval.
