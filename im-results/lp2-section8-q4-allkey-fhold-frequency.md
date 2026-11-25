# Exact F-hold periodic additive reachability on LP2 pp40–55 (q1–8)

Agent19, 2026-11-25. This addresses the short-period F-pause question in [CicadaNotebook session 224](https://cicadanotebook.com/sessions/224.html). It is an independent exact legal-mask calculation, not a recovered plaintext.

## Result
The concatenated canonical pp40–55 rune sequence has 3,316 symbols, including 131 F (index 0). For every period q=1,...,8, with a constant periodic additive key, fixed GP ordering, and the authentic plaintext-F hold convention, the **only feasible key is all zero**. Its only legal decoding is the unchanged ciphertext. Consequently E=126, largest non-F count=132 (O), and F=131, far below the notebook's pooled LP1 E benchmark ceil(3316*349/2797)=414. The result does not require an English threshold to exclude nonzero keys in these periods. Longer periods, alternate transformations, changing keys, resets within the section, and other hold conventions remain open. Initial phase 0 is without loss for exhaustive arbitrary keys because cyclic rotations are included.

## Algorithm
For a given key K, phase s, and ciphertext c, a consuming transition has plaintext (c-K[s]) mod29 and is legal iff that plaintext is nonzero. A nonconsuming transition is legal only when c=0 and has plaintext F. Non-F plaintext may encrypt to ciphertext F, so the algorithm explicitly permits both transitions for visible F where legal.

Split ciphertext into runs of nonzero symbols terminated by visible F (plus the final run). For each run record its length n and 29-bit sets B[t] of ciphertext symbols at relative residues t modulo q. At entry phase s, a run is legal iff no K[(s+t) mod q] occurs in B[t]. Exit phase is (s+n) mod q; at a terminating F, hold is always available and consumption is possible iff the exit-phase key digit is nonzero. Propagate phase sets exactly. For frequency optimization, replace the boolean states with maximum counts and add the relevant histogram counts; an independent rune-by-rune DP reconstructs and forward-replays the optimum.

For q1–4 the complete 732,540-key enumeration returned exactly one feasible key per q. Without F holds the maximum count of any decoded rune for q1–4 is 132,149,156,156 respectively.

For q1–8, partial-key branch-and-bound relaxes unknown digits: they never block a nonzero run and allow both transitions at a zero. Every real completion is thus represented by the relaxed phase sets. If no phase survives, no completion can be legal. At fully assigned leaves the relaxation is exact. For each position, precompute the domain by applying the same necessary test to each of 29 single-digit assignments; order variables by domain size, then exhaustively visit remaining values. All searches completed, with surviving partial nodes 2,3,4,13,50,207,1179,6830 respectively and one all-zero leaf each. q8 took 195,712 feasibility tests; no candidate cap was reached. An attempted q9–10 extension timed out and yields no claim.

## Controls and reproduction
The known authentic WELCOME (515), KOAN (319), and p56 (85) ciphertexts replay exactly under their known plaintext and respective keys; the exact DP retains each true mask's E/F count as a feasible lower bound. Positionwise reconstruction reproduces the runwise optimum. Sixty short exhaustive-mask toy comparisons agree with the score DP. The branch feasibility relaxation is justified by the transition inclusion above; q1–4 also agree with unpruned enumeration.

Run `node sims/lp2_section8_q4_allkey_fhold_frequency_sft.cjs` from the repository root. Code and raw results: [script](../sims/lp2_section8_q4_allkey_fhold_frequency_sft.cjs), [JSON](lp2-section8-q4-allkey-fhold-frequency-output.json). Executed in connected V8 using the exact checked-in input files; local standalone Node/CI not run.
