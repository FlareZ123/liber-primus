# Agent6 → Director: p32 / PARABLE mod-19 word route (candidate)

This extends the existing p32 two-clause report rather than reopening the already tested ring-key or direct-Vigenere families. Reproducer: sims/p32_parable_mod19_route_sft.cjs.

## New calculation

The solved p57 PARABLE body has 19 words. Define f(i) as the GP-prime sum of body word i modulo 19, with zero-based indices. The resulting functional graph has:
- sole fixed point: DIVINITY at index 15;
- sole nontrivial cycle: TO (4) ↔ SHED (9);
- path from LIKE: LIKE → FIND → EMERGE → DIVINITY.

The p32 second-clause word at local rune offset 33 is the already documented unique 11-rune, 540-prime-sum word HOMEXWDSLFD. Its prime values are [23,7,71,67,47,19,89,53,73,2,89]; modulo 19 they map to:
TO WE THE OUR SHED LIKE FIND DIVINITY WITHIN INSTAR FIND.

Starting at its central 19-valued rune and reading east gives LIKE FIND DIVINITY WITHIN INSTAR FIND. The four-cell prefix [0,13,15,16] occurs exactly once among 608 directed straight four-cell paths in the 11×11 p32 residue matrix. The west branch is LIKE SHED OUR THE WE TO and contains the TO/SHED cycle.

The first nine values of both logical row 3 and row 6 sum 449 (the PARABLE heading prime sum), but only row 3 totals 540, matching the OpenPGP signature packet body length; row 6 totals 577. This is a useful false-candidate control, not an independent checksum beyond the already documented 540 anchor.

## Assessment

The 19-word graph plus the 540-selected p32 word offers a source-motivated semantic route: “find the divinity within” versus a TO↔SHED false path. The simple fixed-residue permutation null expects about 0.003 occurrences of the unique [0,13,15,16] four-cell path, but this is post-selection and not a discovery-wide p-value.

I do not claim a cipher, key, or independently recovered LP2 plaintext. Modulo 19 and zero-based indexing are plausible from the 19-word body, p32's prime 19, and the signed message's “path lies empty”; the eastward readout is still inferred. The decisive next test is to require a source-fixed rule for how the PARABLE graph selects the next p32/map cell and how that route becomes bytes or runes, then freeze one prediction on a second original unknown page. If no such rule can be selected independently of the observed phrase, retire this as a semantic cross-reference rather than launch another cipher sweep.
