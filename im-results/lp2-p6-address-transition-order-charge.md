# P6 address-grid transition-order charge: 24x broader syntax preserves the same corridor

**Agent10, 28 November 2026. Classification: target-rune-blind adversarial grammar expansion of the p6 receiver-address result.**

## Question

The p6 4/5/4 address grammar uses:

~~~text
L = [r1,u,-r1,r0]
C = [r1,u,F,u,-r1]
T = [-r3,r2,-r0,u]
R = L + T.
~~~

The existing 3,072-member family charges H-role assignment, role signs, singleton sign, horizontal direction and vertical direction. It did **not** charge the coordinate order inside the four-term transition vector `T`.

Because the formula was recognized after the receiver tape existed, that uncharged order is a real post-discovery degree of freedom.

## Expanded family

Keep the p6-visible left and center symmetries fixed:

~~~text
L = [r1,u,-r1,r0]
C = [r1,u,F,u,-r1].
~~~

Keep the same four typed transition atoms as a multiset:

~~~text
{-r3, r2, -r0, u}.
~~~

Now charge all **24 permutations** of those atoms before forming `R=L+T`.

Together with the existing family:

~~~text
24 H-role permutations
x 16 independent role signs
x 2 singleton signs
x 2 horizontal stencil directions
x 2 vertical directions
x 24 transition coordinate orders
= 73,728 labeled grids.
~~~

Deduplication leaves **36,864 distinct numeric 13-lane delta tapes**.

For every numeric tape, repeat the full target-rune-blind structural search over:

~~~text
31 authenticated contiguous 13-word source windows
x 44 physical 13-page intervals.
~~~

The same fixed lane operation classes and source GP arities are used. No ciphertext rune value, source GP0 checksum, fitted key, or language score participates.

## Result

~~~text
73,728 labeled grids
36,864 distinct numeric tapes

full 13-lane numeric survivors: 4
full labeled survivors:         8

every survivor:
sourceStart = 30
pageStart   = 30.
~~~

The four numeric survivors are exactly the previous four:

~~~text
[26,1,3,2,26,1,0,1,3,20, 6,1,3]
[26,1,3,2,26,1,0,1,3,20,25,1,3]
[26,1,3,2,26,1,0,1,3, 3, 6,1,3]
[26,1,3,2,26,1,0,1,3, 3,25,1,3].
~~~

No alternative transition ordering creates a new source window or page interval.

The two labels per numeric survivor are representation aliases inside the broadened signed/permuted family; they do not create additional tapes.

## Decision

This materially narrows the post-discovery syntax objection. The successful p30-p42 placement is not dependent on having guessed the four right-column transition coordinates in the one favorable order: **all 24 orders were allowed**, and the complete address family still lands only on source30/page30.

This remains a finite charge around a recognized grammar, not a discovery-wide probability. The left/center templates and the choice of transition atom multiset are still model assumptions. The result should therefore strengthen the conditional address architecture without being promoted to authenticated plaintext.

## Reproduction

~~~text
node sims/lp2_p6_address_transition_order_charge_sft.cjs
~~~
