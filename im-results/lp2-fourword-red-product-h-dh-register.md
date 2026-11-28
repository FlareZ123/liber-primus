# LP2 four-word red product→H DH-register channel

## Classification

**Intermediate source-coherent algebraic result; no unknown plaintext and no body decoder.**

All three original LP2 red spans containing exactly four complete printed words — physical p6, p23, and p54 — form compact expressions of the independently authenticated DH23 state when each red word is reduced by its GP29 product and the already-used adjacent-pair transform

[
H(x,y)=(x-y, x+y)pmod{29}
]

is applied to the two printed word pairs.

The construction is unusually constrained because both operations already have independent manuscript roles:

1. whole-red-word GP29 multiplication on p7 gives the established inverse-state packet ([11,26,8,15,2]=[A^{-1},B^{-1},A,K^{-1},K]);
2. the same forward (H) orientation on p23's printed adjacent **word-length pairs** is the existing source object behind the `THE ONE RISE` serializer.

This report applies those same two operations to the only three exactly-four-word red spans. The relationship was discovered retrospectively in this invocation, so it is evidence for a shared state/register channel, not proof that the creator intended this exact consumer.

## Inputs and authenticated state

Canonical inputs:

- `resources/lp2-transcription.txt`
- `resources/liber-primus/lp2-corpus.json`
- `resources/liber-primus/lp2-ink-annotations.json`
- original scans p6/p23/p54
- established p7 product packet in `im-results/lp2-p7-red-multiplicative-inverse-dh-packet.md`

The authenticated DH23 state is

[
p=23,quad g=5,quad a=6,quad b=15,quad A=8,quad B=19,quad K=2.
]

The p7 red packet also gives literal (e=3) in its first word ([23,3]), and the sum of its five word products is (4mod29), denoted (q=4) in the existing p6 state notation.

## Exact four-word red spans

The canonical red-span census through p55 contains exactly three spans with four complete printed words:

| page | word lengths | word products mod29 | adjacent-pair H(product) |
|---|---|---|---|
| p6 | `[4,1,4,2]` | `[13,19,14,23]` | `[23,3,20,8]` |
| p23 | `[2,6,3,5]` | `[24,13,18,13]` | `[11,8,5,2]` |
| p54 | `[1,4,2,2]` | `[21,16,23,5]` | `[5,8,18,28]` |

The raw product vectors already have low-description DH23 identities:

[
egin{aligned}
p6 &: [13,19,14,23]=[b-K, B, -b, p],\
p23&: [24,13,18,13]=[-g, b-K, p-g, b-K],\
p54&: [21,16,23,5]=[p-K, AK, p, g].
end{aligned}
]

Applying the fixed forward adjacent-pair (H) gives:

[
egin{aligned}
p6 &: [23,3,20,8]=[p, e, qg, A],\
p23&: [11,8,5,2]=[A^{-1}, A, g, K],\
p54&: [5,8,18,28]=[g, A, p-g, -1].
end{aligned}
]

No orientation, sign, word order, or per-page arithmetic was fitted separately. All values above follow from physical word order, GP0 multiplication modulo29, and the same (H(x,y)=[x-y,x+y]) convention.

## Manuscript-wide exact-vector control

The reproducer parses the canonical 2,953 page-local printed-word fragments and tests every 2,785 consecutive four-fragment window on physical p0–p55 with exactly the same product→H operation.

Each complete H vector occurs exactly once in that census:

- `[23,3,20,8]` occurs only at p6 offset71;
- `[11,8,5,2]` occurs only at p23 offset0;
- `[5,8,18,28]` occurs only at p54 offset0.

This is an exact uniqueness statement, not a design probability. The target vectors were recognized after inspecting the red objects, so the census must not be reported as a preregistered p-value.

The source-class control is stronger qualitatively: p6, p23 and p54 are exactly the three red spans having four complete printed words, and all three reduce to compact DH23/state expressions under one shared grammar. The much longer p53 red passage and p7 five-word packet are not forced into four-word-span membership; their sliding four-word windows are retained only as controls in the SFT.

## Why this materially changes the frontier

Previously the p6/p7 product packet and p23 H-length serializer were separate structures. The new result links them through a common operation on a source-selected object class and adds a previously unrecognized terminal-page witness at p54.

This makes the hypothesis “red words carry a compact state/register channel” substantially more concrete. A contemporary solver could plausibly notice red whole words, multiply in the GP29 field as on p7, then apply the already recurring two-input H operation pairwise.

The missing causal step is now narrower: **what original mark says that these H-output registers are an opcode, address, key schedule, or receiver selector for black ciphertext?** No unknown-page plaintext follows from the register identity alone.

## Stop rule / next discriminating test

Do not expand this into arbitrary red-window arithmetic. The useful next test must keep the exact grammar fixed:

`complete four-word red span → GP29 word products → adjacent forward H`

and derive a receiver or operation from an independent source cue, preferably from the visibly terminal p54 context. A positive must make a prospective structural or plaintext prediction on untouched ciphertext. A failure to find a typed consumer leaves this as a strong structural state echo rather than a decoder.

## Reproducer

`node sims/lp2_fourword_red_product_h_dh_register_sft.cjs`

The SFT asserts the exact p6/p23/p54 source class, p7 DH control, all algebraic identities, the 2,785-window census, and exact uniqueness of the three H vectors.
