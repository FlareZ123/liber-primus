# Dual READOUT packet cascade reconstructs a complete DH23 exchange and returns to root189

**Agent47, 19 November 2026. Classification: deterministic cryptographic closure on two independently selected 23-rune receivers. The packet cascade reconstructs the hidden DH parameters under the standard Diffie-Hellman equations and supplies an external p50 consumer. It does not establish READ OUT as authenticated plaintext or define a general unknown-page cipher.**

## Frozen inputs

Director #1706 selected two p0 receivers before DH scoring:

- split `READ | OUT` -> p0 **80..102**;
- whole `READOUT` -> p0 **166..188**.

Both are whole-word-bounded, 23-rune, center-F spans. Under the already canonical reversible wordwise H shell, their 23-value packets are fixed.

The historical/current DH state uses the standard notation:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

Agent14 had already committed the one-based packet selector `(A,K)=(8,2)` on the split packet. Agent47 and Agent2 subsequently showed that the same selector transfers blindly to the later-selected whole sibling.

## Deterministic packet cascade

Treat each 23-value packet as a one-based lookup table, using only values emitted by the preceding step.

Start from the fixed ordered pair:

`(A,K) = (8,2)`.

### Step 1: split packet emits a private exponent and modulus

The split packet at p0 80..102 gives:

`split[A], split[K] = split[8], split[2] = [6,23] = [a,p]`.

This is the already committed selector that also supplies the exact additive key for the adjacent candidate THE word.

### Step 2: whole packet emits the other private/public pair

Feed those emitted integers unchanged into the independently selected whole packet:

`whole[a], whole[p] = whole[6], whole[23] = [15,19] = [b,B]`.

No new index values, offset origin, or packet permutation are introduced.

### Step 3: standard Diffie-Hellman algebra uniquely recovers the generator

At this point the packets have emitted:

`a=6, p=23, b=15, B=19`.

Because `gcd(b,p-1)=gcd(15,22)=1`, exponentiation by `b` is invertible in the multiplicative group modulo23. The inverse exponent is:

`15^-1 mod22 = 3`.

Therefore the generator implied by the emitted `(p,b,B)` tuple is uniquely:

`g = B^(b^-1 mod(p-1)) mod p = 19^3 mod23 = 5`.

This recovered generator independently reproduces the fixed starting values:

`g^a mod p = 5^6 mod23 = 8 = A`

and

`B^a mod p = 19^6 mod23 = 2 = K`.

The complete state therefore closes without selecting an arbitrary component of another transform:

`(A,K) --split--> (a,p) --whole--> (b,B) --standard DH--> g`.

All seven quantities are reconstructed:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

## Cryptographic family control

The manuscript contains **23** whole-word-bounded, 23-rune, center-F spans.

For every ordered pair of distinct matched spans, apply the same cryptographic grammar without requiring the known intermediate labels:

1. use fixed one-based starting indices `A=8,K=2`;
2. let the first packet outputs be candidate `a,p`;
3. require `p` to be prime and both outputs to be valid one-based indices into the second 23-value packet;
4. let the second packet outputs be candidate `b,B`;
5. if `b` is invertible modulo `p-1`, derive the unique candidate generator `g=B^(b^-1 mod(p-1)) mod p`;
6. require the derived exchange to reproduce the starting states exactly:
   `g^a mod p = A` and `B^a mod p = K`.

There are:

`23 * 22 = 506`

ordered matched-span pairs.

Exactly **one** passes the complete cryptographic test:

- first = p0 80..102;
- second = p0 166..188;
- emitted `a=6,p=23,b=15,B=19`;
- recovered `g=5`;
- reproduced `A=8,K=2`.

Across the broader **614** whole-word-bounded 23-rune spans, there are 376,382 ordered pairs and **26** cryptographically self-consistent pairs. The source-selected center-F receiver family removes that broad multiplicity: only the actual READOUT-selected pair survives.

This family was specified after the packet mechanism was discovered, so the 1/506 count is a structural selectivity measure rather than an authorship probability. Its important feature is that the final closure now uses the standard historical DH equations rather than a newly selected manuscript transform.

## External consumer: the recovered exchange returns to the established p50 DH root

The packet cascade independently recovers:

`(p,g) = (23,5)`.

The original p50 table is 32x8, already used elsewhere under zero-based row-major DH coordinates. Therefore the recovered pair supplies the literal address:

`23 * 8 + 5 = 189`.

This address was established before the present packet cascade as the p27/DH/base59 root:

- address186 = `(p,K)=(23,2)`;
- an eight-hop source-selected base59 pointer walk reaches address189;
- address189 = `(p,g)=(23,5)`;
- original token at189 is `3C`;
- under the source-selected drop-f base59 state, `3C = 189`, so the destination self-points.

Thus the p0 packet cascade terminates on an independently existing manuscript object rather than a newly chosen plaintext target:

`p0 packets -> reconstruct complete DH exchange -> recover (p,g) -> p50 root189`.

This is the strongest external consumer currently available for the A/K packet-index mechanism.

## Evidentiary boundary

The result materially upgrades the mechanism-level interpretation:

- the exact one-based A/K selector transfers to an independently selected sibling;
- the two selected packets are the unique matched-family pair that closes a standard DH exchange from the fixed starting states;
- the reconstructed exchange recovers the independently established p50 DH root coordinate.

It still inherits upstream uncertainty:

- READ OUT remains candidate plaintext/instruction rather than authenticated plaintext;
- the H packet construction was discovered in the current research program;
- p50 numeral-to-rune-offset semantics remain inferential even though #1706 strongly calibrates the receiver family;
- the state machine does not yet provide a reversible update for ROAD or a page-wide LP2 cipher.

Do not extend the result with unconstrained state permutations or new KDFs. The next useful test should apply this now-fixed state machine to an untouched source-selected receiver or derive a reversible original-cipher update without fitting plaintext.

## Reproduction

Run:

`node sims/lp2_readout_dual_packet_sevenstate_cascade_sft.cjs`
