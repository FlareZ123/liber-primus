# 2013 telnet prime gap and spacing: LP2's 180-cell interior and 225 red runes

**Status: exact source-geometry correspondences and bounded all-secret direct tests; no unknown plaintext, authentic key, or cipher mechanism.** The integer sequences are independently identifiable, although the historical transcript is a secondary witness and no authenticated LP2 instruction chooses a mapping. The historical gap and baseline tests are reproducible in [`sims/lp2_telnet_missing180_source_sft.cjs`](../sims/lp2_telnet_missing180_source_sft.cjs); the 8-orientation interior test is [`sims/telnet2013_missing180_grid_interior_sft.cjs`](../sims/telnet2013_missing180_grid_interior_sft.cjs). A separate new [all-secret 225-red-rune prime-pair gate](../sims/telnet2013_spaced450_red225_affine_sft.cjs) uses the transcript's other visible anomaly, two surplus spaces.

## Visible pre-LP2 input

Historical transcriptions of the **2013 Cicada telnet `primes` command** show a discontinuity from **71** directly to **1229**, with no intervening prime values. Both [neuroretransmit's 2013 first-onion walkthrough](https://github.com/neuroretransmit/cicada/blob/main/2013/004-first-onion/README.md) and [scream314's archived unused hints](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) preserve that gap. The same 2013 telnet `hint` channel reportedly provided “You can't see the forest when you're looking at the trees” ([historical walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_1_%282013%29)). The authenticity and original implementation rationale for the `primes` discontinuity are unknown; this report relies on the historical transcript, not a captured live Tor session.

71 is the **20th prime** and 1229 the **201st**, so the exact missing sequence is the **180 primes with 1-based indices 21–200**, starting **73, 79, 83** and ending **1213, 1217, 1223**. The first 20 primes are the first 20 Gematria Primus weights, and the missing segment begins with the nine remaining GP29 weights. This offers a player-visible candidate key source with unambiguous values and order, distinct from guessing a keyphrase.

## Exact subsequent source relationships

- The authentic LP2 **32×8 numeric table** has a **76-cell outer border and 30×6=180-cell interior**, in original row-major layout. Its border and interior correspond by length to terminal physical p55 (**76 unknown runes**) and solved pp56+57 (**85+95=180 runes**). This pre-existing source geometry led to the present cross-round comparison; the fact that both use 180 does not establish a cipher.
- Original LP2 **p32** has an 11×11 runic tree-page matrix. Its **top-left GP-prime value is 73**, the first missing 2013 prime; its top-row and left-column prime sums are **563** and **569**. Those numbers are the consecutive **103rd and 104th primes**, both present in the 2013 omission, and the independently archived signed **2016 tree JPEG dimensions**. Four LP2 pages (3, 4, 17, 32) begin with GP weight 73, so this anchor is not unique absent the independent illustration-selection of p32.
- The 2013 forest/trees wording supplies a potential human-visible contextual cue to look at the later tree page. It does not prescribe a cipher, traversal or key schedule. Several arithmetic correspondences were noticed after the LP2 dimensions were known.

## Source-spaced 450 primes versus the complete 225 red runes

The same [archived 2013 telnet transcript](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md) visibly has two surplus spacing characters at **29 | 31** and **3257 | 3259**, ordinary prime-index boundaries **p10 | p11** and **p460 | p461**. The underlying inclusive interval **p11..p460** consists of **450 primes** (31 to 3257); **180** of them are the already described p21..p200 omitted interval and **270** actually appear between the spaces in the secondary transcript. Reading the later original LP2 colour annotations in physical page and rune order, including both solved pages, gives exactly **225 red runes**. Hence the observed source-number equality **450 = 2 × 225**. It is a precise count correspondence, **not** authentication of the extra spaces as authored, a known cryptogram, or instructions to reconstruct the omitted 180 values and pair the result.

A falsifiable first operation uses the obvious two-prime-to-one-rune pairing. It also includes the **2013 telnet command's historically specified decimal-digit reversal of each prime**, checked as a second source-fixed input representation. For adjacent underlying primes `(u_i,v_i)=(p_(11+2i),p_(12+2i))`, suppose the original red rune `r_i` is a stationary function of their **affine GP29 combination**:

```text
r_i = f( (a * u_i + b * v_i) mod 29 )
a,b in F_29; f is ANY fixed map F_29 -> the 29 rune labels
```

Unlike an ordinary key search, the [exact SFT](../sims/telnet2013_spaced450_red225_affine_sft.cjs) checks **all 29² = 841** choices of a,b and **analytically maximizes over every possible f** by taking the most frequent observed rune in each of the 29 input classes. The optimized f may be many-to-one, so it strictly contains any unknown stationary rune permutation or affine output shift. The SFT includes all four forward/backward directions of the original red sequence and the reconstructed prime interval, with no offset, rotation or page-local rekeying.

| Red runes | Prime interval | Most matches possible / 225 | Forced mismatches |
| --- | --- | ---: | ---: |
| Printed | Ascending p11..p460 | **55** | **170** |
| Printed | Descending | **53** | **172** |
| Reversed | Ascending | **53** | **172** |
| Reversed | Descending | **55** | **170** |

Applying the **documented telnet decimal-prime reversal** before the same exact all-secret scan gives **53, 52, 52, 53 matches /225**, respectively, for those same four orientation rows, forcing at least **172 mismatches**. The expanded total is **8 × 841** source-mode/coefficient combinations, optimizing over all stationary output functions in each combination. This revises the finite no-go's scope to include the source-native prime reversal as well as ordinary primes, without testing a new fitted cipher or claiming the spaces were intentional.

A separate source-length synthetic plant under a hidden affine pair rule and a secret stationary output permutation achieves **225/225** when scanned by the exact same optimizer. The original failed family is therefore an **all-secret, key-independent no-go for a directly paired stationary affine GP29 red-rune reading**. Position-dependent encodings, unusual pairing orders, hidden keys, interpretations outside F29 or an entirely different role for the displayed spaces are untouched. The exact values and control were independently run in [successful manual CI 42958485548](https://github.com/FlareZ123/liber-primus/actions/runs/42958485548) and the expanded decimal-reversal branch was confirmed in [successful CI 42960133759](https://github.com/FlareZ123/liber-primus/actions/runs/42960133759), using the existing [2013 prime-gap manual workflow](../.github/workflows/telnet2013-gap-key-manual.yml), opt-in `attack=red225`. There is no new plaintext or solved page.

## Historically prescribed prime reversal and arbitrary-secret lookup bounds

The [original 2013 telnet numerical command](https://uncovering-cicada.fandom.com/wiki/The_Telnet_Prompt) reversed the decimal digits of a prime input and then factored the reversed integer. Applying that operation to the missing interval gives source-fixed reversals **73→37, 79→97, 83→38, 89→98**. The 180 reversed integers are all distinct. Their direct byte residues match **0/180** of the original table interior.

A stronger exact, key-independent test grants a secret arbitrary stationary mapping from each public prime residue to an output table byte. At repeated input residues, a stationary function must emit identical outputs. The optimum possible match count is the sum of the highest observed byte frequency for every residue, independent of the secret function.

| Source-residue input | Residues | Maximum matches | Forced mismatches |
| --- | ---: | ---: | ---: |
| `prime mod256` | 109 | 110/180 | 70 |
| `prime mod29` | 28 | 29/180 | 151 |
| `reverse_digits(prime) mod256` | 141 | 141/180 | 39 |
| `reverse_digits(prime) mod29` | 29 | 30/180 | 150 |

These originally reported bounds use **forward row-major** table order. The stronger original-input question now also exhausts the 8 geometrically natural readings of the *same* 30×6 interior: horizontal/vertical flips and row-/column-major traversal, for both unchanged primes and the documented reversed-decimal numbers. Each model still grants an arbitrary, possibly non-bijective secret stationary lookup, so its best possible agreement is exact:

| Input values | Modulus 29: minimum wrong /180 | Modulus 60: minimum wrong /180 | Modulus 256: minimum wrong /180 |
| --- | ---: | ---: | ---: |
| Original 180 missing primes | **132** | **148** | **69** |
| Telnet-reversed decimal primes | **135** | **135** | **38** |

These are best-case errors over all eight orientations, with a separate synthetic stationary-lookup positive control recovering every planted output. The decimal-reversal operation is explicitly source-native, whereas applying it to omitted-prime values as an LP2 instruction remains hypothetical. Reproducer: [8-orientation source-gate SFT](../sims/telnet2013_missing180_grid_interior_sft.cjs), extension [commit 30c0dcf4](https://github.com/FlareZ123/liber-primus/commit/30c0dcf457770aa02559a77c15e70ba44165a3b3).

Thus **none of the direct stationary input-residue lookup families** explains the interior table under the eight elementary rectangle readings, however its secret mapping is chosen. This strengthens the previously reported single-order negative without assuming a secret key; nonlinear position-dependent state, independently prescribed rearrangements and unrelated uses remain untested. The archived historical telnet transcript is a secondary witness.

## Frozen minimal original-input decision

Using the **original 180 inner table bytes** in forward row-major order against the **ascending omitted primes** gives only **1/180** byte agreements for `prime mod256`, **4/180** for `(prime−1) mod256`, and **3/180** for `prime mod29`. Comparing the original 180 terminal ciphertext indices to `(prime−1) mod29` gives **5/180**. Decrypting original p56 with missing-prime totient shifts and the authentic fixed literal-F at rune 56 recovers **5/85** known plaintext runes; using the established p1-starting sequence recovers **85/85**. This rules out a naive missing-prime replacement for the documented p56 totient key. The tests were selected from the obvious source-index mappings and do not cover independently specified permutations, source-key derivations, or other original registers.

**Most useful next decision:** find an original 2013/2014 instruction that uniquely transforms these 180 source-ordered primes into either the table interior or a reproducible LP2 position/state schedule. Freeze the mapping independently of the ciphertext result and demand a held-out original plaintext interval, with full lossless inverse. Without that missing operation, retire the correspondence as an unproven source lead rather than scanning unconstrained pad variations.

The project still has **no recovered plaintext on LP2 pp0–55**.
