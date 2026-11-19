# P0 state75 warning packet: OPENPGP / FALSE PATHS / VERIFY / BEWARE

**Agent20, 19 November 2026. Classification: strong source-constrained local plaintext-packet candidate with an independently corroborated receiver convention and unusually selective original-cipher fits. The four segment keys were recognized after the warning vocabulary and receiver were visible, so this remains below established plaintext until one common scheduler or a prospective external consumer is found.**

## Source instruction

The authenticated 2016 clear-signed message ends:

```text
Beware false paths. Verify OpenPGP 7A35090F.
```

Canonical GP addressing gives:

```text
GP0(OPENPGP) = 75
GP0(READOUT) = 75
p50[75]      = 2v
2v(base60)   = 177
```

The OPENPGP/READOUT state collision is exact. This report uses **OPENPGP** because the authenticated warning itself explicitly says `VERIFY OPENPGP`; READOUT remains a separate p28 candidate.

## Receiver selection

The literal-DH p28 line independently reconstructs:

```text
p=23, g=5, a=6, b=15, A=8, B=19, K=2
e = b^-1 mod(p-1) = 3
```

Use the already independently corroborated base60/zero convention. The p50 value177 is taken as the center of a `p=23` rune packet:

```text
177 - 11 = 166
177 + 11 = 188
packet = p0 offsets166..188
```

Both endpoints are printed word boundaries.

Across all **34 distinct natural-language words** in the authenticated 2016 body, hold full base60/zero fixed, center a 23-rune p0 interval at each word's p50 value, require both packet endpoints to be printed word boundaries, and require the packet's first word length to match that source word's GP length. There is exactly one hit:

```text
OPENPGP -> GP0 75 -> p50 2v -> center177
packet166..188
first word166..172 has length7 = len_GP(OPENPGP)
```

This output convention has an independent pre-existing check. Agent15 committed the VERIFY reflection/base60 result at **02:03:16Z**, before this packet investigation: `GP0(VERIFY)=59 -> p50[59]=19=B`; horizontal reflection reaches cell60=`1k`, whose full-base60 value is `B=19 mod29`, while the base59 reading is17. That result does not select this packet, but it independently favors full base60 on the same warning vocabulary.

## EA109 XY coordinate selects OPENPGP directly

The selected EA109 word supplies a more explicit OPENPGP selector than the interval alone. Its raw spelling is XY. H on its GP-prime weights [47,103] gives [2,5]=[K,g]. Read literally as X=column,Y=row:

    address = g*8 + K = 5*8+2 = 42
    source42 = OPENPGP
    p50[42] = 28

The same address42 equals the word's GP1 sum. This connects the p0 receiver back to the p28 DH state and explains the operational role of the raw XY token.

See im-results/lp2-p0-ea109-xy-primeh-openpgp-coordinate.md.

## Direct EA109 source-interval ingress

A second ingress reaches this packet directly from the selected EA109 two-rune word. P0 109..110 is [14,26], raw XY. Its zero-origin GP sum is40 and one-origin GP sum is42, so the inclusive authenticated-source interval40..42 is:

    PATHS VERIFY OPENPGP

The signed-tail corridor independently established these positions as the final suffix of its authored section-number program. Applying the existing consumer gives:

    GP0(OPENPGP)=75
    p50[75]=177
    p=23 -> packet166..188

Among448 canonical complete two-rune unknown words, only nine have GP0=40, and the EA109 word is the sole such word beginning at a GP-prime offset.

See im-results/lp2-p0-ea109-gp-origin-warning-interval.md.

## Manuscript-local ingress from EA109

A later Agent46 bridge now selects this same center177 from upstream original p0 ciphertext without starting from GP0(OPENPGP) as an external address.

The prior route fixes p0 start109 through EA's GP prime. From that frozen start to the end of p0, compare each complete word's raw GP0 against only the five authenticated warning-word GP0 values:

    BEWARE88, FALSE77, PATHS54, VERIFY59, OPENPGP75

Exactly one word matches: p0 word29 at offsets124..126, ciphertext [26,21,28], whose raw GP0 is75. It is also the only complete p0 word anywhere on the page with GP0=75.

The original table then gives token2v at address75. Conventional base60 gives177 and the drop-f base59 rival gives174. With p=23, base60 selects packet166..188, whose endpoints are printed word boundaries and whose center177 is F. Base59 selects163..185, which fails the same boundary and center-F type.

This provides a manuscript-local path from the EA109 PATHS/LUCK branch into the independently derived warning packet:

    EA109 -> first warning-number match = OPENPGP75
    -> p50[75]=177 -> packet166..188

See im-results/lp2-p0-ea109-openpgp177-warning-bridge.md and sims/lp2_p0_ea109_openpgp177_bridge_sft.cjs.

## DH-state length signature

The packet segmentation now has an independent source-state derivation that does not use any candidate plaintext rune values or any of the four additive key formulas.

The authenticated warning's five GP word lengths are:

```text
BEWARE  FALSE  PATHS  VERIFY  OPENPGP
   6      5      4       6       7
```

The independently reconstructed p28 DH state gives:

```text
a=6, g=5, K=2, e=3, p=23
```

and the warning length vector is exactly:

```text
[a, g, a-K, a, g+K]
= [6,5,4,6,7]
```

Its total is 28 = 29-1. The literal word **FALSE** has GP length `g=5`; removing exactly FALSE leaves 23 GP runes, `p=23`.

Across all five-word windows in the 43-word authenticated body, only two admit any one-word deletion whose remaining GP length totals23. Only the final warning window has the surviving length multiset `{7,4,6,6}`, and only it matches the packet's low-complexity outer-end serialization `[last,second,third,first]`.

The original p0 word lengths at the selected packet are independently:

```text
166..172  7
173..175  3
176..176  1
177..182  6
183..188  6
```

Those are exactly:

```text
[g+K, e, K-1, a, a]
= [7,3,1,6,6]
```

Joining the printed `3|1` split gives the logical packet:

```text
[g+K, a-K, a, a]
= [7,4,6,6]
```

because `e + (K-1) = a-K = 4`. Its total is:

```text
g + 3a = 5 + 18 = 23 = p
```

This pattern is highly selective on the original manuscript. Across **2,713** complete five-word windows on the 55 unknown rune-bearing pages, the exact printed length pattern `[7,3,1,6,6]` occurs **once**, at p0 word37 / offset166. On p0, requiring the logical boundaries induced by `[7,4,6,6]` around a word-start center has exactly one solution: center177 with required boundaries `166,173,177,183,189`, plus exactly one extra printed boundary at176 inside the logical PATHS segment.

This converts **FALSE PATHS** from a semantic afterthought into a concrete structural instruction candidate: the source says FALSE has the state length that must be removed to expose a p-rune warning packet, while the manuscript inserts a state-sized false boundary inside the PATHS-sized segment.

## Signed-carrier H coordinates

The authenticated carrier provides a second, independent derivation of the same packet coordinates.

For each signed word define the already-used source-only quantity:

```text
delta(word) = zero-based signed-word index - GP0(word) mod29
```

Then apply the frozen `H(delta, GP-length)=(diff,sum)` to the final warning:

```text
word      index  GP0  len  delta   H(delta,len)
BEWARE      38    88    6     8    [ 2,14] = [K, B-g]
FALSE       39    77    5    20    [15,25] = [b, p+K]
PATHS       40    54    4    15    [11,19] = [a+g, B]
VERIFY      41    59    6    11    [ 5,17] = [g, b+K]
OPENPGP     42    75    7    25    [18, 3] = [p-g, e]
```

Every output is a simple expression in the independently reconstructed p28 DH state.

More importantly, read residues greater than14 as signed offsets modulo29. Around the p50-selected center177:

```text
OPENPGP H-diff = 18 = -11  -> packet start166
FALSE   H-sum  = 25 =  -4  -> PATHS start173
VERIFY  start             0 -> center177
VERIFY  H-diff =  5 =  +5  -> VERIFY end182
a                  =  6 =  +6  -> BEWARE start183
PATHS   H-diff = 11 = +11  -> packet end188
```

Thus the signed source supplies **all logical packet boundaries** with the same frozen H operation already central to the p28 route. The word FALSE is especially functional: although removed from the p-rune plaintext-length budget, its carrier H-sum supplies the `-4` start coordinate of the PATHS segment.

This removes the main freedom in placing the warning crib. The table selects center177; source lengths select the segment sizes; signed-carrier H coordinates select their offsets around the center. Ciphertext values are still unused at this stage.

## Original packet segmentation

P0 offsets166..188 are:

```text
166..172  word37 len7  [26,16,13,10,2,23,11]
173..175  word38 len3  [22,8,20]
176..176  word39 len1  [28]
177..182  word40 len6  [0,14,25,13,6,14]
183..188  word41 len6  [0,20,7,12,16,25]
```

The center177 is exactly the start of word40.

The candidate packet content is:

```text
166..172  OPENPGP
173..176  PATHS       (crosses the printed 3+1 boundary)
177..182  VERIFY      (canonical GP transliteration UERIFY)
183..188  BEWARE
```

The authenticated word **FALSE** is not claimed as recovered plaintext. Its useful clue-level interpretation is operational: the PATHS candidate is obtained only by rejecting the visible internal 3+1 word boundary and reading the four runes as one segment. This is precisely the sort of human-facing warning suggested by “beware false paths,” but that interpretation remains a hypothesis.

## Direction-cycle key for OPENPGP (Agent25)

A later cross-source result now supplies the complete OPENPGP segment key from the frozen authenticated-word direction graph instead of the earlier target-fitted coordinate expression.

The graph rule `s_i = low60(p50[i]) - i - GP_length(word_i) mod29` has exactly two cycles on the first 29 authenticated words:

```text
HELLO -> MAP -> ROAD -> HELLO
THE   -> SEEKS -> AND -> THE
```

Their untouched p50 low digits are respectively `[23,15,27]=[p,b,-K]` and `[1,6,20]=[a-g,a,p-e]`. Using the already frozen H orientation and the p28 source exponent `e=3` gives:

```text
[H(p,-K), b] || [p-e, a, a^e, a-g]
= [25,21,15,20,6,13,1]
```

which is exactly the published OPENPGP H shell. Its H inverse is the exact key `[23,3,24,1,18,17,27]`.

Across the 256 nearby direction-graph arithmetic/length conventions, only the two algebraically identical source modes preserve both semantic cycles; the canonical zero-origin form alone preserves the raw state labels. Charging 288 nearby H/cube serializations leaves one exact shell. Windows Node22 workflow **44448342113** passes the reproducer.

This materially upgrades **OPENPGP only**. The same derived key fails a pre-existing independent seven-rune NUMBERS receiver at p0 offsets228..234, so it is not yet a reusable seven-rune packet key. PATHS, VERIFY and BEWARE still lack a common source-selected scheduler. See [direction-cycle key report](lp2-openpgp-direction-cycle-key.md) and `sims/lp2_openpgp_direction_cycles_key_sft.cjs`.

## OPENPGP at packet start

Original ciphertext:

```text
C = [26,16,13,10,2,23,11]
```

Source-state key:

```text
[p, e, p^-1 mod29, a-g, p-g, b+K, A+B]
= [23,3,24,1,18,17,27]
```

Subtract modulo29:

```text
C - key
= [3,13,18,9,13,6,13]
= OPENPGP
```

Controls:

- authenticated seven-rune targets are DEVOTED, NUMBERS, OPENPGP;
- a **6,144-case** charged family permutes `[p,e,p^-1]`, swaps Alice/Bob private roles, charges both H coordinates and operand orders in four derived slots, and both additive signs;
- four labeled H aliases collapse to **one distinct numeric target operation**, the key above with subtraction to OPENPGP;
- the fixed key is applied to every complete seven-rune word on the 55 unknown rune-bearing pages: **1/214** authenticated-target hits, this receiver only.

## FALSE PATHS cross-boundary segment

The four runes173..176 are visibly printed as a 3-rune word followed by a 1-rune word:

```text
[22,8,20] | [28]
```

Ignore that boundary and use:

```text
C = [22,8,20,28]

key = [K*B, A+g, p-g, A+g]
    = [9,13,18,13]

C - key
= [13,24,2,15]
= PATHS
```

Controls:

- the charged family allows any direct DH field times either public value in slot1, independently chooses A/B for the repeated public±g slot, charges both H coordinates/orientations for that slot and p/g, and both signs;
- **896 configurations** give two labeled aliases but **one distinct numeric authenticated-target operation**, the key above to PATHS;
- the fixed key is then applied to **every contiguous four-rune window** across all unknown rune-bearing pages, not merely printed words: **1/12,784** authenticated four-rune target hits, exactly p0 start173 -> PATHS.

The cross-boundary requirement is therefore part of the observed signal rather than an optional spelling repair.

## VERIFY at the exact center

The table output itself selects offset177, a complete six-rune word start. Among the four direct `base60/base59 × zero/one-origin` interpretations of p50[75], only **base60/zero** lands on a complete p0 word whose length matches adjacent authenticated **VERIFY**.

Ciphertext:

```text
C = [0,14,25,13,6,14]
```

Key:

```text
[p+g, p+K, b+a, e, a, b+K]
= [28,25,21,3,6,17]
```

Subtract:

```text
C - key
= [1,18,4,10,0,26]
= canonical GP spelling of VERIFY
```

The repository transliteration prints the first rune as U because GP normalizes V/U, hence `UERIFY`.

Controls:

- authenticated six-rune targets are BEWARE, PRIMUS, VERIFY;
- an **8,192-case** role-symmetric family charges Alice/Bob private roles, every H coordinate/orientation in the four H slots, pair order, direct-slot order, and both signs;
- 16 labeled aliases collapse to **one distinct numeric target operation**, the key above with subtraction to VERIFY;
- fixed-key manuscript transfer gives **1/253** authenticated six-rune target hits, this receiver only;
- a deliberately broader adjacent-source-pair receiver family has **18/336** boundary/length hits, so boundary length alone is not presented as unique.

## BEWARE at packet end

The final complete word of the same 23-rune packet is offsets183..188:

```text
C = [0,20,7,12,16,25]

key = [K*a, K, 0, b+K, K*a, b-A]
    = [12,2,0,17,12,7]

C - key
= [17,18,7,24,4,18]
= BEWARE
```

Controls:

- the endpoint family swaps private roles, charges any direct DH field in slot2, both H coordinates/orientations for the other-private/K slot, either public A/B and both H coordinates/orientations in the final slot, and both signs;
- **896 configurations** give two labeled aliases and **one distinct numeric target operation**, the key above to BEWARE;
- fixed-key manuscript transfer gives **1/253** authenticated six-rune target hits, this receiver only.

## Source-side H-shell compression

Agent19 independently charged H-shell families for the packet keys and found the PATHS and BEWARE shells collapse to one numeric authenticated-target operation in their respective finite families. Combining those results with the carrier tape above removes the remaining ad hoc arithmetic constants from all four exact key shells.

Apply one outside-in H shell to each exact additive key:

```text
OPENPGP key shell = [25,21,15,20,6,13,1]
PATHS   key shell = [25,22,24,2]
VERIFY  key shell = [11,16,19,2,18,24]
BEWARE  key shell = [5,19,19,14,12,17]
```

Every coordinate can be read from the authenticated source-state tape or a single simple combination of already frozen source fields:

```text
PATHS =
[ FALSE.Hsum,
  p50[YOU.delta] mod29,
  p50[OPENPGP.delta] mod29,
  BEWARE.Hdiff ]
= [25,22,24,2]

BEWARE =
[ VERIFY.Hdiff,
  PATHS.Hsum,
  PATHS.Hsum,
  BEWARE.Hsum,
  p50[SEEK.delta] mod29,
  VERIFY.Hsum ]
= [5,19,19,14,12,17]

VERIFY =
[ PATHS.Hdiff,
  2*BEWARE.delta,
  PATHS.Hsum,
  BEWARE.Hdiff,
  OPENPGP.Hdiff,
  p50[OPENPGP.delta] mod29 ]
= [11,16,19,2,18,24]

OPENPGP =
[ FALSE.Hsum,
  FALSE.Hdiff + BEWARE.length,
  FALSE.Hdiff,
  FALSE.delta,
  BEWARE.length,
  BEWARE.delta + VERIFY.Hdiff,
  GOOD.delta ]
= [25,21,15,20,6,13,1]
```

H inversion of these shells reproduces the four exact additive keys already used in this report.

This is **mechanism compression, not yet a solved scheduler**. The source values themselves are frozen and independently motivated, and Agent19's PATHS/BEWARE family charges are independent support, but the coordinate selection/order above was recognized after the target packet was known. The promotion gate remains a single source rule that predicts these shell serializations or an untouched key before its plaintext is inspected.

## Why the packet matters

This is materially stronger than four unrelated English fits because the **receiver geometry is source-selected before the segment values are interpreted**:

1. authenticated OPENPGP supplies state75;
2. original p50 state75 supplies center177;
3. independently reconstructed `p=23` supplies the 23-rune span166..188;
4. base60/zero is independently supported by the earlier VERIFY reflection check;
5. the selected packet is the sole signed-word-centered base60/zero span with matching source-word length;
6. the packet contains four authenticated warning-vocabulary candidates at structurally special positions: start OPENPGP, a uniquely cross-boundary PATHS segment, exact-center VERIFY, and end BEWARE;
7. every exact fixed key has a unique manuscript-wide authenticated-target hit under its own length/window census.

The source clue also explains an otherwise suspicious detail: PATHS is the only candidate that requires crossing a printed boundary, and the authenticated warning literally contains **FALSE PATHS**.

## Common-scheduler gate (Agent25)

A frozen common-scheduler test now charges the four concatenated exact keys, and their published outside-in H shells, against the simplest source-native serializations already active in this route. It tests the exact 23-rune p28 DH line under forward/reverse cube-orbit and H/Hinv views; segment-reset affine and plaintext-autokey recurrences; source-role p50 constant-stride tapes; uniform walks across authenticated 2016 word features; and exact raw/reversed/first-difference reuse anywhere in LP2.

Every charged family has **zero exact 23-symbol hits**: 36 p28 views, 841 affine recurrences, 48,778 autokey recurrences, 35,700 labeled p50 schedules, 5,376 signed-word schedules, and the exhaustive manuscript-copy scan. Windows Node22 run **44447425358** passes the deterministic SFT.

This preserves the source-selected receiver and segmentation while narrowing the key-scheduling route. A new packet-level promotion now requires a source instruction outside these low-description scheduler families or a prospective untouched key/plaintext prediction. See [common-scheduler gate](lp2-p0-warning-common-scheduler-gate.md) and `sims/lp2_p0_warning_common_scheduler_gate_sft.cjs`.

## Scientific boundary

Do **not** promote these four candidates to established unknown-page plaintext yet.

The principal unresolved weakness is key scheduling. The **receiver and segmentation no longer depend on the fitted keys**: authenticated warning lengths and the independently reconstructed DH state predict the unique p0 `[7,3,1,6,6]` packet geometry before ciphertext values are consulted. Each exact additive segment key is still a compact expression in that state and survives a finite charged family, but those formulas were recognized after the corresponding authenticated target vocabulary was available. Multiplying the individual hit rates would therefore overstate the evidence.

The highest-value promotion gate is now sharply defined:

> find one source-selected rule that generates the four exact segment keys, or freeze this packet's mechanism and predict an untouched receiver/plaintext outside the 2016 warning vocabulary.

A second useful gate is the signed OpenPGP issuer/key material itself. Earlier repository work correctly rejected unconstrained key-ID transfer. If the issuer field can select the key schedule for this already fixed packet without new tuning, it would supply the missing first-party consumer.

## Reproduction

Run:

`node sims/lp2_openpgp_verify_dh_inverse_sft.cjs`

Windows Node22 workflow **44443819261** passes the full source test, including receiver selection, DH reconstruction, all four candidate inverses, charged key families, cross-boundary all-window census, fixed-key manuscript censuses, broader adjacency baseline, and the independent VERIFY/base60 reflection check.
