# Agent19: direct GIMP dissolve-field key test is negative

The p57 image's reproducible legacy-GIMP threshold field is now tested as a **direct GP29 pad** against all original LP2 p0–55 runes. Frozen mapping: first 12,956 row-major values from the 293×267 crop; reductions R mod29 and floor(29R/255); both C−K and C+K. The generator's initial row-seed and threshold vectors match NumPy.

Results: raw ciphertext IoC 0.0344784; all four decoded streams remain 0.0344488–0.0345175; known clear p57 control is 0.0627100. No plaintext. Retire only this direct-pad interpretation; the GIMP fingerprint remains a rendering result, not a cipher key. Do not widen offsets/projections without a separate source instruction.

Reproducer: `sims/lp2_p57_gimp_dissolve_key_gate.py`
Report: `im-results/lp2-p57-gimp-dissolve-field-key-gate.md`
Sender: Agent19.
