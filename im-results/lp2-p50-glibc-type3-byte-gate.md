# LP2 original table: glibc TYPE_3 consecutive-low-byte exclusion

**Decision:** Director [#2685](https://github.com/FlareZ123/liber-primus/issues/2685), Agent45. Both fixed source-token interpretations are incompatible with this observation model for **every** initial state. No unknown plaintext, authored key, or generator identified.

The input is the source-adjudicated 256 row-major cells across physical p49–51, [canonical grid](../resources/liber-primus/lp2-grid-256.json), blob 2550eae357442912220e05dc51147523a61dd75a. Radix60 uses its printed alphabet; radix59 removes unused lowercase f, as in the [existing source adjudication](lp2-grid-11-original-glyph-adjudication.md). No offsets, reordering, or arbitrary reducers were tested.

Historical primary source: [glibc 2.19 random_r.c](https://github.com/bminor/glibc/blob/glibc-2.19/stdlib/random_r.c#L120-L123), blob 87cfdc285c0f6e4a4911eac0f6dd5efa2c3fb8b6; degree 31, separation 3, feedback/output at lines 385–387. [Default TYPE_3 state configuration](https://github.com/bminor/glibc/blob/glibc-2.19/stdlib/random.c#L187-L189). [Independent 2007 mathematical description and native reference output](https://www.mathstat.dal.ca/~selinger/random/). The feedback is additive modulo 2^32. Discarding the low state bit permits a carry of zero or one in the output sum; projecting onto the low byte preserves this necessary condition modulo 256.

| Radix | delta=0 | delta=1 | Contradictions | first contradiction (zero-based) |
|---|---:|---:|---:|---:|
| 59 | 2 | 1 | 222 | 31 |
| 60 | 1 | 3 | 221 | 31 |

Cell 31 under radix59 is 131, whereas the preceding constrained inputs 200 and 148 permit only 92 or 93. Under radix60 it is 133, whereas 203 and 150 permit only 97 or 98. Thus no hidden low-bit assignment can realize either tape. Subsequent output predictions are inapplicable.

Independent native Linux glibc 2.41 controls (seeds 1, 3301, 305419896, 4294967295) produced 163/62, 166/59, 180/45, 175/50 zero/one deltas respectively, with **0/900** violations. The period 2.19 implementation was inspected, not executed natively. Original table counts were computed using V8 on the exact repository JSON.

Reproduce using [single-file Python test](../sims/lp2_p50_glibc_type3_byte_gate_sft.py) from the repository; native controls run on glibc Linux, portable historical-vector control otherwise. No CI claim.

Retire the precise consecutive raw low-byte TYPE_3 observation model across all seeds. This does not eliminate other state types, observation rules, generators, or table-generation procedures. Do not infer an actual cipher from this failure.
