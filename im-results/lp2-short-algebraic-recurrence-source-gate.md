# Source gate for a new short algebraic key recurrence — Director #3249

## Decision

**Stop before coefficient/tap search.** No currently unconsumed original LP2 observable fixes a distinct short algebraic recurrence family, its ring/clock, coefficient constraints and initialization type. The source gate required by #3249 therefore fails; no joint language/state decoder was run on original ciphertext and no new recurrence order, tap set, reset or coefficient was tuned.

This is a dependency result, not a claim that every short recurrence is cryptographically impossible.

## Preflight of already typed recurrence-bearing clues

The only original features with a credible human-visible route to an evolving algebraic state are already consumed by bounded tests:

- **p15 Fibonacci prime spiral.** This visibly supplies a Fibonacci construction and two center values. The exact plaintext-feedback law `K[i+2]=K[i]+K[i+1]+P[i]` and the structurally distinct ciphertext-feedback law were both calibrated on native controls and fail the original p16–55 language gate. The plaintext-feedback equation additionally collapses algebraically to one global tail shift, so changing IVs cannot rescue it (#2374).
- **p56 successive primes.** The authentic solved operation is a prime-minus-one clock with plaintext-F holds. Shared origins, typed reset classes and the broader page-reset family have been bounded; the surviving chapter-reset family lacks a source-fixed reset and origin (#2525, #3116). Adding recurrence coefficients around that clock would introduce exactly the unauthenticated parameters #3249 forbids.
- **Short plaintext autokey.** The standard q8 native plaintext-fed queue, chosen from the real LP1 key length and authentic F semantics, is calibrated but its fixed intact-group p0–2 inverse dies; spacing-free feasibility remains nonlinguistic (#2549). No new visible object specifies a different primer length/update.
- **Two-lag prime/ciphertext feedback.** The source-clocked family `C_i=P_i+a C_(i-1)+b C_(i-2)+(prime_j-1)` is exactly impossible on the original p40–53 tape for all 812 nonzero-second-lag coefficient pairs under the allowed F paths. This already covers the most natural small shared two-coefficient extension of the prime clock.
- **p50 literal token pairs.** The printed two-character syntax does not form an exceptional transition graph: no Euler structure, no row walk and no reciprocal reflection grammar (#3247). It therefore supplies no radix-free state-transition law.
- **Section artwork/rubrics.** Solved-section visual signatures do not predict cipher method above the identity baseline (#2640), and the red-rubric/13-dot presentation does not act as a uniform reset opcode in solved p56/p57 (#3116).

The p33 magic squares and p28 DH material supply exact mathematical objects, but their source-selected historical operations are static square constraints and modular exponentiation, not a manuscript-visible recurrence with an initialization rule. Existing receiver gates already require a new typed bridge before transfer.

## Exact blocker

A new recurrence attack becomes licensed only if an original or authenticated pre-May-2014 source fixes **all** of the following before ciphertext scoring:

1. the state update family (not merely “Fibonacci”, “prime”, “square”, or “DH”);
2. the algebraic domain/ring;
3. the coefficient/tap restrictions;
4. the state clock and F behavior;
5. the initialization/primer source and reset semantics.

No reviewed live LP2 observable supplies that tuple outside the frozen families above. In particular, choosing an order/tap because it is short, common, or decodes well would be an unconstrained model search with no human solve path.

## Consequence

Do not commission a generic Berlekamp–Massey/LFSR, polynomial-recurrence, or small-coefficient sweep on unknown LP2 under this premise. Reopen only when a new source object contributes a recurrence-defining operand or worked update that is not already represented by the p15, p56, q8-autokey or two-lag gates.

No original plaintext, key, or new recurrence is claimed.
