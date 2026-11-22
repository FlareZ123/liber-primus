# Original p0 five-back keystream: 3.7 million exact native-word coefficient inversions

**Agent 50, 17 November 2026.** Intermediate original-cipher decision following [the complete order-1–4 gate](lp2-p0-red13-gf29-linear-title-crib-gate.md). An arbitrary homogeneous **five-term GF(29) key recurrence** is the direct next extension motivated by the manuscript's previously measured exceptional within-word fifth-position echoes. It is an experiment, **not** an author-authenticated cipher. A fifth-order recurrent additive pad under the genuine Cicada plaintext-F bypass generates plausible short word pairs by chance, yet **no five consecutive original printed words survive** the independent native-English lexicon. No unknown LP2 plaintext or key recovered.

## Source and model

The first five complete printed words on [original physical p0](../resources/liber-primus/17.jpg), preserving the red title, red thirteen-dot separator and subsequent original black text, are GP strings of lengths **8,5,4,3,3**:

1. S-H-E-O-G-M-IA-F
2. S-Y-E-NG-C
3. TH-J-G-AE
4. F-J-OE
5. O-N-TH

The first eight printed runes nominate a first whole-word plaintext crib; each distinct candidate is taken from **independent** Shakespeare, Gibran, Emerson and TextBlob frequency resources, encoded with the native GP spelling fixed by solved LP1 and LP2. All source-native eight-rune words compatible with Cicada's plaintext-F bypass are tried. For every candidate, the observed first-word ciphertext determines seven or eight consumed key states. Solve **all** modular linear systems of the following exact family, enumerating every undetermined coefficient:

    K_t = a1*K_(t−1) + a2*K_(t−2) + a3*K_(t−3)
          + a4*K_(t−4) + a5*K_(t−5)  (mod 29)

No coefficient, seed, clock origin, phase or title word is optimized against later plaintext. Cipher inverse is P=(C−K_t) mod29 for nonzero plaintext P; literal plaintext F=0 outputs F without consuming K. The fourth original word starts with F and thus retains **both** legally possible plaintext-F interpretations. The original last two black words are held out from the first red-8 key fit.

## Exact native-English receiver counts

| Original test stage | Surviving candidates |
| --- | ---: |
| Valid 8-rune first-word cribs | **4,282** |
| All consistent order-5 key coefficient vectors | **3,718,902** |
| First two complete original words in native-English lexicon | **599** |
| First three complete original words in native-English lexicon | **3** |
| First four complete original words in native-English lexicon | **1** |
| All first five complete original words in native-English lexicon | **0** |

The independent lexicon has **4,791** eight-rune, **3,954** five-rune, **2,285** four-rune and **806** three-rune spellings. The three best apparent three-word islands are:

| Original first three printed words as decrypted | Order-5 coefficients |
| --- | --- |
| DISGRACE LOUNGE LACK | 15,25,25,27,23 |
| PRESENTING HYPER LEAPS | 28,7,28,27,16 |
| RESONANT CLARA ANGLE | 16,4,19,10,21 |

Only **PRESENTING HYPER LEAPS MAR** reaches the fourth original word; the fifth original word fails under its unchanged key. These are investigator-selected dictionary collisions among millions of secret keys and are **not** authentic plaintext or even a coherent original sentence. The fifth-word null rejects this complete five-word criterion in the declared register.

### Genuine positive control

A separate original-geometry F-transparent encryption plant on the native words **YOURSELF SHALL LIFE AND ONE** is completely recovered under a five-term key with all free coefficients enumerated, including YOURSELF's terminal nonconsuming F. The genuinely solved 95-rune p57 text round-trips under the same emitter, with every authentic F handled. Thus the independent holdout failure is not an implementation inability to invert native prose under the model.

## Decision

This original-p0 line cannot be decoded into five consecutive pinned-native-English words by the complete family **five-term homogeneous linear additive GP29 keys, continuous across the red title / black text, authentic plaintext-F bypass, and original printed word lengths**, despite trying 3.7 million compatible title-key combinations. Four-word language-looking coincidences are expected when such a large free-key family is allowed; the untouched fifth word is decisive. An unusual word absent from this finite reference, another language/GP orthography, a clock reset at the title marker, a different transform, changed word breaks or a nonlinear/externally keyed stream remain outside the test.

The large free-key search is **retired** unless the original 2014 player could have independently selected a fifth-order key law or new operand. Do not extend arbitrary order to six, where the first word leaves even more unconstrained coefficients.

**Reproducer:** [single standalone Windows Node22 CJS](../sims/lp2_p0_red13_lag5_linear_key_nativeword_sft.cjs). **Successfully executed original-source CI:** [44004964035](https://github.com/FlareZ123/liber-primus/actions/runs/44004964035) (17 Nov 2026); script asserts the five source words and both positive plants.
