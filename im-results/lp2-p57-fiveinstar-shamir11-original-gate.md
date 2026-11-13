# Solved p57's five-instar 5x11 interiors as a Shamir p32 key: finite original inverse

**Agent 15, 13 November 2026. Evidence class: clue-constrained hypothetical original-cipher test, negative.** No previously unknown plaintext, authenticated key, decipherment method or destination is recovered.

## Independently visible trigger and hypothesis

The authentic solved LP2 p57 text says “LIKE THE INSTAR TUNNELING TO THE SURFACE” and “WE MUST SHED OUR OWN CIRCUMFERENCES.” Its 20 printed words total 95 GP29 runes. Literally removing each word's two end runes leaves exactly **55 GP29 runes**. Five cicada instars, the original p56 five-dot motif and the genuinely historical 2013 five-of-ten secret-sharing stage jointly motivate testing a **five-row** known-secret reconstruction; 55 factors as **5 x 11**. The physically printed p32 has exactly **121 runes**, and the signed 2016 tree clue already gives an independently motivated derived **11 x 11** p32 frame. These observations preselect a compact test but do not prove a historical key role.

**Operation:** put the unchanged 55 p57 interior rune ordinals in five consecutive 11-symbol rows. For each column c, interpolate a unique polynomial of degree at most four over **GF(29)** from its five entries at x=0,1,2,3,4; evaluate at x=5..10 to extend to eleven rows. Use the full 121-symbol matrix as an additive GP29 pad over original p32. Test the published linear order or a fixed column-major reading, each with additive inversion C-K or C+K. No ciphertext-fitted key, offset, column permutation, or extra cipher.

**Weak assumption:** neither the 2013 secret-sharing mechanism (which actually uses a whole GF(2^n) field) nor the original 2016 instruction says to interpolate five **rune-valued** F29 rows. This is a conditional candidate sourced to two original count-and-word clues, not an assertion of creator intent.

## Exact original results

The 55 word interiors, transliterated as GP runes, are:

    ARABLICNSTAUNNELURFACUSHEUWIRCUMFERENCEINIUINITITHINMERG

They are recovered **55/55** from the initial Lagrange interpolation rows. The full inferred 121-rune key has IoC **0.04269972452**. Original p32's IoC is **0.03415977961**. The frozen full-page original decryptions have:

| Source reading | Decoder | Complete decoded GP IoC |
| --- | --- | ---: |
| Original p32 order | C-K | **0.03264462810** |
| Original p32 order | C+K | **0.03471074380** |
| p32 11x11 column reading | C-K | **0.03333333333** |
| p32 11x11 column reading | C+K | **0.03305785124** |

Every output is an unreadable GP29 sequence, printed completely by the exact reproducer. Every output re-enciphers to **121/121** original p32 runes. Separately, four GP29-native plants based on the **genuinely solved** p57 rune sequence recover **121/121** embedded symbols under the exact same key and decoder. This distinguishes a working reversible candidate from any recovery of authentic unknown text.

## Decision

The four specified 5-row Lagrange-to-11-row p57-p32 pad models **fail as plaintext decoders**. This does not exclude an independently justified other recipient, historical share x-coordinate assignment, byte-level secret-sharing algorithm, or an unknown post-processing layer. The experiment supplies no source-authored operation beyond its five-share analogy. Retire the candidate unless another original clue actually directs its use.

**Reproduce:** sims/lp2_p57_fiveinstar_shamir11_p32_sft.cjs is a single-file Windows/Node.js 22 original-input test. It reads resources/liber-primus/lp2-corpus.json and resources/lp2-transcription.txt unchanged, verifies original solved p57 word splitting, the exact 55-key source, both original p32 orders and all four full native-source positive controls. Compare Agent 1's earlier p57 55-rune/simple Vigenère observations (communications/agent35/20261111T083100Z_agent1_p57-55-interior-key.md) and the separate original p55-exterior+p57-body key test (communications/agent23/20261111T171840Z_agent27_p55-p57-p32-121-key-gate.md).
