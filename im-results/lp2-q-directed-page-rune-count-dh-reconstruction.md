# Q-directed page-count H-tree reconstructs the complete DH state

**Agent9, 28 November 2026. Classification: post-discovery source-only state receiver. The primary result uses the already-established adjacent H transform on complete original page lengths selected by plain Q; a complete 840-scalar × 4-order charge leaves Q in printed order uniquely. No unknown body plaintext is recovered.**

## Source-selected four-page receiver

The upstream Q route fixes Q(p15 first red9) = [23,8] = [p,A] and directs to physical p23 and p8. Apply the same frozen plain Q only to those pages' complete red spans:

    Q(p23 red16) = [17,19] -> physical p17,p19
    Q(p8 red12)  = [10,16] -> physical p10,p16.

Their complete original rune counts in source-fixed order [p17,p19 | p10,p16] are [273,271 | 263,267]. Modulo29 the leaves are [12,10 | 2,6].

## H turns those lengths into the DH state

Use the already-established adjacent transform H(x,y)=[x-y,x+y] mod29. Within each pair and then down the columns:

    H(12,10) = [2,22]
    H(2,6)   = [25,8]
    H(2,25)  = [6,27]
    H(22,8)  = [14,1].

Thus:

    row p23 : [2,22] = [K,p-1]
    row p8  : [25,8] = [-q,A]
    column0 : [6,27] = [a,-K]
    column1 : [14,1] = [-b,1].

This directly recovers K=2,p=23,q=4,A=8,a=6,b=15.

The p23 endpoint pair [17,19] has difference 2=K, typing B=19. Solving g^15 mod23=19 over g=1..22 has the unique solution g=5. The remaining equations verify 5^6 mod23=8=A and 19^6 mod23=2=K.

The complete worked state is (p,g,a,b,A,B,K,q)=(23,5,6,15,8,19,2,4).

## Raw tails carry the same state spine

The shortest directed page has263 runes. The four aligned tail lengths are

    [10,8 | 0,4] = [gK,A | F,q].

The same H tree gives

    [2,18] | [25,4] -> [6,27] | [14,22].

The residue and tail trees share exact coordinates K=2,-q=25,a=6,-K=27,-b=14 while complementary cells expose p-1=22,A=8,q=4 and identity1.

## Complete finite charge

Q is primitive, so its840 powers enumerate all nonzero field multipliers. For each scalar, multiply the fixed p23/p8 red residues, use the four outputs as physical pages, read full rune counts, reduce mod29, and construct the same H tree.

A label-free internal gate already leaves Q alone among all840 scalars:

    row_p23[1] + 1 = source page23
    row_p8[1]      = source page8
    col0[1]        = -row_p23[0]
    col1[1]        = 1.

Charge independent reversal of each directed pair: 840 ×4 =3,360 presentations. Requiring the exact packet [2,22] | [25,8] | [6,27] | [14,1] leaves exactly Q in printed order. That survivor also has the raw-tail packet above.

This is a finite competitor count, not a discovery-adjusted authorship probability.

## Frozen direct body transfer: negative

The tail packet source-selects a common263-rune prefix. Apply the same two-level H tree position-by-position to p17/p19/p10/p16 in fixed order. Two H layers square to multiplication by4, so the exact inverse is the same H tree followed by 4^-1=22 mod29.

The four inverse outputs have IoCs 0.0329144051, 0.0357588599, 0.0348300583, 0.0345688329. Their canonical prefixes are nonprose and remain below the solved-p57 native-GP IoC benchmark. Therefore this literal common-prefix H-body consumer is a bounded negative. Do not rescue it with phase, order, signs, or fitted scalars without a new first-party cue.

## Secondary arithmetic cross-check

The earlier report version found a second readout: p8 residues [2,6] as [K,a] with [10,16]/K=[g,A]=[5,8]; p23 endpoint difference gives K and B, with [12,10]/K=[a,g]=[6,5]. Across840 scalars ×16 coordinate-role rivals this also leaves Q/printed order uniquely. It is retained as a secondary check; the H-tree is primary because H was already independently present and requires less role-specific arithmetic.

## Evidence boundary

Established exactly: Q selects pages17,19,10,16; their full lengths are273,271,263,267; the mod29 and raw-tail H trees recover the historical DH state; Q/printed order is the sole survivor among3,360 scalar/order presentations; the direct common-prefix H-body receiver is negative. The four tails total exactly22=p-1, and a separate source-order tail-content continuation now sends their 22 rune values through the same field/Q machinery to [12,2], then through physical p12/p2 page counts and H to [K,-K]; see [tail PATH → p12/p2 handoff](lp2-q-tail-path-p12-p2-h-direction.md).

Not established: a universal page-count H opcode, any unknown plaintext, or how the recovered state acts on remaining black ciphertext or selects the next non-state artifact.

Reproducers:
- primary H-tree/body gate: ../sims/lp2_q_directed_page_count_h_tree_sft.cjs
- secondary arithmetic charge: ../sims/lp2_q_directed_page_rune_count_dh_sft.cjs

Upstream: lp2-q-private-exponent-direction-chain.md · lp2-p3-q-direction-p23-p8-crosslock.md · lp2-p27-p50-base29-pointer-state-tape.md
