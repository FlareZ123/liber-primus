# P0–2 27×27 circumference traversal followed by solved-page prime/F inverse

**Status (Agent13, 16 November 2026):** bounded source-visible structural test, **negative for direct plaintext recovery**. No key, unknown plaintext or original Cicada instruction was recovered. Reproducer: [standalone CommonJS original-source SFT](../sims/lp2_p0_27rings_phi_ftransparent_sft.cjs); [successful Windows Node 22 workflow](https://github.com/FlareZ123/liber-primus/actions/runs/43919601711).

## Why this test is a different route

The original first chapter is **262+266+201=729 GP29 runes** (physical pp0–2), exactly **27×27**. Clear p57 directs the reader to **shed circumferences**. A source-respecting but *hypothetical* reading places the three pages' unchanged runes in one 27×27 **row-major** square and traverses its 14 complete nested boundaries from outside in. This preserves the entire original alphabet and 729 positions. It may be appealing to a human because the dimensions are simple, but the book does **not** print its first chapter in this square, explicitly instruct a three-page square reflow, or select a cipher after reading rings. This is weaker authorship evidence than a literal printed graphic.

The candidate inverse is the **actual independently solved p56** transformation: GP29 additive `φ(prime)` key clock with plaintext `F` transparent to the key. We test both arithmetic signs as an intentionally limited rival, and let the prime-clock start be unselected within ordinal positions **0–4999**. For every encrypted `F`, the exact reachability DP includes the bypass and consumed-key possibilities, rejecting any path producing plaintext `F` through a consuming step.

## Full original-input decision

Read the literal 27×27 square in all eight mirror/rotation orientations, from outside to center or center to outside, then test both cipher signs at 5,000 prime starts. This is **8×2×2×5,000 = 160,000** complete original-cipher reachability tests. A legal path must process **all 729 unchanged original source runes** with a valid `F` bypass history.

- **26** prime-start candidates survive in **11** of the 32 model families; all other family/start pairs violate the exact p56 cipher's plaintext-`F` condition before the end.
- Legal survivors have GP29 coincidence **below 0.04** even when the complete surviving `F` bypass histories are enumerated. The independently clear p57 sample has IoC **0.06271**. Exact original forward reencryption is checked for every surviving plaintext.
- Zero survivors yield recognizable complete original-chapter GP29 prose. This qualitative check supplements the objective IoC criterion; it is not a source-derived likelihood or a significance test. The unique prime indices, rotations and arithmetic signs have no independent source authorization.
- The SFT independently checks that the known 85-rune p56 plaintext reencrypts exactly using the original `φ(prime)` / transparent-F transformation and ordinal start 0, so the negative is not caused by a malformed implementation of the real solved-page cipher.

For reproducibility, the surviving start indices by `orientation|reverse|sign` are: `0|0|+1:2381,2382`; `1|0|+1:3243,4545`; `2|1|-1:4406`; `3|0|-1:1359–1362`; `4|0|-1:2078–2080`; `4|1|+1:35,36`; `5|1|+1:3285,3286`; `6|0|+1:4438`; `6|1|+1:3308`; `7|0|+1:3515–3517`; `7|0|-1:538–542`. All other family configurations have zero starts.

## Next decision

**Retire this exact ring reading + unmodified p56 prime-totient cipher route**, including freely choosing an offset from the 26 near-uniform survivors. A different source-authored ring operator or genuine key remains possible, but the result itself does not select one. The separate [original 27-square ring/2016-source numeric experiment](../sims/lp2_p0_rings_2016_payload_gate_sft.cjs) and [p50 256-cell ring pairing](../sims/lp2_p0_square_p50_page_ring_256_sft.cjs) used distinct operators; their existing failures are not erased by this test.

Research priority should return to identifying a **creator-supplied reversible operation or authentic key**, rather than exploring further 27-square ring/key permutations without an independent clue.
