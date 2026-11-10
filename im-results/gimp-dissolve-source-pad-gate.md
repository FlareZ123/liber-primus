# Fixed GIMP Dissolve generator as an original-LP2 key: tested, not decoded

**Classification (10 November 2026): source-linked, bounded negative original-input test. No unknown LP2 plaintext, actual cipher key, or intended continuation has been recovered.**

## Historical input and cipher proposal

Historical GIMP Dissolve rendering uses a deterministic GLib `GRand` (MT19937) generator initialized from **314159265**, to fill a fixed 4,096-element row-seed table. A separate generator initialized with the selected row seed determines individual pixel visibility. This is a **software-artwork generation fingerprint**, not a demonstrated Liber Primus encryption key. Source: [GIMP `gimpoperationdissolve.c`](https://fossies.org/linux/gimp/app/operations/layer-modes/gimpoperationdissolve.c), [GLib `grand.c`](https://github.com/GNOME/glib/blob/main/glib/grand.c). The underlying 27×27 rune grid is the unmodified first **729 runes on LP2 physical pages 0–2** (page lengths 262, 266, 201), read through [the canonical original corpus](../resources/liber-primus/lp2-corpus.json).

Two genuinely specified original-cipher candidates were tested:

1. **27×27 row-specific rendering registers.** Fill 4,096 seed values from MT19937(314159265), seed each grid row with entry `seed[row]`, and generate its 27 pixel positions. For each draw, derive an additive GF29 pad by either `g_rand_int() %29`, `g_rand_int_range(0,255) %29` or `g_rand_int_range(0,29)`. Test either sign of subtraction and both direct GP ciphertext values and first differences `c[i]-c[i-1]` (12 declared variants). No key tuning to ciphertext is allowed.
2. **Single continuous master register with collision-consumed draws.** Start one MT19937(314159265) across all 729 original GP ciphertext positions, not resetting at pixel rows. Test the same three byte-to-29 reductions and both pad signs (6 declared modes, including raw/range29 numerical equivalence over this prefix). A Viterbi decoder may consume one extra draw only where the first proposal would exactly equal the previous observed ciphertext rune. The latent skip count is capped at 30; its score includes an explicit 3.5-natural-log penalty per extra draw. Unseen GP training prose is the independent first 2,200 GP runes from the source-normalized solved LP1 reference. There is no fitted initial seed, free IV, nonce, source symbol permutation or arbitrary pad offset.

The second candidate permits an exact reversible mapping under a recovered skip witness. The decoder computes maximum native-GP trigram score and re-enciphers **every one of the 729 original cipher runes exactly**, including the rejected-draw state. Such reconstruction is an implementation consistency condition; fluent independently justified plaintext is still required to identify a historical cipher.

## Fixed source-generator control vectors

The first eight original row seeds are:
`[3721122731,618219707,807213306,3144837749,3447982176,3230631767,755972506,1398685501]`.

The first eight `GRand(seed[0])` raw outputs are:
`[505524582,4277517655,1702989131,912900261,1432505218,4108960502,2270003630,316039421]`.

The same generator's first eight integer-range `[0,255)` outputs are:
`[87,10,191,6,133,152,5,71]`.

These reference vectors were checked against the system's native GLib implementation, not merely the script under test. Both executable single-file tests assert them or the exact source-derived pad.

## Direct and first-difference original results

| Statistic | Value |
| --- | ---: |
| Number of fixed-source decoding variants | 12 |
| Best original LP2 GP rune IoC | **0.0351829240718** |
| Best projection, sign, transform | raw32%29, −1, first difference |
| Matched inventory-preserving 27×27 shuffles | 500 |
| Nulls whose own best-of-12 IoC equaled/exceeded original | 122 |
| Family-selected plus-one conditional tail | **123/501 = 0.245509** |
| Null best-of-12 median | 0.034994498 |
| Original-register solved GP plant IoC after exact recovery | 0.061136737 |
| Original-register planted rune recovery | **729/729** |

The pre-selected generator projections do not raise original LP2 output far above the random GP baseline of `1/29`; the family-selected null test gives no evidence of natural-language key recovery.

## Original cipher with collision-consumed extra draws

The model's best original-rune score among six modes is **−4.749562465 nats/rune**, versus independently planted source-native controls around **−2.59 to −2.62 nats/rune**. The original top-mode transcript starts `PGGONTHJSFTHEJSAERLXTH...` under GP transliteration and remains unrecognizable. Viterbi infers 16 extra draws in its top original mode. Every original mode returns **729/729 exact forward re-encryption**, but its plaintext scores remain far from the true-key planted controls.

| Mode | Original trigram log-score/rune | Original inferred skips | Plant correct runes /729 |
| --- | ---: | ---: | ---: |
| raw, C=P−K | −4.749562465 | 16 | 728 |
| range29, C=P−K | −4.749562465 | 16 | 728 |
| byte255, C=P−K | −4.749711797 | 14 | 727 |
| byte255, C=P+K | −4.756768099 | 12 | 729 |
| raw, C=P+K | −4.796001145 | 9 | 727 |
| range29, C=P+K | −4.796001145 | 9 | 727 |

The corresponding source-GP planted plaintext in each variant used real skip-induced ciphertext generation, with 16–23 true skipped draws. The decoder recovered the original plant within two GP runes in all six cases. That positive recovery establishes the selected model's practical decryptability when its key generator is historically correct.

## Reproduction, interpretation, and limits

Run these two independent CommonJS SFTs with Node 22 from the repository root:

```text
node sims/gimp_dissolve_source_pad_gate.cjs
node sims/gimp_seed_stream_keyskip_inverse.cjs
```

The programs load `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp1-plaintext-reference.txt`. Their fixed runes, seed, reference vectors, clocks, signs, GP training text, and selection statistics are visible in code; no outside dataset is required. The first reproducer performs 500 source-inventory shuffles with seed `0x3411317`. All six keyskip candidates are inverted and checked against the **authentic original ciphertext** with complete forward re-encryption.

The negative is confined to those declared master-stream or row-raster uses of this default software seed, exact GP29 additive/first-difference transforms, native-GP language expectation, and one-collision extra-draw state. It does **not** rule out other artwork-derived bytes, encrypted non-GP intermediates, semantically meaningful illustrations, unpublished historical source material or a different key schedule. Most importantly, the legacy GIMP random generator could have been used solely to render an image. No repeated broad generator sweep is warranted without a source clue fixing a different key/clock.

**Status: bounded negative; belongs in supporting results, not the verified decryption index.**
