# P28 DH23 state supplies a unique reversible cube bridge into GP29

**Agent 1 + Agent50, reconciled by Agent11 on 19 November 2026. Classification: source-constrained structural bridge with post-discovery source-frozen corroboration. Exponent3 remains a compact arithmetic candidate; the p27 red19+13 match does not by chronology serve as a prospective selector. No unknown LP2 plaintext is claimed.**

## New relation

The leading p28 route already fixes a complete manuscript-native DH instance from one physical line:

`p=23, g=5, a=6, B=19`

with the uniquely derived values

`b=15, A=8, K=2`.

Treat the Liber Primus rune indices as the prime field **GF(29)**. The DH values then satisfy a previously unrecorded cross-field chain. The exponent

`e = g - K = 5 - 2 = 3`

is independently repeated by

`a / K = 6 / 2 = 3`.

Under cubing modulo29:

`K=2 -> A=8 -> B=19 -> b=15`

because

`2^3=8, 8^3=19, 19^3=15 (mod29)`.

Continuing the same operation gives the complete orbit

`2 -> 8 -> 19 -> 15 -> 11 -> 26 -> 2`.

Its period is **6**, exactly the selected DH private exponent `a=6`. Every value in this six-cycle is a primitive root modulo29, so each individually generates the complete 28-element nonzero GP29 group.

Cubing is itself a reversible operation on the full 29-symbol rune register: `gcd(3,28)=1`, its inverse exponent is **19** because `3*19 = 1 mod28`, and zero remains fixed. Therefore the p28 DH object now supplies a concrete value-changing GP29 permutation without importing an external cipher primitive.

## Post-discovery p27 red13 corroboration of exponent3

The exponent no longer depends only on the two internal identities `g-K=3` and `a/K=3`. The independently selected p27 red receiver consists of a red heading of length **19=B** immediately followed by a red **13**-dot mark. A reversible GP29 circumference transform was fixed independently on the p28 object:

```
H(x,y) = (x-y, x+y) mod29.
```

The clear phrase **OUR OWN** fixes H's sign/order convention on p28. Applying that frozen operation to the p27 pair gives

```
H(19,13) = [6,3] = [a,e].
```

Thus the first coordinate recovers the already known DH exponent `a=6`, while the second coordinate equals the cube exponent **e=3**. Across all **16** original red spans immediately followed by a red 13-dot mark, p27 is the only one with `H(length,13)=[6,3]`.

The chronology bounds that evidence. The cube bridge was committed at 23:46:47 UTC and the `READ OUT` cube-layer candidate at 23:52:08 UTC on 18 November. The first repository commit applying H to p27 red19+13 as an exponent check followed at 23:53:38 UTC, and the explicit “source-select” promotion followed at 23:56:29 UTC. The p27 object and H operation were already present, so the equality is a source-frozen cross-object corroboration. The target `[a,e]=[6,3]` and this particular application were evaluated after the cube candidate and plaintext appeared. It therefore cannot serve as a prospective validation of the operation or direction.

A later Agent2 arithmetic observation derives the same value as `b^-1 mod (p-1)=15^-1 mod22=3`, with `B^3 mod23=g`. That gives another source-number rationale for 3, while transferring this DH-group inverse exponent into the GP29 power map remains an interpretive bridge discovered after READ OUT. The unresolved question remains which independently selected ciphertext state receives one application, repeated applications, or a derived cube-orbit value, and which direction/layer convention is intended.

## Fixed-group exhaustiveness

To check whether the chain is merely a generic consequence of using the toy DH group, freeze `p=23,g=5` and enumerate all **22×22=484** secret pairs `a,b in 1..22`. For each pair derive ordinary DH values `A,B,K`, then define `e=(g-K) mod29` and test the same three GP29 equations:

`K^e=A, A^e=B, B^e=b (mod29)`.

Exactly **one** DH secret pair satisfies all three equations:

`(a,b,A,B,K,e) = (6,15,8,19,2,3)`.

That is the manuscript-selected tuple. This is a finite conditional census inside the already selected DH23 group. It is not a global postselection probability over every arithmetic relation that could have been invented after seeing the tuple.

## Immediate receiver tests

The bridge selects an operation. The p27 DIVINITY core is now a source-selected candidate receiver, but its direct one-step cube/inverse test is negative; no other plaintext-producing receiver or clock is established.

Several minimal consumers were checked to avoid mistaking the arithmetic closure for a decryption:

- Cubing the five-rune p28 selector word `EA A I U L` gives `EA L X U AE`; inverse cubing gives `EA W NG U A`. Neither is a readable instruction.
- Using the six primitive roots as a repeating six-phase discrete-log alphabet on p0, under page-clock rotations, forward/reverse order and F/EA repeat sentinels, reaches at most **3 of 27** differential constraints from the conditional p0 phrase islands.
- Using the six roots or their base-2 exponent orbit `[1,3,9,27,25,19]` as raw/differential six-period additive keys reaches at most **4 of 27** conditional p0 constraints.
- A whole-book finite scan of direct six-period raw GP29 shifts, six-root discrete-log decoding and exponent-orbit differential shifts, under page-reset/continuous clocks, six rotations and both signs, remains random-like. The strongest GP trigram score was about **-3.526 nats/rune** under the repository's solved-GP reference register. An 80/20 score of the reference itself gives about **-2.619** on held-out text.
- The source-selected p27 DIVINITY receiver is the unique 12-rune body word EORNSOOCAEYEE whose twice-shed eight-rune interior NSOOCAEY has GP-prime sum376, matching solved p57 DIUINITY; its whole-word totient280 matches INSTAR. Applying x³ and inverse x¹⁹ directly gives RJIAIANLOTH and CMEEOEWXJ. Neither matches any complete p57 word or produces readable plaintext. This is a bounded negative, not a new global cipher result (p27 receiver report: lp2-p27-divinity-dh-cube-receiver-gate.md; SFT: ../sims/lp2_p27_divinity_dh_cube_receiver_sft.cjs).
- The p55 76-rune page has a source-supported 43-interior/33-exterior partition under the solved p57 circumference instruction and 3301=43×76+33. Applying x³ and inverse x¹⁹ to the 43 strict interiors, then restoring original exteriors and word boundaries, yields nonlinguistic word sequences in both directions. This is a bounded negative on the most obvious p55 receiver (report: lp2-p55-dh-cube-43interior-receiver-gate.md; SFT: ../sims/lp2_p55_dh_cube_43interior_receiver_sft.cjs).

These negative consumers are deliberately small. They show that the new bridge should not be promoted into a six-period manuscript cipher by default.

## Cryptanalytic consequence

The p28/DH23 route previously reached a point where it selected Diffie-Hellman state but lacked a GP29 value-changing operation. The internal identities supply the compact candidate exponent3, while the later p27 red19+13 check independently reproduces `[a,e]=[6,3]` on a source-frozen object. This supports the candidate without prospectively authenticating its application:

`x -> x^3 mod29`, inverse `x -> x^19 mod29`.

The two most obvious source-selected receivers now tested are the p27 DIVINITY core and p55's 43-rune strict interior. Direct x³ and inverse x¹⁹ fail on both; neither yields plaintext. The cube remains a reversible arithmetic candidate without a plaintext-producing LP2 receiver. The red19+13 object corroborates the operation parameter after discovery but does not prospectively validate its use. Future work should require a new independent receiver or an untouched ciphertext prediction. Broad cube-key phase searches would recreate the same underselection the repository is trying to avoid.

## Reproduction

Run:

`node sims/lp2_p28_dh23_gp29_cube_bridge_sft.cjs`

The CommonJS SFT reconstructs the DH values, verifies both selectors of exponent3, checks the four-value chain and six-value primitive-root orbit, proves inverse cubing over all29 residues, and exhausts all484 secret pairs in the fixed DH23 group. The p27 receiver SFT independently selects NSOOCAEY and reproduces the negative direct/inverse outputs; the p55 receiver SFT reconstructs the 43/33 partition and both negative 43-interior outputs.
