# P2 GOOD: marker-selected local inverse and manuscript-wide fixed-key control

**Agent12's original candidate (18 November 2026); source-coordinate extension by Agent33 and independent fixed-key control by Agent30 (26 November 2026). Classification: provisional local plaintext candidate with a plausible source-selected coordinate; the H4 key-slot assignment remains post-hoc.**

The exact local inverse is:

```text
p2 offset36 ciphertext [1,2,8,26] = U TH H Y
key                    [24,28,5,3] = A EA C O
                         subtract mod29
plaintext              [6,3,3,23] = G O O D
```

The fixed key has exactly one hit across every canonical complete four-rune word on the 55 rune-bearing unknown pages, against all nine distinct four-rune targets in the authenticated 2016 message, in both additive directions. This strengthens the local candidate but does not establish a reusable cipher or independently authenticate the key-slot assignment.

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

The reconstructed DH shared value **K=2** selects p2, and the direction-ray vertical magnitude **V=4** selects a four-rune receiver. Under a parser that resets word/group numbering at each physical page, p2's tenth printed group is exactly the four-rune packet at offsets36..39:

```text
page-local group10
offsets36..39
[1,2,8,26] = U TH H Y
```

This is a materially better receiver-selection story than choosing the word after seeing GOOD. It is still a hypothesis: the use of the physical page boundary as a reset for the group ordinal must be retained explicitly.

### Page-boundary convention

The p2 page begins with a two-rune fragment while p1 ends in a rune without a printed hyphen or period. Therefore two legitimate counts differ:

- **Page-local numbering:** reset at the physical page; the target is group10.
- **Whole-manuscript complete-word census:** carry a possible word across the page boundary and exclude any word spanning two pages; the same receiver is complete-word index8 (zero-based) on p2.

The offset and four-rune ciphertext are identical under both conventions. The source-coordinate proposal uses page-local numbering; the manuscript-wide control below uses only complete words wholly contained on one physical page. Do not conflate these counts.

## 2. Frozen source values and reflection-pair key

The candidate uses four values reconstructed elsewhere without reference to the p2 rune values:

- **K=2**, the reconstructed DH23 shared value;
- **NG=21**, the original-rune center of the source-selected H-NG-C TURNS key node;
- **V=4**, the vertical component magnitude of the authenticated LIES / EMPTY / EPIPHANY direction ray;
- **p=23**, the reconstructed 2013 DH modulus.

The p50 tree artwork motivates horizontal reflection, pairing the four key positions as outer `(k0,k3)` and inner `(k1,k2)`. The p57 parable's language about shedding circumferences and divinity within is compatible with taking differences and sums of those pairs.

Impose the candidate pair invariants:

```text
outer sum:        k0 + k3 = -K = -2
outer difference: k0 - k3 = NG = 21

inner sum:        k1 + k2 = V = 4
inner difference: k1 - k2 = p = 23
```

Since (2^{-1}=15 pmod{29}), the unique solution is:

```text
k0 = (-2 + 21)/2 = 24
k3 = (-2 - 21)/2 = 3
k1 = ( 4 + 23)/2 = 28
k2 = ( 4 - 23)/2 = 5

key = [24,28,5,3] = A EA C O
```

In the already-used H4 serialization,

```text
H4(k) = [k0-k3, k1-k2, k1+k2, k0+k3]
      = [21,23,4,27]
      = [NG,p,V,-K].
```

This is an exact reversible inverse. It is not yet an authenticated key derivation: reflection motivates the pairings, but no first-party instruction has yet fixed which state value belongs in each sum/difference slot and with which sign. The ray may motivate the chosen orientation, but the mapping remains a post-hoc assignment.

## 3. Exact decryption and assignment audits

The original p2 receiver is:

```text
ciphertext [1,2,8,26]
key        [24,28,5,3]
----------------------
plaintext  [6,3,3,23] = GOOD
```

Forward addition reconstructs all four original runes exactly.

Using exactly the four selected residues `{2,21,4,23}`, exhaustive permutation and independent sign choice gives:

```text
24 permutations * 16 sign patterns = 384 assignments
exact GOOD hits = 1
winning signed slots = (-2,+21,+4,+23)
```

The wider finite source-state pool

```text
{2,3,4,5,6,8,12,15,19,21,23}
```

gives `11P4 * 16 = 126,720` signed assignments. Four hit GOOD, but they are aliases of the same numeric key: `-8=21 mod29` may replace `+21`, and `-6=23 mod29` may replace `+23`.

These are finite-family search audits, not p-values. The target GOOD and the algebraic slot family were available when the candidate was formulated.

## 4. New fixed-key manuscript-wide control

I held `[24,28,5,3]` fixed and tested it against:

- all **509** canonical complete four-rune words wholly contained on unknown LP2 pages p0..p55, excluding rune-free numeric page p50;
- all **nine** distinct four-GP-rune targets in the authenticated 2016 message: LIES, THEIR, MEANING, ROAD, SEEK, WILL, GOOD, LUCK, PATHS;
- both additive directions.

That is:

```text
509 * 9 * 2 = 9,162 comparisons.
```

There is exactly one hit:

```text
p2 offset36 [1,2,8,26]
subtract [24,28,5,3]
= [6,3,3,23] GOOD.
```

The receiver is included in the complete-word census. This is a fixed-key manuscript control, separate from the 384- and 126,720-assignment audits. It supports the specificity of this local inverse; it does not repair the remaining source-ordering gap.

## 5. Cross-result source-index convergence

The recovered GP29 value of GOOD has:

```text
GP0(GOOD) = 6+3+3+23 = 35.
```

Zero-based signed-source word35 is **FOUND**. The independently source-selected p35 receiver at offsets25..29 has ciphertext `[19,17,19,24,11]`; the published p35 local inverse subtracts `[19,14,18,15,17]` and recovers FOUND. In turn:

```text
GP0(FOUND) = 36
signed-source word36 = GOOD.
```

Thus the p2 candidate supplies another incoming receiver for the existing source-only FOUND35 <-> GOOD36 numerical cycle. This is cross-result consistency, not independent authentication: the p35 candidate and the source-index cycle are already documented in `im-results/lp2-p33-p35-found-road-map.md`.

## 6. Evidence boundary and next decisive test

What is supported:

- exact GP29 forward and inverse arithmetic on the original p2 ciphertext;
- a plausible page2 / page-local group10 / offset36 / length4 coordinate from the 13- and 23-dot endpoint markers and the signed 2016 phrase lengths;
- one fixed-key hit across 9,162 manuscript-wide target comparisons;
- a source-index convergence with the existing p35 FOUND candidate.

What remains unproved:

- the first-party rule that assigns `-K, NG, V, p` to the four H4 output slots in this order;
- whether the intended word-number convention resets at the physical page boundary;
- any continuation from this isolated p2 word to a general page cipher.

Repeating the same four-rune key on the following p2 word does not produce LUCK. Treat this as a local candidate, not a page-level decoder.

Promotion requires an original clue that independently orders the four state values, or a fresh receiver selected before plaintext inspection for which the frozen H4 slot assignment predicts the output.

## Reproduction

```text
node sims/lp2_p2_good_reflection_pair_key_sft.cjs
```
