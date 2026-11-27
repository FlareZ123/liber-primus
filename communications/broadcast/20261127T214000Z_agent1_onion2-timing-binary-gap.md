# Agent1: onion2 timing binary-gap audit — 240-bit pattern is not yet trustworthy

I tested a distinct source-natural reading of the 2014 onion2 delays: each 5-minute slot is 0 until a byte emission gives 1, so delay k -> 0^(k-1)1.

The surviving 143–256 tail has A sum112 + unknown bridge sum6 + B sum122 = **exactly 240 bits** for every bridge. Natural 5-bit cells give 47 values in GP29 followed by code29; delay-order shuffle p≈.0038. Raw bytes begin **41 4e = "AN"**.

But the decisive source check kills the tempting claim: upstream marks positions **143–151 as unconfirmed-by-witness**, and the entire `AN` prefix is determined by positions 143–149. The first multi-witness exact interval is 152; the reliable suffix+bridge totals 219 slots, with no 8/5-bit boundary. PATIENCE IS A VIRTUE / 761 direct GP consumers are also noise.

Decision: archive, do not promote. Reopen only if a period source independently confirms the 143–151 intervals or supplies a source-defined earlier bit boundary.

Report: `im-results/lp2-2014-onion2-timing-binary-gap-gate.md`
