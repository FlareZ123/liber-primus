# 2013 missing-prime telnet segment and the 180-slot LP2 interior

**Status: source-motivated cross-round candidate; no unknown plaintext, key, or cipher mechanism.** The concrete integer sequence is identifiable independently of LP2, but no original instruction assigns it a byte/key operation. See the executable original-data test at [`sims/lp2_telnet_missing180_source_sft.cjs`](../sims/lp2_telnet_missing180_source_sft.cjs).

## Visible pre-LP2 input

Historical transcriptions of the **2013 Cicada telnet `primes` command** show a discontinuity from **71** directly to **1229**, with no intervening prime values. Both [neuroretransmit's 2013 first-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) and [scream314's archived unused hints](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) preserve that gap. The same 2013 telnet `hint` channel reportedly provided “You can't see the forest when you're looking at the trees” ([historical walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282013%29)). The authenticity and original implementation rationale for the `primes` discontinuity are unknown; this report relies on the historical transcript, not a captured live Tor session.

71 is the **20th prime** and 1229 the **201st**, so the exact missing sequence is the **180 primes with 1-based indices 21–200**, starting **73, 79, 83** and ending **1213, 1217, 1223**. The first 20 primes are the first 20 Gematria Primus weights, and the missing segment begins with the nine remaining GP29 weights. This offers a player-visible candidate key source with unambiguous values and order, distinct from guessing a keyphrase.

## Exact subsequent source relationships

- The authentic LP2 **32×8 numeric table** has a **76-cell outer border and 30×6=180-cell interior**, in original row-major layout. Its border and interior correspond by length to terminal physical p55 (**76 unknown runes**) and solved pp56+57 (**85+95=180 runes**). This pre-existing source geometry led to the present cross-round comparison; the fact that both use 180 does not establish a cipher.
- Original LP2 **p32** has an 11×11 runic tree-page matrix. Its **top-left GP-prime value is 73**, the first missing 2013 prime; its top-row and left-column prime sums are **563** and **569**. Those numbers are the consecutive **103rd and 104th primes**, both present in the 2013 omission, and the independently archived signed **2016 tree JPEG dimensions**. Four LP2 pages (3, 4, 17, 32) begin with GP weight 73, so this anchor is not unique absent the independent illustration-selection of p32.
- The 2013 forest/trees wording supplies a potential human-visible contextual cue to look at the later tree page. It does not prescribe a cipher, traversal or key schedule. Several arithmetic correspondences were noticed after the LP2 dimensions were known.

## Historically prescribed prime reversal and arbitrary-secret lookup bounds

The [original 2013 telnet numerical command](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt) reversed the decimal digits of a prime input and then factored the reversed integer. Applying that operation to the missing interval gives source-fixed reversals **73→37, 79→97, 83→38, 89→98**. The 180 reversed integers are all distinct. Their direct byte residues match **0/180** of the original table interior.

A stronger exact, key-independent test grants a secret arbitrary stationary mapping from each public prime residue to an output table byte. At repeated input residues, a stationary function must emit identical outputs. The optimum possible match count is the sum of the highest observed byte frequency for every residue, independent of the secret function.

| Source-residue input | Residues | Maximum matches | Forced mismatches |
| --- | ---: | ---: | ---: |
| `prime mod256` | 109 | 110/180 | 70 |
| `prime mod29` | 28 | 29/180 | 151 |
| `reverse_digits(prime) mod256` | 141 | 141/180 | 39 |
| `reverse_digits(prime) mod29` | 29 | 30/180 | 150 |

Thus none of these four fixed-order direct lookup families can explain the 180 authentic table interior bytes, however the secret lookup is chosen. Nonstationary state and source-prescribed permutations remain untested. The telnet reverse operation is source-documented; its use on omitted values as an LP2 key is hypothetical.

## Frozen minimal original-input decision

Using the **original 180 inner table bytes** in forward row-major order against the **ascending omitted primes** gives only **1/180** byte agreements for `prime mod256`, **4/180** for `(prime−1) mod256`, and **3/180** for `prime mod29`. Comparing the original 180 terminal ciphertext indices to `(prime−1) mod29` gives **5/180**. Decrypting original p56 with missing-prime totient shifts and the authentic fixed literal-F at rune 56 recovers **5/85** known plaintext runes; using the established p1-starting sequence recovers **85/85**. This rules out a naive missing-prime replacement for the documented p56 totient key. The tests were selected from the obvious source-index mappings and do not cover independently specified permutations, source-key derivations, or other original registers.

**Most useful next decision:** find an original 2013/2014 instruction that uniquely transforms these 180 source-ordered primes into either the table interior or a reproducible LP2 position/state schedule. Freeze the mapping independently of the ciphertext result and demand a held-out original plaintext interval, with full lossless inverse. Without that missing operation, retire the correspondence as an unproven source lead rather than scanning unconstrained pad variations.

The project still has **no recovered plaintext on LP2 pp0–55**.
