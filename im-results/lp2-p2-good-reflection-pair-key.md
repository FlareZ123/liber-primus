# P2 GOOD: source-constrained H4 local inverse

**Original local candidate: Agent12 (18 November 2026). Source-coordinate and ray-order analysis: Agent33 (26 November). Independent fixed-key and source-only ray tests: Agent30 (26 November). Classification: strong provisional local plaintext candidate; not yet an authenticated general cipher.**

This intermediate candidate is summarized in `results/README.md` under **Opening p0–14**; it is not promoted as an established decryption.

The proposed local inverse is:

```text
p2 offset36 ciphertext [1,2,8,26] = U TH H Y
key                    [24,28,5,3] = A EA C O
                         subtract mod29
plaintext              [6,3,3,23] = G O O D
```

The key is no longer supported only by a post-hoc slot assignment. A source-only 3-4-5 ray constraint reduces the 384 possible H4 assignments to two. A manuscript-wide fixed-key control then selects one of those two: the candidate key has exactly one authenticated-word hit, while the alternative has none.

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

The reconstructed DH shared value **K=2** selects p2, and the direction-ray vertical magnitude **V=4** selects a four-rune receiver. Under a parser that resets group numbering at each physical page, p2's tenth printed group is exactly the packet at offsets36..39:

```text
page-local group10
offsets36..39
[1,2,8,26] = U TH H Y
```

This is a source-motivated receiver selection made without using the plaintext GOOD. It depends on treating the physical page boundary as a reset for the page-local ordinal.

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

The ray fixes the inner pair and `k3`, but leaves a binary ambiguity in the outer-left key symbol. The ciphertext and manuscript-wide control must distinguish A from B.

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

These are finite-family search audits, not p-values. The source-only ray filter is the stronger result because it reduces the key choices before inspecting the ciphertext output.

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

Candidate A's sole hit is the p2 offset36 receiver itself, decrypting to GOOD. Candidate B has no hit anywhere in the 509-word control. This resolves the remaining binary ambiguity in favor of A without searching over alternative plaintexts at the target.

This is the strongest current evidence for the p2 local inverse. It does not prove that the proposed ray readout is the intended mechanism, but it makes the interpretation substantially more constrained than an unconstrained key search.

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
- a source-only 3-4-5 ray filter that reduces 384 H4 assignments to two;
- a manuscript-wide fixed-key control that selects one of those two, with one GOOD hit versus zero for the alternative;
- a cross-result source-index convergence with the existing p35 FOUND candidate.

What remains unproved:

- whether the right-side readout `[k3,k1+k2,k2]` is the intended interpretation of the 2016 direction ray;
- whether the H4 reflection/sum/difference operation is explicitly selected by the p50/p57 clues rather than merely compatible with them;
- whether the mechanism generalizes beyond this local receiver.

Repeating the same four-rune key on the following p2 word does not produce LUCK. Treat this as a source-constrained local plaintext candidate, not a page-level decoder.

Promotion requires a fresh receiver selected before plaintext inspection for which the same frozen H4 and ray readout predict the output, or an original clue that explicitly identifies the reflection-pair operation.

## Reproduction

```text
node sims/lp2_p2_good_reflection_pair_key_sft.cjs
```
