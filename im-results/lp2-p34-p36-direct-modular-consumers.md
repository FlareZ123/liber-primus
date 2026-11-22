# p34 ↔ p36 direct modular consumers: finite negatives

**Agent 19, 18 November 2026. Evidence class: source-constrained cipher-operation gates. The p34↔p36 structural pointer remains intact; no unknown plaintext or key is recovered here.**

## Fixed receiver

The source-only census in `im-results/lp2-p34-p36-prime-totient-mutual-pointer.md` isolates one compound relation among 212 unsolved-page period-delimited units:

- p36 numbered item 1 is visually separated by the red 10-square mark, has **34 words and 139 runes**, and (139) is the 34th prime;
- p34 clause 3 has **36 words and 138 runes**, with (138=arphi(139));
- the word counts point reciprocally to pages 34 and 36.

This note asks whether the surrounding cuneiform constants or the authentic p56 prime/totient operation supply a direct reversible consumer for that pair.

## 3301 as a primitive root modulo 139

The repeated cuneiform header contains 3301. Modulo the p36 item length,

[
3301mod139=104,qquad operatorname{ord}_{139}(104)=138.
]

Thus successive powers of 3301 enumerate every nonzero residue modulo 139 exactly once, matching the p34 clause length without padding. The second printed header value also fits the same field:

[
1033mod139=60,qquad operatorname{ord}_{139}(60)=46,
]

and (3301^{39}equiv1033pmod{139}). The order-46 subgroup gives exactly three cosets in the 138-element multiplicative group.

The fixed transposition test therefore covered:

- source order;
- 3301-power order, forward and reverse;
- the three 1033-subgroup cosets in both coset orders and both within-coset power directions.

A source-native Shakespeare GP trigram model was frozen before scoring. **All seven transformed originals are below the worst of 2,780 independent 138-rune native-GP control windows.** The best original candidate is the reversed 3301-power traversal at **-12.429181 nats/trigram**; the worst native control is **-9.249772**. A planted Gibran transposition is recovered exactly and scores **-8.171846** after inversion.

Decision: reject these literal primitive-root and subgroup-coset transpositions.

Reproduction: `sims/lp2_p34_p36_3301_primitive_root_transposition_sft.cjs`. Windows Node 22 PASS: Actions **44404033926**, job **135154359370**.

## Header powers as a GP29 additive keystream

A second direct interpretation uses the same successive modular powers as rune shifts, reducing each power modulo 29 and applying the resulting 138-symbol stream to the p34 clause. Both printed header bases and both additive signs were fixed:

| stream | sign | score / trigram |
|---|---:|---:|
| powers of 3301 mod 139 | -1 | -12.349572 |
| powers of 3301 mod 139 | +1 | -12.694882 |
| powers of 1033 mod 139 | -1 | -12.482755 |
| powers of 1033 mod 139 | +1 | -12.602579 |

Again, **0/4** candidates reach the worst native-GP control score of **-9.249772**. The planted 3301-power additive cipher recovers exactly: native plaintext **-8.171846**, encrypted plant **-12.655602**, recovered plaintext **-8.171846**.

Decision: reject the literal header-power additive keystream.

Reproduction: `sims/lp2_p34_p36_139_header_power_keystream_sft.cjs`. Windows Node 22 PASS: Actions **44404919280**, job **135157480035**.

## Authentic p56 `phi(prime)` transfer starting at 139

The most literal prime/totient consumer is the already-authenticated p56 mechanism: ordinary ciphertext runes decode with (arphi(p)=p-1) modulo 29, while literal plaintext F passes unchanged without consuming the prime clock.

The p36 item itself selects **prime 139 = prime #34**, so no phase search is needed. Starting the p56 prime clock at 139:

- p34's 138-rune clause has no legal authentic-sign F-bypass path beyond zero-based rune **58**;
- p36's 139-rune item has no legal authentic-sign path beyond rune **12**;
- the opposite sign also fails, at p34 rune **5** and p36 rune **72**.

This is a structural impossibility, independent of English scoring.

## Arithmetic closure that does not decode

The 2014 Wisdom center word `FORM` has GP prime-sum **91**. The new receiver also satisfies

[
34	imes91equiv36pmod{139}.
]

Using multiplication by 91 as a permutation modulo 139, in both natural orientations, does not yield GP prose from either receiver unit. Direct additive alignment of the 138-rune p34 clause with either 138-rune truncation of the p36 item is also nonlinguistic. These attractive arithmetic closures therefore do not supply an inverse.

## Decision

The **p34↔p36 prime/totient mutual pointer remains the useful discovery**. Its most direct source-selected consumers are now bounded:

- `FORM=91` modular position permutation;
- 3301 primitive-root traversal;
- 1033 order-46 subgroup/coset traversal;
- 3301/1033 modular-power GP29 keystreams;
- authentic p56 `phi(prime)` cipher starting at prime 139.

Do not extend this branch with arbitrary affine maps, alternate phases, or extra cipher layers. A future continuation should require a new authored clue that specifies how the paired receiver is consumed.
