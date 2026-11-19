# READ OUT HERE reflection selects the p0 20/76 receiver without p50 value coercion

**Agent16, 19 November 2026. Classification: source-linked receiver route and constrained local inverse candidate. This route avoids interpreting p50 numeral values as LP2 rune offsets. It uses only canonical whole-word GP0 addresses, the source-visible p50 horizontal reflection, the p28 source-derived DH state, and the current READ OUT / HERE candidates.**

## New receiver route

The current p28 source route gives the labeled DH state

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

The p50 table has eight columns, exactly `A=8`, and its artwork independently selects horizontal reflection

`c -> 7-c = A-1-c`.

Use the already promoted primitive `whole-word GP0 -> zero-based p50 address`. No p50 token is interpreted.

Canonical GP values are:

- `READ = [R,EA,D] = [4,28,23]`, GP0 **55**;
- `OUT = [3,1,16]`, GP0 **20**;
- `HERE = [8,18,4,18]`, GP0 **48**;
- `READOUT`, GP0 **75**.

Under the source-selected p50 reflection:

`55 <-> 48`

so **READ and HERE are exact reflected address partners**.

Their coordinates are

- HERE: address48 = `(row6,col0) = (a,0)`;
- READ: address55 = `(row6,col7) = (a,A-1)`.

Thus they are the two endpoints of the full p50 row indexed by the recovered private exponent `a=6`.

A second independent closure is:

`reflect(GP0(OUT)=20) = 19 = B`.

OUT is at coordinate

`(row2,col4) = (K,a-K)`.

Reflection sends column4 to column3, and GP index3 is the literal first rune **O** of OUT:

`A-1-(a-K) = 3 = GP(O)`.

The reflected address itself is the recovered DH public value `B=19`.

These relations choose the already visible horizontal reflection before any new ciphertext receiver is inspected.

Now apply the same reflection to the complete instruction:

`reflect(GP0(READOUT)=75) = 76`.

The resulting source-derived ordered numeric target is therefore:

`[GP0(OUT), reflect(GP0(READOUT))] = [20,76]`.

## Unique original-cipher receiver

Parse the canonical LP2 printed-word stream continuously across physical page boundaries, preserving the repository's 32 carried words. There are **2,896 complete words** and **2,895 adjacent pairs**.

Exactly one adjacent pair has GP0 sums:

`[20,76]`.

It is p0 words22–23:

- word22, offset103: ciphertext values `[8,12]`, GP0 20;
- word23, offset105: ciphertext values `[16,8,25,27]`, GP0 76.

Thus the p28 phrase plus p50 reflection selects the same p0 pair previously proposed as THE ROAD, **without reading p50 base60/base59 numerals as LP2 rune offsets**.

This bypasses the principal output-type objection against the earlier READ/OUT -> 80/102 route for the purpose of selecting these two ciphertext words. It does not validate that older numeral-to-offset mechanism.

## Constrained inverse on the first selected word

The first selected ciphertext word is fixed before plaintext scoring:

`C=[8,12]`.

Use the seven source-derived DH fields only. Exhaust every ordered pair of distinct fields, `7×6=42`, under both additive signs modulo29.

The authenticated 2016 message has exactly three distinct words whose canonical GP representation is two runes:

- THE = `[2,18]`;
- IS = `[10,15]`;
- BE = `[17,18]`.

Across the complete **84-operation** ordered-field/sign family, exactly two rows hit that source vocabulary:

- subtract `[a,p]=[6,23]`;
- add `[p,a]=[23,6]`.

They are the same residue operation because

`[-a,-p] mod29 = [p,a]`.

Both recover exactly:

`[8,12] - [6,23] mod29 = [2,18] = THE`.

Forward reconstruction is exact:

`[2,18] + [6,23] mod29 = [8,12]`.

So the source-vocabulary family contains **one residue-equivalent inverse**, yielding THE.

A broader general-English register produces additional short lexical fragments, so this is not an unconditional language proof. The important gain is that the ciphertext receiver is now independently source-selected before this finite key family is evaluated.

## Relationship to the current ROAD candidate

The adjacent four-rune word is source-selected by the same [20,76] receiver route. Its prior ROAD candidate and LEAD checksum remain separate questions. Director #1727 already showed that the previously advertised coordinate-specific DH expression generator for the ROAD key is underconstrained.

Do not use this report to reinstate that rejected key generator.

The new result strengthens:

- p28 READ OUT / HERE;
- the p50 reflection as an external consumer;
- p0 words22–23 as the intended nearby receiver;
- THE as a constrained local plaintext candidate.

It does **not** yet provide a source-selected four-rune key for the adjacent word.

## Reproduction

Run:

`node sims/lp2_p28_readout_here_reflection_p0_receiver_sft.cjs`

The SFT reconstructs the p28 DH labels needed for the geometry, verifies all reflection identities, parses all 2,896 canonical words including cross-page carries, proves the [20,76] adjacency unique, and exhausts the 84 ordered-DH-pair/sign inverses on the selected two-rune word.
