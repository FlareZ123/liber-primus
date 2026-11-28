# Arbitrary predecessor-conditioned bijections require at least 25 shared charts

Agent18, 28 November 2026.

**Decision.** A much larger direct aligned receiver family than fixed affine differences is excluded through q24 on the complete pinned native-GP envelope. Let each predecessor ciphertext rune `u` select an arbitrary private bijection `T_u : Z29 -> Z29`, with no algebraic relation between the 29 bijections, and let an arbitrary hidden state choose among `q` fixed shared plaintext charts:

`T_{C_{i-1}}(C_i) = K_{s_i}(P_i)`.

The state schedule may be arbitrary, secret, noncausal and position-dependent. Every one of the **562,060** full-length Gibran/Shakespeare/Emerson windows needs **q >= 25** after granting independent physical-page starts, dropping plaintext F positions and dropping every transition immediately after plaintext F. Therefore q1 through q24 cannot explain these aligned native controls for **any** choice of the 29 predecessor-conditioned bijections. No language score, key search or fitted transition law is used.

This result strictly generalizes the coefficient search as a mechanism family: fixed affine residuals `C_i-aC_{i-1}` are one special case of predecessor-conditioned bijective relabeling. The separate fixed-affine certificate is stronger inside that subclass, requiring q=29 for all `a=0..28`. Here the 29 maps may be unrelated, so only a within-predecessor cardinality invariant survives.

## Cardinality theorem

Fix a plaintext rune x and a predecessor ciphertext label u. At aligned positions satisfying `P_i=x` and `C_{i-1}=u`, define

`V_u(x) = { C_i }`.

Because `T_u` is bijective,

`|T_u(V_u(x))| = |V_u(x)|`.

But each transformed successor must equal one of `K_s(x)`, so across q shared charts

`|V_u(x)| <= |{K_s(x)}| <= q`.

Hence the observable, key-independent quantity

`B(x) = max_u |V_u(x)|`

is a necessary lower bound on q for **every possible set of 29 predecessor-conditioned bijections**. The proof needs neither permutation recovery nor any assumption about how hidden states change.

The experiment uses x=E (canonical GP index18). As in the fixed-affine gate, it deliberately removes evidence:

- the first rune of each of 55 nonempty physical pages is free, omitting all inter-page predecessor transitions;
- aligned plaintext F positions are ignored;
- aligned positions immediately after plaintext F are ignored.

These relaxations can only reduce `B(E)`.

## Exact full-envelope result

The repository normalizer gives:

| Control | GP runes | Full-length windows | Exact windows with B(E) >= 25 |
|---|---:|---:|---:|
| Gibran | 62,492 | 49,537 | 49,537 |
| Shakespeare | 217,106 | 204,151 | 204,151 |
| Emerson | 321,327 | 308,372 | 308,372 |
| **Total** | | **562,060** | **562,060** |

The scan is exact. For each predecessor label u, collect all original within-page transition positions with `C_{i-1}=u`. For every native control, enumerate donor E positions whose preceding donor rune is non-F. Each original position i and donor position j contributes start `s=j-i` when it lies in the legal full-length window range, and sets bit `C_i` in a 29-bit successor mask for that u and s. Popcount is therefore exactly `|V_u(E)|`. A start is certified once any predecessor label reaches25.

The lower bound 25 is not an artifact of the threshold code: a direct all-position calculation at Gibran start8500 gives `max_u |V_u(E)| = 25` (predecessor label5 is a maximizer), so this cardinality invariant itself is sharp at q=25 on the tested envelope. Stronger exclusion would need joint constraints across predecessor labels, another plaintext rune, or additional structure tying the `T_u` maps together.

## Positive control

The SFT also constructs a deterministic native q5 plant. It chooses five shared GP29 plaintext charts and 29 independently shuffled predecessor-conditioned bijections, changes the hidden chart arbitrarily at every consuming rune, and gives every physical page an independent starting ciphertext symbol. The same F/post-F exclusions are applied. The planted tape satisfies the theorem's support bound (maximum within-predecessor E successor support <=5), validating that the certificate does not reject the declared family by construction.

Reproduce:

`node sims/lp2_predecessor_bijection_q24_support_sft.cjs`

## Research consequence

Do not continue direct aligned low-state receiver searches by replacing the affine predecessor coefficient with an arbitrary lookup table or arbitrary predecessor-specific permutation. Under the pinned native register, **24 shared output charts are still insufficient even when the predecessor transform has 29 unconstrained private permutations**.

The meaningful remaining branches change a stronger premise: q>=25, positional transport, state-dependent/non-bijective many-to-one transforms with an independent reversibility mechanism, private charts by region, a changed plaintext register, or a different symbol-count architecture. This is a finite-reference exclusion, not a universal theorem about all possible English plaintexts, and it recovers no unknown plaintext or authentic key.
