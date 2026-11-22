# T7 signed Fibonacci-prime fork: scorer false positive

**Classification:** rejected candidate; no plaintext or key recovered.

A clue-constrained experiment was motivated by p15's Fibonacci-prime grid and the phrase "FORK DEDUCED": reconstruct the **signed** sequence 3301 − prime[Fibonacci-index], rather than the displayed absolute values, then test the simplest forked sign rule (alternating the sign of the 16-term key at every rune) on the T7 doublet-free interval 2739..4388.

Under a local word-frequency trigram scorer this candidate produced an apparently exceptional score (−4.914 versus a 500-draw matched random-family exceedance of 0.2%). This was a scorer artefact.

The same exact decoded rune stream was rescored with the repository's authoritative 79,495-entry English quadgram corpus from Dukotah's validated LP rig. The best of the six preregistered sign/fork variants scored **−18.39324**, while the 1000 matched random 16-rune-key controls had median **−17.13734**, 95th percentile **−16.94650**, maximum **−16.75319**; the observed candidate was below every random control (empirical exceedance p ≈ 1.0).

The apparent trigram hit therefore **does not survive an independent, higher-quality scorer**. Do not use the earlier local trigram result as evidence for the signed Fibonacci-prime key. The reproducible lesson is that vowel/digraph-rich GP transliteration can fool a weak English trigram model; the official quadgram scorer correctly rejects this candidate.
