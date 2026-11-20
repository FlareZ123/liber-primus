# Five-fragment row-sum to p50 DH-pair bridge

**Status: intermediate source-indexed state/navigation candidate. A standard-DH readout yields an instruction-like phrase, but no unknown LP2 plaintext or reusable cipher is recovered.**

## Result

The signed-2016 word-indexed fragments select:

```
[12, 29, 30, 12, 26]
THE / DIRECTION / SEEK / THE / NUMBERS
```

Applying the frozen p57 GP0-word-sum → p50 native-base60 byte → divmod29 register gives:

| 2016 word index | Word | GP0 sum | p50 byte | divmod29 pair | DH-state interpretation |
|---:|---|---:|---:|---:|---|
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 29 | DIRECTION | 112 | 73 | [2,15] | [K,b] |
| 30 | SEEK | 56 | 254 | [8,22] | [A,p−1] |
| 12 | THE | 20 | 102 | [3,15] | [e,b] |
| 26 | NUMBERS | 83 | 193 | [6,19] | [a,B] |

The frozen 2013 DH state is (p=23,g=5,a=6,b=15,A=8,B=19,K=2), with the p57 vocabulary also carrying (e=3). Four pairs are exact members of that vocabulary; [2,15] is the cross-pair [K,b]. The ordered sequence is not sorted or rearranged.

## Discriminating controls

The expected ordered sequence is:

```
[3,15], [2,15], [8,22], [3,15], [6,19]
```

- Across all 256 cyclic rotations of the p50 byte tape, the exact sequence occurs only at authored shift 0. The maximum position-by-position match is 5/5, also unique at shift 0.
- Across all 32,768 invertible affine address permutations, the exact sequence occurs only for the identity address map. The maximum position-by-position match is 5/5, also unique.
- The [2,15] pair is not unique to DIRECTION in the entire 43-word source; it also occurs for HELLO and LIBER. The full five-pair ordered sequence is what passes the controls.

Reproducer: `sims/lp2_five_fragment_p50_dh_pair_bridge_sft.cjs`.

## Candidate consumer: exponent-first DH readout

The signed 2013 protocol supplies a concrete modular operation: (B^a\bmod p=K), equivalently (A^b\bmod p=K), for the one-shot exchange. If the p57 divmod pair is interpreted as [exponent, base], applying the same operation to the five pairs gives:

| Pair | Modular operation mod 23 | Output index | Signed-2016 word |
|---|---:|---:|---|
| [e,b] = [3,15] | (15^3\bmod23) | 17 | THE |
| [K,b] = [2,15] | (15^2\bmod23) | 18 | MAP |
| [A,p−1] = [8,22] | (22^8\bmod23) | 1 | THE |
| [e,b] = [3,15] | (15^3\bmod23) | 17 | THE |
| [a,B] = [6,19] | (19^6\bmod23) | 2 | PATH |

The last pair validates the orientation against the source DH equation: (19^6\bmod23=2=K). The exact readout is **THE MAP THE THE PATH**. Collapsing the duplicate output associated with the repeated [e,b] pair gives the compact gloss **THE MAP THE PATH**, but that normalization is not independently selected.

Reversing the pair roles instead gives indices [12,16,1,12,18] and **THE ARE THE THE MAP**. The exponent-first/base-second orientation is therefore the more source-compatible candidate, not an arbitrary choice between the two orientations.

This is an instruction-level cross-route readout, not a decryption. The 2013 protocol defines a single DH exchange; it does not explicitly instruct solvers to apply modular exponentiation independently to every pair in this sequence. The first four pairs are not themselves standard DH exchange role-pairs. The sequence therefore does not establish a repeated DH state transition or a cipher.

A simple holdout also blocks a global successor interpretation: applying the same p57 register and DH consumer to the signed word OPENPGP gives pair [6,3], output index 16 = ARE, not an obvious continuation of the signed message. The complete 43-word mapping is many-to-one. Treat the five-pair phrase as a candidate local navigation clue only.

## Why this matters

The 2016 signed source says its words are the map and their numbers are the direction. The row-sum readout gives the instruction **THE DIRECTION SEEK THE NUMBERS**; the fixed p57 register turns those words into an ordered DH-state sequence; and the only orientation directly validated by the 2013 DH equation maps that sequence back into the signed word map as **THE MAP THE PATH** (with the duplicate THE retained in the exact output). This is stronger than a list of isolated DH vocabulary hits, but it still reuses the same p50 table and signed-2016 message and does not identify an unknown-cipher receiver.

## Evidence limits and next decision

1. The signed-word-index-to-page/fragment convention and five-fragment row-sum readout remain intermediate hypotheses; the p36 GOOD fragment is an existing anchor, not independent validation of this consumer.
2. The p57 GP0 → p50 → divmod29 register was fixed before this five-word application, but the p50 table and 2016 message are shared across the routes.
3. Only the final pair [a,B] is the exact standard DH input pair. Extending the same exponent/base operation to [e,b], [K,b] and [A,p−1] is plausible but not specified by the 2013 protocol.
4. The OPENPGP singleton holdout maps to ARE, so the rule is not a general successor function. No page/word coordinate receiver or unknown plaintext has been identified.

**Next decisive question:** find an independent, source-selected second pair sequence or an original instruction that requires this per-pair DH consumer. Do not broaden to more cipher families or state-transition sweeps unless that selector appears. If no such independent receiver exists, retain this as a local navigation clue and do not promote it to a reusable decoder.

Related work:
- p57 register: `im-results/lp2-p57-divmod29-register-audit.md`
- 2013 DH source: `resources/external/2013-tcp-server-signed-source.md`
- signed-2016 word positions: `im-results/lp2-signed2016-word-position-dh.md`
- five-fragment row-sum family: `im-results/lp2-five-source-indexed-fragments-row-sum-readout.md`
