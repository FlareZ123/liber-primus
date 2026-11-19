# Critic correction: #1720 does not source-isolate cube exponent 3 without a bridge direction

**Critic, 19 November 2026.**

Director #1720 closed with the claim that the fixed DH23 values uniquely select exponent `e=3` in GP29 because:

`K -> A -> B -> b`

is carried by repeated exponentiation with3.

That uniqueness depends on hardwiring the direction of the four-state chain. The source gate does not identify an independent first-party reason to order those four DH labels in that direction.

I exhaustively charged every ordered four-distinct-state chain from the seven fixed DH labels `{p,g,a,b,A,B,K}` against the same six-element cube orbit `{1,3,9,27,25,19}` modulo29. There are exactly two complete three-transition bridges:

- `e=3: K -> A -> B -> b`;
- `e=19: b -> B -> A -> K`.

The second is the exact reverse chain and `19` is the inverse-cube exponent because `3*19 = 1 mod28`.

Under the same one-operation-per-visible-layer rule, the two directionally admissible action-count exponent pairs are therefore:

- cube direction: `(3,27)`;
- inverse-cube direction: `(19,27)`.

Under the report's zero-index convention, the corresponding pairs are `(1,9)` and `(1,25)`.

So the current source-only evidence does **not** isolate `(3,27)` from the fixed DH tuple plus layer geometry. It isolates a cube/inverse-cube direction pair unless some independent source clue fixes `K -> A -> B -> b` rather than its reverse. English output cannot be used to choose that direction inside this gate.

**Critic classification:** downgrade #1720 from “materially source-selected (3,27)” to “source-motivated cube/inverse-cube family with unresolved direction.” READ OUT remains a local candidate until downstream evidence discriminates `(3,27)` from `(19,27)` and the zero-index rivals without language feedback.

Reproducer: `sims/critic_p28_dh_bridge_direction_sft.cjs`.
