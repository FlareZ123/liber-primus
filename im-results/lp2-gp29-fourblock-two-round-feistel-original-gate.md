# Two-round four-rune GP29 Feistel: exact all-secret original-cipher gate

**Agent14, 23 November 2026.** The unmodified LP2 unknown corpus has **12,956 GP29 runes**, **2,896 complete printed words** with **32 cross-page carries**, and **55 rune-bearing physical pages** p0–p55 (p50 holds a separate numerical table). We tested an explicit, source-era-available *candidate four-rune cipher family*, using a stronger key-independent test than the arbitrary block-permutation equality partition. **No unknown plaintext, key or author-designated opcode was found.**

## Typed cipher and exact necessary-and-sufficient condition

Split each disjoint four-rune packet into two ordered pairs of GP29 indices, L and R, each in GF(29)^2. The standard *two-round additive Feistel* encoding is

    A = L + F1(R)             (mod29 in both coordinates)
    B = R + F2(A)             (mod29 in both coordinates)
    C = A || B

Every original physical page may independently choose one of all four alignment phases and completely unrelated secret nonlinear maps F1 and F2, each an **arbitrary 841-entry function from two GP runes to two GP runes**. Each block transform remains reversible whatever those maps are, because R = B − F2(A), then L = A − F1(R). Incomplete leading/trailing page fringes are ignored for the feasibility test.

For *any* proposed aligned plaintext and original ciphertext, these secret maps exist **if and only if** the two observed assignments R→(A−L) and A→(B−R) are well-defined functions. A repeated input that requires different output values is an exact contradiction; a consistent set of assignments can always be extended to full private functions. This proof is independent of key size, assumed internal function algebra or cryptanalysis heuristics. It is a structural test of the concrete two-round half-block architecture, **not** of all four-rune ciphers, general Feistel with more rounds, moving spaces, or message-dependent state.

## Original-input decision

We reused the predeclared original-word-length-matched native-source controls from the repository's four-block all-secret packet gate: 96 seeded **independently sampled donor-word sequences** each from Kahlil Gibran, Shakespeare and Emerson, preserving **all 2,896 original GP word-length slots**, page lengths and page-carry geometry. These are GP-native donor words assembled to match the original word-length slots, **not contiguous grammatical prose from the donor books**. Their GP29 conversion uses the solved-Cicada-calibrated actual IO→IA and ING→NG ligatures. The fixed xorshift32 seed is `0x33012026`. For *each* candidate book, the adversary may independently optimize every original page's phase 0, 1, 2 or 3, with entirely new unknown F1/F2 on each page.

| Native donor-word control | Complete sampled sequences compatible among 96 | Fewest total required conflicting secret-map assignments | Mean individually compatible pages out of 55 |
|---|---:|---:|---:|
| Gibran | **0** | **398** | **2.59375** |
| Shakespeare | **0** | **384** | **2.73958** |
| Emerson | **0** | **383** | **2.51042** |

All **288/288** original-word-length-matched GP-native donor-word sequences violate the exact cipher equations, even after granting entirely secret page-dependent round functions and all phase choices. The first frozen Gibran sample has **447 minimum conflicts** and only **2 compatible pages**. Even though the previously established arbitrary page-private 29^4-state permutation allows 13/288 native word-length samples to share the original equality pattern, the concrete *two-round Feistel* cannot map any of these 288 donor texts to the unchanged original ciphertext. These are **conditional finite controls on sampled donor-word registers**, and cannot exclude arbitrary connected grammatical English or other plaintext registers. It remains mathematically possible that an especially unusual or resegmented unknown message satisfies the equations.

## End-to-end positive controls and limitations

The standalone CJS source implements *actual nonlinear* page-private Feistel encryption and decryption with two different quadratic GP29 round functions. A complete **12,956-rune** native GP English positive plant, retaining original physical pages and printed-word slots, encrypts and inverts exactly on all complete four-packets; original source-length fringes are preserved losslessly. The inferred secret-function assignments have **zero contradictions**, while a deliberately wrong one-rune block phase produces contradictions. A separate **95-rune independently solved p57** plaintext Feistel positive also inverts exactly. The implementation checks all original page and word counts before computing; no secret is fitted to make ciphertext look English.

**Causal implication:** Arbitrary page-private four-packet S-boxes remain unidentifiable, but a concrete low-round Feistel law imposes strong hidden-key-independent constraints through its reused two-rune halves. An author-supplied original clue specifying a 4-rune split, **two rounds**, the exact per-coordinate addition, secret F1/F2 derivation, real page phase and fringe handling would still be needed to promote this historically imaginable family to an intended solve route. The original p15 4×4 Fibonacci-prime square supplies sixteen numbers but no such instruction. No reason remains to search Feistel round keys within this two-round family for ordinary author-native English absent independent contrary source evidence.

**Independent CI verification:** [verified Windows Node22 PASS 45147498038](https://github.com/FlareZ123/liber-primus/actions/runs/45147498038); all complete native plants, phase controls and original source assertions pass under Windows Node.js 22.

**Reproduction:** `sims/lp2_gp29_fourblock_two_round_feistel_allkey_sft.cjs` via Node 22; source images and GP corpus under `resources/liber-primus/`, solved control encoder and original-word parser in `sims/`. Underlying earlier unconstrained four-block orbit: `im-results/lp2-allsecret-fixedblock-equality-original-gate.md`. The result is narrowly scoped, and no unknown LP2 page is thereby deciphered.
