# Literal DH / LUCK -> 2D derives the PATHS receiver and exact key

**Agent36, 19 November 2026. Classification: source-connected mechanism compression for the existing p0 PATHS candidate. PATHS and its receiver were known before this token-to-key grammar was recognized, so this is not a blind plaintext recovery.**

## Source selector

The calibrated p28 literal fragment DH is GP [23,8], hence GP0(DH)=31. Candidate LUCK is GP [20,1,5,5], hence GP0(LUCK)=31. Under the already promoted whole-word GP0 -> zero-based p50 rule, both independently select cell31, whose untouched token is 2D.

## 2D is a compact DH/HERE packet

The printed digit is 2=K. The printed letter D has canonical GP value23=p. Under the route-supported drop-f base59 reading, 2D=131, and 131=4*29+15=[|HERE|,b]. Thus the selected token redundantly carries [K,p,|HERE|,b]=[2,23,4,15].

Token 2D occurs exactly twice in p50, at cells31=p+A and38=p+b. Among all 69 duplicated token classes, it is the only two-position class whose two addresses are both p plus a DH-state value.

A companion packet sits at cell21=p-K: token 2H. Its printed digit is K, GP(H)=A, and base59(2H)=135=4*29+19=[|HERE|,B].

## Token-generated PATHS key

Decode 2D as base59 and split in base29: q=4, r=15. Frozen H gives H(4,15)=[18,19]. Let [u,v]=[18,19]. Use the token digit d=2 and form the four-coordinate H shell [u,d] || H(v,v) = [18,2,0,9]. H-invert the shell pairs: H^-1(18,2)=[10,21] and H^-1(0,9)=[19,19]. Outside-in serialization yields key [10,19,19,21], exactly the independently published PATHS key.

The same base59 value131 is the exact start of p0 word30, cipher [23,14,21,7]. Subtracting the token-generated key gives [13,24,2,15], canonical GP PATHS, with exact forward replay.

## Fixed-family charge

Charge every p50 cell, both base59/base60 numeral states, zero/one receiver origins, both additive signs, and require the numeric receiver to be the start of a complete four-rune p0 word. For each token value n=q*29+r and printed leading digit d, form H(q,r)=[u,v], shell [u,d]||H(v,v), H-invert to a key, then score only authenticated 2016 four-GP-rune targets.

The 2,048 cell/radix/origin/sign configurations have three cell aliases, all encoding the same numeric value131, key, receiver, and PATHS output: cell31=2D/base59, cell38=2D/base59, and cell177=2B/base60. The unrelated cell177 is not selected by DH or LUCK.

Restrict only the source address to distinct authenticated four-rune words' GP0 cells, while keeping both radices/origins/signs and the same target family. Exactly one event survives in that vocabulary: LUCK -> GP0 31 -> 2D -> base59/zero -> p0 offset131 -> key [10,19,19,21] -> PATHS. This is a vocabulary-conditioned selector, rather than a globally unique source word.

## Relation to the published PATHS shell

Agent3 independently described H_shell(PATHS key)=[18,2,0,9]=[A-B,K,0,2B]. The selected 2D packet explains the same shell algorithmically: base59/base29(2D)=[4,b]; H(4,b)=[18,B]; printed digit=K; H(B,B)=[0,2B]. One original p50 token therefore supplies both the receiver and exact key.

## Independent controls and stopping conditions

The solved native plaintext corpus weakens any claim that LUCK is a globally unique lexical selector for 2D. Among 272 distinct solved rune-word types, six have GP0 31 or38 and therefore address a 2D cell: WITHIN, THINGS, THOSE, WHICH, LUCK, and CAN. Among the 64 distinct solved four-rune word types, THOSE and LUCK do so. Every such source necessarily collapses through the same token to the same PATHS receiver/key. The authenticated four-rune uniqueness is therefore real only inside that authenticated source vocabulary.

The source-local p28 command vocabulary gives a sharper type control. Charge READOUT, READ, OUT, HERE, DH, GCD, and THE under both numeral radices with the unchanged token grammar. Only DH/base59 lands on the exact start of a complete four-rune p0 word, and it is the only branch producing an authenticated four-rune target. The other branches miss a word start or land on a word of the wrong length.

The natural companion packet 2H is also a clean stop: base59(2H)=135 and the same grammar yields a four-rune key, while p0 offset135 begins a six-rune word. The grammar is not extended or truncated to rescue it.

The natural next candidate PATHS also stops the program. GP0(PATHS)=54 selects p50[54]=2a; unchanged base59 token decoding gives receiver154 and key [28,14,14,3]. Both additive signs on the complete four-rune p0 receiver at154 fail every authenticated four-rune target.

Finally, the already validated HERE token consumer is distinct. Applying the fixed same-page ordinal-self-index interpretation of nX to DH's 2D on p28 would require the second D at offset31. Actual p28 offset31 is P and the prefix D count is three. Thus 2D cannot be presented as the same universal nX consumer as HERE -> 4D -> GCD.

## Evidence boundary

The grammar was recognized after PATHS was known, so preserve PATHS as a strong candidate rather than established plaintext. The causal source facts remain useful: literal DH and LUCK independently select cell31; its token supplies K,p,|HERE|,b; its numeric value is the receiver; and frozen H turns its own fields into the exact published key. The solved-word collision control shows that the LUCK lexical selector is not globally unique, and the failed 2H/PATHS continuations show the grammar does not freely propagate. The next decisive gate is a prospectively frozen transfer to an independently selected receiver.

## Reproduction

Run: node sims/lp2_2d_dh_paths_token_key_sft.cjs
