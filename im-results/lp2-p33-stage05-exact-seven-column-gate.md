# Original p33 first 91 runes under the exact 2014 Stage05 row-seven permutation

**Decision (12 November 2026, Director #485):** Applying the recovered Cicada 2014 Stage05 *rowwise* seven-column read order **1736254** to the original 91-rune first titled unit of LP2 physical p33 yields a complete but **nonlinguistic** rune sequence. The exact historic Stage05 positive example and all 91 original p33 runes round-trip under the frozen transformation. No ciphertext/key/plaintext recovery. This excludes the specific documented transposition transfer, not a general class of page rearrangements.

## Contemporary source-selection candidate

The original Stage05 OutGuess text from the recovered third JPEG contains two 28-character rows. Selecting positions **1, 7, 3, 6, 2, 5, 4** independently within each seven-character row gives the known decoded Stage05 text:

    TOBELIEVETRUTHISTODESTROYPOSSIBILITYQ4UTGDI2N4M4UIM59133

The continuation identifies the historic onion and the trailing digits 9133. Original source message SHA and historical decoder positive/forward controls are documented in [Stage05's reconstructed container](2014-stage5-avowy-archive-audit.md) and [its source-exact decoder](../sims/stage5_original_outguess_columnar_sft.cjs).

The original LP2 p33 first source-visible titled unit has **91 runes** (13 rows of seven), beginning with a **ten-rune red heading** followed by a red thirteen-dot separator, and terminating before the next red rubric at local rune91. The [previous source-locked p33 interlude](p33-91-rune-p56-totient-transfer-gate.md) gives the exact input index-byte SHA-256:

    b1b5e2158180d53991b59b4063955f9dd29b36c273d6bc96c14d766934ed7b2a

The exact seven-character stride is applied to the entire original first 91 runes, in original reading order. Since GP29 transliterations TH/NG/EA/AE may occupy multiple Latin letters, each rune is first bijectively represented by **one** temporary character. The new [standalone CommonJS SFT](../sims/lp2_p33_stage5_row7_transfer_sft.cjs) imports the exact historic Stage05 decode/encode functions rather than implementing a new seven-permutation variant. It first asserts the original 56-character historical positive, then the entire p33 forward re-encoding.

## Full original p33 candidate

Each of the following is one GP29 rune token, not a hypothesis about text word boundaries:

    D A X I EO F C W T G F H OE EO E G EA S OE IA A Y O N R EA AE TH IA D W Y M M X B AE R H T J U OE F NG S IA H W IA T TH W L I T O S N L U M W TH AE W J EA A J G IA M P Y D W E W W H J U E NG L S J I G AE

The continuous transliteration is:

    DAXIEOFCWTGFHOEEOEGEASOEIAAYONREAAETHIADWYMMXBAERHTJUOEFNGSIAHWIATTHWLITOSNLUMWTHAEWJEAAJGIAMPYDWEWWHJUENGLSJIGAE

No meaningful p33 title, body, readable instruction or independent source text emerges. The red heading and punctuation boundaries are original visual controls, preserved as locations, and cannot be reinterpreted as seven-column cipher symbols.

## Readout on pinned English quadgrams

Scores use the existing English quadgram file resources/control/duko_round27_english_quadgrams.txt, summed log10 probability over four-letter windows in GP transliterations. Higher scores are more English-like. The original 91 p33 runes and their decoded output both have 113 Latin letters after GP29 transliteration.

| Sample | Mean log10 quadgram probability |
| --- | ---: |
| Original p33 first 91 ciphertext runes | **−7.5142604490** |
| Stage05 original historical permutation applied once | **−7.4895873120** |
| Wrong-direction (inverse-permutation) control | **−7.6509001397** |
| Authentic solved p57 plain runes | Source-native independent positive, checked by SFT |

The originally sourced permutation improves the cipher-like score by merely **0.0246731** per quadgram. Its exact p33 re-encoding passes, but that alone proves only that the tested operation is reversible. The SFT also scores the original unmodified solved p57 English control. The Stage05 source example recovers the correct original historically decoded continuation.

**Result and stop:** Shared seven-column width is a plausible period-human cue, yet no LP2 source instruction states the original Stage05 operation recurs. This one complete frozen transfer is negative, so no alternate width/phase/row reversal or repurposed key search is justified. The original p33 91-rune source segmentation remains intact.

Sources: [Stage05 source record](2014-stage5-avowy-archive-audit.md), [historic decoder](../sims/stage5_original_outguess_columnar_sft.cjs), [p33 exact original unit](p33-91-rune-p56-totient-transfer-gate.md), [new frozen SFT](../sims/lp2_p33_stage5_row7_transfer_sft.cjs), [unmodified original GP29 corpus](../resources/liber-primus/lp2-corpus.json).
