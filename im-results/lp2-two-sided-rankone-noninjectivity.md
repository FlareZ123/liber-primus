# Two-sided rank-one GP29 sender: constructive noninjectivity (#3184)

**Decision:** reject the unrestricted shared permutation-factor sender as a lossless finite-frame cipher. This is a structural result, not original plaintext recovery. No original ciphertext scoring is required or justified for this subfamily.

## Exact sender and collision

For a length-n plaintext P with fixed known endpoint symbols L,R, define C_i=A(P_i)+u(P_{i-1})v(P_{i+1}) modulo 29, with P_0=L, P_{n+1}=R. A may be any fixed map (including a permutation), and u,v are arbitrary permutations of GF29. This is the preferred separable product branch of #3184, not all two-sided nonlinear senders.

Choose any b!=b' and c!=c'. Since u,v are permutations, both difference denominators are nonzero. Define

    a = u^{-1}(-(A(b)-A(b'))/(v(c)-v(c')))
    d = v^{-1}(-(A(c)-A(c'))/(u(b)-u(b')))
    g = u^{-1}(0), h = v^{-1}(0)

All operations are in GF29. The distinct six-rune blocks (g,a,b,c,d,h) and (g,a,b',c',d,h) produce identical ciphertext when embedded anywhere in the same fixed exterior plaintext of any frame n>=6. Only outputs at a,b,c,d can change. At a, the difference is u(g)(v(b)-v(b'))=0; at d it is (u(c)-u(c'))v(h)=0. At b,c the difference is zero by the definitions of a,d. Other outputs have identical arguments. This is independent of L,R and of the rest of the plaintext. With neutral fixed endpoints, n=4 suffices. No choice of the full key can remove these collisions over the unrestricted tape.

In fact, for each choice of ordered distinct b,b' and c,c', this constructs a collision pair. For a fixed key and block location there are 812^2=659344 ordered pair constructions (329672 unordered pairs): the ordered pair of plaintext blocks uniquely encodes the chosen ordered quadruple. The argument also extends to fixed known position-dependent A_i,u_i,v_i with each u_i,v_i a permutation, by using the local maps at each of the four affected output coordinates. A public phase clock alone therefore does not rescue this class.

Example, all maps identity, fixed L=7,R=11:
    P  = (0,1,0,1,1,0)
    P' = (0,1,1,0,1,0)
    C  = (7,1,1,1,1,11)

The difference is confined to two neighboring runes, so merely observing printed punctuation or fixed frame lengths cannot distinguish these two tapes if both use the same layout. This does not assert that both tapes are grammatical English or preserve a plaintext-F bypass.

## Executed controls

Run python3 sims/lp2_rankone_neighbor_collision.py. Local Python with seed3184 verified 5000/5000 constructed collisions: 1000 independent random triples of permutation maps and random distinct b,b',c,c', each embedded at a randomly chosen location in frames of lengths 6,13,76,121,729 with random fixed exterior and endpoints. Also 100/100 distinct one-sided causal additive inverse controls recover the complete original input with the given initial state. These are implementation checks; the proof does not depend on sampling.

## Distinction from existing work and scope

The [rank-one triangular pair wrapper reduction](lp2-rank-one-pair-wrapper-reduction.md) is bijective by construction and reduces to fixed pair-frequency invariants under stationary wrappers. The present overlapping two-sided product is instead noninjective before statistics. [Chapter pair-sum fibers](lp2-chapter-pair-sum-fiber-gate.md) study disjoint pairs, not overlapping neighbor coupling. [Phase-private two-tap feedback](lp2-phase-private-two-tap-feedback.md) is causal ciphertext-history feedback, not simultaneous plaintext neighbors. The [separable tridiagonal filter](lp2-p32-separable-tridiagonal-inverse.md) is a linear matrix family; nonsingular linear filters can have unique inverses. None of these should be conflated with the local collision proof.

Not excluded: non-surjective factor maps, non-product B, restricted plaintext codebooks with an independently specified unique-decoding rule, genuine extra side information, one-sided causal maps, or other independently specified nonlinear architectures. No original clue selects this product, no authentic key or unknown plaintext has been found. Do not run language searches on this particular unrestricted class to manufacture uniqueness. A new branch would require an independently motivated different reversible law, not a tuned collision exception.
