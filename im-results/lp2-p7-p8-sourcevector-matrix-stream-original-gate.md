# The p7→p8 matrix as a complete autonomous GP29 keystream: original decoder gate

**Agent46, 28 November 2026. Evidence class: new source-seeded reversible cipher consumer with a bounded original-input negative, not a plaintext recovery.** [One-file SFT](../sims/lp2_p7_p8_sourcevector_matrix_stream_original_sft.cjs) · [successful Windows Node22 original-source CI](https://github.com/FlareZ123/liber-primus/actions/runs/46141009614).

## The missing cryptographic distinction

The [new p8 fragment-square source result](lp2-p8-fragment7-chapter-state.md) establishes an actual **adjacent-page state transfer**, not merely a seven-symbol coincidence: p7's original five marked red-word products determine a quartic orbit; its five-step warmup freezes **v=[5,15,28,9,10,24,7]**, and p8's original 49 black fragment lengths determine an exact **7×7 matrix M** over GP29 with **Mv=[2,28,5,28,23,28,27]**. The same result previously tested *moving* blocks of ciphertext under successive matrix powers, but not using the entirely source-fixed **autonomous state trajectory** as a changing **symbol-level keystream**. Those are different ciphers.

Because the original p8 first black word has GP0 product **K=2**, choose output component **index K=2**, with no free coordinate. This gives the fully reproducible, source-selected candidate generator

```
state[0] = v
state[t+1] = M × state[t] mod29
key[t] = state[t][K]
plaintext[t] = ciphertext[t] ± key[t] mod29
```

The exact M matrix is transcribed from the page's 49 original printed fragment *lengths* in row-major 7×7 order by the SFT, **not** fitted to unknown ciphertext. The signed p7 warmup is reconstructed by source word products in the same script. The source already identified the 243-rune p8 black segment and the following complete p8–p14 chapter; the former starts immediately after the 12-rune red heading, and the longer joint 1,717-rune body keeps the natural p8→p9 carry.

The machine state actually traverses **24,388 distinct states** before returning to v, exactly the published matrix order `29³−1`. Thus this is a nonperiodic (on page scale), autonomous, strongly mixed finite-field stream, **not** a seven-period key or a static Hill substitution. The first 12 values of component K are

```
[28,5,5,9,7,2,11,7,20,18,23,7].
```

The **only** finite controls charged are two source-literal clock conventions (sample v before the first M step or sample Mv), both GP29 additive signs, and two natural notions of t: advance the matrix **for every rune**, or advance **once per one of the 49 original printed black fragments** while holding each fragment's key constant. The longer contiguous p8–p14 receiver is meaningful only for the rune clock. No phase search, coordinate search, key material from ciphertext, F bypass, cipher-feedback tweak, or word-length fitting occurs.

## Original results

| Source clock / receiver | Candidate models | Best original GP29 IoC | Cipher runes |
| --- | ---: | ---: | ---: |
| Per rune / p8 black | 4 | **0.0364248546** | 243 |
| Per rune / continuous p8–p14 after p8 red | 4 | **0.0344701891** | 1,717 |
| Per printed fragment / p8 black | 4 | **0.0337040438** | 243 |
| **All direct consumers** | **12** | **0.0364248546** | 243 or 1,717 |

The unmodified original 243 black p8 runes have IoC **0.0340441452**; a fixed independent native benchmark comprises **89 original solved-GP windows of length243** with IoC **0.0544502262–0.0734278815**. Every one of the 12 source-frozen candidate inverses is below even the lowest native reference. None produces a coherent source-native word stream; the best GP29 IoC remains far too near ciphertext baseline. Full output previews, keys, all twelve IoCs and original reconstruction checks print from the exact script.

This is a **real cipher receiver test** rather than a numerical coincidence: applying the identical candidate source stream to an independently solved native-GP 243-rune plant, re-encrypting, then inverting recovers all **243/243** rune values; every candidate inverse also re-encrypts exactly to the unmodified original.

## Next decision

**Reject the direct p7 state + p8 matrix autonomous additive keystream for the source-selected physical p8 original and chapter consumers.** The closely matched source-specific matrix algebra remains potentially intentional and is unaffected; the result does not refute a **nonadditive** state-to-symbol map, another originally authored output coordinate, a typed branch traversal, or an independent external packet. Those require a new first-party selection; optimizing phases or key components on ciphertext after this negative would reintroduce unlicensed freedom.

The strongest still-missing link is an authored **source-to-cipher opcode**: what a human solving the p7→p8 state transfer would do *with* the seven field values to recover unknown runes. This experiment closes an especially straightforward candidate without turning the algebraic source packet into a claimed decipherment.
