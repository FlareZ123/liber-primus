# The p6/p7 22×14 DH23 terminal-red register: source-led reversible gate fails

**Agent38, 21 November 2026.** A distinct complete arrangement of the original red-bracketed p6/p7 black passage is mathematically and historically motivated, but seven source-fixed reverses on all original ciphertext runes recover no readable GP29 plaintext. This is a bounded negative for the tested operations. The geometrical relationship remains an observation, not an authenticated instruction.

## Independent geometry and key selection

The original p6 scan contains **196 runes = 14²**. Its third red word has GP29-index product **14**. The p6 red passage ends after rune offset81, and the p7 red passage begins at offset194. The intervening physical black runs are p6 offsets82–195 (114 runes) and p7 offsets0–193 (194 runes), so the original contiguous receiver is **308 = 22×14 runes**. The p7 terminal red passage contains **exactly 14 runes**, giving a non-arbitrary candidate terminal state, in source order:

`[23,3,22,16,2,25,5,7,11,14,28,6,28,19]`.

The separately recovered historic 2013 Diffie–Hellman demonstration specifies modulus23 and generator5; 5 has multiplicative order22 modulo23. The same p7 red final word's rune-index product is **2**, the independently known historical DH shared secret. These premises suggest 22 consecutive 14-column rows, each keyed by the 22-element cyclic generator register and terminating at the printed red14. This is materially different from prior 28×11 tests using the opposite exact factorization `308=28×11`; those instead use p6's red11 as key and GF29's 28-cycle power of2.

The historical DH operation is modular exponentiation modulo23. A direct GP29 state-action or red14 ciphertext-feedback is a **new proposed operation**, requiring a numeric lift from GF23 residues into the GP29 symbol field. The original artifact does not specify that lift, the grid orientation, or a cipher recurrence. Those remain limits to the hypothesis.

## Frozen original-cipher reverses

Read the 308 runes in printed order as 22 rows of14. Let `C[r,j]` be the actual original rune indices; let `K[j]` be the 14 printed p7 red runes; and let `s[r]=5^(21−r) mod23`, so the physically closest black row to the p7 key has state1. All arithmetic on ciphertext runes is modulo29, while generator powers are computed modulo23 and then used as numbers from1 to22.

Three directly reversible row constructions were tested:

1. `C = s*P + K`;
2. `C = P + s*K`;
3. `C = s*K*P`.

Four right-to-left ciphertext-feedback constructions were also tested: `P[r,j] = C[r,j] − a[r]*C[r+1,j]`, where the terminal row `C[22,j]` is the actual red14 and `a[r]` is respectively **1**, **2**, **s[r]**, or **2s[r]**. Every operation has a complete deterministic forward reencryption, no fitted offset, phase, guessed alphabet, plaintext crib, or postselected parameter.

The solved-LP1 GP-native reference supplies a trigram model and a fixed solved-reference vocabulary. A native long-word match requires an exact GP29-symbol match on one of the **40 printed words of length at least four** in the original 308-rune body; their line/page carries are respected. The same reference recognizes 11/12 long words on solved p57, which scores −2.07669. The untouched receiver scores −3.56051.

| Reversible inverse | Trigram log likelihood per rune | Exact four-plus-rune native word matches |
| --- | ---: | ---: |
| Direct `(C−K)/s` | −3.58675 | 0/40 |
| Direct `C−sK` | −3.61661 | 0/40 |
| Direct `C/(sK)` | −3.61710 | 0/40 |
| Feedback coefficient `1` | −3.57206 | 0/40 |
| Feedback coefficient `2` | −3.60417 | 0/40 |
| Feedback coefficient `s` | −3.59740 | 0/40 |
| Feedback coefficient `2s` | −3.59645 | 0/40 |

Every candidate reenciphers to the exact original 308-rune source. Planted 308-symbol solved-p57 data is recovered exactly by every matching encoder/decoder pair. These are implementation positives. All seven source readouts are unambiguously nonlinguistic under the attested GP English register.

## Interpretation and decision

**Reject the seven source-fixed 22×14 direct-row and terminal-feedback GP29 decoders.** The independent fact that 22 rows align with the DH generator's full group order, while the closing red span has length14, is a useful source-derived shape. It does not, by itself, identify the historical numeric lift or support assigning a new key or cipher family. The complementary 28×11 shape remains source-motivated and was already exhausted for its direct DH2 and GF29 Fourier consumers. Further searches require a clue naming an operation beyond dimension matching.

Reproducible implementation: [Node22 CommonJS SFT](../sims/lp2_p6_p7_dh23_22x14_terminal_row_sft.cjs). Its original inputs are [the committed rune corpus](../resources/liber-primus/lp2-corpus.json), [the physical transcription](../resources/liber-primus/lp2-transcription.txt), and [the solved LP1 reference](../resources/liber-primus/lp1-plaintext-reference.txt). The source and all controls passed in [GitHub Actions run 44942571081](https://github.com/FlareZ123/liber-primus/actions/runs/44942571081).
