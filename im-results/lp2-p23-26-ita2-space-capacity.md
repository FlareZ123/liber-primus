# Physical LP2 pp23–26: exact five-bit teleprinter-space capacity

**Agent 3, 12 November 2026. Classification:** independently specified historical five-bit readout, exact all-secret-bit impossibility for its **plain letters-mode ITA2** variant. **No unsolved plaintext, key, source-authorized teleprinter operation or destination is recovered.**

## The original clue and the bounded question

The original `40.jpg` (physical p23) prints five black dots before its red 16-rune heading. Removing only that source-bounded heading leaves **1,005 unchanged GP29 runes** through p26, namely **201 consecutive groups of five**. The exact figure is one of three geometrically reflected five-dot stencils on p7/p23/solved p56. This motivates a historical five-bit encoding independently of a language score, but the artwork does not state a teleprinter alphabet, rune-to-bit assignment or bit order. For full page and image evidence see [the prior source-art gate](lp2-p23-26-original-art-source-gate.md) and [three-stencil comparison](lp2-p7-p23-p56-five-dot-dihedral-triad.md).

**Frozen candidate:** Assign each of the 29 original GP rune identities one arbitrary permanent secret 0/1 bit. Interpret each chronological quintet as an ITA2 teleprinter five-bit symbol, either in printed bit order or with the five bit positions reversed. The traditional letters-mode codebook has **NULL=0, FIGS=27, LTRS=31, SPACE=4** in the MSB-first numeric convention (with CR=8, LF=2). Restrict this direct prose reading to a no-mode-switch, no-null output: every one of the 201 codes must avoid **0,27,31**. No rune-bit mapping, offset, secret table, language corpus or key is fitted or assumed.

## Exhaustive exact theorem

With `x_r∈{0,1}` for each of 29 rune identities, the predicate that quintet `(r0,r1,r2,r3,r4)` encodes code 4 (00100) is `x_r2=1` and `x_r0=x_r1=x_r3=x_r4=0`. Give each group a binary space indicator `y_i`; constrain `y_i≤x_r2` and `y_i≤1−x_rk` for each of the other four rune positions. For each group and each forbidden code 0/27/31, add the clause requiring at least one of its five bit literals to differ from that code. Repeated rune identities with contradictory demanded bits automatically make that forbidden code impossible. This yields a **pure binary linear program** with 29 unknown bits, 201 space indicators and exact legal-code clauses. Maximizing `Σ y_i` requires no heuristic cipher scoring.

Using SciPy HiGHS MILP with zero MIP gap, both source-natural directions reach the same certified optimum:

| Original source ordering | Maximum ITA2 ordinary spaces / 201 characters | ILP optimality | Number of illegal codes at the maximizing key |
| --- | ---: | --- | ---: |
| Printed 5-rune groups, printed bit order | **12 / 201** | Exact (`mip_gap=0`) | **0** |
| Same groups, reverse bits within each quintet | **12 / 201** | Exact (`mip_gap=0`) | **0** |

The result ranges over **every one of the 2²⁹ fixed rune-to-bit maps**, including maps that assign most rune symbols the same bit. It excludes a source-ordered, single-fixed-bit-map, continuously **letters-mode** ITA2 plaintext passage needing **13 or more actual SPACE codes**, independent of which key a creator might have used. A *native English* 201-character sample from the solved LP1 WELCOME text has **42 spaces** and is losslessly encodable into 201×5 groups using one known 29-rune binary map; the script checks every encoded quintet against the intended original ITA2 character. Thus the capacity test rejects a mechanism the code is otherwise able to carry.

**Countermodel with teleprinter controls allowed.** Removing the NULL/FIGS/LTRS legality clauses entirely, while still maximizing the very same standard ITA2 SPACE code4 over all 29 secret bits, raises the exact optimum to **36/201 spaces** in both source bit orders. A forward witness achieving 36 spaces contains **54 NULL codes and one FIGS**; this demonstrates concretely why the 12-space bound is conditional on a direct, continuous letters-mode register. It also shows that even an unconstrained fixed rune→bit channel cannot carry the specific 201-character LP1 plant's 42 literal SPACE characters at one source output per five-rune group, though a different genuine English passage might use fewer. The [same MILP SFT](../sims/lp2_p23_26_ita2_space_capacity_sft.py) regenerates both optima. Do not interpret skipped NULLs or shift controls as a decoded message without a source-given framing and register policy.

**Important scope:** This is **not** a universal rejection of five-bit messages. An ITA2 stream containing NULL, LTRS/FIGS controls, a separately encoded word space, alternate bit labeling, reset/state switching, interleaved channel, encrypted output or an independently supplied substitution can evade the exact bound. CR and LF were allowed in the 201 original slots but are **not counted as word-space characters**, as their teleprinter role is carriage/line motion. A genuinely space-poor 201-character plaintext is also logically possible. None of these unselected variants is a reason to launch arbitrary key fitting.

## Reproducer and next decision

[Standalone original-input Python SFT](../sims/lp2_p23_26_ita2_space_capacity_sft.py) loads the exact canonical original GP indices (physical p23–p26), removes only 16 title runes, constructs the binary legality and space predicates, calls SciPy HiGHS and verifies the exact dual/primal optimum and a 201-character solved-LP1 positive plant. NumPy and SciPy are its only nonstandard dependencies; it writes no files.

**Decision:** Retire the tempting direct, stationary rune-bit **plain ITA2** reading of the 201 source-fixed quintets as an ordinary space-separated English passage. Preserve the five-dot/201×5 observation, but require a new original artifact supplying the missing output register, bit mapping or key before any extra five-bit codec search.
