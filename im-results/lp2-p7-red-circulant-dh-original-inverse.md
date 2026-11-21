# P7 five-word circulant inverse reproduces a DH23 source register

**Evidence class (21 November 2026): exact original-GP29 arithmetic correspondence and a direct candidate-body failure.** The matrix relation is reproducible, but `circulant` and the particular recovered register arrangement are interpretations. **No unknown LP2 plaintext, original encryption key or authenticated general decoder has been recovered.**

## Source observation and a human-reconstructible operation

The original physical LP2 p7 image (`resources/liber-primus/24.jpg`) has five distinct red words at rune indices 194–207, immediately above **five separate black dots**. The source provides a fixed count/order of five, unambiguous printed word boundaries and 29 possible rune index values. Its exact five red GP29 vectors, preserving printed order, are:

| Position | Literal GP29 indices | Index product mod29 |
|---:|---|---:|
| 0 | `[23,3]` | 11 |
| 1 | `[22,16,2,25]` | 26 |
| 2 | `[5,7,11]` | 8 |
| 3 | `[14,28]` | 15 |
| 4 | `[6,28,19]` | 2 |

This gives `v=[11,26,8,15,2]`. The existing [p7 inverse-state packet](lp2-p7-red-multiplicative-inverse-dh-packet.md) already established that `v=[A⁻¹,B⁻¹,A,K⁻¹,K]` in GF29 using the independently authenticated 2013 Diffie-Hellman worked example, `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`. That existing coincidence is an upstream premise of the new experiment, not an independent newly recovered key.

One concrete operation a player might infer from **five printed words, five dots, multiplicative reciprocals and the GP29 prime field** is to place `v` as the first row of a cyclic/rotating 5×5 matrix and invert it. The original image supplies the cardinality and source values; **no Cicada instruction has yet been located that explicitly demands a circulant matrix**. To avoid choosing matrix entries after seeing plaintext, freeze the standard *right-rotating* convention:

```text
M = [11 26  8 15  2]
    [ 2 11 26  8 15]
    [15  2 11 26  8]
    [ 8 15  2 11 26]
    [26  8 15  2 11]
```

The exact GF29 inverse is:

```text
M^-1 = [23  2  5  2 19]
       [19 23  2  5  2]
       [ 2 19 23  2  5]
       [ 5  2 19 23  2]
       [ 2  5  2 19 23]
```

All 25 entries of `M * M^-1` are the identity mod29, and `det(M) mod29 = 19`. The inverse's **entire first row** is exactly:

```text
[p, K, g, K, B] = [23, 2, 5, 2, 19].
```

This is a second, different representation of independently known signed-source numbers, including two appearances of the same shared secret `K`. It is a genuine exact field identity. Because both the *circulant hypothesis* and `[p,K,g,K,B]` as the recognized pattern arose during exploration, the coincidence remains a candidate intended design relation. It does not establish that those five numbers encrypt any LP2 body.

## Conditional specificity without retrospective probability claims

Hold the authenticated DH teaching modulus/base `p=23,g=5` fixed. Enumerate the complete finite **22×22** family of nonzero private-exponent pairs `(a,b)` modulo the 23-element DH group, derive `A=5^a mod23`, `B=5^b mod23`, `K=B^a mod23`, and define the identical state/inverse product vector `[A⁻¹,B⁻¹,A,K⁻¹,K]` over GF29. Of 484 tuples, **456** produce an invertible 5×5 right-circulant. **Only the authenticated historical exponents `a=6,b=15`** satisfy the resulting inverse-first-row relation `[p,K,g,K,B]` exactly. The determinant also equals `B=19` at this historical tuple.

This shows that the complete relation is **not an identity that holds for arbitrary DH parameter choices**. The 1/484 matched family count is descriptive and conditional on the source field, the selected circulant convention and the discovered target arrangement. It is **not** a calibrated chance estimate for a research process exploring many possible ways to rearrange GP29 tokens and historical constants.

## Frozen p8 original-cipher consumer: negative

The immediately following original physical p8 contains **exactly 255 runes = 51 complete 5-rune blocks**. That is a plausible entire-page receiver for a five-column reversible operation. Freeze `C_block = M P_block mod29` and decrypt all 255 original p8 runes as `P_block = M^-1 C_block mod29`, with zero-based p8 page start, source column order and no fitted phase or key. The inverse reproduces **255/255** original ciphertext runes on forward replay.

| Readout | Original GP29 IoC |
|---|---:|
| p8 untouched ciphertext, 255 runes | **0.03427513** |
| p8 after standard right-circulant inverse | **0.03637486** |
| p8 after natural transposed orientation inverse | **0.03415161** |
| Independently clear p57, 95 native GP runes | **0.06270997** |

Neither p8 inverse gives an ordinary native-GP letter distribution or readable initial 30-rune text; its direct output remains ciphertext-like. As an algorithmic/native-language control, encrypt all **95** p57 clear GP runes with the exact same source `M`; the same decoder recovers **95/95** original clear runes, including its native IoC. This eliminates a coding/field-orientation failure as an explanation for the negative ordinary p8 readout under the tested convention.

This gate excludes the **whole-p8, page-reset, five-rune standard/transposed Hill consumer** with this exact matrix. It does not test arbitrary page offsets, mixed word clocks, nonstandard invertible matrices, or a different operation on the original **308-rune** marker-bracketed p6→p7 interval. The original artwork does not currently select such adaptations. Do not fit one merely to rescue the numerical identity.


## Original-manuscript-only donor: p7 state reconstructs the previously known p0 title

The circulant inverse has a stronger and more actionable consequence than matching the 2013 worked example. **All nine numerical state variables needed by the already published p0 marker-RISE/H local decoder are recoverable from the p7 red inscription itself**, with no historical square data or known plaintext values supplied as key inputs:

| State variable | Extraction from original p7 | Value |
| --- | --- | ---: |
| `p` | First index of first p7 red word `[23,3]` | **23** |
| `e` | Second index of first red word `[23,3]` | **3** |
| `g` | First index of third red word `[5,7,11]` | **5** |
| `a` | First index of fifth red word `[6,28,19]` | **6** |
| `b` | Fourth red word's product modulo29: `14×28 mod29` | **15** |
| `A` | Third red word's product modulo29: `5×7×11 mod29` | **8** |
| `B` | Multiplicative inverse of second red-word product `26` in GF29 | **19** |
| `K` | Fifth red word's product modulo29: `6×28×19 mod29` | **2** |
| `q` | Sum of the five products `11+26+8+15+2 = 62 mod29` | **4** |

The original p7 source therefore yields `(p,e,g,a,b,A,B,K,q)=(23,3,5,6,15,8,19,2,4)` entirely from its **literal rune indices, word products, one GF29 reciprocal, and the five-word product sum**, without invoking a circulant matrix or solving a discrete logarithm. The resulting `g=5,a=6,A=8,B=19,K=2` satisfy `g^a mod23=A`, `g^b mod23=B` and `B^a mod23=K`. The independently computed circulant inverse first row `[p,K,g,K,B]` gives a separate exact algebraic check on that same source state. Independent signed-source facts *verify the labels* but do not enter the arithmetic. One additional cross-page relation is `q=4` and `g=5`, equal to the visible `4|5|4` source marker geometry immediately beside the **p0 red title**, and `A+g=13`, the number of dots in that marker.

Feed these **p7-derived values**, and the original p0 `4|5|4` /13-dot geometry, into the **previously published, unchanged** three-column RISE rules ([existing p0 state-only key construction](lp2-p0-square-state-rise-key-serializer.md)):

```text
u = q-e = 1,    t = g+K = 7,    w = A+g = 13

left  = cumulative(-q, [q-u, w-u, w+u])       = [25,28,11,25]
center= cumulative( q, [q, q+t, q+2t, q+3t]) = [4,8,19,8,4]
right = cumulative( t, [t-u, t, t+u])         = [7,13,20,28]

H(left || center || right)
       = [26,24,8,19,27,24,18,3,0,8,0,16,19]
```

Subtracting this **source-only regenerated key** from all **13 original p0 red-title runes** reproduces the earlier independently recovered GP spelling **`EPIPHANYSEECS`**, human **“EPIPHANY SEEKS”**. All 13 original ciphertext runes reencrypt exactly; unlike the nonprose p8 Hill output, this output is a meaningful 13-rune original ciphertext recovery. The result does **not** add new previously unsolved plaintext, because `EPIPHANY SEEKS` was recovered by several earlier routes before this p7 calculation.

**Novel consequence:** a single *later page of the original encrypted book itself* can supply the complete proposed numeric p0 decoder state, whereas the older route used external 2013/2014 worked-example and square metadata to populate the same values. This offers an internally closed source-key loop and a new human-solve-path hypothesis for cross-page navigation.

**Critical limitation:** this is a reconstruction using the earlier RISE/H grammar, which was originally found after the 13-rune p0 residual was visible. The source provides five words and five dots, but still does not tell a blind solver to form a circulant or to assign its row entries exactly to `[p,K,g,K,B]`. The `q` row sum and `[23,3]` interpretation are arithmetic observations recognized after the DH state was known. Therefore this is a reproducible **source-only key donor for an already-known local reading**, not a prospective solution of the unknown LP2 bodies or evidence that the exact proposed path was intended in 2014.

The expanded [single-file original-source SFT](../sims/lp2_p7_red_circulant_dh_inverse_sft.cjs) now derives all state variables directly from p7 original rune indices and red-word products **before** opening p0's printed title, using the circulant inversion only as an independent check, runs the existing serializer, verifies the full 13-rune forward replay and separately preserves the negative 255-rune p8 body test. [Windows Node22 original-p7-only key recovery PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44932016786).

## Decoding decision

The inverse could serve as a **register recovery clue** to the historical DH source rather than a ready-made ciphertext key. A genuine next step would require an independent first-party instruction tying one specified body interval to that 5×5 map (or another uniquely specified use), an exact reset/direction and an untouched plaintext prediction. Until then, retain the algebraic observation without promoting it to a recovered cipher. The preceding [p7 reciprocal-product report](lp2-p7-red-multiplicative-inverse-dh-packet.md) covers the original red structure and earlier failed direct consumers.

**Complete reproducer:** [Windows Node22/CommonJS read-only SFT](../sims/lp2_p7_red_circulant_dh_inverse_sft.cjs), reading `lp2-corpus.json` and the physical `lp2-transcription.txt`. The program asserts the exact original red words, all matrix entries, determinant, DH signed tuple, conditional exponent family, complete p8 reencryption and solved p57 positive plant. [Updated original/census test PASSED](https://github.com/FlareZ123/liber-primus/actions/runs/44930877683).
