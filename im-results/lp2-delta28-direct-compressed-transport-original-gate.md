# Exact keyless GP29-difference → base28 compressed-byte gate

**Decision, 13 November 2026:** The natural, keyless previous-ciphertext-difference readout of the original unsolved 12,956 runes produces no recognisable bzip2, gzip, XZ or ZIP member in the complete register, the nine source visual chapters, all sufficiently long rune-bearing physical pages or the original p40–55 floral register. There are **zero embedded byte-level member headers in 236 declared source/orientation cases**, while complete authentic-gzip and real-bzip2 synthetic byte members survive a full GP29 cumulative cipher plant and are recovered exactly. No unknown LP2 plaintext or key is recovered.

## Motivated mechanism and exact input

Cicada historically used bzip2 and gzip transport in its 2014 recruitment stages. Independently, original LP2 has only **86 immediate same-rune pairs** in its entire 12,956-rune unknown register. One simple human operation is to interpret the mod-29 difference between consecutive original ciphertext runes as a cumulative cipher increment; a *nonzero* increment is naturally a digit of base28 and a zero increment may signal an escape. If this maps immediately to previously compressed text, decompressing the resulting bytes would recover plaintext without a hidden key. Both halves are anchored in author-demonstrated techniques, but there is **no direct author instruction to combine them**.

Freeze the forward rule at the source order:

1. For each contiguous source register, omit only its first rune, which has no predecessor within the register.
2. Compute each subsequent `dᵢ=(Cᵢ−Cᵢ₋₁) mod 29`. For `dᵢ=0`, omit that *exact observed* repeat site; for `1≤dᵢ≤28`, interpret `dᵢ−1` as one base28 digit.
3. Convert the entire base28 integer to its minimal-length big-endian bytes. Inspect exact bytes for recognizable bzip2 `BZh1`–`BZh9`, gzip `1f8b08`, XZ `fd377a585a00`, and ZIP `504b0304` file members, **even if the magic begins inside the byte register**.

Source-motivated finite controls use the opposite modulo29 difference sign and reversed source reading direction, producing four variants per register. The **59** registers are the exact full unknown sequence, the nine original visual chapters (lengths `729,1145,1729,1903,1021,1433,1680,3008,308`), the p40–55 3316-rune floral run, and 48 original rune-bearing physical pages of at least 160 runes. No 29-rune alphabet relabeling, unprinted clock offset, fitted prefix or message-key word is searched.

## Results on original ciphertext

| Original register | Direction | Rune positions | Nonrepeat base28 digits | Ignored true repeat sites | Decoded bytes | Byte prefix |
|---|---|---:|---:|---:|---:|---|
| All unsolved | GP step +, forward | 12,956 | 12,869 | 86 | 7,734 | `02bf8b71cd485188fb34d4ce15c5...` |
| All unsolved | GP step +, reverse | 12,956 | 12,869 | 86 | 7,734 | `01071c80041159311c6e14a087ab...` |
| All unsolved | GP step −, forward | 12,956 | 12,869 | 86 | 7,733 | `dba688c7637b334a44604d6d8b54...` |
| All unsolved | GP step −, reverse | 12,956 | 12,869 | 86 | 7,734 | `0294157a909a738b290b207afba5...` |

Across the entire group × direction space, **236/236** byte registers lack all four recognized compressed-file signatures, including at internal offsets. This is an original-input result, not a simulation or probabilistic prose score. If a complete compressed member with its normal header were packed in this *exact* way, the receiver would see it.

## Positive original-topology encrypted controls

For the source-floral register, embed actual bzip2-compressed bytes of `LIBER PRIMUS IS THE WAY ITS WORDS ARE THE MAP` (73 bytes, exact original compressed hex in the SFT), and independently a real Node zlib-produced gzip member. Encode each complete compressed member as a base28 integer in the unchanged runic length. Use the **exact 21 source-floral immediate-repeat positions** as reserved zero steps and use positive GP29 increments elsewhere; preserve the original first rune as seed.

Decoding the planted GP29 chain reproduces the entire original compressed bytes exactly; both compression magics appear at byte offset0; gzip independently decompresses to the source message. This demonstrates that the detector accepts both historically motivated compression classes with the exact original marker topology. It is an implementation/identifiability control, not evidence that either operation was used on LP2.

## Scope and next decision

This closes only the **direct no-key cumulative GP29-to-unframed-base28 compressed-member** interpretation under the declared source segmentation and two sign/read directions. It leaves unselected alphabet orders, nonzero state seeds across group boundaries, independently keyed steps, intermediate framing, ciphertext that is compressed *before* another encryption, and nonstandard raw compression open. Avoid brute-forcing header offsets or new secret permutations after observing the failure unless an original clue explicitly chooses them.

**Reproduction:** [full CommonJS single-file SFT](../sims/lp2_delta28_direct_compression_sft.cjs); [Windows Node.js 22 GitHub Actions run 43495660081](https://github.com/FlareZ123/liber-primus/actions/runs/43495660081) completed with PASS on the original canonical corpus and both compressed-byte plants.
