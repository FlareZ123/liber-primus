# Authenticated THE / WAY p0 road closes on the p27 byte80 DIVINITY route

**Agent9, 18 November 2026. Classification: source-connected navigation closure. No unknown LP2 plaintext or complete cipher inverse is recovered.**

## Independent inputs

Two source routes fixed this test before the p0 source-order census:

- finite historical `prime_echo` plus p57 `FIND → T[42]=28` select p27:28 `DJU / BEI`; the frozen GP0/table-byte continuation converges at **p27 byte80**;
- the selected p27 DIVINITY carrier reconstructs historical BASE29 `3QO = 3301`; `3301 mod 256 = 229`, and original p50 cell229 is literal `00` with byte0, giving the existing conditional p0 return.

The authenticated 2016 message independently contains adjacent source words **THE / WAY** in `Liber Primus is the way`.

## THE / WAY closes through original p0

Use the replicated grammar:

`source word → GP0 sum → p50 byte → containing receiver-page word → that word's GP0 sum → p50 byte`.

For signed source word **THE** at zero-based signed-word index12:

- `GP0(THE)=20`;
- `T[20]=102`;
- p0 offset102 is the final rune of word20, spanning95..102;
- that ciphertext word has GP0 sum139;
- `T[139]=13`, exactly the zero-based signed-word index of the next source word **WAY**.

Continue **WAY**:

- `GP0(WAY)=57`;
- `T[57]=118`;
- p0 offset118 lies in word26, spanning117..121;
- that word has GP0 sum37;
- `T[37]=80`.

So the authenticated source-order pair yields `THE → WAY → 80`.

Byte80 was already fixed by the p27 DJU / BEI convergence. On p27 it is the first rune of the once-shed interior of the 12-rune carrier whose twice-shed core has GP-prime sum **376=DIVINITY**.

## THE / WAY receiver numbers spell DH

The two p0 receiver words selected by authenticated **THE / WAY** have GP0 sums **139** and **37**. Reduce those same already-used word numbers in the native GP29 alphabet:

- `139 mod 29 = 23 = D`
- `37 mod 29 = 8 = H`

The road therefore reads **DH**. This is an operation-family result from the unchanged GP0 numbers used by the navigation grammar, not a newly introduced number family.

The numeric values are independently relevant as well: **23** is the signed-2013 DH modulus already recovered at p50 root coordinate (23,5), and **8** is the signed server public value already recovered as the eight-edge MUST path length. This cross-object DH state existed before the p0 residue readout was noticed.

A wider control over all **1,931 valid** page × authenticated-source-adjacency receiver pairs finds six raw `DH` residue pairs. Two also end at byte80. Requiring the already frozen source-order bridge leaves **one** `DH` pair, and requiring both source order and independently frozen endpoint80 still leaves exactly **one**: p0 **THE / WAY**.

This upgrades the route from a navigation-only coincidence to a source-selected **DH operation-family pointer**. It does not add a KDF, block/stream cipher, rune serialization, or post-DH payload opcode, so it still does not decrypt unknown LP2 runes.

## Prospective p2 GOOD receiver from the same byte80 grammar

The natural `27x27` square formed by original p0-p2 contains exactly three complete-word ends on global column0: p0 word22 at108, p0 word53 at243, and p2 word9 at567. The first two were already selected independently as candidate **ROAD** and **DEVOTED** endpoints. This leaves p2 word9 as a locked prospective receiver before consulting the authenticated source vocabulary.

Apply the same source-word bridge used above:

`source word -> GP0 -> p50 byte -> containing receiver word -> receiver GP0 -> p50 byte`.

For authenticated source **GOOD** at zero-based word index36:

- `GP0(GOOD)=35`;
- `T[35]=39`, exactly the final rune of p2 word9 at local offsets36..39;
- GOOD has four GP runes and the receiver has exactly four ciphertext runes;
- the receiver ciphertext GP0 sum is **37**;
- 37 is exactly the zero-based source index of the next authenticated word **LUCK**;
- `T[37]=80`, the independently frozen p27 DIVINITY endpoint.

So the source-order relation is

`GOOD -> 35 -> 39 -> p2 word9 -> 37 = index(LUCK) -> 80`.

A complete census over all 56 unknown pages and all 42 authenticated source adjacencies required, simultaneously: the first table byte is the exact receiver-word end, receiver length equals source GP length, receiver GP0 equals the next authenticated source index, and the receiver GP0 table byte equals80. **The only hit is p2 GOOD / LUCK.**

This is a prospective plaintext prediction:

`p2 word9, local offsets36..39 = GOOD`.

It uses the already frozen navigation grammar and an independently selected 27x27 receiver. It remains conditional until a reversible value-changing cipher reproduces the four letters or another independent artifact feature confirms them. LUCK is a navigation-state label here, rather than a claim that the following p2 word plaintext is LUCK.

## Full source-family control

The exact grammar was applied to all **56 unknown pages p0–p55** and all **42 adjacent authenticated 2016 word pairs**. A first-hop hit requires the first source word to bridge through the page to the actual zero-based index of the next signed word.

There are **10** first-hop source-order adjacencies across the full 56×42 population.

THE / WAY has two first-hop receiver pages, p0 and p25. The next source-word step discriminates them:

- p0 WAY exits at **80**;
- p25 WAY exits at **65**.

Across the full 56×42 population, **p0 THE / WAY is the only source-order chain whose next step exits at the independently frozen byte80**.

## Closed navigation circuit

The supported route is now:

`p55 boundary300 → p27:28 DJU/BEI → 80 → shed carrier → DIVINITY → 3QO=3301 → 229/00/byte0 → p0 → authenticated THE/WAY → 80 → p27 DIVINITY carrier`.

This materially strengthens the GP0/table mechanism as an intended navigation layer and p0 as the receiver of the p27/3301 route.

## Decision

The cycle supplies a reproducible route and historical scalar key material. It still does not specify a reversible value-changing transform for unknown runes.

The next useful cryptanalytic step is fixed: use p0 as receiver and require a reversible mechanism that explains the already source-selected p0 crib locations without retuning the navigation grammar. Existing failed title-columnar, direct p56-transfer and generic table-pad families should not be rerun.

**Reproduce:** [single-file source SFT](../sims/lp2_p0_the_way_p27_80_cycle_sft.cjs) · [Windows Node22 PASS 44420220363](https://github.com/FlareZ123/liber-primus/actions/runs/44420220363).
