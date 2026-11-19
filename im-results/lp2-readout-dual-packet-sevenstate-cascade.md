# Dual READOUT packet cascade reconstructs all seven DH23 states and returns to root189

**Agent47, 19 November 2026. Classification: deterministic state-machine closure on two independently selected 23-rune receivers. This materially strengthens the H/DH packet interpretation and supplies an external p50 consumer. It does not establish READ OUT as authenticated plaintext or define a general unknown-page cipher.**

## Frozen inputs

Director #1706 selected two p0 receivers before DH scoring:

- split `READ | OUT` -> p0 **80..102**;
- whole `READOUT` -> p0 **166..188**.

Both are whole-word-bounded, 23-rune, center-F spans. Under the already canonical reversible wordwise H shell, their packets are fixed. The DH23 state is independently reconstructed elsewhere as:

`p=23, g=5, a=6, b=15, A=8, B=19, K=2`.

Agent14 had already committed the one-based packet selector `(A,K)=(8,2)` on the split packet. Agent47 and Agent2 subsequently showed that the same selector transfers blindly to the later-selected whole sibling.

## Deterministic packet cascade

Treat each 23-value packet as a one-based lookup table, using only state values already emitted by the preceding step.

Start from the fixed ordered state pair:

`(A,K) = (8,2)`.

### Step 1: split packet

The split packet at p0 80..102 gives:

`split[A], split[K] = split[8], split[2] = [6,23] = [a,p]`.

This is the already committed selector that supplies the exact additive key for the adjacent candidate THE word.

### Step 2: whole packet

Feed that emitted pair unchanged into the independently selected whole packet:

`whole[a], whole[p] = whole[6], whole[23] = [15,19] = [b,B]`.

No new index values or field permutation are introduced.

### Step 3: the already fixed H map closes the missing state

Apply the same H operation to the second emitted pair:

`H(b,B) = H(15,19) = [15-19, 15+19] mod29 = [25,5]`.

Among the seven fixed DH23 values, exactly one state is still absent after the two packet lookups:

`g = 5`.

The H sum component is exactly that missing state.

The complete deterministic path is therefore:

`(A,K) --split--> (a,p) --whole--> (b,B) --H--> g`.

It reconstructs all seven DH values:

`{p,g,a,b,A,B,K} = {23,5,6,15,8,19,2}`.

## Matched-window family control

The manuscript contains **23** whole-word-bounded, 23-rune, center-F spans.

For every ordered pair of distinct matched spans, apply the exact cascade family:

1. fixed start indices `(A,K)`;
2. first packet must emit two fixed-DH values;
3. those two values become one-based indices into the second packet;
4. the second packet must emit two fixed-DH values;
5. applying H to the second pair must supply exactly the missing fixed-DH state so the union equals all seven states.

There are:

`23 * 22 = 506`

ordered matched-span pairs.

Exactly **one** passes:

- first = p0 80..102;
- second = p0 166..188;
- first output = `[a,p]=[6,23]`;
- second output = `[b,B]=[15,19]`;
- H output = `[25,g]=[25,5]`;
- missing state = `g=5`.

Across the broader **614** whole-word-bounded 23-rune spans, there are 376,382 ordered pairs and **11** generic seven-state closures. The source-selected center-F family removes that broad multiplicity: only the actual READOUT-selected pair survives.

This control was defined after the packet contents were known, so the 1/506 count is a structural selectivity measure, not an authorship probability.

## External consumer: the cascade returns to the established p50 DH root

The cascade independently emits:

- `p=23` at step1;
- `g=5` at step3.

The original p50 table is 32x8, already used elsewhere under zero-based row-major DH coordinates. Therefore the recovered pair supplies the literal coordinate:

`(p,g) = (23,5)`

and address:

`23 * 8 + 5 = 189`.

This address was established before the present packet cascade as the p27/DH/base59 root:

- address186 = `(p,K)=(23,2)`;
- an eight-hop source-selected base59 pointer walk reaches address189;
- address189 = `(p,g)=(23,5)`;
- original token at189 is `3C`;
- under the source-selected drop-f base59 state, `3C = 189`, so the destination self-points.

Thus the p0 packet cascade terminates on an independently existing manuscript object rather than a newly chosen plaintext target:

`p0 packets -> recover (p,g) -> p50 address189 -> established DH root/self-pointer`.

This is the strongest external consumer currently available for the A/K packet-index mechanism.

## Evidentiary boundary

The new result materially upgrades the mechanism-level interpretation:

- the exact one-based A/K selector transfers to an independently selected sibling;
- the two selected packets form a unique matched-family seven-state cascade;
- the cascade recovers the independently established p50 DH root coordinate.

It still inherits upstream uncertainty:

- READ OUT remains candidate plaintext/instruction rather than authenticated plaintext;
- the H packet operation was discovered in the current research program;
- p50 numeral-to-rune-offset semantics remain inferential even though #1706 strongly calibrates the receiver family;
- the cascade does not yet provide a reversible update for ROAD or a page-wide LP2 cipher.

Do not extend the cascade with unconstrained state permutations or new KDFs. The next useful test should apply this now-fixed state machine to an untouched source-selected receiver or derive a reversible original-cipher update without fitting plaintext.

## Reproduction

Run:

`node sims/lp2_readout_dual_packet_sevenstate_cascade_sft.cjs`
