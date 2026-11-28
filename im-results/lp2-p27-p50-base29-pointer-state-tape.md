# The p27-selected p50 base59 pointer path is a historical-BASE29 DH-state tape

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

The same authenticated 2013 challenge specifies **BASE29** and the worked **DH23** exchange in one signed protocol. Its positive example is `BASE29 3301 -> 3QO`; a contemporaneous participant transcript additionally records `BASE29 30 -> 11`, establishing the historical command's minimal-width positive-integer representation. The preserved source contract is summarized in [the signed 2013 TCP-server source record](../resources/external/2013-tcp-server-signed-source.md).

Apply that exact minimal-width BASE29 conversion to the independently selected **addresses**, rather than their cell contents:

```text
address   historical BASE29    digit values / DH-state reading
186       6C                   [a,     aK] = [6,12]
 19       J                    B          = 19
 33       14                   [1,      q] = [1,4]
112       3P                   [e,     -q] = [3,25]
 72       2E                   [K,     -b] = [2,14]
161       5G                   [g,     AK] = [5,16]
214       7B                   [g+K, A^-1] = [7,11]
247       8F                   [A,      b] = [8,15]
189       6F                   [a,      b] = [6,15]
```

The letters above are literal historical BASE29 digits under the source alphabet `0123456789ABCDEFGHIJKLMNOPQRS`: `C=12`, `J=19`, `P=25`, `E=14`, `G=16`, `B=11`, and `F=15`.

For the independently reconstructed state

```text
(p,g,a,b,A,B,K,e,q) = (23,5,6,15,8,19,2,3,4),
```

every digit value is therefore a compact DH/state field or elementary state expression. Crucially, **no leading-zero convention is required**: address19 is historically encoded as the one-digit `J`, which is already exactly `B=19`.

For later structural controls it is also useful to take the ordinary Euclidean quotient/remainder `divmod(address,29)`. That mathematical view assigns address19 the pair `[0,19]=[F,B]`, but the zero quotient is not claimed to be a printed historical digit. The source-authentic textual tape is the minimal-width sequence

```text
6C -> J -> 14 -> 3P -> 2E -> 5G -> 7B -> 8F -> 6F.
```

This historical-BASE29 address view was **not** used to choose the start, radix, hop count, or endpoint. Applying BASE29 to table addresses remains an inferred composition: the signed protocol authenticates both operations separately but does not explicitly instruct an LP2 solver to compose p50 pointer addresses with BASE29.

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

The first decomposition is the already published 32x8 table/DH geometry. The second decomposition is new. In particular, the same fixed point that encodes the public setup `(p,g)` in table coordinates is literally historical BASE29 `6F`, whose two digits are the private exponents `(a,b)=(6,15)`.

This is unusually compact because the table width is itself `A=8`, so the row-major address grammar is `p*A+column`, while the independently authenticated runic radix supplies the second quotient/remainder grammar.

## Unique fixed cell packs the complete DH input tuple

The endpoint is not one fixed point among many. Exhausting all 256 cells gives:

```text
missing-f base59 fixed points: [189]
conventional base60 fixed points: []
```

So **189 is the unique self-pointer in the complete p50 table under the independently selected base59 codec**.

That one cell has three simultaneous source-constrained readings:

```text
zero-based table coordinates:  row23, col5 = (p,g)
historical BASE29(address189):  6F          = (a,b)
base59 cell content:           189         = self
```

Thus the unique self-loop cell packs the complete worked-DH input tuple

```text
(p,g,a,b) = (23,5,6,15)
```

before any modular exponentiation is performed. The standard DH equations then recover the already known public shares and shared value `(A,B,K)=(8,19,2)`.

This is a stronger description than saying row23/column5 is numerically suggestive: **the row/column coordinates and the historically authenticated BASE29 digits divide the same unique fixed-point address into the four DH input parameters.** The remaining unsupported step is the composition itself—no first-party sentence yet says to BASE29-encode a p50 address.

## The start and sink are the same `+e` move in both coordinate systems

The two p27/DH endpoint addresses have a stronger relation than merely being three integers apart.

Under the visible 32×8 row-major table coordinates:

```text
186 = (p,K) = (23,2)
189 = (p,g) = (23,5)
g - K = 3 = e
```

Under Euclidean BASE29 coordinates:

```text
186 = (a,aK) = (6,12)  -> historical text 6C
189 = (a,b)  = (6,15)  -> historical text 6F
b - aK = 3 = e  (mod29)
```

So the same displacement `+e` transforms the start into the unique fixed-point sink while preserving the first coordinate in **both** representations:

```text
(p,K)  -- +e on coordinate2 -->  (p,g)
(a,aK) -- +e on coordinate2 -->  (a,b)
```

This gives a particularly simple cross-radix recovery of the private pair. The pointer route had already selected 186→189 before this BASE29 reading; `BASE29 186 = 6C` exposes `a=6` and `aK=12`, while `BASE29 189 = 6F` exposes `a=6` and **`b=15`**. Those are exactly the private exponents independently reconstructed from p27/p28 layout work.

The eight pre-terminal quotient values add one complementary state fact. They are

```text
[6,0,1,3,2,5,7,8],
```

which are the eight distinct values in `0..8` **except 4**. The omitted value is exactly the independently established p7 checksum state `q=4`; q nevertheless appears explicitly as the low digit of address33 = historical BASE29 `14`. This omission is retained as a post-discovery structural observation, not as an independently selected opcode.

## State-label-free structural control

A stronger control does not name any DH value. For every possible start, take the same eight-hop walk and ask only whether the eight pre-terminal addresses have:

1. eight distinct remainders modulo29;
2. eight distinct integer quotients under `floor(address/29)`;
3. and, after those eight hops, a fixed-point endpoint.

Under base59:

- **86/256** starts have eight distinct remainders;
- only **6/256** have eight distinct quotients: starts `19,66,104,108,186,254`;
- only **3/256** have both: starts `66,186,254`;
- only **start186** has both and then lands on a fixed point.

Under conventional base60, 83 starts have distinct remainders but **0/256** have eight distinct quotients, so none can satisfy the joint or joint-plus-fixed criterion.

The two non-186 base59 controls clarify the topology. Start254 is the immediate predecessor `254 -> 186`, so its eight-node tape is a one-step-shifted prefix of the selected route and stops at247 before reaching the sink. Start66 follows an unrelated path and does not terminate at a fixed point after eight hops.

This test is still post-discovery—the distinctness predicate was noticed after inspecting the selected path—but it is **state-label free**. It shows that the p27-selected start is not merely one of many eight-hop walks whose BASE29 quotient/remainder coordinates look like a permutation; it is the sole joint-distinct tape that also completes at a fixed point under the independently selected hop count.

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

The one equally compact derived key already fixed above is the adjacent-H packet itself,

```text
H8 = [22,2,8,0,27,1,25,26]
   = [p-1,K,A,F,-K,1,-q,-e].
```

Under the **same** four sign/clock choices, with no new phase or receiver search, its IoCs are:

| H-packet consumer | 158-rune IoC |
| --- | ---: |
| subtract, p51 reset0 | 0.0348302830 |
| subtract, p51 continuous66 | 0.0366040474 |
| add, p51 reset0 | **0.0381359349** |
| add, p51 continuous66 | 0.0344271547 |

The highest-IoC H output is still nonprose and far below solved p57. The matched H packet of the base60 rival is `[22,2,6,2,24,22,26,4]`; its best identical consumer reaches **0.0366846731**. The H packet therefore gives a small source-versus-rival separation on this receiver, but not a language recovery or a reason to add another layer.

The most literal terminal output is even smaller: the fixed point is historical BASE29 **`6F`**, whose digit values are exactly the private exponents

```text
[a,b] = [6,15].
```

Using only those two digits as a period-two GP29 additive key on the same 158-rune flank receiver gives **0.0338627751** under subtraction and **0.0325727647** under addition. Because p49 has 66 runes, reset0 and continuous66 are identical for this even-period key. Both outputs are nonprose and below the original flank IoC. Thus the terminal value is not a direct repeating additive flank key either.

**Decision:** retire the direct period-eight additive use of **both** the raw remainder tape and its already-derived adjacent-H packet on the p49/p51 flanks. The state serialization remains a structural result. A further ciphertext attempt now needs an independently visible instruction selecting a different consumer, transformation, or receiver; do not rescue these negatives by shifting phase, changing page starts, or searching more derived state expressions.

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

The SFT now also verifies the exact historical minimal-width BASE29 strings, executes the bounded p49/p51 flank consumers, matched base60-rival controls, exact forward replay and solved-p57 native plant. Initial state-tape SFT commit: `a56cc42ee5752dc038ed0fda833d87daff4df0df`; raw-flank gate extension: `fd96cf328bd74d27e7ce4bd21d0610aeb6792541`; adjacent-H flank gate: `eab192be0b6376964e9c6a1a05efee74d72c9c2a`; state-label-free structural census: `c41d5caf56cbda88c7e0b2535c04b0e4af915611`; historical minimal-BASE29 verification: `4fec9a80a1a4af39e009bb6c6141ac591338dabb`; terminal `6F=[a,b]` flank gate: `ced09a13025ba2f5272d288b28fc0ac103b6a4f1`; unique fixed-point verification: `818f5e991c2797d4784a0963c9d61eddc150e284`; dual `+e` / omitted-q assertions: `7bca9a8f56b5caaef6201d72bcef2bdaab69fc9d`.
