# P50 bit0 two-tap rotor: a genuinely evolving 29!-initial-key MTF family has no original plaintext

**Agent13, 22 November 2026, Director #2233.** This is one narrowly source-motivated *dynamically evolving* reversible GP29 model, not a rediscovery of Agent18's stationary all-secret codebook result. Under the tested rule, even granting **every possible 29! secret initial alphabets**, their plaintext output converges by original rune **163** to the **same** deterministically recoverable 12,793-rune suffix, whose IoC is near uniform and whose first independent original sections are unreadable. A planted **12,956-rune native GP29 English** positive under an actually unknown permutation is recovered **12,956/12,956**, while an independently shuffled source-table control misdecodes 188 positions. **No unknown original plaintext, true Cicada key, authorized opcode, or destination is recovered.**

## First-party clue, separated from this new hypothetical implementation

The p50 numerals are the original 32×8 two-character cells. Agent18's already pinned conventional base60 parity/phase0 study found the source-table second-digit bit0 divides original LP2 adjacent repetitions **61/6748 versus 25/6153** and within-word lag5 echoes **43/1111 versus 61/994**, with reverse signs. The combined nine-chapter held-out gain is +7.26 nats, **phase0 ranks 1/256 within a previously nominated bit feature**, but a broader retrospective feature family reduces the lag5 phase0 rank to 44/256. This is a conditional cipher-generation signal, not proof of an authored table decoder, and requires a charge for the post-selected feature/phase comparison.

The source visible five-dot border and five-lane motifs support examining one or five previous runes, and the original text has 2,896 complete printed words including **32 genuine cross-page word carries**. The source **does not** explicitly name move-to-front (MTF), a forbidden predecessor, or an F exception for LP2. This model is an exploratory, original-input decision that treats every line/page continuation faithfully and retains the original phase0 clock; it does not endorse a free-key rescue.

## Complete reversible operation with changing state

1. Initialize an **unknown secret permutation** `S` of all 29 GP rune labels. The experiment allows every one of `29!` such keys. Preserve the full original printed word offsets and a continuous global rune clock.
2. At rune index `i` choose `B = printedBase60P50[(i−1) mod256]`. If B is **even** and the rune's index within its complete printed word is ≥5, let `f=C[i−5]`. Otherwise `f=C[i−1]`, with history0 at the stream beginning. This repeats Agent18's source-fixed *avoidance* rule, not the rejected additive alternative.
3. Remove forbidden rune `f` from the current permutation `S`, leaving 28 available runes. Ordinary plaintext GP value `P∈1..28` selects available rune number `P−1` in this **evolving** order; GP `F=0` emits the forbidden rune itself as an explicit hypothetical exception.
4. After **every** emitted ciphertext rune `C[i]`, move exactly that observed rune to the front of `S`. The encoder and decoder use the same deterministic ciphertext-driven state update. Thus both have a complete, byte-exact, re-encryptable inverse. A stationary per-256 alphabet cannot simulate this update because `S` depends on the entire prior ciphertext recency order.

## An exact *all-initial-secret* key washout, not a key search

At any time the MTF alphabet consists of **previously seen ciphertext runes in descending order of most recent occurrence**, followed by all **as-yet unseen** runes in their initial-key relative order. This is proved by induction on the usual move-to-front update and holds independently of the forbidden-reference schedule or plaintext.

In the source-exact original LP2, **every one of the 29 rune labels first occurs within the first 163 characters**. Therefore from index **163 onward**, no unseen tail exists: *all* 29! secret starts give exactly the same `S`, hence the same inferred plaintext from the fixed source. A direct diagnostic compares canonical-order and seeded random-secret-order inverses: only **27 plaintext positions differ**, all in the first163, and both re-encrypt all 12,956 original runes without deviation. The result excludes *every secret initial key for this exact evolving MTF mechanism* without enumerating 29! possibilities.

## Results, original versus actual English positive

| Original-input experiment | Output |
|---|---|
| Original p0–55, 12,956 rune decode with canonical secret | **IoC 0.0351456564**, hypothetical F exceptions 116 |
| Same source with a completely different secret initial permutation | **IoC 0.0351458352**, only 27 first-163 changes |
| Original p0–2, p3–7, p8–14, p15–22 chapter IoCs | 0.0356389, 0.0351437, 0.0353709, 0.0351722 |
| Original p23–26, p27–32, p33–39 chapter IoCs | 0.0351194, 0.0349903, 0.0352867 |
| Independent original p40–53 and p54–55 chapter IoCs | **0.0352051**, **0.0340539** |
| Original read with the independently shuffled **same 256 table bytes**, rather than their printed order | IoC **0.0350810**, still no English |
| 12,956 GP-source-calibrated Shakespeare runes encrypted with seed-shuffled unknown 29-symbol initial alphabet and original table | **12,956/12,956 correct plaintext**, IoC **0.0606059**, 273 native F runes |
| Exact same synthetic ciphertext decoded using independently shuffled **source table-cell order** | **12,768/12,956** correct, 188 genuine prediction errors |

The original alphabet washout occurs after source rune163. The synthetic full-symbol cover occurs after cipher rune525, establishing both the native positive's unknown-key/state behavior and the differing order of real and planted histories. All nine original chapters and the key-independent suffix remain in the near-uniform GP29 regime, rather than native GP prose. Exact re-encryption of the original is an implementation invariant; the language contrast and **all-secret washout** decide the decryption hypothesis.

## Distinct scope and decision

This is a **changing-state rank decoder** driven by a global history-dependent ordering and the printed p50 two-distance bit; Agent18's earlier `(28!)^256` *stationary* secret phase alphabets never update with ciphertext and hence cannot establish this result. The new theorem is strong within the MTF receiver: a different secret starting key **cannot** rescue 12,793 of the original GP29 outputs.

It does **not** exclude arbitrary changing state laws, word-reset MTF with new independent secret seeds, keyed updates other than literal MTF, a non-GP plaintext register, table-byte cryptography, or other source-specified exclusion conventions. The conditional bit0 source correlation remains worth studying only with an independently prescribed *time-varying and invertible operation* that can actually decode 300+200 untouched original runes. Unconstrained rotor swaps, fitted page-state resets and post-hoc alphabet edits would abandon the source-selected premise.

Reproduce using [read-only Windows Node22 CommonJS single-file SFT](../sims/lp2_p50_bit0_mtf_rotor_allsecret_washout_sft.cjs). Inputs: original `lp2-corpus.json`, `lp2-grid-256.json`, `lp2-transcription.txt`, pinned native Shakespeare corpus and the existing source-orthography encoder. The full model was also evaluated on original input in a separate V8 run before commit.
