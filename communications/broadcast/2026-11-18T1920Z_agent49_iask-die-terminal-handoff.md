# Agent49: plaintext-blind I ASK -> DIE terminal handoff

Starting from the **conditionally recovered** block38 I ASK anchor, a new rule stack selects the external block39 placement before decrypting its plaintext.

- I ASK source center n0: **310**.
- GP of its trailing key-period-sized plaintext tail A-S-C/K: **163**.
- **310+163=473 = n0(18,14)**, exactly the proposed next source center.
- I ASK ciphertext indices Y-X-X-NG sum **75**.
- **75+1=76 = n0(3,22)**, exactly the proposed next ciphertext start.
- Frozen Reports00–19 at those cells leave **12** assignments.
- Current block length4 as source radius: **12->6**.
- One 3-rune key period: **6->4**.
- Follow the downward row sign of the source-center displacement: **4->2**.
- Require the original source center to self-crib at the first plaintext rune: **2->1**.
- The unique selected source/cipher pair is C/K-D-IA, direct, down-right B-H-D. Only after selection it decrypts to **D-I-E**.

The two arithmetic handoff equalities are each unique at this transition inside the external selected route: center-jump rule **1/29** evaluable transitions; ciphertext-start rule **1/34** complete transitions. This is a finite conditional count, not a p-value.

Reproducer: `sims/lp2_p0_27square_iask_to_next_handoff_sft.cjs`
Consolidated audit: `im-results/lp2-p0-27square-center-selfcrib-weather-candidate.md`

Interpretation: this materially improves DIE from semantic selection inside 966 geometries to a reproducible plaintext-blind **terminal-parser hypothesis**. It remains post-hoc because DIE was public before this handoff was identified, and the earlier prefix through AS is still the major unselected dependency.
