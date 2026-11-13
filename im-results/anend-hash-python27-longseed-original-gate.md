# Page-56 512-bit hash as a historical Python 2.7 long-integer PRNG seed

**13 November 2026, Agent15. Result: original-input negative within a 96-mode, source-seeded family. No unknown LP2 plaintext, authenticated key, cipher operation, hash preimage or destination.**

## Why try it, and its unsupported premise

The authentic solved LP2 p56 prints exactly one 512-bit digest. Earlier Cicada puzzles used Python scripts and Mersenne Twister; Python 2.7 accepts an arbitrarily large positive integer seed for \`random.Random\`. A solver might use the p56 digest itself as a seed for the next LP2 key. This fixes the seed material before any unknown ciphertext scoring. **The manuscript does not instruct users to seed Python, interpret the digest as an integer, or apply a PRNG to an unknown chapter.** Thus this is a testable proposal, not a source-authenticated key.

Use the existing source-faithful CPython2.7 \`init_by_array\` MT19937 implementation from [the independent Python27-long-seed SFT](../sims/lp2_2016_linechar_python27_longseed_original_sft.cjs), whose historical output vectors are asserted. The original p56 digest and canonical GP29 unsolved corpus are pinned in \`resources/cicada2014-archive-hash-manifest.json\` and \`resources/liber-primus/lp2-corpus.json\`. No guesses, fitted seeds, missing page bytes or ciphertext-derived keys.

## Locked direct original-input experiment

Exactly **2 seed integer serializations** (printed 512-bit hex big-endian; the same 64 bytes reversed), **3 reset clocks** (continuous book, physical-page reset, nine source-visible visual chapters), **4 CPython2.7 number reductions** (\`getrandbits(5)\` rejection, 53-bit float, scaled 32-bit word, modulo-32-bit word), **2 additive signs**, and **2 rune mechanisms** (direct GP29 addition, or predecessor-excluding GP28 gap transport with doublets treated as nonconsuming transparent events) give **96 complete specifications**.

Use pages p0–27 as fixed model-selection input and reserve p28–55 as a separately scored heldout part of the original. The same independent Duko English quadgram model is applied throughout. The GP28 mechanism necessarily omits each starting symbol and adjacent equality marker, so its decoded score is only for remaining characters and does not represent a full recovered text; it cannot authenticate an independent escape rule.

| Original-source result | Mean log10 English quadgram |
| --- | ---: |
| Unmodified original p0–55 | **−7.44014928** |
| Best training mode (big-endian digest, book continuous, scaled32, subtractive, direct29), p0–27 | **−7.43007060** |
| Same frozen mode, p28–55 | **−7.52780835** |

Best frozen original output begins \`IAICXXASTAYEAJTHIAUIEAAIAENGIDCJBGATHA\`. It remains nonlinguistic. The strongest heldout mode selected **after inspecting all heldout scores** reaches only **−7.43118146** and cannot be credited as independent validation. No source hash encoding and tested PRNG rule yields discernible GP prose or new key.

The test passed [passing manual Node.js 22 original-input CI run 43381316529](https://github.com/FlareZ123/liber-primus/actions/runs/43381316529): syntax check, the 96 frozen original-model assertions, full native GP plant, original-input heldout metrics, and wrong-endian source control all completed successfully.

The exact-key source-native positive plant starts from independently native-GP Shakespeare text, encrypts all 12,956 runes under the full original digest-seeded MT, recovers **12,956/12,956** with the correct inverse, exactly forward re-encrypts the original synthetic ciphertext, and rejects the reversed-hash source. This validates full-size PRNG integration; it cannot establish Cicada authorship.

## Research consequence

**Retire the 96 direct CPython2.7 digest-seeded GP29/GP28 transport modes.** A p56 digest is an independently authentic source input, but it lacks a historical PRNG-selection instruction. Further endian/PRNG/phase menus would not create one. This result complements the already failed direct SHAKE256, HMAC-SHA512 and SHA512-counter digest expansions ([existing tests](../sims/anend_hash_direct_29stream_inverse.cjs)); it is a distinct Python2 long-seed consumer. Neither test excludes a *different independently instructed cipher* using this hash, an external service preimage, or a different hidden key.

[Exact SFT with frozen original-output assertions](../sims/anend_hash_python27_longseed_original_sft.cjs) · [passing manual Node.js 22 original-input CI run 43381316529](https://github.com/FlareZ123/liber-primus/actions/runs/43381316529).
