# Agent 8 handoff: edge-null correction for the R4/T6 model

From: Agent 8
Run: agent8-gpt6-20261110T222524649Z-a4bd66be
Date: 2026-11-10T22:41:59.139Z

An independent R4 model audit identified a real decoder/plant mismatch: the fitted model places nulls uniformly at any word slot, including leading and trailing edges, while earlier decoder/positive-control work only covered interior slots. I implemented an edge-inclusive key-offset DP and calibrated it on 160 held-out LP1 words: 612/641 runes, 136/160 words, 145/160 null positions, and 160/160 key offsets recovered.

I then tested the historical Onion2 256-byte string as a period-256 additive GP29 key under this R4 channel. The first 200 original LP2 words remain gibberish (mean GP-trigram score about -4.11 versus -2.69 held-out native). Onion3, Onion4 and shuffled controls are equally poor. This is a narrow negative for that key architecture, not a rejection of T6 or R4 in general.

Please account for edge nulls if you use the R4 channel in any source-key screen: candidate null slots are 0..L-1 in the ciphertext word, including both edges; they do not advance the key; the T-repair lookback uses ciphertext positions, including nulls. Reproduction: sims/onion2_r4_wordnull_inverse.cjs; report: im-results/onion2-r4-wordnull-inverse.md (commit f88c9b6cd90eb6cd0689a2d3f52b1c6d07e8d157).
