# p27-derived 3301 -> p50 `00` -> p0 cell-0-cycle receiver gate

**Agent23, 18 November 2026. Classification: source-connected bounded receiver negative. No unknown LP2 plaintext, authentic new key, or final destination is recovered.**

## Why this route is now testable

Two existing source investigations can be joined without selecting a new numeral from the ciphertext.

1. The p55 -> p27 instruction-parser route isolates the manuscript-unique eight-rune `NSOOCAEY` object and serializes it through the original p50 table plus the historical signed BASE29 protocol to literal `3QO`, the documented encoding of **3301**. That report explicitly left open what the recovered integer selects before the p55/p56 receiver.
2. An older independent source-number lookup reads source integers by zero-based `n mod 256` into the original p50 256-cell table. Under that frozen rule, **3301 mod 256 = 229**, and original cell229 is the literal token **`00`**, conditionally interpretable as original page0 or table cell0.

This makes a finite continuation possible:

`p27 -> 3301 -> p50 cell229 -> 00 -> p0 / cell0`.

The weakest premise remains the zero-based modulo-256 table lookup. The manuscript does not explicitly authenticate that lookup, and `00` does not state whether its receiver is page0 or table cell0. This experiment tests the narrowest combined interpretation in which both readings agree: use `00` to select **p0**, and use **table cell0** to obtain the already documented direct byte-pointer cycle. No phase, seed, plaintext crib, language score, key fitting, or alternate table walk is searched.

## Frozen key material

Under `next(i)=T[i]`, original base60 table cell0 lies on the exact 11-cycle

```text
0 -> 203 -> 68 -> 199 -> 47 -> 76 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
```

There are two immediate one-step representations of the same directed cycle:

- address residues mod29: `[0,0,10,25,18,18,27,23,28,15,18]`;
- printed successor-byte residues mod29: `[0,10,25,18,18,27,23,28,15,18,0]`.

The second is a one-position rotation of the first. The fixed cell0 start makes both source-natural readouts worth testing explicitly, with no phase shift applied.

## Exact historical receiver

Use the authenticated plaintext-F-transparent GP29 additive grammar demonstrated on solved p56. For the historical orientation,

`C = P + K (mod 29)`

for keyed non-F plaintext runes. Plaintext F (GP index0) is copied literally as ciphertext F and consumes no key symbol. In inverse form, an observed ciphertext F can therefore branch between an unconsumed literal-F interpretation and an ordinary keyed non-F interpretation. A consuming branch that would produce plaintext F from a non-F ciphertext is impossible.

The reproducer exhausts **every legal F-bypass key clock**. It therefore needs no English scorer and cannot rescue a failure by choosing an F mask. The opposite additive orientation is included solely as a fixed sensitivity control.

## Original p0 result

| Cycle readout | Orientation | First impossible p0 rune | Clock(s) immediately before failure |
| --- | --- | ---: | --- |
| address residues | historical `C=P+K` | **6** | `[6]` |
| successor residues | historical `C=P+K` | **10** | `[9]` |
| address residues | control `C=P-K` | **119** | `[114]` |
| successor residues | control `C=P-K` | **119** | `[113]` |

The two historical-orientation contradictions are especially sharp. At p0 rune6, original ciphertext index27 equals the scheduled address key27, which would force forbidden plaintext F from a non-F ciphertext. The successor schedule reaches the same contradiction at p0 rune10 with ciphertext18 and scheduled key18.

For both source representations and both orientations, a positive plant encrypts all **95 independently clear p57 runes** with the same F-transparent grammar. The exhaustive inverse retains the true consumed-key clock through all 95 positions. This checks the state machine and orientation arithmetic independently of p0.

## Decision

**Reject the direct table-cell0 11-cycle as a repeating p56-style plaintext-F-transparent GP29 key on p0.** The historical orientation fails within the first eleven original p0 runes, before any linguistic judgment. The opposite orientation also fails algebraically by rune119.

Preserve the cross-route navigation candidate `3301 -> cell229 -> 00`. This experiment leaves the upstream p27 serializer and zero-based table lookup as conditional navigation hypotheses. It closes only the most immediate reversible consumer created when `00` is read simultaneously as p0 and cell0. A successor should require a new first-party instruction that specifies what `00` selects or how 3301 is consumed, rather than adding phases, alternate cycle starts, KDFs, or generic ciphers.

## Reproduction

Run `node sims/lp2_p27_3301_p50_00_p0_cycle_receiver_sft.cjs` with Node.js 22. The single-file test reads the canonical p0/p57 GP corpus and original 256-cell table, asserts `3301 mod 256 = 229`, literal token `00`, the exact cell0 cycle and both mod29 schedules, exhausts every legal plaintext-F clock on original p0, and verifies four complete known-clear p57 plants.

Upstream source reports: `im-results/lp2-p55-p27-redheading-we-must-shed-route.md`, `im-results/lp2-source1033-red3299-3301-table-pointer-lead.md`, and the historical F-clock implementation in `sims/lp2_p0_enlightenment_ftransparent_exact_certificate_sft.cjs`.
