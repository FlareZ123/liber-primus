# Original LP2 source-seeded PostScript RNG inverse with collision-rejected key draws

**Agent 30, 10 November 2026. Classification: exact reversible, source-constrained hypothesis test and negative original result.** No unknown plaintext, historical key, cipher identification or onward destination recovered.

## Specific original-source hypothesis

Historical Cicada image-production tooling included Ghostscript, whose PostScript `rand` implementation follows the Park–Miller recurrence `state[n+1] = 16807*state[n] mod 2147483647`. The literal PostScript initial state `srand 1` generates states `16807, 282475249, 1622650073, 984943658, 1144108930`. This is an *independent technical source* for a deterministic running key, rather than a result inferred by fitting arbitrary binary output to ciphertext. PDF rendering under Ghostscript does **not** imply the author used that RNG as a cipher.

Test the native GP29 additive reversible model `C_i = (P_i + sign*K_j) mod 29` with `K_j=rand_j mod 29` or `K_j=floor(29*rand_j/2147483647)`. Permit exactly one otherwise consumed output `K_j` to be discarded before a given rune if and only if it would have produced an **observed collision with the previous ciphertext rune** for that same plaintext rune. The original program tests five independently attested candidate seeds `1,331,662,1033,3301` and two signs, 20 concrete configurations total. The seeds are hypotheses motivated by PostScript default and existing printed manuscript symbols, with no assertion that those symbols historically selected a generator seed.

## Source-original experiment and actual outcome

Eight original black-body section windows of **300 source cipher runes each**, from the canonical 12,956-rune LP2 corpus, were supplied unchanged by the existing section parser. For each candidate, exact Viterbi maximization over a hidden running-key skip count (up to 25) fits a GP-English trigram source model. The first **150 runes per section** select the single global generator, seed, reducer and sign. Each heldout 150-rune continuation is conditioned on the frozen training endpoint; the cipher settings are not refitted.

Under the original ciphertext the **train-selected model** is `seed=331, mod29, sign=+1` with mean training log likelihood **−5.7114348705 nats/rune** and frozen heldout **−5.9662824226 nats/rune**. The best retrospectively heldout-scoring model `seed=331, scale, sign=+1` reaches **−5.8147888229** on validation, but is a different key and has worse training likelihood. All eight decoded original 80-rune prefixes are nonlinguistic. The original trained model achieves no independent GP-English recovery.

**Power and genuine inverse control:** encrypt 2,400 held-out GP-English runes under the same actual fixed `seed=1, mod29, sign=+1` and generate 85 genuine collision-consumed extra key draws across the eight source windows. With no supplied skip schedule, the inverse reconstructs **2,400/2,400 exactly**, selects the authentic key first out of all 20 candidates by training score, and yields heldout **−2.5295184072 nats/rune**, compared with the original train-selected **−5.9662824226**. It reconstitutes the cipher-generating skip path exactly in the positive plant. This establishes high power against this narrowly specified source-key mechanism. The original result is a clear finite negative, and does not identify LP2 plaintext or establish a general no-PRNG theorem.

## Reproduction and decision

- Original ciphertext and language source: `resources/liber-primus/lp2-corpus.json`, `resources/control/shakespeare_first300k.txt`; exact seeded source windows from `sims/grid_stream_collision_viterbi.cjs`.
- One self-contained [CommonJS inverse](../sims/postscript_rand_collision_inverse.cjs), importing only existing repository helpers, asserts the actual first five Park–Miller states, exact planted plaintext recovery, and true-key rank-one training selection.
- Executed success: [GitHub Actions run 42858859753](https://github.com/FlareZ123/liber-primus/actions/runs/42858859753); runner [workflow](../.github/workflows/postscript-rand-collision-inverse.yml) is *manual dispatch only*.
- Next investment should require a **new author-supplied key stream or source-derived state transition**, since expanding arbitrary seeds on this same generator would be another unprincipled key search. No new public `results/README.md` claim follows from this bounded negative.
