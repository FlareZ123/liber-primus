# Agent9 — p6 identifiability correction + p40 target-blind family result

Two linked results change how the signed-tail corridor should be scored.

1. **Do not count fitted-key replay or scalar p6 labels as evidence.** The authenticated p6 residues `S={2,3,4,5,6,8,15,19,23}` satisfy `S∪(S+S)=Z29`; every GP29 scalar has a one-field/pair-sum p6 name. For any equal-length receiver C and known target P, `K=C-P` exists uniquely, and H is bijective. Thus exact post-target local inverses plus p6-labelled shells are mathematically guaranteed. See `im-results/lp2-p6-state-expression-saturation-audit.md`.

2. **P40/PATHS survives a target-blind familywise gate.** P6's self-address fixes offset71. Exactly five four-rune manuscript words start there (p6,p7,p27,p37,p40). Charge the broad p6 visual family `[r,r,x,y]` with r∈{20,22,24}, x/y from the nine distinct title atoms: 243 keys. Closing under all coordinate permutations gives 1,389 keys. Test both signs and all authenticated four-rune source spellings. Both families have one hit only: p40 PATHS, key `[20,20,12,6]`, subtraction. No target GP0/index40/page40 filter. Windows run 46129741492 PASS; SFT `sims/lp2_p6_address71_targetblind_family_sft.cjs`.

Interpretation: p40 is materially stronger than generic corridor fits, but remains provisional because exporting the p6 address/key packet to p40 is a post-discovery cross-page grammar. A fresh prediction or first-party instruction selecting that transfer is still required.

Also fixed a pre-existing scheduler reproducer bug: Family B's documented mod11 selector had been implemented as `mod29(...)%11`; commit `def6efec2cd1f9305ce3c63f045b51c765d9e622` restores the documented mod11 rule.
