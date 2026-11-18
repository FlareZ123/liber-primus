# Source-grounded bzip2 zero-run completion of the 2015 LP2 opening register

**18 November 2026, Agent9. Decision:** The 729-rune LP2 p0–2 opening, after the public 2015 prime-shift/difference proposal, **cannot be a complete ordinary circular Burrows–Wheeler (BWT) last column even when the missing standard bzip2 RUNA/RUNB zero-run expansion and move-to-front inverse are supplied**. Both a continuous opening block and three source-physical page blocks fail a key-independent exact test. **No unknown plaintext, original key or next-stage destination was recovered.**

## Clue-to-operation route, and its limit

The real 2014 Cicada challenge used bzip2 in an earlier stage. Standard bzip2 decompression expands special RUNA and RUNB zero-run symbols **before** inverse move-to-front (MTF), which in turn precedes the BWT inverse. A February 2015 participant described a different, unverified intermediate transformation of the *original* LP2 p0–2 ciphertext that generates 729 symbol values and 40 repeats. Historical use of bzip2 gives an independently motivated way to fill the gap between that intermediate and the BWT decoder.

The existing [2015 D/BWT source report](lp2-2014-html133331-bwt-2015D-lfcycles-original-gate.md) excluded direct BWT and four MTF-only versions; those did **not** apply the bzip2 zero-run expansion. The original HTML integers 133 and 331 are sometimes suggested as BWT primary row positions, but the images do not name such an operation. The 2015 prime/difference stage is a participant proposal, not a Cicada-signed clue. The present test is conditional on both steps.

## Fixed algorithm and original sources

Use canonical GP29 original LP2 ciphertext indices from [the source corpus](../resources/liber-primus/lp2-corpus.json). Physical p0, p1, p2 hold exactly 262, 266 and 201 original runes. Let the consecutive primes begin p0=2, p1=3. The 2015 participant intermediate D is:

    S[-1] = -p0 (mod 29)
    S[i] = C[i] - p[i+1] (mod 29)
    D[i] = S[i] - S[i-1] (mod 29)

The SFT regenerates D (729 symbols, 40 adjacent repeats) and recovers 729/729 original runes under the reverse transformation. The *new* stage interprets D=0 and D=1 as bzip2 RUNA and RUNB. Each consecutive run r0...rk expands into sum over j of (rj+1)*2^j zero MTF ranks. Every other D value 2–28 becomes MTF rank D-1 (1–27). MTF decoding uses the **fixed 28-element GP alphabet** 0–27. The alphabet reduction is a defined conditional receiver, not an assertion about the true LP2 cipher.

An actual bzip2 packet additionally has framing, a used-symbol map, an end-of-block marker and Huffman codes; this test does **not** invent any of those missing inputs. Its output is interpreted as a **single sentinel-free circular BWT last column**, under a continuous source clock or three original-page reset clocks.

The BWT last-to-first permutation can be determined exactly from its candidate last column L without a primary row. For one primitive circular message, LF must be one complete cycle; a periodic message requires equal-length cycles. **Unequal cycles disprove every primary-row choice** for the specified message model, without an English-likelihood screen.

## Original-cipher result

| Original register | D symbol count | RLE2+MTF output count | Complete LF cycle lengths |
| --- | ---: | ---: | --- |
| Continuous physical p0–2 | 729 | **750** | **247, 206, 152, 76, 62, 4, 3** |
| Physical p0 alone | 262 | 267 | 228, 10, 10, 6, 5, 3, 2, 1, 1, 1 |
| Physical p1 alone | 266 | 275 | 160, 75, 30, 9, 1 |
| Physical p2 alone | 201 | 208 | 152, 23, 16, 9, 4, 3, 1 |

There are **42** contiguous RUNA/RUNB groups in the continuous 2015 D register, decoding to **63** zero-rank symbols. The LF cycles shown above are all fixed by original input; no zero- or one-based rendering of historical HTML 133/331 repairs them.

One incidental continuous-LF cycle has length **76**, matching source p55's 76 rune count. This length match supplies no decryption. Even giving that 76-rune cycle *any* cyclic rotation, reversal and arbitrary one-to-one GP29 relabeling, its sorted repeated-symbol multiplicities begin **[7,7,5,5]** while actual original p55 ciphertext begins **[6,5,5,5]**. Consequently a stationary permutation cannot read the actual p55 rune sequence from that cycle. The same SFT explicitly asserts this obstruction, avoiding promotion of the count coincidence into a new key theory.

## Native positive and future decision

The independent positive begins with the **authentic 95-rune clear p57 PARABLE text**, tiled into 729 native GP runes. The source-native text undergoes genuine circular BWT → MTF → RUNA/RUNB encoding → synthetic prime/difference cipher inversion. The same exact decoder recovers the genuine last column, then BWT inverts **729/729 native source GP runes** and yields one 729-cycle. All original source arrays and both original decrypt/reencrypt operations are asserted; the SFT reads source only and writes no files.

[Executable Windows Node22 CommonJS SFT](../sims/lp2_2015_primeD_bzip2_rle0_bwt_sft.cjs) · [Passing original-input CI run 44328934503](https://github.com/FlareZ123/liber-primus/actions/runs/44328934503).

**Retire the one specified RLE2→MTF→circular-BWT route on the published 2015 D.** A different bzip2 packet, added symbol framing, or a different register is outside this result, but requires a distinct original instruction or an independently recognizable packet signature before more parameter tuning. This conditional exclusion does not update the [authoritative decrypted-text synthesis](../results/README.md).
