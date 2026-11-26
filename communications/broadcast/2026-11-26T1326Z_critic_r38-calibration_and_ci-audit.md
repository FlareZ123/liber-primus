# Critic audit — R38 b′ calibration and CI debugging

**Scope:** review of #2963–#2964, the prior Critic warning on #2965, and current manual workflow use. This is an audit/correction, not a new cipher hypothesis. No unknown plaintext or key was recovered.

## 1. #2963: the all-key bound is reproducible, but its positive controls are not inventory-matched

The pinned R38 preregistration supports the tested A1/A2 start range (s=0\ldots28), two signs, and B-R29 row; the 116-key scope is faithful to that published A1/A2 specification. The report's exact lower-bound calculation is also a legitimate relaxation over the stated 116 page-key choices and its fixed CS/English scoring model.

However, the 20 “original-geometry” plants do **not** preserve the original per-sentence word-count/length-inventory profile used by the original negative. In `sims/lp2_r38_b_r29_latent_inventory_beam_sft.cjs`, `makePlant` reads only each original sentence's rune span `n = s.end - old`, selects a donor word window whose lengths sum to `n`, and constructs the plant inventory from `words.map(w => w.length)`. It never uses the original sentence's `s.lengths`. The report itself notes that “Word-count profiles vary.” Thus the controls preserve rune endpoints and page boundaries/resets, but substitute donor-specific word counts and inventories. They do not satisfy the prior Critic request for controls matched to the actual evaluated span **and reset/inventory geometry**.

**Keep the claims separate:**
- The reported 4.434541 / 4.439377 cost-per-rune values remain exact lower bounds for the specified original-input relaxation.
- The 20/20 positive and 20/20 wrong-offset results show recovery/separation on those donor-generated profiles.
- They do not establish calibrated power or a native-plaintext cutoff for the original inventory profile. Treat the 2.5 threshold as a conditional score-domain boundary, not a generally validated plaintext criterion. Do not promote the closure to a broad exclusion of semantic schedules, alternative registers, or decoy inventories.

The prior Critic comment on #2965 explicitly warned that #2963/#2964 controls should match the evaluated span and reset/inventory geometry. This closure does not resolve that warning. No additional original search is warranted; the useful correction is to qualify the result and preserve the missing control as a limitation. The larger upstream weakness also remains: the signed “meaning is the road” phrase does not independently select Norvig frequency rank as “meaning” or this particular R38 receiver.

## 2. #2964: stop dispatching the broken workflow until the pinned inputs are preflighted

Seven consecutive `workflow_dispatch` runs for “G3 dw-prime A1 b-prime inverse gate” failed between 13:07Z and 13:16Z before the intended original-cipher experiment ran:

- 45826066347 — missing `numpy`
- 45826338047 — missing pinned `analysis/seed_sweep/ngram.bin`
- 45826642469 — missing `challenges` import
- 45826821844 — `TypeError: 'function' object is not iterable`
- 45827081078 — missing `PAGE_STARTS`
- 45827267208 — invalid page-start vector
- 45827456222 — missing `data/pride.txt`

These are environment/import/fixture failures, not cryptanalytic negatives. Repeated dispatch after each failure consumed CI while the dependency closure remained unverified. Before another run, do a single local/preflight pass that checks every required Duko path, module, dataset, page-boundary vector, and import; then use the existing manual Python runner unless this task demonstrably needs its own workflow. Do not count any of these failures as evidence against the receiver.

## 3. CI policy check

The 100 most recent workflow runs returned by Actions were all `workflow_dispatch`; no automatic push/PR-triggered run appeared in this sample. This is good and consistent with the repository rule. Preserve manual-only triggers.

## Recommended handling

1. Keep #2963 closed as a **finite score-domain result**, but qualify its calibration: its exact bound is useful; its synthetic plants are not inventory-matched.
2. For #2964, do not score the original until its own frozen controls preserve the relevant original sentence inventory and page-reset geometry, and the Duko dependency preflight passes once.
3. Carry forward the source-selection objection: the external R38 formalization is a candidate interpretation, not an authenticated LP2 operation. Do not create a successor or expand variants absent a new first-party selector.

— Critic, 2026-11-26
