# P28 READ OUT p0 receiver: wordwise Hadamard shells expose the complete DH23 state

**Agent39, 19 November 2026. Classification: source-linked structural echo on the prospectively selected p0 receiver. No unknown plaintext, new key stream, or global LP2 inverse is claimed.**

## Frozen upstream inputs

This test starts after two independently preserved steps:

1. The p28 center-boundary cube-layer candidate reversibly produces **READ OUT**.
2. The already established whole-word GP0 -> zero-based p50 address -> byte receiver maps
   - `GP0(READ)=55 -> p50[55]=80`
   - `GP0(OUT)=20 -> p50[20]=102`

Those endpoints select original p0 offsets **80..102**, exactly four complete ciphertext words, **23 runes** total, with **F=0 at the exact center**. The source-selected p28 DH object is likewise a 23-rune center-F object.

The only value-changing operation used here is the already frozen p28 circumference transform

```
H(x,y) = (x-y, x+y) mod 29.
```

For each p0 receiver word independently, pair its outer runes, then the next inner pair, and so on. Apply `H` outer-to-inner. An unpaired center rune is not part of a circumference and is left out of the shell-output stream. No phase, radix, Caesar shift, cube iterate, language score, or target plaintext is selected.

## Exact receiver

The four selected p0 words are:

| word | offsets | length | GP29 values |
|---|---:|---:|---|
| 18 | 80..82 | 3 | 21,25,2 |
| 19 | 83..89 | 7 | 10,25,8,14,2,13,6 |
| 20 | 90..94 | 5 | 26,0,21,5,11 |
| 21 | 95..102 | 8 | 2,24,19,10,21,10,27,26 |

Their frozen shell outputs are:

```
19 23 | 4 16 12 9 6 10 | 15 8 24 5 | 5 28 26 22 9 0 18 2
```

The p28 line6 geometry independently fixes the standard DH23 state:

```
p=23, g=5, a=6, b=15, A=8, B=19, K=2.
```

Every one of those seven values occurs in the receiver's Hadamard shell stream. Scanning left-to-right, the first appearances of previously unseen DH-state values are:

```
19, 23, 6, 15, 8, 5, 2
 B   p  a   b   A  g  K
```

That ordering is reported as an observation only. It was noticed after the complete-state coverage and is not used as an acceptance criterion.

## Exact manuscript census

To determine whether complete DH-state coverage is common, the SFT exhausts the canonical unknown-page transcription p0..p55, excluding rune-free p50.

Two comparison families are reported.

### Same coarse shape: four consecutive words totaling 23 runes

There are **117** such spans manuscript-wide. Three contain all seven DH23 state values in their wordwise `H` shell outputs:

- p0 words18..21, offsets80..102, **center F**
- p18 words21..24, offsets82..104, center not F
- p51 words15..18, offsets62..84, center not F

Only **4/117** four-word 23-rune spans have F at the exact center. The READ OUT receiver is the only one combining center-F geometry with complete DH-state shell coverage.

### Broader shape: every whole-word-bounded 23-rune span

There are **614** such spans across the unknown manuscript. Four contain all seven DH23 values under the same frozen shell operation:

- p0 words18..21, offsets80..102, **center F**
- p18 words21..24, offsets82..104, center not F
- p48 words26..31, offsets95..117, center not F
- p51 words15..18, offsets62..84, center not F

There are **23** whole-word-bounded 23-rune spans with F at the exact center. The p0 READ OUT receiver is the **only** member of that center-F family whose shell outputs contain the complete DH23 state.

This is an exact corpus census, not a discovery-adjusted p-value. The receiver, its 23-rune center-F geometry, and the `H` operation were all available before this field-coverage check, but the choice to score complete DH-state coverage was made after inspecting the selected receiver. Treat the result as a discriminating structural echo that deserves independent reproduction.

## Interpretation

The p28 source object selects both the receiver operation and the DH23 state. Applying that same circumference operation to the prospectively selected p0 object reproduces every state value without changing the receiver boundaries or adding a new numerical transform. That is consistent with p0 being an intentional continuation of the p28 READ OUT route.

The result still does **not** say how to turn the p0 ciphertext into English. Direct cube iteration on the p0 title was already rejected, and this report does not introduce a DH-derived running key, tuned field order, or arbitrary extraction from the non-DH shell values. The next justified step is to look for a source-fixed consumer of this state echo, ideally one that makes a blind plaintext or navigation prediction before inspecting another target.

## Reproduction

Run:

```
node sims/lp2_p28_readout_p0_hadamard_dh_echo_sft.cjs
```

The SFT re-derives the READ/OUT p50 endpoints, reparses p0 and p28 from canonical source text, reconstructs the DH23 tuple from p28 geometry, exhaustively verifies `H` invertibility over GP29, performs the selected receiver transform, and enumerates every comparable 23-rune span in the unknown manuscript. Windows / Node.js 22 reproduction passed in Actions run [44427354972](https://github.com/FlareZ123/liber-primus/actions/runs/44427354972).
