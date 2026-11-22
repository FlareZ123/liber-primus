# LP2 23-cycle → p32 compass path → p55 key gate

**17 November 2026 · Agent 1 · intermediate original-source result.** The opening 23-word pointer cycle can be fed through the already-proposed p50-byte compass decoder to make a 23-rune path across the provisional p32 11×11 layout. Its twelfth move lands on **p32 cell 55, an X rune**. That is an interesting possible pointer to physical p55, but it is not a decryption: the p32 page has five X runes, the cell layout and compass convention are inferred, and no original instruction says to treat this path as a key. Two direct, source-motivated readouts tested below fail to produce plaintext.

## 1. Reconstructed opening cycle

The canonical original p0–p2 transcription contains **729 runes in 158 printed words**: two red heading words followed by **156 black-body words**. Their GP-prime sums are **347** and **315**. Using the first red word as the seed and the candidate pointer

\[
f(i)=\left(\sum_{r\in w_i}\operatorname{GPprime}(r)\right)\bmod156
\]

gives the already reported three-node transient (one-based body-word cells **36, 56, 113**) followed by the exact **23-node cycle**:

    6, 65, 112, 35, 25, 120, 4, 96, 15, 68, 54, 152,
    109, 89, 102, 129, 82, 12, 151, 122, 108, 140, 144

The 23 selected words contain **119 original runes**. The second red heading seed enters the same cycle at offset 6. The 23-cycle is a reproducible source-derived structure; modulo 156 and the interpretation as a pointer map remain hypotheses, as documented in [the original 13×12 gate](lp2-13x12-wordmap-23cycle-source-gate.md).

## 2. Provisional compass continuation

This continuation reuses, rather than re-derives, the existing p50/p32 compass convention:

- take each selected word's GP-prime sum modulo 256 as a zero-based address in the original 256-byte p50 table;
- decode the byte's low three bits as one of eight compass directions and its high five bits as distance;
- walk the p32 121-rune stream reflowed row-major as an 11×11 grid, modulo 11;
- start at zero-based cell 33 (row 3, column 0), the H in the contiguous HOMEX run.

The 23 visited p32 cells, one-based, are:

    41, 77, 97, 91, 80, 81, 44, 35, 13, 25, 45, 55,
    53, 50, 20, 97, 75, 39, 89, 99, 109, 21, 70

The corresponding runes are:

    S W S NG H EO D O W B NG X N A IA S H W T J L OE IA

At step 12, the path reaches **one-based cell 55 / zero-based index 54**, whose p32 rune is **X**. This is not the X at the end of the HOMEX marker (cell 38); it is a different X. The path continues and ends at cell 70 / IA. The numerical coincidence “cell 55” → “physical p55” is worth preserving as a hypothesis, not treating as an authenticated address. There are five X runes on p32, and the p32 11×11 arrangement and compass walk are both inferred.

The compass continuation's assumptions are those already recorded in [the p57 ring/2016 word-map bridge](lp2-p57-ring-totient-2016-wordmap-compass-bridge.md) and [the p32 tree source gate](lp2-tree121-signed2016-source-gate.md). In particular, the p32 tree is not the same artwork as the signed 2016 tree; the 563×569 / first-row-first-column sum equality is an exact numerical observation, not proof of shared image identity.

## 3. Direct decryption tests

### A. Treat the selected 119-rune cycle stream as ciphertext under the solved p56 cipher

The solved p56 method supplies a concrete, reusable operator: consecutive-prime totients \(K_i=(p_i-1)\bmod29\), beginning with \(p_1=2\), with plaintext F passing transparently without consuming a key symbol. The 23 selected words are a source-selected 119-rune stream, so applying this already-solved operator is a low-complexity direct test.

Both arithmetic signs were tested with a continuous, nonwrapping prime key and exact dynamic programming over every legal F-bypass placement:

| Inverse | Complete legal inverses | Result |
|---|---:|---|
| \(P=C-K\) | **0** | No full inverse exists under the F-transparent rule |
| \(P=C+K\) | **8** | All outputs remain ciphertext-like |

The eight surviving \(P=C+K\) outputs have GP29 IoCs from **0.03176 to 0.03490**. Their original 23 word boundaries remain nonlinguistic. This rejects the direct transfer of the p56 cipher to this selected stream; it does not exclude a different operator or an extra layer.

### B. Treat the 23-rune p32 path as a periodic key for original p55

If cell 55 is a pointer to physical p55, the path's 23 GP indices are a natural candidate key to test once against the 76 original p55 runes. The cycle length fixes period 23; no phase, key permutation, page reset or language-fitted parameter was introduced. Both signs and the known plaintext-F transparent convention were tested.

| Inverse | Complete legal inverses | GP29 IoC range |
|---|---:|---:|
| \(P=C-K\) | **4** | **0.03018–0.04175** |
| \(P=C+K\) | **1** | **0.03228** |

None of the five outputs is readable GP prose. The exact p55 input has 76 runes and three literal F symbols. Every candidate re-encrypts the original exactly. As a positive control, the independently solved 95-rune p57 plaintext was encrypted and recovered exactly under each of the four tested key/sign combinations. Thus the inverse and F-bypass implementation works; the original p55 result is negative for this specific periodic path key.

The earlier [23-cycle prime-sum key test](../sims/lp2_wordmap23_cycle_p55_native_inverse_sft.cjs) already tested the 23 word-prime sums modulo 29 as a direct p55 key and found no plaintext. This report tests a distinct key: the rune sequence obtained by the provisional p32 compass continuation.

## Decision

Preserve the **23-cycle → p32 cell-55 X** as a possible navigation clue. Do **not** promote it to a p55 solution, key, or destination. The two cheapest direct consumers tested here fail: the selected cycle stream is not decoded by the solved p56 operator, and the path-rune sequence is not a periodic additive key for p55.

The causal next step is not another key encoding, phase or receiver sweep. It would require an independent source instruction that selects how the cell-55 path is to be consumed (for example, a specified p55 address/readout or an authenticated key schedule). Without that, further transforms would multiply assumptions rather than advance toward plaintext.

**Reproducer:** [source-exact CommonJS SFT](../sims/lp2_wordmap23_compass_p55_key_sft.cjs). It reads the checked-in original transcription, canonical GP corpus and p50 256-byte table; asserts the exact cycle, path, cell-55 X, all original inverses and solved-p57 positive controls.
