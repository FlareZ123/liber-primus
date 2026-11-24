# Block-progressive p15 geometric route + authentic prime clock (#2647)

The source-fixed p15 spiral is a real decoded arithmetic grid; it does not by itself instruct block progression. Test the single conjectural route from #2647: plaintext first encrypted by the authentic p56 consecutive prime-minus-one additive clock with literal F hold, then written along the same 4×4 spiral rotated by b mod16 for block b. Origin is the only unknown, 0–3301 inclusive. Exact forward order: C[16b + route[(b+j) mod16]] = inner[16b+j]; absent slots filtered in partial final blocks. No alternative direction, phase, sign or reset. Source route [5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]; full authentic p56 replay 85/85. The 1,744-rune p16–22 receiver is separate from the earlier fixed-spiral gate on p15-offset20–p22 and earlier prime-stream-order/Josephus tests.

## Original decision

0/3302 origins reach the block-aligned training cut 864; 0/3302 reach the full 1744-rune receiver. Longest legal prefix 657, origins 1477. No original prefix survivor to freeze; do not rank failed origins or inspect suffix language. Exact reachability accounts for every possible literal-F branch. Outer permutation is invertible; the empty inner frontier is independent of language and therefore order-sensitive.

## Constructive native controls

Training language prior excludes all four native donor sections. Three independently rekeyed native windows are written through the progressive geometry, then inverted; select the prime origin on only the first 864 plaintext-order ciphertext runes, freeze it, and score the withheld 880 runes. Exact original and planted geometric roundtrip, full re-encryption of each decoded control, and partial-block toy replay are asserted. Wrong-geometry baseline is the static spiral on the same planted outer ciphertext.

| True origin | Chosen origin | Prefix survivors | Full survivors | Runes recovered | Withheld | Static wrong-route full survivors |
|---:|---:|---:|---:|---:|---:|---:|
| 89 | 89 | 6 | 3 | 1744/1744 | 880/880 | 0 |
| 761 | 761 | 1 | 1 | 1740/1744 | 880/880 | 0 |
| 2909 | 2909 | 2 | 2 | 1744/1744 | 880/880 | 0 |

The controls use overlapping native donor windows (not three independent text corpora); the origins are independently fixed. Withheld plaintext paths may use observed suffix ciphertext to disambiguate F; the origin alone is prefix-frozen. This demonstrates key selection and original-order-sensitive rejection under the tested architecture, not authentication of the source's intended receiver. Retire this single progressive composition in the specified origin range; no unknown LP2 plaintext or authentic key recovered.

[CommonJS reproducer](../sims/lp2_p15_progressive_spiral_prime_sft.cjs) · [Exact output](lp2-p15-progressive-spiral-prime.json). Executed in connected V8, no Windows CI claimed.
