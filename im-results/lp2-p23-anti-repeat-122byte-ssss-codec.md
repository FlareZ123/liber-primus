# LP2 pp23–26: a lossless 122-byte anti-repeat register for the historical five-share operation

**Classification, 12 November 2026:** new explicit invertible format candidate, independently run against authentic original ciphertext and historical 2013 SSSS share controls. This establishes a *conditional capacity bridge*, not a source-authenticated intended decoder. **No unknown-page plaintext, source-selected share identifiers, key, or destination recovered.**

## Manuscript clue and exact obstacle

On the original physical LP2 p23 the red heading has exactly sixteen runes, followed on pp23–26 by a black 1,005-rune body and a prominent five-dot ornament. A plausible human hypothesis is **five shares of 201 GP29 runes**, informed by the actual 2013 Cicada five-of-ten Poettering `ssss` v0.5 sharing stage. Its implementation accepts an exactly 122-byte/976-bit whole-field share but no longer byte-aligned field below its 128-byte maximum relevant to these 201-rune streams. Prior exact attempts interpreted each 201-rune lane as an ordinary base29 integer, requiring 977 bits for some observed values. Two of five raw original values overflow the 976-bit field. This [original format exclusion](lp2-p23-26-ssss201-original-format-gate.md) is correct for *ordinary positional base29*, but does not exclude alternate injective encodings of a restricted text alphabet.

## Fully invertible candidate register

The unknown LP2 ciphertext is unusually deficient in adjacent repeated runes. For a **201-rune** string, record the first GP29 index (0..28), then record 200 cyclic successor differences, 0..28. Zero means a repeated adjacent rune; the other 28 residues are distinct changes. Restrict the register to at most **seven zero differences**. Define `S(m,k)=sum_{j=0}^k C(m,j) 28^(m-j)`: the exact number of legal suffixes of length m having at most k further zeros. Assign each allowed string a lexicographic rank, first indexing its first rune and then the successors, skipping suffixes that would exceed the seven-repeat budget. This is a bijection with ranks

`0 <= rank < 29*S(200,7) < 2^976`

and has a constructive unique inverse. The total model capacity is **975.75146 bits**, i.e. a *lossless, fixed-width 122-byte* value. The allowance of an eighth zero would require **976.02948 bits**, exceeding 122 bytes. Thus *seven* is an explicit maximal repeat budget derived from the historical field width. The choice of this nonstandard combinatorial code itself is **not** given by any author-verified LP2 clue.

Source-printed red-heading removal and consecutive partition into five 201-rune blocks produces original within-block adjacent-repeat counts **[1,4,3,2,1]**, so all five share lanes can be packed and unpacked byte-for-byte. The alternative interleaved five-column arrangement produces counts **[7,11,3,9,8]**, failing the identical bound in three of five lanes. Under this codec the contiguous reading is source-compatible and the interleaved reading is excluded. This is a format discrimination, not evidence that the codec is intended.

## Actual historical finite-field inverse

For the source-original contiguous five shares in forward order and reverse-lane control, the experiment applies exact **GF(2^976)** arithmetic using the degree-976 irreducible polynomial from the original `ssss` 0.5 coefficient table, `x^976+x^17+x^10+x^6+1`. It uses the literal archived 2013 five-share **decimal IDs 02,03,05,07,08**, subtracts the source algorithm's monic x^5 term, interpolates the constant coefficient and inverts the historical cyclic XTEA diffusion for **122 bytes**.

The [complete original-source SFT](../sims/lp2_p23_201_122byte_ssss_codec_sft.cjs) asserts full pack/unpack on every lane, source body counts, a seeded synthetic 976-bit polynomial recovery, and reconstruction of the **actual 2013 onion address `p7amjopgric7dfdi.onion`** with the same field+diffusion implementation in GF(2^176). The [successful GitHub Actions original-input run](https://github.com/FlareZ123/liber-primus/actions/runs/43165240860) executes all checks in Node.js 22.

| Frozen source interpretation | Complete 122-byte SSSS secret result |
| --- | --- |
| Five original contiguous strands, forward | **43/122** printable ASCII bytes; **11/122** native GP29-index bytes. First32 hex `839dc666c476dd982cb521b25fe3c94494031769673e9f90cfe3f69100aa8297` |
| Five original contiguous strands, each reversed | **48/122** printable ASCII bytes; **6/122** native GP29-index bytes. First32 hex `f34c85f94532b8b77de2ccbbd37d920f6329a149224ca4cf38e9c145ace2dcc5` |

The complete outputs are random-looking and recover **no native plaintext or recognizable clear secret** under those original historical IDs. These failures do not exclude a binary secret, other combinations of authentic 2013 decimal x labels or a different encoder, but there is no authored LP2 instruction identifying the codec, share order, or identifiers. Do not confuse an allowed finite-field interpolation with proof that a five-of-ten sharing mechanism was actually used; any five distinct IDs permit interpolation.

## Next decision

The code provides a reusable **strictly reversible bridge** from the authentic 5×201 manuscript structure into an actual pre-2014 122-byte secret-sharing implementation. A genuine next step would need either source-selected share IDs/codec or a strongly recognizable independent useful secret from a *complete, predeclared finite historical identifier test*, followed by withheld original LP2 decryption. Arbitrary per-byte mappings or fitted word keys would abandon this route's evidential constraint. The result remains an explicit *intermediate* candidate and belongs in `im-results/`; the authoritative `results/README.md` should not present it as a cipher discovery.
