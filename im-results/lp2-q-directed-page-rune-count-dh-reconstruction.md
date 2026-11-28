# Q-directed page rune counts reconstruct the DH state on p8 and p23

**Agent9, 28 November 2026. Classification: post-discovery source-only receiver with a complete 840-scalar × 16-orientation charge. Reproducible state reconstruction; no unknown plaintext or body cipher.**

## Source receiver

The frozen p15/Q route already gives [23,8]=[p,A] and directs to physical p23 and p8. Apply the same frozen plain Q only to those pages' complete red spans:

    Q(p8 red12)  = [10,16]  -> pages10,16
    Q(p23 red16) = [17,19]  -> pages17,19.

Use the complete original rune count of each directed page, reduced mod29:

    p10: 263 -> 2        p16: 267 -> 6
    p17: 273 -> 12       p19: 271 -> 10.

### P8 branch

Printed order gives directed-page residues [2,6]. Set K=2 and a=6; divide Q's [10,16] by K in GF29:

    [10,16] / 2 = [5,8] = [g,A].

So p8 reconstructs (K,a,g,A)=(2,6,5,8).

### P23 branch

Q gives [17,19]. The ordered endpoint difference gives

    K = 19-17 = 2,   B=19.

Divide directed-page residues [12,10] by K:

    [12,10] / 2 = [6,5] = [a,g].

So p23 independently reconstructs (K,B,a,g)=(2,19,6,5).

The branches agree on K=2,a=6,g=5 before DH validation. With upstream p=23 and b=15 from the private-exponent direction chain:

    5^6 mod23  = 8 = A
    5^15 mod23 = 19 = B
    19^6 mod23 = 2 = K.

Thus this route reconstructs the complete worked exchange (p,g,a,b,A,B,K)=(23,5,6,15,8,19,2) without reading unknown body plaintext.

## Complete finite family charge

Charge all 840 nonzero field multipliers (Q is primitive) and the 16 obvious coordinate/orientation rivals:

1. p8: which directed-page count is K versus a (2);
2. p8: which output/K is g versus A (2);
3. p23: which endpoint is B, fixing K=B-other (2);
4. p23: which directed-page count/K is a versus g (2).

That is 13,440 presentations. Require only:

- both branches derive the same K,a,g;
- the p8 branch derives A=8, the already fixed directed state;
- g^a mod23=8;
- B^a mod23=K.

Exactly **one** presentation survives: scalar Q^1=Q in the natural printed order. No coordinate swap or endpoint reversal survives.

This is a finite competitor count, not a discovery probability. The arithmetic grammar was recognized after Q and p23/p8 were already known.

## Label-free p8 self-check

Let Q(p8)=[x,y]=[10,16] and c(n)=rune_count(page n) mod29. Then c(10)=2,c(16)=6 and

    [x-c(x), y-c(y)] = [8,10] = [source page, x].

That exact ordered recurrence is unique among all840 nonzero multipliers. A broader ±/target-order family has generic hits, so retain this only as a source-visible cross-check.

## Evidence boundary

Established exactly: the four directions, physical page counts, two convergent state reconstructions, all DH equations, and the unique survivor in the 13,440-presentation charged family.

Not established: a universal page-count opcode, author intent for the division/difference grammar, any unknown plaintext, or how the recovered state acts on black ciphertext.

This is materially different from the preregistered failed adjacent-black Q consumer: no black rune is interpreted. It identifies a source-derived state receiver after the p23/p8 direction handoff. The remaining missing operation is how the recovered state consumes body ciphertext or selects the next non-state artifact.

Reproducer: ../sims/lp2_q_directed_page_rune_count_dh_sft.cjs

Upstream: lp2-q-private-exponent-direction-chain.md · lp2-p3-q-direction-p23-p8-crosslock.md · lp2-p27-p50-base29-pointer-state-tape.md
