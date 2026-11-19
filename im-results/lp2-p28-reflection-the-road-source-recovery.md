# P28 positional reflection selects and decrypts p0 THE ROAD

**Agent16, 19 November 2026. Classification: strong source-constrained local plaintext recovery candidate. This route uses no p50 token numeral as an LP2 rune offset. It combines the source-only p28 DH / READ OUT / HERE checkpoint with the already source-selected horizontal p50 reflection, then applies source-visible p28 scalar keys to the uniquely selected p0 receiver.**

## Causal route

The independently reconstructed p28 literal-DH state is

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

The source-only p28 continuation currently supplies:

- `READ`, canonical GP `[4,28,23]`, GP0 **55**;
- `OUT`, GP0 **20**;
- `HERE`, canonical GP `[8,18,4,18]`, GP0 **48**;
- whole `READOUT`, GP0 **75**.

P50 is visibly a 32×8 grid. Its independently selected horizontal reflection acts within each eight-cell row:

`c -> 7-c`.

The recovered DH public value `A=8` equals the table width.

Without decoding a single p50 token value, reflection gives three exact source-state identities:

- `READ 55 -> HERE 48`;
- `HERE 48 -> READ 55`;
- `OUT 20 -> B=19`.

In coordinates, HERE and READ are the two endpoints of row `a=6`:

- HERE = address48 = `(row6,col0)`;
- READ = address55 = `(row6,col7)`.

OUT is address20 = `(row2,col4)=(K,a-K)`; its reflected address is 19 = `B`.

Applying the same frozen reflection to the complete instruction gives

`READOUT 75 -> 76`.

Therefore the source-derived ordered receiver signature is

`[GP0(OUT), reflect(GP0(READOUT))] = [20,76]`.

## Unique original-cipher receiver

The canonical LP2 stream contains **2,896 complete printed words** and **2,895 adjacent word pairs**, preserving all 32 words carried across physical page boundaries.

Exactly one adjacency has GP0 sums `[20,76]`:

- p0 word22, offsets103..104, ciphertext `[8,12]`, GP0 20;
- p0 word23, offsets105..108, ciphertext `[16,8,25,27]`, GP0 76.

This receiver is selected before either word is decrypted.

Its GP-length shape is `[2,4]`. In the authenticated 2016 signed message, the sole adjacent `[2,4]` GP-length pair is **THE ROAD**.

## Direct source key for THE

The p28 literal-DH source line itself supplies, in natural source order:

- one-based line number = `6=a`;
- line rune count = `23=p`.

This fixes key

`[a,p]=[6,23]`.

Subtracting modulo29 from the selected first ciphertext word gives

`[8,12]-[6,23]=[2,18]=THE`.

Forward reconstruction is exact:

`[2,18]+[6,23]=[8,12]`.

The earlier p-length H-packet extraction also emits this same `[a,p]` key under geometry-selected `(A,K)=(8,2)`, but that packet is no longer required for the local inverse.

## Direct source key for ROAD

The already recovered HERE carrier is p28 line1. Its nested visible descriptors are:

1. p28 rune-bearing line count = **12**;
2. HERE-line fragment count = **5**;
3. HERE one-based line number = **1**;
4. HERE output length = **4**.

This fixes

`[12,5,1,4]`.

Subtracting from the selected four-rune ciphertext word gives

`[16,8,25,27]-[12,5,1,4]=[4,3,24,23]=ROAD`.

Forward reconstruction is exact.

An independent broad source-scalar audit charges **23 natural p28 / HERE / DH / page scalars**, every ordered four-scalar tuple without replacement, both signs, and all eight authenticated four-rune source targets: **425,040 configurations**. It has four descriptor-name hits, all aliases of the same numeric key `[12,5,1,4]`; every hit is subtraction and every plaintext is ROAD. No alternate authenticated four-rune target survives.

## What changed

Earlier THE ROAD arguments depended on one or more of:

- p50 numeral values interpreted as LP2 rune offsets;
- a post-inspection H packet selector;
- the A1Z26 `LEAD` / atomic-number82 semantic echo.

This route does not need those steps.

The positional p50 reflection selects the receiver. The p28 literal-DH and HERE source geometry supply the two exact local keys. `LEAD=82` remains a separate semantic echo and is unnecessary for recovering these six plaintext runes.

## Evidence boundary

The route is source-constrained and fully reversible at the selected words, and its receiver is unique in the canonical original ciphertext. Repository chronology still matters: THE ROAD was already under investigation before the reflection receiver and HERE-descriptor key were recognized. These finite-family audits sharply reduce model freedom, while they do not constitute a prospective blind decryption of an untouched receiver.

The most valuable next test is therefore an untouched continuation chosen by the recovered mechanism before its ciphertext values are interpreted.

## Reproduction

Run on Windows Node22:

`node sims\lp2_p28_reflection_the_road_source_sft.cjs`

The SFT reconstructs the p28 DH and HERE source objects, verifies the reflection identities, exhausts all 2,895 canonical adjacent-word receivers, recovers THE and ROAD with exact forward reconstruction, and reruns the 425,040-configuration broad ROAD source-scalar control.
