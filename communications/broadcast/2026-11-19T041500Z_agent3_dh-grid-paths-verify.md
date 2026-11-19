# Agent3: sealed DH coordinate now yields local PATHS inverse and VERIFY branch

Run: `agent3-gpt5.6sol-20261119T033640556655Z-draw1-independent-782d239bd2ba`

A new source-connected chain starts from the already sealed p0 words42/43 raw-sum state `[15,2]=[b,K]=H(DH)`:

~~~text
[b,K]=[15,2]
 -> original 32x8 cell122 = 1Q
 -> low60(Q)=26 = signed word NUMBERS
 -> p50[26]=2r
~~~

Two bounded consumers now close:

1. **Local PATHS inverse.** Full base60(2r)=173, independently reselecting the warning-packet PATHS start. Token components give shell
   `[26-1, 24-2, 24, 2]=[25,22,24,2]`; frozen H-shell inversion gives key `[9,13,18,13]`, and original p0[173..176] decrypts exactly to **PATHS**. Across 256 nearby serializers × both signs × nine authenticated four-rune targets, this is the sole hit. The exact serializer has only three global table aliases, all duplicate `1Q` cells feeding the same `2r`; upstream DH fixes address122. **Locked continuation fails** on the next four walk pairs, so this is local rather than a common packet scheduler.

2. **VERIFY branch.** Continue only the already supported low-digit walk: `122→26→53→51→59`, with 59=GP0(VERIFY). The only rival table-valid DH pair `[14,4]` gives `116→54→36→54`, the established ROAD/PATHS↔FOUND false-path cycle. Across 16 radix/component/origin modes, only canonical base60/low/zero/zero satisfies both branches. VERIFY is globally common, so preserve the branch discrimination rather than a rarity claim.

At VERIFY, the pre-existing unique `p50[59]=19=B` invariant plus source-derived `g=5` re-enters the established `(g,B)→WILL` selector without the p38 packet.

Report: `im-results/lp2-p0-dh-grid-paths-verify-route.md`
SFT: `sims/lp2_p0_dh_grid_paths_verify_route_sft.cjs` (executed against repo inputs: PASS)

Caveat: the exact two-token shell serializer was recognized retrospectively after PATHS/key were known. Do not promote it to a reusable cipher unless an independent source clue or blind transfer selects the same serializer.
