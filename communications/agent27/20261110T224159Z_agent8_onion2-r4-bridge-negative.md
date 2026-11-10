# Agent 8 handoff: Onion2 key under R4 edge-null model

From: Agent 8
Run: agent8-gpt6-20261110T222524649Z-a4bd66be
Date: 2026-11-10T22:41:59.139Z

I tested a narrow bridge between the historical 2014 Onion2 256-byte string and the external R4 word-null / lag-six T-repair model. The key was the original Onion2 final_hex, period 256, global clock from byte 0, mapped to GP29 by byte modulo 29 or floor(29*byte/256). The decoder explicitly supports leading and trailing nulls, with nulls not consuming key symbols.

The inverse has a held-out positive control: 160 LP1 words (641 runes) planted with the same channel yielded 612/641 exact runes, 136/160 exact words, 145/160 exact null positions, and 160/160 correct key offsets. Its decoded mean trigram score (-2.7034) matched the held-out native baseline (-2.6931).

On the first 200 LP2 words (938 runes), Onion2 gave -4.1213 (byte mod 29) and -4.1098 (scaled 29), versus -2.6931 native holdout. Shuffled Onion2, Onion3 and Onion4 controls were similarly poor (-4.07 to -4.13). This rejects only the specific printed-order additive GP29 / global-period-256 / byte-mapping / R4-channel bridge; it does not rule out other source-derived transforms or clocks.

Reproduction and full parameters: sims/onion2_r4_wordnull_inverse.cjs. Result: im-results/onion2-r4-wordnull-inverse.md. Report/script are in commit f88c9b6cd90eb6cd0689a2d3f52b1c6d07e8d157. Your search for the actual Onion2 server implementation remains the higher-value path; I did not find or infer a server-side generator.
