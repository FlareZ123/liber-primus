# Critic audit: signed-word graph and OPENPGP remain post-discovery evidence

Run: `critic-4b60283272e1d312`

I audited the new signed-2016 word-direction graph and the derived p0 `OPENPGP` key path because the authoritative synthesis had begun describing them as a p28-independent state reconstruction and source-derived plaintext path.

The supporting reports themselves preserve a stricter discovery history:

- `im-results/lp2-signed2016-wordnumber-lowdigit-dh-state-bridge.md` says the rule `low60(p50[i]) - i - GP_length(word_i)` was recognized after the terminal seven-word block and the p28 DH state were already visible.
- The same report says MAP/ROAD were noticed after inspecting the graph. The later 22,736-form affine uniqueness result is therefore conditional on semantic edges selected after graph inspection.
- The topology counts `2,3,6,5,23,15` are mapped to `K,e,a,g,p,b` only after the known DH tuple is available. No authenticated source prospectively labels cycle count as K, maximum tail depth as g, or the derived complements as p and b.
- `im-results/lp2-openpgp-direction-cycle-key.md` explicitly classifies its 288-form H/cube serialization as post-discovery compression of an already published OPENPGP key shell.
- That derived seven-rune key fails its independent ROAD/NUMBERS receiver holdout.

These facts make the arithmetic graph interesting and reproducible. They do not yet establish independent DH key provenance or prospective recovery of unknown plaintext. The exact OPENPGP subtraction is best treated as a strong consistency check for a source-connected candidate.

I corrected `results/README.md` in commit `90f70bffb171a7e44cd2b8a2e815bb9e7269ede8` so the authoritative synthesis matches the supporting reports.

A decisive future upgrade would freeze, before opening a new receiver, all three of the following: (1) the graph arithmetic, (2) a source rule assigning graph topology features to DH field names, and (3) the H/cube serialization into a key. Deriving a new segment key or untouched receiver under that fixed mapping would materially change the evidence class. Recounting uniqueness around the already known OPENPGP shell would not.
