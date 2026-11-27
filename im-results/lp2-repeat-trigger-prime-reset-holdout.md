# Repeat-triggered prime-clock inverse (exploratory; negative)
 
**Decision.** Retire this exact all-encrypted prime-minus-one schedule in which a ciphertext doublet resets the next prime cursor to its initial origin. The stronger affine extension below has an exact singleton-word obstruction across the whole book and six of nine independently keyed chapters, conditional on the native singleton register; the remaining three chapters fail the predictive decoder. It is a reversible clock that could be recognized by a player without an external mask; the source does not actually select this reset. No original plaintext or key was recovered.
 
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

## Exact all-affine singleton gate and constructive survivor attack

Extend the same clock (no additional reset triggers) to C_i=P_i+a(p_j-1)+b mod29, with a,b in 0..28 and origin j0 in 0..3300. Each ciphertext doublet resets the next cursor to j0; all other symbols advance. The public age A_i since that reset gives j=j0+A_i regardless of a,b or plaintext. Allowing a=0 includes constant shifts. No transparent F or altered word spacing. In a standard English native GP register, every complete singleton word is one of A/I/O (GP indices 24/10/3); this deliberately includes O. This is a conditional necessary lexical gate, not a claim that all possible messages use that register.

The transcript parser follows the canonical rune stream across page and physical line boundaries; only the real printed delimiters terminate groups. It verifies exact 12,956-rune equality with the canonical corpus before taking all 83 complete singleton positions. For each origin and multiplier a, every allowed first plaintext singleton q fixes the sole possible b=C_s-a(p_{j0+A_s}-1)-q mod29. Intersect the remaining singleton constraints. This exactly covers all 2,776,141 (3301×29×29) affine origin/key configurations for each interval, without n-gram pruning. With the first singleton applied, 287,187 remain before subsequent constraints.

| Original chapter | Runes | Singleton words | Exact surviving keys | First decisive singleton |
|---|---:|---:|---:|---:|
| p0–2 | 729 | 5 | 39 | — |
| p3–7 | 1,145 | 8 | 0 | 7 |
| p8–14 | 1,729 | 11 | 0 | 8 |
| p15–22 | 1,903 | 18 | 0 | 8 |
| p23–26 | 1,021 | 5 | 22 | — |
| p27–32 | 1,433 | 12 | 0 | 9 |
| p33–39 | 1,680 | 9 | 0 | 7 |
| p40–53 | 3,008 | 13 | 0 | 8 |
| p54–55 | 308 | 2 | 28,593 | — |
| p0–55 continuous | 12,956 | 83 | **0** | 7 |

The independently initialized chapter analyses give private origin/multiplier/offset to every chapter. A single law across the book, even with per-chapter private keys, cannot produce native singleton words in six chapters. No claim against private page keys, different reset semantics, alternate word register or general prime clocks.

For the three surviving chapters, separately choose the best key using only first 60% of ciphertext and the singleton constraints in that prefix, then freeze and decrypt the remaining 40%. Full-chapter best scores are also reported to avoid conflating a failed prefix selection with proof that no key could work:

| Chapter | Prefix surviving keys | Prefix-selected (origin,a,b) | Prefix / holdout logp | Withheld legal singletons | Full feasible max logp |
|---|---:|---|---|---|---:|
| p0–2 | 3,012 | (753,10,15) | −3.41949 / −3.44927 | 0/2 | −3.45124 |
| p23–26 | 278 | (2644,2,8) | −3.44035 / −3.50831 | 0/1 | −3.44357 |
| p54–55 | 28,593 | (1311,4,28) | −3.36690 / −3.50490 | 0 withheld | −3.39739 |

The same 1,731-rune training model as above is used. The exact solver recovers unique true keys (1033,17,11) and (2029,3,23) on two independent encryptions of the *same* 740-rune reference LP1 KOAN donor with 13 singletons (740/740 for both; language logp −2.88679). The controls are hidden-key recovery tests, not independent plaintext samples. Prefix-selected original outputs fail readable continuation and the full feasible maxima likewise produce nonprose. The singleton exclusions are exact; the scoring conclusions for the remaining chapters are heuristic. Source convention and reset origin are unselected exploratory hypotheses.

Reproducer: `node sims/lp2_repeat_trigger_affine_prime_singleton_sft.cjs`. Connected JavaScript runtime executed the complete exact gate and survivor decoding, then verified the source file at commit 0b6c728e99aacc3ddcf1d5324055a0cf6d30b62c; no Windows/CI run claimed. Source transcript blob 43bfeb6bf8dabaf25b0446cc519f8d91d205d8a7.
