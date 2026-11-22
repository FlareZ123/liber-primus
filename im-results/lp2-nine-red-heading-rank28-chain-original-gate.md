# Red-heading seeded rank28 chapter-chain cipher: source-original counterexample

**Agent11, 15 November 2026; Director #1096.** This is a single frozen, source-visible candidate reversible cipher on original LP2 runes. The exact unknown-page inverse produces no readable plaintext, verified cipher key or intended destination. Its positive control is the original known-clear LP2 p57, whose GP spelling is authenticated independently.

## Why a 2014 player could try it

The original LP2 printed scans have nine visual chapter starts, independently identified by red headings following terminal red 13-dot stops, on physical pp **0, 3, 8, 15, 23, 27, 33, 40, 54**. Their very first red title spans contain respectively **13, 16, 12, 9, 16, 19, 10, 8, 9** GP29 signs; original chapter lengths are **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. The red heading can be hypothesized as a transmitted variable-length IV and short repeating key for its immediately following body, with a source-visible clock reset only at chapter beginnings. These are original physical observations, not proof of a key.

Separately, the unusual **86** identical adjacent ciphertext pairs might arise if the original alphabet's last and comparatively rare symbol, **EA** (index28), forces a repeated output, and the other 28 GP29 symbols are encoded into the 28 *different* possible next ciphertext signs. Such a rank28 cipher is reversible, 2014-human-comprehensible and might suppress adjacent repeated signs without requiring an unsourced long pad. The previous generic GP28/Chaocipher/equality-marker tests do **not** select this exact title-key schedule. The weakest assumptions remain substantial: no signed Cicada text calls a red heading a cipher key, reserves EA as a no-advance marker or specifies this particular rank map.

## Frozen exact inversion and controls

For each chapter, let `H` be the unmodified **first red span** of original ciphertext, `prev` initially the last `H` rune, and `q=0`. The original printed body is all subsequent chapter runes, including later red spans and every page carry; the numeric-only physical p50 adds no rune.

For each subsequent source ciphertext rune `C`:

- `delta = (C−prev) mod29`; update `prev=C`.
- If `delta=0`, output plaintext EA (index28) and **do not** advance `q`.
- Otherwise output `P = (delta−1−H[q mod |H|]) mod28`, then advance `q`.

The exact forward inverse holds `prev` stationary for plaintext EA, otherwise emits `C=(prev+1+((P+H[q mod |H|]) mod28)) mod29` and advances `q`. The key is the literal GP29 red ciphertext indices reduced modulo28; no inferred secret, free phase, per-word key, altered word boundaries or fitted alphabet appears. The first-heading spans are retained as transmitted IV material; thus this is a possible *key-only heading* model, which conflicts with p56/p57's independent example of red headings as meaningful titles, another reason not to promote the design.

The complete [original-source SFT](../sims/lp2_nine_red_heading_rank28_chain_original_sft.cjs) reads `lp2-corpus.json` and the image-adjudicated `lp2-ink-annotations.json`; verifies all exact chapter lengths and initial red spans; perfectly re-enciphers **all 12,844 original body runes** after **112 transmitted red-heading runes**. The same model genuinely encrypts the **95 independently known-clear original p57 GP29 runes** under the original p54 nine-rune red heading, recovers **95/95** with the correct key, correctly rejects the reversed wrong key, and restores planted ciphertext byte-for-byte. P57's authentic clear IoC is **0.0627099664**.

## Untouched original LP2 decryption

| Original pages | Body runes | Repeated-cipher EA outputs | Decoded IoC |
| --- | ---: | ---: | ---: |
| p0–2 | 716 | 4 | 0.03550416 |
| p3–7 | 1,129 | 6 | 0.03568557 |
| p8–14 | 1,717 | 9 | 0.03526506 |
| p15–22 | 1,894 | 10 | 0.03546830 |
| p23–26 | 1,005 | 11 | 0.03483182 |
| p27–32 | 1,414 | 12 | 0.03509141 |
| p33–39 | 1,670 | 12 | 0.03532037 |
| **Held-out p40–53** | **3,000** | 18 | **0.03530710** |
| **Held-out p54–55** | **299** | 3 | **0.03470180** |

All nine output streams remain close to a 29-way uniform register; the first 100 runes in each chapter are nonprose. The model only explains the *number* of suppressed adjacent repeats by assigning them to EA; it does **not** provide a validated account of the observed within-word lag-five echoes, authentic plaintext word shapes or independent key material. The exact forward-inversion checks are implementation controls; they cannot authenticate the wrong-key outputs.

**Decision:** Retire this **specific** source-red first-heading GP28-keyed predecessor-exclusion cipher and its hypothesized EA no-advance clock. Its title-to-body key schedule is a reversible formula with a strong source-native positive, but the untouched original data give no plausible GP-native plaintext on either training or withheld chapters. It is not evidence against other chapter-specific states or unrelated cipher families. Before exploring new red-state mechanisms, obtain a genuinely authored rule selecting the *role* of the heading and the value-changing operation; the chapter reset layout alone does not supply either.

**Executable evidence:** [Windows Node 22 passing run 43704082238](https://github.com/FlareZ123/liber-primus/actions/runs/43704082238). All exact original data and the negative/p57 control are encoded in the linked SFT.
