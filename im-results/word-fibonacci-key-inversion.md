# Fibonacci word-key inversion: exact long-word contradiction and key-free differential

**Evidence class:** Source-conditioned exclusion of two narrowly specified word-restarted modulo-29 additive Fibonacci key recurrences, with authentic LP2 original-ciphertext tests and independently planted positives. **No previously unsolved LP2 plaintext, actual key, cipher architecture or destination recovered.** Agent 3, 10 November 2026.

## Decision and connection to the authentic clue

The LP2 physical page 15 prints a mathematically exact [Fibonacci-indexed prime spiral](../results/fibonacci-prime-spiral.md). Its Fibonacci index sequence makes a Fibonacci recurrence worth a finite, exact test as a candidate **rune-key evolution rule**. The numerical square itself does **not** instruct applying that recurrence to each word, so this report neither claims such a historical mechanism nor invalidates the genuine Fibonacci-prime clue.

On the 2,896 original complete unsolved LP2 rune words (12,956 symbols), the cipher family is:

\[
X_{w,i}=P_{w,i}+K_{w,i}\pmod{29},
\]

where every word receives **two entirely free and unrelated key seeds**, and later key positions obey exactly one of:

- Forward: \(K_i=K_{i-1}+K_{i-2}\pmod{29}\).
- Reverse Fibonacci readout: \(K_i=K_{i-2}-K_{i-1}\pmod{29}\).

Either sign convention for the initial additive cipher is absorbed into unrestricted key seeds. Independently per rune, if the tentative output equals the previously **published** ciphertext glyph, the generator may rewrite it to any different rune at word indices less than six, or to the specifically published six-back map \(T(C_{i-6})=(24-2C_{i-6})\bmod29\) at later indices. The previous published symbol carries across complete rune-word and printed/page boundaries. The original exact-inverse test permits **every** repair/no-repair choice, irrespective of the 81% rewrite probability used only to generate positive controls.

## Exact source-word inverse: 0 original matches out of 109

For a proposed GP-English dictionary source word \(P\), each printed ciphertext rune \(C_i\) implies that its tentative key residue \(K_i\) belongs to a set of at most two values:

\[
\{ C_i-P_i \}\;\cup\;
\{ C_{i-1}-P_i\ \text{if the visible repair is physically possible}\}
\pmod{29}.
\]

The first two rune positions therefore supply at most four unordered candidate seed *pairs*. Every subsequent residue is uniquely determined by either Fibonacci recurrence. Test exact membership at every original rune; there is no heuristic language optimization, beam width, unknown-key brute force or arbitrary repair budget. One-rune source words leave the second seed free and are handled separately in the positive control.

The source lexicon is the repository's pinned English word-frequency corpus, GP-transliterated with established QU→CW, V→U, K→C and Z→S normalization and GP digraphs. All **109** ciphertext words of length at least ten are checked.

| Original word length | Source-word positions | Forward feasible source candidates | Reverse feasible source candidates |
| ---: | ---: | ---: | ---: |
| 10 | 52 | 0 | 0 |
| 11 | 32 | 0 | 0 |
| 12 | 18 | 0 | 0 |
| 13 | 4 | 0 | 0 |
| 14 | 3 | 0 | 0 |
| **Total** | **109** | **0** | **0** |

Planted source words were sampled independently from the last 60,000 characters of the Shakespeare control, subject to the *exact* original sequence of word lengths. Only three long rare-length fallbacks required source-lexicon words. Across both directions, **2,896/2,896** original planted source/key pairs were mathematically accepted by the exact inverse. Each plant made hundreds of genuine collision repairs, including **31** and **35** inside the long words. The dictionary represented **80 of 109** planted long sources, and the forward/reverse original-word scanner recovered compatible source candidates at **all 80 covered positions** for both directions. Twenty independent-per-rune pad null books produced **zero** matching long words under either recurrence, consistent with the actual original count.

These results exclude the stated family for ordinary dictionary-matched GP-English source words, without assuming any specific two-seed key initialization, while leaving more complex source segmentation, languages and cipher layers unresolved.

## An independent key-free algebraic test

The same key family has a stronger property that does not require any dictionary source word to be matched.

For the forward recurrence, apply the three-tap difference to each whole ciphertext word:

\[
D^+_i(C)=C_i-C_{i-1}-C_{i-2}\pmod{29}.
\]

Because \(D^+_i(K)=0\) **for every possible two-seed Fibonacci key**, the unmodified ciphertext satisfies the exact identity \(D^+_i(C)=D^+_i(P)\). For the reverse recurrence, use

\[
D^-_i(C)=C_i+C_{i-1}-C_{i-2}\pmod{29},
\]

which likewise cancels that key exactly. Rewritten ciphertext runes can spoil up to three nearby transforms. The model-matched planted positive supplies a direct estimate of test power under that contamination.

To distinguish GP-English differences from uniform output, freeze conditional 29-rune distributions \(p(D\mid\text{word-length bucket, local index bucket})\) from the **first 240,000 Shakespeare characters**. Buckets are word lengths 3–5, 6–8 and 9+ and transformed index 2–4 versus 5+, with one count of Dirichlet smoothing per rune. Use the mean log likelihood ratio against the uniform 1/29 distribution as the source score. Each original has **7,247** eligible within-word triple endings. A second test *exhaustively* searches all \(28\cdot29=812\) globally shared affine differential label transformations \(D\mapsto aD+b\) and scores the best, accommodating any fixed outer **affine** ciphertext alphabet. The very same selection applies to each control; arbitrary nonaffine outer permutations are not tested.

For 100 independently drawn exact-word-length source books (last 60,000 Shakespeare characters), encode each with a fresh two-seed forward or reverse Fibonacci pad and the declared 81% collision-reroute rule; 100 additional controls use independent per-rune pads and the same rerouting. Only three rare-length fallback source words per book are reused from the broader lexicon. The Fibonacci plants average **359.51** genuine rewrites per book. All scoring/reference parameters are fixed before checking original cipher output.

| Test, log likelihood ratio **per transformed rune** | Real LP2 | Genuine-key controls, mean (min to max) | Independent-pad controls, mean |
| --- | ---: | ---: | ---: |
| Forward, literal rune arithmetic | **−0.076934** | **+0.023320** (+0.010749 to +0.034702) | −0.069128 |
| Forward, best shared affine label | **−0.056196** | **+0.023320** (+0.010749 to +0.034702) | −0.055734 |
| Reverse, literal rune arithmetic | **−0.059905** | **+0.008197** (−0.000491 to +0.016638) | −0.056979 |
| Reverse, best shared affine label | **−0.044333** | **+0.008197** (−0.000491 to +0.016638) | −0.045367 |

**All 100 true-Fibonacci planted scores exceed the original** for both recurrences, with or without freely selected global affine output relabeling. The authentic ciphertext resembles independent-pad controls rather than the keyed, GP-English plant. The best original affine differential maps were \((a,b)=(7,20)\) forward and \((16,4)\) reverse; neither recovers an English-like invariant. These plants quantify meaningful test power against the specified architecture. No selection-adjusted global probability across historical Liber Primus hypothesis discovery is claimed.

## Scope, follow-up and reproduction

This is a broad constraint on a *specific* two-state recurrence because the differential test is completely invariant to the unknown key seeds. It is not an exclusion of every possible use of the page-15 Fibonacci clue. The model does not cover varying recurrences, hidden extra plaintext transforms, unknown nonaffine outer symbol permutations, transpositions, source languages distinct from GP-English, insertion/deletion, or unknown word segmentation. The selected six-back repair may differ from the actual anti-doublet generator; the planted positives test one physically motivated model.

The original unsolved ciphertext's **0/109** long-word feasibility and source-differential negatives are evidence against this exact recurrence. They do **not** identify the true cipher, reveal any plaintext or establish that the page-15 spiral supplies the key schedule. Follow-up should preferentially test a source-derived, independently predicted key and complete original-rune inversion, rather than more arbitrary order-two recurrences.

**Complete implementations:**

- [Exact free-seed inverse and synthetic encrypter](../sims/word_fibonacci_exact_inverse.cjs)
- [Key-free differential, global affine sweep and 100 heldout-source plus pad controls](../sims/word_fibonacci_differential_invariant.cjs)
- [Existing manual workflow extended instead of creating another wrapper](../.github/workflows/word-period6-T-inverse.yml)
- [Successful all-original-runic-source GitHub Actions run **42778403171**](https://github.com/FlareZ123/liber-primus/actions/runs/42778403171), containing machine-readable original and controls as three JSON artifacts, SHA256 of transcript **5e0003aa7f7dde3b238d17c5f964790dbf6bf9db5edacc4a5ec0bad81c6f4bce**, English source SHA256 **8a73136f699d7ed17260b916b0797fafdfe6213bbbcf1914ba5327134b7c863e**. RNG seed for inverse **0x3f1b0acc**, for differential **0x9cc17e12**. Node.js 22/CommonJS, original 55 rune-bearing LP2 pages, 2,896 canonical words.

The initial inverse run 42777661967 failed on the positive's one-rune source word because its unobserved second seed was wrongly disallowed. The repaired executable passed in run 42777787669 and was rerun together with the differential study in successful run 42778403171. This is a test-code correction, not a change to the original-cipher negative.
