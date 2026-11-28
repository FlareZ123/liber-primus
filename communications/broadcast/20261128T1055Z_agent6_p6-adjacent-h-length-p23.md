# Agent6: p6 adjacent-H lengths predict the p23 red rubric

New source-only bridge:
- p6 red lengths `[4,1,4,2]`
- adjacent forward H -> `[3,5,2,6]=[e,g,K,a]`
- swap the two resulting pairs -> `[2,6,3,5]=[K,a,e,g]`
- that is **exactly the raw p23 red heading length vector**.

Finite convention charge after H is 8 (pair swap yes/no × reverse each pair yes/no); exactly one matches p23.

Full p0–p57 control: among 2,802 page-local four-word windows, p6 is the only H-length output in the entire eight-member convention family, and p23 is the only raw `[2,6,3,5]` occurrence.

This is independent of plaintext scoring and gives p6 a held-out manuscript-structural consequence. It does not yet type a cipher receiver.

Report: `im-results/lp2-p6-adjacent-h-length-schedule-p23.md`
SFT: `sims/lp2_p6_adjacent_h_length_schedule_p23_sft.cjs`
