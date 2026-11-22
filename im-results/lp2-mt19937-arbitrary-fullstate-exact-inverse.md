# MT19937 arbitrary-full-state exact inversion of the LP2 28-way step stream

**Agent23, 15 November 2026. Exact cryptanalytic negative, with 16 genuine MT19937 positive controls. No unknown plaintext or key.** Successful original-input run: [GitHub Actions 43670612751](https://github.com/FlareZ123/liber-primus/actions/runs/43670612751). Reproducers: [Node22 driver](../sims/lp2_mt19937_fullstate_original_sft.cjs), [C++20 F2 solver](../sims/lp2_mt19937_fullstate_inverse.cpp), and [manual workflow](../.github/workflows/agent23-mt19937-fullstate-manual.yml).

## Why this is stronger than seeded searches

The canonical original LP2 p0–55 corpus contains 12,956 GP29 runes over 55 rune-bearing pages. It has 12,901 within-page successor positions, **86 zero differences**, and **12,815 nonzero differences**.

A direct 28-way MT19937 step hypothesis would read each nonzero difference D=(Ccurrent−Cprevious) mod29 as either:

1. Ordinal: D = 1 + (M mod28).
2. Exponent: D = 15^(M mod28) mod29, where 15 has multiplicative order28 mod29.

M is the next full 32-bit tempered MT19937 output. Because 28 is divisible by4, the first proposal reveals the **lowest two bits** of M as (D−1) mod4. The second reveals those bits as log-base15(D) mod4. Both interpretations are checked also with the reverse GP29 step sign. These two-bit observations are *linear functions over GF(2)* of all **19,968 unknown raw MT19937 state bits**, even though M mod28 as a full-output operation is not linear. A symbolic C++20 implementation generates the true 32-bit MT19937 tempering and state twists, constructs independent low-two-bit constraints, and applies exact online GF(2) elimination. All possible internal states are included; no seed, page phrase, key clock phase, or wordlist is searched.

The four original-visible clock choices are page-head MT draw absent/present and zero-difference draw skipped/consumed as an unobserved value. Cross those with both encodings and both GP29 step signs for **16 exact original cases**. The zero-consumption alternative explicitly permits all 86 source repeats to hide arbitrary MT outputs without assigning them a plaintext symbol. No other irregular key skips are allowed in this finite model.

## Original-input execution

| Generator clock | Observed low-2-bit outputs | Total MT draws | GF2 rank | Exact original contradictions across four encoding/sign combinations |
|---|---:|---:|---:|---:|
| Page head skip; zero skip | 12,815 | 12,815 | 19,939 | **2,817–2,888** |
| Page head skip; zero draw | 12,815 | 12,901 | 19,939 | **2,790–2,917** |
| Page head draw; zero skip | 12,815 | 12,870 | 19,937 | **2,849–2,889** |
| Page head draw; zero draw | 12,815 | 12,956 | 19,937 | **2,785–2,893** |

Every one of the **16/16 original models is inconsistent with every possible 624-word MT19937 state**: the first independent contradiction occurs between output positions **9,968 and 9,999**, with thousands more afterward. This is a deterministic all-state inconsistency, not a statistical p-value or an exhausted finite seed sweep.

**All sixteen positive controls passed.** For every original-page and zero-marker clock, the same solver independently checks an authentic full-width 32-bit C++ standard-library MT19937 generator, initialized with a seed unknown to its GF(2) inference routine. The planted stream satisfies all 12,815 observed two-bit outputs, producing **zero contradictions** in each case. The symbolic twist, tempering, unknown-state inference, original-marker bookkeeping and equation solver therefore successfully recover an entire authentic MT-generated observation stream of the exact source shape.

## Cryptanalytic consequence

**Retire a manuscript-wide direct MT19937 low-bit successor-step generator** under the exact ordinal/power-of-15 output mappings, fixed signs and four source-simple clocks. Trying more 32-bit seeds or 256-bit grid-derived seeds for these exact models is futile: every possible full internal state has already been excluded.

The test is conditional on its direct-generator construction. It does **not** exclude MT19937 as an additive or affine mask over unobserved plaintext, high-bit or rejection-sampling outputs, arbitrary nonzero-step key skips, a separate MT state per page/section, nonlinear output permutations, or other generators. The original historical artifact does not itself name MT19937. This is a strong method-specific structural exclusion rather than plaintext recovery or a claimed creator-selected cipher.
