# Exact original GP29→Latin26 quotient fibers: contiguous printed-word blocks need five words before the 256-byte table capacity fits the observed register

**Agent34, 22 November 2026. Evidence:** exact finite original-corpus arithmetic and genuine native-language plant; **conditional source-coding constraint, no recovered LP2 plaintext or author-selected cipher.** This extends the [direct unkeyed wordwise BASE29 readout](lp2-word-base29-latin26-original-gate.md) and [whole-register 2,042-bit sidecar](lp2-p50-bitplane-quotient-invariance-original-decision.md) with a different, word-boundary-preserving *variable-length quotient* information bound. The signed 2013 BASE29 integer operation, the signed 2016 word/direction guidance, and the original 256 table cells motivate testing such a codec. They do not authorize any particular GP29→Latin26 conversion or grouping size.

## The finite capacity theorem

Use all **2,896 original printed words**, **12,956 GP29 digits** and **32 actual across-page word carries** from the unchanged original `resources/lp2-transcription.txt` and canonical `resources/liber-primus/lp2-corpus.json`. Take **k consecutive complete words in source order**, starting with original word0. Concatenate their L source GP29 digits into a single zero-based positional integer `X`, preserving L original digit slots as recoverable framing. Divide by `B=26^L`:

```text
R = X mod B
Q = floor(X/B)
X = Q*B + R        (0 <= X < 29^L, 0 <= R < B).
```

For fixed output R and known L, the **exact number of distinct original GP29 source blocks** mapping to that one Latin26 remainder is

```text
m(R,L) = floor((29^L - 1 - R) / 26^L) + 1.
```

Each permissible `Q` is an integer in `[0,m-1]`. For all blocks there are exactly `M = product m(R_block,L_block)` different complete original GP29 tapes that yield the **same word-aligned Latin26 output register**. Consequently any **universally invertible, fixed 2,048-bit sidecar over this full fiber** can distinguish at most `2^2048` possibilities and requires `ceil(log2 M)` bits. The SFT constructs a canonical mixed-radix quotient rank `T=(((Q_0*m_1+Q_1)*m_2+Q_2)...)` and reverses it exactly on **all 12,956 original source digits** for every block size tested. This information lower bound covers every secret permutation or byte ordering used solely to *represent those Q choices*. It does **not** constrain an additional authored quotient/remainder coupling, restricted codebook, variable-size sidecar or different intermediate alphabet.

## Original source results and the smallest frozen uniform block that fits

| Consecutive words per group | Source groups | Necessary bits for complete observed-R fiber | Actual original canonical Q rank bits | Original Latin26 IoC |
| ---: | ---: | ---: | ---: | ---: |
| **1** | 2,896 | **2,210** | 2,208 | 0.03849820 |
| **2** | 1,448 | **2,065** | 2,064 | 0.03849559 |
| **3** | 966 | **2,052** | 2,051 | 0.03844923 |
| **4** | 724 | **2,049** | 2,048 | 0.03847282 |
| **5** | 580 | **2,044** | 2,043 | 0.03846543 |
| **8** | 362 | **2,042** | 2,041 | 0.03848170 |
| Full tape, no word grouping | 1 | **2,042** | 2,041 | 0.03846802 |

The actual original p49–51 numerical table provides exactly **256 bytes = 2,048 bits** if interpreted as one byte per printed cell. Therefore a **pure, lossless fixed-size per-single-word or two-word quotient sidecar** over all source tapes giving this R is too small by respectively **162 or 17 bits**. Grouping four printed words still lacks **one bit of universal capacity** for this particular R; the specific observed k4 source rank happens to be 2,048 bits and can itself be represented in 256 bytes, so that latter strict whole-fiber statement must not be misreported as forbidding *every* special-case encoding of the observed source. Five-word grouping needs **2,044 bits**, leaving four table bits to spare for the observed R; an eight-word block drops to 2,042. Five is merely the **first in the declared contiguous uniform grouping family** with capacity for the observed R. The five dots and five red products elsewhere in the manuscript are an appealing but **unvalidated** possible motivation, not evidence for this decoder: the threshold depends on source digit values, grouping origin and the hypothesis of a Latin26 remainder.

Under k1, the original m-fiber sizes are exactly **866 words with m=1, 1,749 with m=2, 247 with m=3, 32 with m=4, and two with m=5**. The 2,030 ambiguous printed words cannot be encoded as independently selected fixed-width 2,048-bit quotient fields. The k1 fixed-width Latin starts `GWFKJNTO YQPLP DIDO AND EDE CSEHGOIXGWE`; `AND` is a coincidental word, not a coherent passage. All tested k1/k2/k3/k4/k5/k8 variants produce near-uniform Latin26 symbols, with no source-native plaintext over the original passage or independent chapters. The original k5 register opens `NATGIYGTEUYTSLCETQDWAPC`, without English continuation.

The **canonical k4** quotient rank begins (256-byte big endian) `9D 2D 68 86 25 EB 11 B7`; canonical **k5** `04 62 95 C0 28 22 F8 9C`. The original printed conventional-base60 table begins `CB E7 A7 BA 61 ED 7E B7`, so neither exact canonical rank equals that literal source table. These are fixed direct byte comparisons only; there is no additional arbitrary permutation scan. A different table encipherment would require independent first-party instructions.

## Full-length positive and reproducibility

The [Windows Node.js 22 standalone test](../sims/lp2_wordblock_gp29_latin26_quotient_capacity_original_sft.cjs) reproduces all source numbers and exact mixed-radix roundtrips using the checked original printed-word parser `sims/lp2_word_pages.cjs`. It also selects actual Shakespeare words **of exactly the same lengths as every one of the 2,896 printed source words**. It encodes these **12,956 genuine Latin26 letters** using legal, **nonzero** blockwise quotient choices where possible and exactly decodes the rank and every native Latin letter while reconstructing the actual synthetic GP29 tape. This is an independent full-register plant, not a native-language fit to the original ciphertext. [Successful Windows/Node22 Actions #45023400299](https://github.com/FlareZ123/liber-primus/actions/runs/45023400299).

## Next actual decision

A wordwise/paired-word **quotient-only sidecar** is insufficient at a uniform 2,048-bit fixed source table for the observed original Latin26 remainder fiber; regrouping five words removes the *information-capacity* obstruction **but does not yield native plaintext or a historical opcode**. The sidecar cannot change the Latin26 remainder produced by each frozen source block. The useful next question is an independently source-selected *symbol-changing* operation that couples blocks, mixes quotient and remainder, or specifies a non-Latin alphabet, with a substantial original plaintext prediction. Agent47, currently working the distinct two-word nonlinear mixer in Director #2265, was sent the exact bound in [communication](../communications/agent47/20261122T1236Z_agent34_wordwise_quotient_sidecar_capacity.md). No wider secret-key search is justified by this observation alone.
