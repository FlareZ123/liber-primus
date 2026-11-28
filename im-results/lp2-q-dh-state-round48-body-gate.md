# Q-derived seven-field DH state fails both calibrated Round48 erasure channels on p8/p23 bodies

**Agent1, 28 November 2026. Source-constrained conditional negative; no plaintext/key promoted.**

## Premise and receiver lock

The newer plain-Q route selects physical p8 and p23 and, from their complete red spans plus Q-directed page rune counts, reconstructs the seven-field worked exchange

```
(p,g,a,b,A,B,K) = (23,5,6,15,8,19,2).
```

That reconstruction survives the repository's complete 840-scalar × 16-orientation charge in exactly one presentation, although its arithmetic grammar was recognized post-discovery. This experiment grants that state and asks whether it is the missing periodic body key.

Both selected pages have their complete red span at page origin. The receiver is therefore fixed without plaintext inspection as the complete black body immediately after that span:

- p8: red12 at offset0, then **243** body runes from offset12;
- p23: red16 at offset0, then **197** body runes from offset16.

Charge exactly two source-motivated representations of the seven values in label order, period7, phase0: the raw tuple `[23,5,6,15,8,19,2]`, and the already-authentic solved-p56/p23 prime-minus-one serializer `T(n)=prime(n)-1 mod29`, giving `[24,10,12,17,18,8,2]`. No key rotation, permutation, additional KDF or receiver shift is searched.

## Mod36 hidden-output inverse

The existing exact/unbounded periodic inverse models GP29+SPACE plaintext, mod36 output, strict repeat rejection and seven silent output symbols. A same-key held-Gibran plant calibrates each key representation.

| representation | same-key native | p8 body | p23 body |
|---|---:|---:|---:|
| raw state | **-1.91939678** | **-4.89490246** | **-4.86520342** |
| prime-minus-one state | **-1.83141389** | **-5.25876734** | **-5.09412309** |

All original candidates replay exactly but are grossly non-native. Exact replay proves only reachability of the permissive channel.

## GP29 deletion inverse

The separate existing strict-repeat + iid-deletion inverse is run with each period7 representation, phase0, beam900 and at most three deleted plaintext symbols between observations.

| representation | p8 body | p23 body |
|---|---:|---:|
| raw state | **-4.11176524** | **-4.20470830** |
| prime-minus-one state | **-4.23656160** | **-4.15774657** |

Matched known-key controls recover 92.53% Shakespeare and 84.12% Gibran retained plaintext with scores **-3.02934 / -3.08207**. Independent wrong-key controls score **-4.05111 / -4.15931**. Every original decode is at wrong-key scale.

## Decision

Neither the raw seven-field DH state nor its one already-authenticated prime-minus-one representation is the simple periodic key for either calibrated Round48 erasure channel on either Q-selected black body under the natural phase0 transfer. This closes a materially stronger key-delivery hypothesis than arbitrary state-key searches because both the state and the two body receivers are supplied by the same Q navigation route before the erasure inverse is applied.

The result does not reject the Round48 channel families globally, nor the Q navigation/state route. It rejects this specific causal continuation:

```
Q navigation -> p8/p23 state reconstruction -> {raw DH tuple, authentic prime-minus-one image} as periodic erasure key -> black body plaintext.
```

A different KDF, clock, receiver or independently authored operation remains open.

## Reproduction

`sims/lp2_q_dh_state_round48_body_gate_sft.cjs`

The SFT imports the two pre-existing erasure-channel implementations unchanged and replays the native controls and original results above.
