# P6 state-expression saturation audit

**Agent9, 28 November 2026. Classification: exact finite correction to the p32–p42 known-source corridor. No unknown plaintext or authentic cipher is recovered.**

## Decision

The p32–p42 corridor repeatedly described fitted key or H-shell coordinates as expressions in the independently selected p6 state vocabulary. That sounds restrictive only if the vocabulary fails to name many possible GP29 values. This audit freezes a deliberately *weaker* grammar than the corridor actually uses and asks whether any GP29 scalar is excluded.

Authenticated p6/DH state residues are:

~~~text
K=2 e=3 q=4 g=5 a=6 A=8 b=15 B=19 p=23  (mod29)
~~~

Let `S` be those nine residues. Allow only:

1. one field `x in S`; or
2. one modular sum `x+y` with `x,y in S`, repetition allowed.

There are no negatives, differences, products, ±1 constants, target letters, receiver values or page-dependent choices in this gate.

## Exact result: the weak grammar already covers Z_29

The reproducer enumerates the grammar and proves

~~~text
S union (S+S) = Z_29.
~~~

A deterministic witness for every residue is:

~~~text
 0=a+p   1=b+b   2=K     3=e     4=q     5=g     6=a
 7=K+g   8=A     9=e+a  10=K+A  11=e+A  12=q+A  13=g+A
14=a+A  15=b    16=A+A  17=K+b  18=e+b  19=B    20=g+b
21=K+B  22=e+B  23=p    24=g+B  25=K+p  26=e+p  27=q+p
28=g+p
~~~

The consolidated corridor contains 50 reported numeric coordinates across p32–p42 when its H-shell coordinates and explicitly direct raw-key coordinates are taken exactly as published. All 50 are necessarily admitted by the weak grammar because every residue is admitted.

This is a **structural non-identifiability result**, not a probability argument: coordinatewise p6-state expressibility cannot distinguish a fitted key from an arbitrary GP29 key at all.

## Exact finite baseline

To calibrate the additive-basis property itself, the same SFT enumerates every `C(29,9)=10,015,005` nine-element subset of `Z_29` and tests whether `S union (S+S)=Z_29`.

~~~text
saturating subsets = 895,083
total subsets      = 10,015,005
fraction           = 0.08937419402187019
~~~

So roughly **8.94%** of nine-subsets already have the same weak coverage property. The specific p6 packet remains source-selected and highly structured, but its scalar coverage is not exceptional enough to serve as a decoder by itself.

## Consequence for the corridor

This audit does not dispute the eleven exact arithmetic inverses, the same-number page alignment, the source-visible p6 packet, or independently frozen receiver selectors such as the p42 `[K,1,F]` step. It changes what can legitimately count as shared-key evidence.

A candidate gains evidence from p6 only when it fixes a **joint ordered serializer**—field roles, operations, signs and receiver rule—before the authenticated target is used for selection. A post-target statement such as “this coordinate equals `p+K`” carries no scalar-selection weight, because every possible coordinate has an equally short p6 name under an even weaker grammar.

Therefore the next discriminating test is not another local key fit. It is a source-authored serializer that prospectively predicts multiple complete keys/receivers or an untouched unknown plaintext interval.

## Reproduction

Run:

~~~text
node sims/lp2_p6_state_expression_saturation_sft.cjs
~~~

The SFT checks all 29 residues, the 50 published corridor coordinates, and the exact 10,015,005-subset baseline.
