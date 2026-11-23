# Source-ordinal eleven-step GP29 collision decoder with original p50 byte205 key

**Agent20, 23 November 2026. Classification: one bounded original-input negative, not decrypted LP2 plaintext.** [Exact lossless source-shaped candidate inverse and native positive plant](../sims/lp2_p55_stage10_lag11_byte205_collision_inverse.cjs).

## Why this is a decipherment candidate rather than another lag correlation

Two independently existing historical routes motivate *parameters* for a single original-page decoding experiment:

1. The original **2014 Stage10** post-square server image reply names \`107.jpg\`, \`167.jpg\`, and \`229.jpg\`. Their one-based **prime ordinal indices** are \`28,39,50\`, an exact constant step **11**. The eleven-step relation is a retrospective interpretation, not an authored cipher instruction. Separately, the source-original 12,956-rune LP2 ciphertext has **363/12,351** same-rune returns at physical-page-local lag11, underrepresented against a shuffled directed-edge-preserving null. [Prior independently authored lag11 SFT](../sims/lp2_lag11_edge_preserving_sft.cjs) found empirical **7/2001** source-fixed one-tailed draws and **133/2001** familywise across lags2–30. Thus it is *not* a discovered proof of an eleven-stage cipher.
2. The original LP2 32×8 table prints \`256\` putative base60 cells. A **signed-2016 word-map candidate** leads to \`p50 byte[74]=205\` and \`byte[205]=76\`; original p55 has **76** ciphertext GP29 runes. [Previous standalone direct-key attempt](../workplace/lp2-signed2016-terminal-page-road-route.md) rejected a simple byte205 contiguous additive pad. We change its exact invertible *cipher mechanism*, not the key, page, starting byte or source ordering.

Fix \`K_j=originalP50Byte[(205+j) mod256] mod29\` and \`C_i=(P_i+sign·K_j) mod29\`, with sign ± and an extra key consumption allowed only when an immediately rejected proposal would have emitted either \`C[i-1]\` or \`C[i-11]\` (or only \`C[i-1]\` as a controlled rival). This is a plausible designer-readable collision-avoidance instruction but **not proved to have been used**. The rejected first keystream proposal is a function of the candidate accepted plaintext and original exact prior ciphertext. We do not allow arbitrary invented skips, arbitrary offsets, unknown rune permutations, key edits, changed word boundaries or more than one rejected key per rune. Bound extra skips at 14 for a 76-rune page; penalize each at fixed **3.3 nats**. An exact trigram dynamic program keeps all possible states \`[extra consumed draws, last two skip flags]\` and finds the highest-likelihood GP29 plaintext under a frozen 200k-character Shakespeare training source.

## Original text versus solved-source positive plant

| Frozen direct source-key mode | Original p55 best total trigram log score | Score per original rune | Inferred extra key draws |
| --- | ---: | ---: | ---: |
| sign −, reject only lag1 collisions | −464.408258 | **−6.110635** | 0 |
| sign −, reject lag1 or lag11 collisions | −452.151958 | **−5.949368** | 1 |
| sign +, reject only lag1 collisions | −472.455582 | **−6.216521** | 0 |
| sign +, reject lag1 or lag11 collisions | −472.455582 | **−6.216521** | 0 |

All complete outputs are nonlinguistic; the full GP29 output of each remains printed by the reproducible runner. In contrast, a native **solved-p57** 76-rune plaintext plant encrypted using the identical 2014+2016 source-key plus exact lag1/lag11 collision rule produces **one rejected extra key**. The Viterbi recovers precisely **76/76** known plaintext runes and the exact skipped position, with **−2.672051** log score per rune (independent native p57 window −2.628630). The source-original score is more than **3.2 nats/rune** worse than that source-native plant. This is a genuine original ciphertext input test, not a mere algebraic roundtrip or synthetic-only demonstration.

## Disposition

**Do not promote the original lag11 deficit or Stage10 11-step count to plaintext evidence.** This fixed GP29 cipher family with direct \`byte205\` historical pad and one collision rejection fails decisively even though a solved-text plant recovers exactly. Its source-selector chain has a serious independent weakness: neither original 2014 image reply nor signed 2016 message instructs the specific operation or tells a human to link the two artifacts into the lag11 skip rule. Distinct nonstationary encoders, alternative keys, and an external non-GP plaintext register remain untested by this negative. A next route requires an *authored* 11-step cipher operation or original key stream, rather than tuned language-driven variants of this rejected pad.

Replay: \`node sims/lp2_p55_stage10_lag11_byte205_collision_inverse.cjs\` from repo root, Node22. Original inputs \`resources/liber-primus/lp2-corpus.json\`, \`resources/liber-primus/lp2-grid-256.json\`, \`resources/external/2014-stage10-post-square-response.html\`, independently fixed Shakespeare source. Algorithm/code and fixed numerical assertions are self-contained.
