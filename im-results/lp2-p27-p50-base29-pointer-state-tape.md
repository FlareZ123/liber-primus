# The p27-selected p50 base59 pointer path is a BASE29 DH-state tape

**Agent11, 28 November 2026. Classification: new source-constrained state serialization on an independently selected p50 path; no unknown plaintext, key schedule, cipher inverse, or destination.**

## Decision

The already established p27/DH route fixes all of the choices needed to obtain one eight-edge p50 pointer walk **before** this observation:

- original start address **186** is selected by p27 source geometry;
- the uniquely successful live numeral codec is the existing missing-`f` **base59** interpretation;
- the hop count is the authenticated DH public share **A=8**;
- the resulting original-table walk is

```text
186 -> 19 -> 33 -> 112 -> 72 -> 161 -> 214 -> 247 -> 189
```

and cell189 is the pre-existing base59 self-pointer at row23/column5.

Taking the canonical Euclidean quotient/remainder `divmod(address,29)` of those already selected **addresses**, rather than their cell contents, exposes a complete state tape. The modulus29 is source-authenticated by Cicada's 2013 BASE29 command, but the fixed two-coordinate address representation used here is newly inferred. The eight pre-terminal addresses are

```text
186 = 6*29 + 12 = [a,     aK]
 19 = 0*29 + 19 = [F,      B]
 33 = 1*29 +  4 = [1,      q]
112 = 3*29 + 25 = [e,     -q]
 72 = 2*29 + 14 = [K,     -b]
161 = 5*29 + 16 = [g,     AK]
214 = 7*29 + 11 = [g+K, A^-1]
247 = 8*29 + 15 = [A,      b]
```

for the independently reconstructed state

```text
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4).
```

The endpoint itself is

```text
189 = 6*29 + 15 = [a,b].
```

### Historical BASE29 representation caveat

The authenticated 2013 challenge gives `BASE29 3301 -> 3QO`, and a contemporaneous participant transcript records `BASE29 30 -> 11`. The latter is important: the observed command uses **minimal-width positive-integer output**, so an address below29 is not printed with a leading zero. Under that historical textual convention, address19 is the one-digit value corresponding to GP index19, not a printed two-digit `[0,19]` word.

Accordingly, the high coordinate `F=0` at address19 is a canonical mathematical quotient from `divmod(19,29)`, **not** an authenticated fixed-width BASE29 serialization rule. The stronger remainder tape and adjacent-H packet below do not depend on that padding convention: every low coordinate is simply `address mod29`, including `19 mod29=19`.

Thus the source-selected eight-hop pointer path is simultaneously a sequence of nine compact mod29 quotient/remainder state pairs under one newly inferred fixed-width view. This address-level state view was **not** used to choose the start, radix, hop count, or endpoint.

## Strongest algebraic compression: adjacent H of the low BASE29 digits

The eight pre-terminal BASE29 remainders are

```text
[12,19,4,25,14,16,11,15]
=
[aK,B,q,-q,-b,AK,A^-1,b].
```

Apply the repository's already fixed adjacent two-coordinate transform

```text
H(x,y) = [x-y, x+y] mod29
```

to consecutive pairs. No pair order or sign is changed after inspection:

```text
H(12,19) = [22,2]  = [p-1,K]
H(4,25)  = [8,0]   = [A,F]
H(14,16) = [27,1]  = [-K,1]
H(11,15) = [25,26] = [-q,-e]
```

so the complete packet is

```text
[p-1,K,A,F,-K,1,-q,-e]
=
[22,2,8,0,27,1,25,26].
```

Every equality above is exact arithmetic over the already reconstructed state. The significance is structural rather than linguistic: no candidate plaintext or English score enters the construction.

The H application itself is still **post-discovery**. H is a pre-existing repository operation used on multiple independently selected LP2 source objects, but no first-party Cicada instruction yet states that p50 **addresses** should be reduced modulo29, split into quotient/remainder pairs, or adjacent-H transformed. The packet therefore strengthens a state-serialization interpretation; it does not authenticate a cipher opcode.

## Dual packing at the independently selected endpoints

The two most important path addresses now have two compact state decompositions each.

At the p27-selected start:

```text
186 = 23*8 + 2 = p*A + K
186 =  6*29 +12 = a*29 + aK
cell186(base59) = 19 = B
```

At the base59 fixed-point sink:

```text
189 = 23*8 + 5 = p*A + g
189 =  6*29 +15 = a*29 + b
cell189(base59) = 189
```

The first decomposition is the already published 32x8 table/DH geometry. The second decomposition is new. In particular, the same fixed point that encodes the public setup `(p,g)` in table coordinates also encodes the two private exponents `(a,b)` in BASE29.

This is unusually compact because the table width is itself `A=8`, so the row-major address grammar is `p*A+column`, while the independently authenticated runic radix supplies the second quotient/remainder grammar.

## Exact all-start control

The reproducer charges every possible p50 start under each of the two live table codecs, keeping the hop count fixed at eight.

For each start it records the eight **pre-terminal address remainders modulo29**. Two exact post-discovery criteria are checked:

1. whether their unordered multiset equals
   `{4,11,12,14,15,16,19,25}`, the observed state-value set
   `{q,A^-1,aK,-b,b,AK,B,-q}`;
2. whether adjacent H produces the exact ordered packet
   `[22,2,8,0,27,1,25,26]`.

Results:

| Codec | starts matching the 8-value state set | starts matching the exact H packet |
| --- | ---: | ---: |
| missing-`f` base59 | **1 / 256: start186** | **1 / 256: start186** |
| conventional base60 | **0 / 256** | **0 / 256** |

The conventional base60 rival from the same independently selected start/hop count is

```text
186 -> 19 -> 33 -> 114 -> 197 -> 115 -> 247 -> 192 -> 0
```

and does not reproduce either state condition.

These counts are an **exact finite census, not a discovery-adjusted p-value**. The state labels and the decision to inspect BASE29 address digits were recognized after the pointer route was known. The census shows that the observed state tape is not a generic property of eight-step p50 walks under the same table; it does not quantify the probability that the author intended this representation.

## First original-cipher consumer: direct eight-remainder flank key is negative

The integrated original-inversion challenge preselects the **158 original GP29 runes physically flanking the p49-p51 numerical panel** as the first recipient for any source-fixed table-derived key: p49 contributes 66 runes, p50 contributes no runes, and p51 resumes with 92.

The cheapest use of the new state tape adds no H layer or KDF. Freeze the eight pre-terminal remainders in pointer order as the period-eight GP29 key

```text
K8 = [12,19,4,25,14,16,11,15]
   = [aK,B,q,-q,-b,AK,A^-1,b].
```

Charge only the two unavoidable additive directions `P=C-K` / `P=C+K` and the two already documented p51 clocks: reset at phase0 or continue after the 66 p49 runes. P49 always begins at phase0. All four candidates exactly re-encrypt the original 158 runes.

| State-key consumer | 158-rune IoC |
| --- | ---: |
| subtract, p51 reset0 | **0.0373296783** |
| subtract, p51 continuous66 | 0.0340240264 |
| add, p51 reset0 | 0.0320890107 |
| add, p51 continuous66 | 0.0352334113 |

The unchanged original flank ciphertext has IoC **0.0340240264**. Authentic solved p57 has IoC **0.0627099664**. None of the four state-key outputs is coherent native-GP prose; for example the highest-IoC candidate begins p49 `SEAWRGGEAMIATHTHGCEAXLEON...` and p51 `ABNRPROTHYSSPMOYTPRWNGPN...`.

A matched wrong-source control uses the eight remainders of the conventional-base60 walk from the same start/hop count,

```text
[12,19,4,27,23,28,15,18].
```

Under the identical four sign/clock choices that rival reaches a **higher** maximum IoC, **0.0386196888**. Thus the small IoC lift of the state-key reset model does not discriminate the source-selected state tape from the failed radix rival.

Implementation controls pass: every tested candidate forward-reconstructs the original flank runes exactly, and a synthetic encryption of all 95 authentic solved-p57 runes with `K8` is recovered **95/95** by the matching inverse.

**Decision:** retire exactly the direct period-eight additive use of the raw remainder tape on the p49/p51 flanks. The state serialization remains a structural result. A further ciphertext attempt now needs an independently visible instruction selecting a different consumer, transformation, or receiver; do not rescue this negative by shifting phase, changing page starts, or searching derived state expressions.

## Relationship to prior work

This result extends rather than replaces the existing p27/p50 DH route.

- [The p27 red-header bridge](lp2-p27-redheader-dh23-base59-bridge.md) independently selected address186, base59, the eight-hop count, and fixed point189 before this BASE29 address view.
- [The red13 transducer](lp2-p27-red13-dh-radix-transducer.md) independently recovered the private DH fields and the two row23 coordinates.
- [The p6/p50 state-grid bridge](lp2-p6-p50-dh-state-grid-bridge.md) had already observed the suffix residues on the cell43-to-sink route, including `[-b,AK,A^-1,b,b]`; the new start186 view exposes the missing prefix `[aK,B,q,-q]` and closes the whole eight-hop state tape.
- [The p7 inverse-state packet](lp2-p7-red-multiplicative-inverse-dh-packet.md) independently established `A^-1=11` and the same DH/GF29 state vocabulary in original red source material.

The new contribution is therefore not another independent derivation of the DH tuple. It is a new **serialization of that already established tuple on an independently fixed original p50 navigation path**.

## Evidence boundary and next decision

The strongest causal interpretation now is that p50 can act as a DH/state **navigation register**, not merely a numerical fixed-point graph. Start186, eight steps and base59 were selected without consulting the BASE29-pair output; the path then encodes public, private, signed and inverse state fields densely enough to justify preserving this view.

What remains missing is unchanged but narrower: **what consumes this state tape?** Nothing here specifies a ciphertext page, an ordered GP29 key stream, reset/clock semantics, or an inverse. Existing direct DH-key consumers are negative and must not be repeated.

The next useful experiment needs one original/first-party feature that selects a recipient or tells a solver to treat the BASE29 state pairs as an opcode/key schedule. Until that exists, do not turn the nine state pairs into another arbitrary periodic pad, page-address menu, or fitted plaintext key.

## Reproduction

Run:

```text
node sims/lp2_p27_p50_base29_pointer_state_tape_sft.cjs
```

The SFT reads only the pinned original 256-cell table, reconstructs both live radices, verifies the upstream p27-selected paths, checks the DH equations and both endpoint packings, derives every BASE29 pair and adjacent-H packet, and exhausts all 256 starts under base59 and base60.

The SFT now also executes the bounded p49/p51 flank consumer, matched base60-rival control, exact forward replay and solved-p57 native plant. Initial state-tape SFT commit: `a56cc42ee5752dc038ed0fda833d87daff4df0df`; flank-gate extension: `fd96cf328bd74d27e7ce4bd21d0610aeb6792541`.
