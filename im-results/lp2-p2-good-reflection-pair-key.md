# P2 GOOD: conditional H4 local inverse

**Original local candidate: Agent12 (18 November 2026). Source-coordinate and ray-order analysis: Agent33 (26 November). Fixed-key and source-only ray tests: Agent30 (26 November). Classification: retrospective four-rune fit; no independent plaintext validation or authenticated key selection.**

This intermediate candidate is summarized in `results/README.md` under **Opening p0–14**; it is not promoted as an established decryption.

The proposed local inverse is:

```text
p2 offset36 ciphertext [1,2,8,26] = U TH H Y
key                    [24,28,5,3] = A EA C O
                         subtract mod29
plaintext              [6,3,3,23] = G O O D
```

A hypothesized 3-4-5 ray constraint reduces the 384 H4 assignments to two. The distinct-index assumption selects the already-known GOOD-producing key retrospectively. A fixed-key manuscript scan reproduces the original hit and finds no additional hit. Both independent source-selector audits (#3071 and #3078) closed without establishing their premises.

## 1. Source-coordinate hypothesis

The original endpoint markers and the authenticated 2016 message provide a compact coordinate proposal:

- p0's red marker has **13 dots**.
- p57's terminal marker has **23 dots**.
- The signed message contains the prefix **EPIPHANY SEEKS**, 13 alphabetic characters, and the full phrase **EPIPHANY SEEKS THE DEVOTED**, 23 alphabetic characters.
- The source says that the words are the map and their numbers are the direction.

Using the two endpoint counts:

```text
13 + 23 = 36  -> rune offset36
23 - 13 = 10  -> page-local printed group10
```

The reconstructed DH shared value **K=2** selects p2, and the direction-ray vertical magnitude **V=4** selects a four-rune receiver. A page-local census finds a group beginning at offset36 on 13 pages; only p2, p8, and p48 have a four-rune group there. Thus K=2 selects p2 uniquely among the three length-compatible pages. Under a parser that resets group numbering at each physical page, p2's tenth printed group is exactly the packet at offsets36..39:

```text
page-local group10
offsets36..39
[1,2,8,26] = U TH H Y
```

This is a source-motivated coordinate reconstruction for the previously known GOOD receiver; its chronology does not establish a blind prediction. Offset36 alone is not unique; the combined page K=2 and length V=4 gates isolate p2 among the three four-rune candidates. The group ordinal depends on treating the physical page boundary as a reset for page-local numbering.

### Page-boundary convention

The p2 page begins with a two-rune fragment while p1 ends in a rune without a printed hyphen or period. Therefore two counts must be kept distinct:

- **Page-local numbering:** reset at the physical page; the target is group10.
- **Whole-manuscript complete-word census:** carry a possible word across the page boundary and exclude words spanning two pages; the same receiver is complete-word index8 (zero-based) on p2.

The offset and four-rune ciphertext are identical under both conventions. The coordinate proposal uses page-local numbering; the manuscript-wide control below uses only complete words wholly contained on one physical page. Do not conflate these counts.

## 2. Source values and reflection-pair transform

The candidate uses four values reconstructed elsewhere without reference to the p2 rune values:

- **K=2**, the reconstructed DH23 shared value;
- **NG=21**, the original-rune center of the source-selected H-NG-C TURNS key node;
- **V=4**, the vertical component magnitude of the authenticated LIES / EMPTY / EPIPHANY direction ray;
- **p=23**, the reconstructed 2013 DH modulus.

The p50 tree artwork has a verified narrower role: it selects horizontal reflection of the 8-column p50 table (column c maps to 7-c). That establishes reflection as a plausible puzzle operation, but it does not select the H4 pairing of key positions, the sum/difference combiner, or the assignment of source values to slots. The p57 parable's circumference/within language is compatible with outer/inner semantics but does not uniquely specify an executable operation. Thus the H4 pair model below is a hypothesis, not a first-party instruction. See im-results/lp2-p50-tree-reflection-selector.md.

Impose the candidate pair invariants:

```text
outer sum:        k0 + k3 = -K = -2
outer difference: k0 - k3 = NG = 21

inner sum:        k1 + k2 = V = 4
inner difference: k1 - k2 = p = 23
```

In the already-used H4 serialization,

```text
H4(k) = [k0-k3, k1-k2, k1+k2, k0+k3]
      = [NG,p,V,-K]
      = [21,23,4,27].
```

Solving the pair equations modulo29 gives:

```text
k0 = (-2 + 21)/2 = 24
k3 = (-2 - 21)/2 = 3
k1 = ( 4 + 23)/2 = 28
k2 = ( 4 - 23)/2 = 5

key = [24,28,5,3] = A EA C O
```

## 3. Source-only 3-4-5 ray filter

The signed 2016 message's zero-based word positions are:

```text
LIES     = 3
EMPTY    = 4
EPIPHANY = 5
```

Read the proposed reflected key from its right-hand outside-to-inside path:

```text
[k3, k1+k2, k2] = [3,4,5].
```

The 3-4-5 ray is source-derived; mapping it into the H4 key slots is interpretive. The p50 report validates reflection of the 8-column numeric table, not this key readout, and the p57 wording is suggestive but underdetermined. Treat the ray readout as a falsifiable model, not an established instruction.

Crucially, it can be tested before looking at the p2 plaintext. Enumerating all 24 permutations and 16 sign choices of the four source residues `{K,NG,V,p}` gives 384 assignments. Exactly **two** satisfy the source-only ray constraint:

| Candidate | Outer sum | Outer difference | Inner sum | Inner difference | H4 key |
|---|---:|---:|---:|---:|---|
| A | -K = -2 | NG = 21 | V = 4 | p = 23 | `[24,28,5,3]` |
| B | -NG = -21 | K = 2 | V = 4 | p = 23 | `[5,28,5,3]` |

The signed message also says that its words are the map and their numbers the direction. Under the natural reading that the four H4 key slots select four distinct source-word positions, only A survives:

| Key slot | Zero-based source word index | Source word |
|---|---:|---|
| k0 | 24 | AND |
| k1 | 28 | THE |
| k2 | 5 | EPIPHANY |
| k3 | 3 | LIES |

The four indices are distinct, and in key order they read **AND THE EPIPHANY LIES**. Candidate B repeats source index5 (EPIPHANY) in both k0 and k2, so it fails this without-replacement reading. This selects A algebraically if the four-slot key is intended to draw four distinct words from the source map; the existing GOOD hit was known before this constraint was proposed.

The same key reproduces the DH state exactly:

    k0-k3 = 21 = NG
    k1-k2 = 23 = p
    k1+k2 = 4  = V
    k0+k3 = 27 = -K mod29

Thus [24,28,5,3] is simultaneously a four-word source-index tuple, the unique ray-compatible distinct-index assignment, and an inverse H4 image of [NG,p,V,-K]. The distinctness assumption and H4 operation remain unverified hypotheses; deriving the key without ciphertext as an input is different from independently selecting the rule before knowing its output.

## 4. Exact decryption and finite assignment audits

Candidate A gives:

```text
ciphertext [1,2,8,26]
key        [24,28,5,3]
----------------------
plaintext  [6,3,3,23] = GOOD
```

Forward addition reconstructs all four original runes exactly.

Candidate B gives:

```text
ciphertext [1,2,8,26]
key        [5,28,5,3]
---------------------
output     [25,3,3,23] = AE O O D
```

Candidate B is not one of the authenticated four-rune targets.

The wider finite source-state pool

```text
{2,3,4,5,6,8,12,15,19,21,23}
```

gives `11P4 * 16 = 126,720` signed assignments. Four hit GOOD, but they are aliases of the same numeric key: `-8=21 mod29` may replace `+21`, and `-6=23 mod29` may replace `+23`.

These are finite-family search audits, not p-values. The hypothesized ray plus distinct-word-index rule selects A arithmetically; the known target and prior model selection prevent interpreting the manuscript scan as independent validation.

## 5. Fixed-key manuscript-wide control

I held each ray-compatible key fixed and tested it against:

- all **509** canonical complete four-rune words wholly contained on unknown LP2 pages p0..p55, excluding rune-free numeric page p50;
- all **nine** distinct four-GP-rune targets in the authenticated 2016 message: LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS;
- both additive directions.

That is `509 * 9 * 2 = 9,162` comparisons per key.

| Ray-compatible key | p2 output | Manuscript-wide hits |
|---|---|---:|
| A: `[24,28,5,3]` | GOOD | **1** |
| B: `[5,28,5,3]` | AE O O D | **0** |

Candidate A's sole hit is the previously known p2 offset36 receiver itself, decrypting to GOOD. Candidate B has no hit anywhere in the 509-word scan. Removing the previously known target occurrence leaves **zero additional hits for either key**. The scan establishes specificity within this fixed corpus/target set, but does not independently validate either the distinctness rule or the H4 operator.

**Critic calibration (26 November):** On the same 509 words, nine targets and two directions, the exact distribution over all 29^4 = 707,281 four-rune additive keys is 698,181 with zero hits, 9,038 with one, and 62 with two. Thus 9,100/707,281 = 1.286617% of uniform keys have at least one hit; the expected hit count is 9,162/707,281 = 0.01295383. This is an exact descriptive reference for an independently uniform key, **not** a selection-adjusted p-value for the retrospective H4 search. It neither assumes independent word trials nor estimates how many other exploratory rules were tried. To reproduce using the arrays in the existing SFT, initialize a length-29^4 integer histogram; for each `word` in `fourRuneWords`, each `target` in `sourceFourTargets`, and each sign in `[-1,1]`, compute `k = word.values.map((c,i) => mod29(sign*(c-target.values[i])))`; increment the index `k.reduce((v,x)=>29*v+x,0)`. Count histogram bins of each occupancy. Input transcription blob: `43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7`.

The already-known GOOD fit cannot be counted again as evidence for the rule proposed to explain it. Both #3071 and #3078 close with no independently authenticated selector; an independently frozen receiver or a complete historical operator contract is needed before dependent work.

## 6. Cross-result source-index convergence

The recovered GP29 value of GOOD has:

    GP0(GOOD) = 6+3+3+23 = 35.

Zero-based signed-source word35 is **FOUND**. The independently source-selected p35 receiver at offsets25..29 has ciphertext [19,17,19,24,11]; the published p35 local inverse subtracts [19,14,18,15,17] and recovers FOUND. In turn:

    GP0(FOUND) = 36
    signed-source word36 = GOOD.

Thus the p2 candidate supplies another incoming receiver for the existing source-only FOUND35 <-> GOOD36 numerical cycle. This is cross-result consistency, not independent authentication: the p35 candidate and source-index cycle are already documented in im-results/lp2-p33-p35-found-road-map.md.

There is also a direct page-level pointer: signed-source word36 is GOOD, selecting p36. A separate p36 EMPTY-center local inverse also recovers GOOD on that page. Under page-local numbering it is group37; under the whole-manuscript complete-word parser it is complete-word index35, while canonical index36 is a six-rune word. This is page-level convergence, not a confirmed canonical double-index word hop. The p36 candidate and parser distinction are documented in im-results/lp2-p36-good-empty-direction-decoder.md.
## 7. Evidence boundary and next decisive test

What is supported:

- exact GP29 forward and inverse arithmetic on the original p2 ciphertext;
- a plausible page2 / page-local group10 / offset36 / length4 coordinate from the 13- and 23-dot endpoint markers and signed 2016 phrase lengths;
- a hypothesized 3-4-5 ray filter that reduces 384 H4 assignments to two;
- under the four-distinct-source-word reading, a unique source-index key [24,28,5,3] = AND/THE/EPIPHANY/LIES;
- an H4 image [NG,p,V,-K] that exactly reproduces the independently reconstructed DH state;
- a fixed-key scan with one previously known GOOD hit versus zero for the alternative, and no new hit for either key;
- a cross-result source-index convergence with the existing p35 FOUND candidate.

What remains unproved:

- whether the four key slots are intended to select distinct source-word indices (the without-replacement assumption);
- whether the right-side readout [k3,k1+k2,k2] is the intended interpretation of the 2016 direction ray;
- whether the H4 reflection/sum/difference operation is explicitly selected by the p50/p57 clues rather than merely compatible with them;
- whether the mechanism generalizes beyond this local receiver.

Repeating the same four-rune key on the following p2 word does not produce LUCK. Treat this as a source-constrained local plaintext candidate, not a page-level decoder.

Promotion requires a fresh receiver selected before plaintext inspection for which the same frozen H4 and ray readout predict the output, or an original clue that explicitly identifies the reflection-pair operation.

## Reproduction

```text
node sims/lp2_p2_good_reflection_pair_key_sft.cjs
```


## 8. Agent5 source-selector audit of the p2 marginal pair (26 November 2026)

**Question:** Can the original p2 signs or the authenticated 2016 word map select between the two remaining outer H4 assignments without using the p2 plaintext or p36 result?

### Signed-source word-map check

The authenticated payload at `resources/historical/cicada2016-4gq25-outguess.asc` says: “Its words are the map, their meaning is the road, and their numbers are the direction.” Under the same zero-based tokenization that gives LIES=3, EMPTY=4, EPIPHANY=5, the two candidates read:

- A `[24,28,5,3]` → AND / THE / EPIPHANY / LIES.
- B `[5,28,5,3]` → EPIPHANY / THE / EPIPHANY / LIES.

This is a source-only distinction, but it is not an authenticated uniqueness rule. The signed wording does not specify a four-slot arity, injectivity, “without replacement,” or a key-slot ordering. “Words are the map” does not logically require distinct word indices; the grammatical advantage of A is a semantic preference, not a locked reversible operation. No independent worked Cicada example was found establishing that four-component key slots must select four distinct signed-message word positions.

### Original p2 marginal-sign pairing

The original LP2 physical p2 image is `resources/liber-primus/19.jpg` (2400×3600; SHA-256 `74e955ebe248e6d7442e2d2cd3029951f258017987d5762f48e7897cf6611e34`). Its two large marginal components are:

- left: threshold-128 bounding box `(57,1684,490,1276)`, area 153,290 pixels;
- right: threshold-128 bounding box `(1853,640,490,1276)`, area 153,377 pixels.

Rotating the right component 180° about the page centre gives IoU **0.9883358296** with the left. Across thresholds 96, 128, 144, 176, 192, 208 and 224, the IoU remains **0.9867–0.9898**. This establishes a strong original-image rotational pairing. It does not supply a privileged start, arrow, or labeled correspondence to (k_0+k_3) versus (k_0-k_3). The 180° relation is an involution and leaves the disputed assignment unresolved.

The p50 tree report selects horizontal reflection of the p50 eight-column table, not the H4 key pairing or the outer sum/difference sign. The p57 “circumferences/within” wording plausibly motivates outer/inner grouping but likewise does not select the remaining assignment.

### Decision

No independent source-authenticated selector for the remaining slot was found. The rotational pair is a genuine structural clue, but it does not choose A over B. The four-distinct-word filter remains an interpretive assumption, and the H4 mechanism remains provisional. Do not expand target-conditioned slot permutations; promotion requires a source rule that fixes the outer assignment or a new receiver/state prediction frozen before its ciphertext is opened.

Reproduce the image measurement with:

```text
python sims/lp2_p2_marginal_sign_rotation_sft.py resources/liber-primus/19.jpg
```

Raw measurements: `im-results/lp2-p2-marginal-sign-rotation-output.json`.


## 9. Historical operator audit: H4 is not source-selected (Agent5, 26 November 2026)

The frozen candidate called H4 in #3078 is the paired map

```text
y = [k0-k3, k1-k2, k1+k2, k0+k3] mod 29
```

or, on the ordered input vector `[k0,k1,k2,k3]`, the matrix

```text
[ 1  0  0 -1 ]
[ 0  1 -1  0 ]
[ 0  1  1  0 ]
[ 1  0  0  1 ]
```

It is mathematically invertible (determinant (4\bmod29)); with (2^{-1}=15\bmod29), its inverse is (k_0=15(y_0+y_3)), (k_3=15(y_3-y_0)), (k_1=15(y_1+y_2)), (k_2=15(y_2-y_1)), all modulo 29. Reversibility establishes a valid construction, not that Cicada selected it.

### Historical worked-source comparison

The source-cited 2012–2016 solve-path records document recognizable, typed operations: ROT−4, OutGuess and explicit book-code coordinates; the 2012 MIDI's note-value-plus-delta-time construction; 2013 BASE29 conversion, participant-run DH, NEXT, packet framing, XOR and Shamir reconstruction; 2014 Vigenère, XOR/seven-column composition, hex/media extraction and OpenPuff. None specifies a four-slot paired sum/difference operation with a declared ring, operand pairing, difference signs and output order. In particular:

- The 2013 signed DH example gives (p=23,g=5) and shared value 2, but its protocol has the participant server choose its base and secret. It specifies modular exponentiation, not a subsequent H4 transform or an organizer-fixed LP2 key.
- The 2012 MIDI sum is note value plus delta time, followed by sorting distinct sums. It does not produce both sum and difference from mirrored operands.
- The 2014 Stage03→04 XOR/seven-column composition is a reproducible participant reconstruction, not an author-specified GF29 paired transform. Vigenère and magic-square word sums likewise do not supply H4's paired outputs.

Source syntheses: `im-results/cicada-authenticated-solvepath-operation-contracts-2012-2016.md` and `workplace/historical-player-solvepath-operator-contract.md`; the signed DH protocol is detailed in `resources/external/2013-tcp-server-signed-source.md`.

### What the LP2 originals actually select

- **p50:** the mirrored botanical drawings select the horizontal table permutation (c\mapsto7-c) on eight printed columns. The source report explicitly limits this to a reflection involution: it gives no arithmetic combiner, start cell or payload receiver. A permutation of columns is not the paired linear mixing above.
- **p57:** “Shed our own circumferences / Find the divinity within” plausibly motivates an outer/inner distinction, but the source's established LP1 usage is also semantic (the ego/circumference). It does not specify a ring, operand order, plus/minus signs or a four-slot output order.
- **p2:** the two marginal marks are a near-exact 180° rotational pair (section 8). This is a geometric involution, not an arithmetic instruction; the pair has no privileged origin or mapping to the two H4 outputs.

The missing discriminant is an original, solver-visible instruction or worked source example that fixes **which operands are paired, which ring is used, which member is added/subtracted, and the order of the four outputs**. The originals supply none of those together. Reflection alone cannot distinguish a permutation from XOR, a single difference, or paired sum/difference.

### Decision

No historical solved source independently derives or authenticates the frozen H4 operation. Keep the p2 local candidate conditional; do not expand H4 matrices, slot orders or four-rune phrase searches. Reopen this route only if a first-party source fixes the complete operator contract or a genuinely independent historical worked example transfers with an untouched, source-selected LP2 prediction.
