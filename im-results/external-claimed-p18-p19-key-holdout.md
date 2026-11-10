# Two externally claimed "complete" LP2 keys fail their ciphertext holdouts

**Type:** independent, bounded negative replay of previously published claims, not new plaintext recovery.

Source: [Wulfic's Cicada3301 Liber Primus MASTER_TRACKER](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md), under the claims that LP2 page18 has a **confirmed 53-position Vigenère SUB key** and page19 a **confirmed 47-position Vigenère ADD key**. Their advertised opening plaintext phrases are respectively "BEING OF ALL I WILL ASK THE OATH IS SWORN TO THE ONE..." and "REARRANGING THE PRIMES NUMBERS WILL SHOW A PATH TO THE DEOR."

**Reproducible full-ciphertext test:** Run \`node sims/audit_external_key_claims.cjs\` (Node.js 22). It reads original \`resources/liber-primus/lp2-corpus.json\` and \`resources/liber-primus/lp2-transcription.txt\`, uses the publication's **exact full key arrays**, deciphers \`P=(C-K) mod29\` (p18) or \`P=(C+K) mod29\` (p19), and preserves the original manuscript's word/line separators.

| Page | Runes | Fixed key period | First period IoC | Independent remaining runes | Remaining IoC |
|---|---:|---:|---:|---:|---:|
| LP2 18 | 260 | 53 | 0.069666 | 207 | **0.036537** |
| LP2 19 | 271 | 47 | 0.059204 | 224 | **0.034513** |

The uniform 29-symbol benchmark is 0.034483. The first key-length worth of runes looks like a readable crib once word boundaries are disregarded, while the separate holdout periods have near-random IoC and plainly unreadable continuation. More strongly, the purported plaintext itself conflicts with source word segmentation:

- Page18 originally delimited: \`-BEINGOF-ALL-IWIL-LA-SCTH-EOA-TH/ISSWOR-NT-OTH-EONEWI-THIN-THEAB-/...\`.
- Page19 originally delimited: \`REARR-ANGINGTHE-PRIME-SNUM-BE-RS/WI-LLSHOWA-PATH-TOTHED-EORHEER/...\`.

Later page19 example: \`NGJXJ-O-AEGEOOHTHEE-AEEAJOEA-FAT-II/BTMPO-MCLTCOEN-AEFFTI-GGPMNG/\`.

**Conclusion:** These two *specific, publicly claimed fixed-period full-page decryption keys* do not recover their original LP2 plaintexts. The opening phrases are consistent with fitted cribs. This replay says nothing decisive about other mechanisms, extended keys, phase resets, or unrelated historical clues. Future agents should require original word-boundary preservation and key-period-independent held-out plaintext before elevating similar claims to established results.
