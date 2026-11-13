# Direct 2013 ssss zero-key diffusion on the 256-byte LP2 table

**Classification (13 November 2026):** original-input, historical-operation transfer with an authentic positive control. The two source-layout readings yield no readable secret, file payload, page key or previously unknown plaintext. This is a bounded negative, not evidence that the table lacks an encrypted payload.

## Intended-route hypothesis and source

The original LP2 numerical table occupies 32 printed rows by eight cells across physical pp49–51. Its conditional conventional-base60 interpretation produces exactly 256 bytes (source SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`). The authentic 2013 Cicada continuation used \`ssss\` v0.5, which diffuses a secret with a **zero-key 32-round XTEA byte transform** before/after GF(2^n) sharing. That historically implemented operation is independently reproducible on its original 176-bit secret; its exact inverse yields \`p7amjopgric7dfdi.onion\`. This offers a concrete low-parameter transfer hypothesis for the opaque table.

The weak premise is that the later LP2 table contains an \`ssss\`-diffused secret. No original LP2 instruction selects \`ssss\`, its secret length, or a table-to-secret mapping. The experiment fixes only two readings suggested by the printed shape: (1) **one 2048-bit secret** in row-major order and (2) **eight separate 256-bit secrets**, one per printed vertical column in top-to-bottom order. No password, private shares, guessed XTEA keys, phase searches or post-decipher alphabet substitutions are used.

## Source-exact test and outcomes

The CommonJS [reproducer](../sims/lp2_grid_2013_ssss_xtea_diffusion_sft.cjs) loads the repository's canonical grid byte rows, checks the full source digest, performs the same exact 40 × byte-length sliding XTEA inverse as the historical \`ssss\` decoder, verifies the original 2013 22-byte address **byte-for-byte**, and forward-enciphers each decoded test input back to the exact original source bytes.

| Original input | Decoded secret size | Printable ASCII bytes | Zero bytes | Longest uninterrupted printable run |
| --- | ---: | ---: | ---: | ---: |
| 32×8 row-major full table | 256 | **91/256** | 1 | **9** |
| Column 1 | 32 | 13 | 0 | — |
| Column 2 | 32 | 7 | 0 | — |
| Column 3 | 32 | 11 | 1 | — |
| Column 4 | 32 | 6 | 0 | — |
| Column 5 | 32 | 12 | 0 | — |
| Column 6 | 32 | 13 | 0 | — |
| Column 7 | 32 | 12 | 0 | — |
| Column 8 | 32 | 10 | 0 | — |

The 256-byte single-secret output begins with hex \`fc 68 86 27 61 7e 4a d0 ff b0 f7 3c 72 0b 28 ce\` and ends \`8b b9 7a 15 fa 2d 5a 62 8c 1b e4 70 71 33 52 73 4e 45 59 4b d9 ee c2 33 d0 d9 d0 d5 f3 54 26 d5\`. Its 91 printable bytes, isolated NUL and longest 9-byte printable run supply no natural-language or self-identifying file readout. Eight separately decoded column streams likewise lack a readable address or self-describing message. Forward inversion succeeds on all nine complete original source inputs and the independently known historical address. Source-native inverse/forward consistency confirms arithmetic correctness; it does not prove a historical key choice.

This is **independent** of the existing all-secret TEA/XTEA *intermediate-round-state* and *expanded-subkey* exclusions, and of the genuine 2013 five-of-ten **Shamir-column** gates, because it treats the bytes as an already XTEA-diffused secret and supplies no public share IDs.

## Decision

The historically fixed \`ssss\` diffusion alone does **not** reveal a recognizable direct plaintext or key from either natural printed-table serialization. Keep the actual zero-key inverse available as a building block only if an independent original clue supplies the table's secret serialization or a second operation. Searching secret XTEA keys, arbitrary byte permutations, salt conventions or ad hoc binary decoders is unjustified by these inputs. No unknown LP2 rune or Cicada destination has been recovered.
