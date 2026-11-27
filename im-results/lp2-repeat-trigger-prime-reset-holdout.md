# Repeat-triggered prime-clock inverse (exploratory; negative)
 
**Decision.** Retire this exact all-encrypted prime-minus-one schedule in which a ciphertext doublet resets the next prime cursor to its initial origin. It is a reversible clock that could be recognized by a player without an external mask; the source does not actually select this reset. No original plaintext or key was recovered.
 
## Mechanism
Let p_j be the j-th prime with p_0=2. At each position emit C_i=(P_i+p_j-1) mod 29, then set j=start if C_i=C_(i-1), otherwise advance j by one. The first preceding ciphertext is undefined. The inverse subtracts the same shift and updates from already observed C. Every rune is encrypted, including F; no deletion or literal-F escape. This is distinct from the authentic p56 plaintext-F hold, conventional uninterrupted prime-origin tests, and zero-step escape/rank codecs. Origin is not authenticated, so the explicit 0..3300 search is exploratory.
 
Frozen target p0–2 (729 runes, continuous across physical page joins), select origin using p0 alone (262 runes) and then score p1–2 (467 runes). All candidate origins use identical additive smoothing 0.25 trigram log likelihood from the reference LP1 pages 1,3,5,9,10,11,12,13,15 (1731 GP runes after normalization). Native control donor is reference pages 6,14,57 (1154 runes); the two 729-rune control windows overlap by 304 runes, so they are not independent linguistic samples. They use different hidden origins and different ciphertext. Source transcriptions are normalized using V→U, K/Q→C, Z→S, ING→NG, IO→IA; this is an approximate Latin-to-GP conversion rather than exact original ink registration. Controls test constructive recovery for this model, not historical authenticity.
 
| Input | Prefix-selected origin | Prefix log likelihood | Holdout log likelihood | Exact recovery | Cipher repeats |
|---|---:|---:|---:|---:|---:|
| Plant origin 1033 | 1033 | -2.88660 | -2.89432 | 729/729 | 21 |
| Plant origin 2029 | 2029 | -3.06335 | -2.85559 | 729/729 | 20 |
| Original, repeat reset | 2161 | -3.39440 | -3.47204 | no readable text | 4 |
| Original, uninterrupted clock baseline | 3210 | -3.39000 | -3.49082 | no readable text | 4 |
 
The selected reset decode starts `NAENGBTDFAEGEAECEOLIAIAPSLMDBFEATHRTHUJREORPTLALLIEOMWBYLGOFXUNGXAERFBEOSCPEAHBNEJEAEXNAEHNAECHBHELTXIARNPPHBBTHYHNONGROEUIAIATAEDNYTHAEDDNSTHNIAOENGNGOEIRWXAPWPL`. The continuation is likewise nonlinguistic. Exact forward reproduction is checked for every selected origin, but follows from construction and is not authenticity evidence. Plant repeat counts also substantially exceed the original four events, although two plants cannot establish an all-key distributional exclusion. No reset on the source's rare doublets is established. No attempt to extend the model by tuning extra triggers or affine coefficients is warranted absent source evidence.
 
Run `node sims/lp2_repeat_trigger_prime_reset_holdout_sft.cjs` from the repository. It prints the complete original candidate and controls. Executed in JavaScript runtime against actual repository inputs; no CI run claimed. Script commit 4ea187e6d61be6b4fa5855692dc97a09219bcb59. Canonical corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165. This is a bounded heuristic plaintext-recovery negative, not an exact all-language or all-prime-family theorem.
