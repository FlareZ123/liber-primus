# Original p50 table as a 16-leaf SHA-512 Merkle proof

**13 November 2026; Agent50. Classification: source-anchored but conditional original-input negative.** No unknown LP2 plaintext, authentic key or continuation page was recovered. This experiment directly tests a plausible cryptographic use for the conspicuous **32×8** numerical table, source-visible **sixteen-page tree-framed register**, and solved end-page **64-byte hash**.

## Source clue and frozen operation

Three original physical features suggest a human-recognizable hash-tree hypothesis:

1. The original pages **p40–55** constitute a sequence of **16** identically bordered image pages, a natural four-level binary tree (`2^4=16`). The pale tree on p55 and matching blurred tree on p32 make tree imagery independent of any numeric fit.
2. The original numerical table pp49–51 has **32 rows ×8 columns =256 bytes** under the documented base60 transcription. Four consecutive **8×8 printed blocks** each hold exactly **64 bytes**; alternatively each of four **32×2 column strips** holds 64. These are two source-visible partitions into four SHA-512-sized candidate sibling digests.
3. Solved physical p56 prints the exact 64-byte digest `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. This provides an independently fixed cryptographic equality target.

The speculative operation is a **standard four-level SHA-512 Merkle inclusion path**. For leaf p`40+i`, hash its original file or symbol bytes once, then combine it with four table-derived 64-byte siblings using `SHA512(left||right)` at each level. The page index `i∈0..15` fixes left/right at every level via successive bits. Test both physical four-way table partitions and both natural top-to-bottom or bottom-to-top sibling enumerations; **no secret root, key, byte offset or matching prefix is optimized**.

The four exact leaf registers are (1) complete source JPEG bytes, (2) original GP29 rune-index byte values, (3) unseparated source Unicode GP runes encoded as UTF-8, and (4) the source GP Latin transliteration as ASCII. The actual p50 numerical page has an empty rune register. These are recorded source representations, without an inferred unknown plaintext.

A second, independent necessary-condition check constructs the **complete four-level Merkle tree over all 16 original leaves**, for each leaf register, and compares its root directly with the printed p56 digest. It additionally compares each authentic sibling digest from that known 16-leaf tree to every source-preserving printed 64-byte table grouping. This asks whether the table is an authentication path for **already available bytes**, without relying on the printed target.

## Reproducible results

| Frozen comparison | Input coverage | Full equality hits |
|---|---:|---:|
| Table-backed p50 Merkle path to printed p56 root | 16 source pages × 4 byte registers × 2 table partitions × 2 direction orders = **256 paths** | **0** |
| Full known-16-leaf root versus printed p56 root | **4 native byte registers** | **0** |
| Individual table 64-byte blocks versus siblings of known-16-leaf trees | 4 registers, all page directions and both printed block orders | **0** |

The table byte SHA-256 is asserted to be `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`; source input covers all original JPEGs `57.jpg–72.jpg` and canonical LP2 rune indices. A planted four-sibling proof verifies by re-evaluation and fails after altering its leaf, leaf index or sibling direction order. The original-data inverse and all equality checks ran **successfully** in [the isolated manual CI run 43379022214](https://github.com/FlareZ123/liber-primus/actions/runs/43379022214) from [the single-file CommonJS SFT](../sims/lp2_p50_merkle16_sha512_source_sft.cjs).

## Interpretation and decision

The numerical and image shapes make a hash tree a plausible *visible* operation. The original p50 table is also independently subject to exact GF(29) quadratic divisibility relations corresponding to 2013 Cicada examples; interpreting its bytes as four independent cryptographic hashes already carries a substantial unsupported premise. Neither the original pages nor the signed 2016 tree image explicitly orders a Merkle proof, supplies leaf serialization, or authenticates SHA-512 as the only possible operation.

The tests conclusively retire **the standard SHA-512 Merkle proof of the sixteen available p40–55 page files/rune registers under the two physical 64-byte table partitions and ordinary sibling orderings**, plus their direct complete-tree roots. They do not exclude a Merkle proof for a genuinely **missing external page** or an encrypted/serialized leaf whose bytes cannot yet be inferred. Further invented leaf serializations, altered cryptographic hash families, secret byte permutations and nonce schemes would remove the original-source constraint. Reopen this route only if an original instruction or recoverable new leaf object actually selects one.
