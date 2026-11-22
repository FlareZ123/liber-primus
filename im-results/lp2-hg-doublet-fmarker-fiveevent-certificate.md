# Doublets as F-markers: a five-event certificate against the source H·G LFSR key

**13 November 2026, Agent 9.** [Both original-source SFTs passed Node22 CI run 43376200182](https://github.com/FlareZ123/liber-primus/actions/runs/43376200182). This is a source-linked, language-independent negative for a clearly defined possible key-recovery route. **No original plaintext, author-provided key or new decoder was recovered.** [Standalone CommonJS SFT](../sims/lp2_hg_doublet_fmarker_state_recovery_sft.cjs).

## Why the attempted inversion could have recovered plaintext

The first 55 rune-bearing LP2 pages contain **12,956 original GP29 ciphertext runes** and only **86 adjacent identical rune events within physical pages**. Solved Cicada pages use a special F/interrupter convention, although they do **not** say that a ciphertext doublet represents a plaintext F. A possible designer's variation is to mark rare plaintext-F interruptions by repeating the preceding ciphertext rune.

Independently, the original p50 table's GF29 polynomial has the 2013 BASE29 and p39-red-linked quadratic factors H and G. Their product fixes a four-term reciprocal pair of keystream recurrences without guessing a key:
`K[i+4] = (15K[i] + 20K[i+1] + 16K[i+2] + K[i+3]) mod29`
or
`K[i+4] = (2K[i] + 27K[i+1] + 26K[i+2] + 18K[i+3]) mod29`.

The *additional, unproven* marker hypothesis is `C[i] = P[i] + K[i] (mod29)` with `P[i]=0` (GP F) whenever `C[i]=C[i−1]`. **At every source doublet, the secret key value is then known exactly: `K[i]=C[i]`.** Four such observations can determine all four original secret starting key symbols by linear algebra. If a fifth held-out doublet agrees, the same key can decrypt all other original ciphertext. This is an executable route to unknown plaintext, without optimizing a language model.

## Exact original five-event test

Using the original page order and only *within-page* doublets, the first observed repeat sites and source GP29 symbol indices are:

| Original global rune offset, zero-based | Physical page; offset within page | Repeated ciphertext index |
| --- | --- | ---: |
| **122** | p0; 122 | 2 |
| **207** | p0; 207 | 14 |
| **456** | p1; 194 | 28 |
| **653** | p2; 125 | 11 |
| **782**, held out | **p3; 53** | **20** |

For each recurrence, the coefficient row giving `K[i]` as a linear combination of `K[0..3]` is computed exactly over GF29. The first **four** observed constraints give a rank-4 system with a **unique** seed; no key-value guesses or language-fitted choices are involved:

| Source-selected orientation | Forced secret initial state | **Fifth event prediction** | Actual fifth event |
| --- | --- | ---: | ---: |
| H·G polynomial forward | **[10,20,22,1]** | **2** | **20** |
| H·G reciprocal | **[16,20,25,25]** | **6** | **20** |

This is a direct withheld-source contradiction in either orientation. The four-event fit is guaranteed by full rank and is not a successful cryptanalytic recovery of a Cicada key.

One possible objection is that the book's visible chapter boundaries reset the key. Grant **four completely free secret starting GP29 symbols per chapter** rather than one global seed. Across the nine visible original chapter groupings, **seven chapters have inconsistent repeat constraints** under *each* recurrence, even with independently chosen seeds. The opening chapter has exactly four repeat events and therefore fits without a held-out check; the final chapter has only three and is underdetermined. They supply no validating plaintext.

The SFT constructs a known, nonzero four-rune seed and a synthetic GP29 ciphertext with five deliberately repeated-key marker events, confirms each marked plaintext index is F, and reconstructs the original secret exactly from the first four events. It checks the planted fifth. The real manuscript fails the same operation. The previous [entire 707,281-state language test](lp2-hg-fourstate-lfsr-allsecret.md) rejected the broader direct-additive F-register family as native-English ciphertext; the present marker-specific source obstruction is independent of any assumed English frequency or candidate key ranking.

## Decision

**Reject doublet→plaintext-F exact markers under either specified H·G additive keystream recurrence**, for both continuous source order and visible chapter resets. The original doublet deficit remains unexplained. The manuscript does not authenticate that repetitions signify F, and neither the known factorization nor the existing glyphs requires a four-state keystream. Do not rescue the failed five-event prediction by fitting a separate clock offset at every marker, dropping contradictory repeats, or assuming extra keys without a source cue. A genuine successor needs a different independently indicated marker/clock operation with a held-out prediction.
