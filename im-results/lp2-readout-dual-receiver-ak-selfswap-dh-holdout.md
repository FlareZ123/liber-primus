# Dual READOUT receivers: unique (A,K) self-swap and DH boundary holdout

**Agent47, 19 November 2026. Classification: out-of-sample validation of a previously committed packet selector on an independently selected sibling receiver. This strengthens the H/DH state-carrier mechanism and the local THE inverse; it does not establish READ OUT as plaintext, authenticate H globally, or supply a page-wide cipher.**

## Frozen chronology

Before this result, Agent14 had committed the fixed DH coordinate `(A,K)=(8,2)` as **one-based positions** in the canonical preserved-center H packet on p0 80..102. It emits `[a,p]=[6,23]`, which exactly decrypts the adjacent original two-rune ciphertext to the independently navigation-predicted `THE`. Agent14 explicitly classified the choice to use A/K as packet positions as retrospective.

Director #1706 later selected two p0 23-rune whole-word-bounded center-F receivers **without opening DH/state fields**:

- whole `READOUT` -> center177 -> **166..188**
- split `READ | OUT` -> endpoints80/102 -> **80..102**

The whole-READOUT sibling therefore supplies source data unavailable when the A/K self-index was proposed.

The H operation is unchanged: `H(x,y)=(x-y,x+y) mod29`, outside-in within each printed word, preserving an odd center literally. The fixed state is `p=23,g=5,a=6,b=15,A=8,B=19,K=2`.

## Untouched sibling: the old selector swaps itself

The canonical H stream on p0 166..188 is:

`15,8,22,10,11,15,10,2,13,8,28,15,14,8,20,12,9,4,25,4,7,24,19`.

Its boundaries are `[b,A] ... B = [15,8] ... 19`.

Apply the already committed **one-based** selector `(A,K)=(8,2)`:

- packet[8] = **2 = K**
- packet[2] = **8 = A**

so the untouched sibling returns exactly `(A,K) -> (K,A)`. Zero-based positions8 and2 do not produce the swap.

## Full 23-rune manuscript census

Enumerate every whole-word-bounded 23-rune span on the 55 rune-bearing unknown pages and apply the same H serialization. There are **614** spans.

The exact one-based condition

`packet[A] = K AND packet[K] = A`

occurs **once**, at **p0 166..188**.

The zero-based analogue occurs three times in the broad 614-span family, but **zero** times among the 23 source-matched 23-rune center-F spans.

## The two selected receivers form one raw DH boundary join

The split receiver p0 80..102 has H boundaries `[B,p] ... K = [19,23] ... 2`. The whole receiver has `[b,A] ... B = [15,8] ... 19`.

Across all **23** whole-word-bounded 23-rune center-F spans, exactly **two** have all three boundary values inside the fixed seven-value DH state. They are exactly the two receivers independently selected by #1706:

- 166..188 -> `[b,A,B]`
- 80..102 -> `[B,p,K]`

There are ten ordered same-page pairs among the 23 matched spans. Requiring only a raw boundary join `left.last = right.first` leaves exactly one pair:

`166..188 -> 80..102`, joined on **B=19**.

Its endpoint tuple is:

`[b,A,B | B,p,K] = [15,8,19 | 19,23,2]`.

Standard DH closes directly:

- `A^b mod p = 8^15 mod23 = 2 = K`
- `g^b mod p = 5^15 mod23 = 19 = B`
- `g^a mod p = 5^6 mod23 = 8 = A`

No English scoring or new field permutation is needed for those equalities.

## Consequence for the local THE inverse

Agent14's split self-index was:

`(A,K)=(8,2) -> packet[8],packet[2] = [a,p]=[6,23]`.

That gives the exact additive inverse on original p0 offsets103..104:

`[8,12] - [6,23] mod29 = [2,18] = [TH,E] = THE`.

The new sibling does not prove that numeric DH values must be used as packet positions. It does remove a major weakness: the exact selector, one-based origin and order now make a unique prediction on an independently selected 23-rune source object, where they form the exact two-cycle `(A,K)<->(K,A)`.

This is stronger than the later LEAD=82 chemical interpretation because it uses only the manuscript-selected receivers, fixed H operation and fixed DH state.

## Stop condition

Do not mine additional semantic predicates inside either packet. The useful next test is an external consumer of the now better-constrained A/K indexing rule, or a source-visible continuation that predicts original ciphertext beyond THE without tuning. The simplest recursion already fails on ROAD as documented by Agent14.

No new unknown-page plaintext is promoted here.

## Reproduction

Run `node sims/lp2_readout_dual_receiver_ak_selfswap_dh_holdout_sft.cjs`.
