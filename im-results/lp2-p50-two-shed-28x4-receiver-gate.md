# Twice-shed p50 28×4 core receiver gate

**Agent8, 18 November 2026. Director #1641. Classification: source-selected geometry, no source-selected value receiver, no unknown plaintext.**

## Decision

The signed-DH/p57 route fixes a literal geometric object cleanly: apply the recovered shared value **2** as two complete rectangular circumference peels to the source-ordered 32×8 p50 table. The surviving row-major core is **28×4 = 112 cells**, and its exposed circumference has **60 cells**. Addresses186 and189 lie on opposite side edges of that circumference, whose shortest ring distance15 reproduces the worked-example client exponent.

That geometry does **not** supply a complete reversible payload operation. Every authenticated Cicada operation compatible with the route is missing a required typed input, serialization, or state source before plaintext scoring begins. Per #1641's completion fork, retire the 112-cell core as a plaintext/key operand and retain it as geometric structure only.

## Frozen core

The original p49–p51 typography independently selects one continuous left-to-right, top-to-bottom 32×8 table (#1632). With zero-based table coordinates used by the conditional DH interpretation, two complete peels leave exactly rows2..29 and columns2..5: **28×4 = 112 cells**. The circumference contains `2*(28+4)-4 = 60` cells. Conditional DH addresses `186=(23,2)` and `189=(23,5)` both lie on that ring, with shortest ring distance15.

## Length and serialization boundary

No LP2 page contains 112 runes, so the core has no direct one-cell-per-rune page receiver. The once-shed 30×6 interior has180 cells, exactly solved p56+p57's `85+95=180` runes, yet the existing source test finds many conflicts under deterministic byte→GP assignments and does not recover the known text.

The table prints two-character numeral tokens. Conventional base60 can serialize them as bytes, while the p27 pointer circuit locally selects base59 for particular cells. No first-party instruction extends that local base59 rule to all112 core cells or supplies a global byte→GP29 mapping.

## Authenticated receiver inventory

| Historical operation | What is authenticated | Missing input for the 112-cell core |
| --- | --- | --- |
| Signed 2013 DH | Integer exchange ending in literal `03 DATA k` | #1625 establishes no KDF, payload cipher, IV, byte/rune codec, or post-DH receiver |
| Signed 2013 NEXT | Records client-supplied plaintext lines | It does not consume or transform the DH shared integer |
| 2013 Instar XOR | A genuine bytewise XOR precedent | No source selects a second equal-length 112-byte operand. Repeating scalar2 or another DH field would invent key expansion |
| Solved-p56 prime/totient cipher | Reversible GP29 transform with a specific prime/totient clock and transparent-F behavior | The core has numeral cells rather than GP29 symbols and supplies no authenticated prime start/clock; byte mod29 would invent serialization |
| Signed BASE29 | Deterministic scalar integer→base29 numeral conversion | It defines no block cipher or per-cell inverse over 112 cells |

No candidate reaches the issue's eligibility threshold of exact serialization, state provenance, direction, initialization, inverse, and blind original target. Therefore no plaintext score or cipher menu is justified.

A future reopening requires one new first-party fact that supplies an explicit whole-core numeral alphabet, an equal-length operand, a reversible payload operation consuming the recovered state, or a source-selected original target span.

Supporting sources: [shared2 circumference/client-secret report](lp2-p27-dh23-shared2-circumference-client-secret.md), [operation gate](lp2-p27-find-divinity-operation-gate.md), [p27 DH transducer](lp2-p27-red13-dh-radix-transducer.md), [row-major source-layout gate](lp2-p49-p51-rowmajor-source-layout-gate.md), and [outer76/inner180 source test](../sims/lp2_32x8_outer76_p55_instar_source_gate_sft.cjs).
