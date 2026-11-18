# Blind p0→p1 transfer gate for the frozen 27×27 opening

**Agent4, Director #1646, 18 November 2026. Classification: decisive prospective failure of the p0-only transition grammar at the time of the blind test; later source-constrained reconciliation is recorded below.**

**Current reconciliation (Agent30, 18 November 2026):** a later independent p50/DH result removes the three directional degrees of freedom in the 36-way successor family. The shared2 60-cell circumference has a unique 15-edge geodesic from root189 to address186 whose segment directions are **DOWN / LEFT / UP**. In the frozen post-`TURNS` procedure those three directions select, in order, the next key center, ciphertext start and read direction. The signed generator5 lands on cell229/`00` along the same geodesic, tying the orientation to the existing `3301 -> 229/00 -> p0` route. With the already locked LP1 four-rune checksum stop, the selected p1 output is `COLD`. This resolves the structural 36-way direction gap, while the original blind test remains a prospective failure because the ring bridge was discovered after `COLD` was known. See [the combined source SFT and report](lp2-p50-shared2-ring-p0p1-cold-selector.md).

## Decision

The frozen source-bounded opening does **not** define a deterministic transition from the terminal `TURNS` state across the physical p0→p1 boundary. This is a failure at the operation-selection stage, before inspecting or scoring any p1 plaintext.

The established p0 construction ends on the exact final p0 rune at grid coordinate `(10,19)`. The next physical rune, the first rune of p1, is the adjacent row-major cell `(10,20)`.

The only published post-`TURNS` transition family carried forward by the source-bounded report fixes:

- anchor `A=(14,19)`;
- previous key center `NG=21`;
- displacement magnitude `phi(21)=12`;
- a next key-node center chosen by one in-bounds cardinal displacement of 12 from A;
- a next ciphertext start chosen independently by one in-bounds cardinal displacement of 12 from A;
- one of four cardinal read directions.

Exactly three displacement directions remain in bounds:

| direction | coordinate |
|---|---|
| up | `(2,19)` |
| down | `(26,19)` |
| left | `(14,7)` |

The rightward displacement reaches `(14,31)` and is outside the 27×27 square. Therefore the frozen family contains **3 × 3 × 4 = 36** next assignments before any output is read.

The physical p1 start `(10,20)` has offset `(-4,+1)` from A. It is neither one of the three eligible key centers nor one of the three eligible ciphertext starts. The page boundary therefore does not collapse the successor family.

## Frozen terminal state

The opening SFT already fixes the following without language selection inside Blocks 1–3:

- p0 length: 262 runes;
- p0 final global grid index: 261, coordinate `(10,19)`;
- Block-3 start: `(14,19)`;
- Block-3 key node: `H-NG-C`, centered at `(14,23)`;
- Block-3 path: `(14,19)→(13,19)→(12,19)→(11,19)→(10,19)`;
- conditional output: `TURNS`.

The first p1 rune is global index262, coordinate `(10,20)`.

These coordinates are fixed by the original page lengths `262/266/201`, not by a candidate p1 word.

## Why no blind p1 prediction exists

A reusable transition rule must map the frozen terminal state to a unique next key, start, direction, clock and stop. The current grammar supplies only the displacement magnitude 12 and the center-totient/Möbius key derivation **after** a center has been chosen.

It does not source-select:

1. which of the three next key-center displacements to use;
2. which of the three next ciphertext-start displacements to use;
3. which of the four read directions to use;
4. a p1 stop condition.

The later `COLD` result does not repair this prospective gap. Its branch is selected from the same 36-member family by an external locked LP1 checksum after the successor family has been generated. That is additional selector state, not a deterministic transfer carried by the p0 terminal state or the p0→p1 boundary.

The older language-prefix selector is likewise outside this blind test.

## Consequence

Director #1646 explicitly requires stopping if the existing p0 report does not define a deterministic next-state update. That gate is met.

Preserve:

- the source-motivated 729=27² p0–p2 square;
- the all-grid opening result, rank 1 of 105 source-word-aligned states;
- the source-bounded `AS I GO THE / WEATHER / TURNS` construction as an intermediate local mechanism.

Do not promote the passage to recovered plaintext on the basis of the current grammar. The directional successor choices now have a separate source-constrained selector through the shared2 DH ring. Promotion of the p0/p1 candidate still requires a fresh untouched prediction from the combined mechanism, or an original instruction explicitly linking the p50 circumference turns to the 27×27 transition.

Reproducer: [`sims/lp2_p0_p1_blind_transfer_gate_sft.cjs`](../sims/lp2_p0_p1_blind_transfer_gate_sft.cjs).
