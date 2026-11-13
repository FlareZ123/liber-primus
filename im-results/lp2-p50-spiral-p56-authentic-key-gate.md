# Original p15 spiral × p50 table → solved p56 prime-key: exact rejection

**Agent17, 13 November 2026.** This is a *source-constrained negative* for one natural numerical-table consumer, and recovers **no previously unknown Liber Primus plaintext, key, or Tor destination**. The [standalone CJS SFT](../sims/lp2_spiral_table_p56_authentic_key_sft.cjs) takes the exact source table and canonical runes.

## Proposed human solve path and the gate that matters

Physical LP2 p15 prints a Fibonacci-indexed **spiral**. Physical pp49–51 print one **32×8** sexagesimal table. The solved p57 says to “shed our own circumferences”; peeling that exact rectangle clockwise produces four rings of **76, 68, 60 and 52** cells. The final three physical pages hold precisely **76 + 85 + 95 = 256** runes: unknown p55 and independently solved p56/p57. This motivates asking whether the table's spiral ordering can provide the same per-rune key stream that actually decrypts p56. It does not authenticate such a transfer; the spiral, table, final page grouping and p57 text may be unrelated. Both p15's spiral and the p57 wording are independent source-visible reasons to test one traversal, unlike a freely searched table permutation.

The discriminant uses **the actual known p56 cryptographic shifts**, rather than relying only on whether p55 looks English. The source-attested p56 algorithm subtracts `φ(p_n)=p_n−1 (mod29)` for successive primes, with exactly **one nonconsuming literal F at p56 offset56**. It yields 84 consumed prime shifts and one zero-shift site across **85 original ciphertext runes**, independently recovering the expected opening **ANENDWITHIN**. This is a stronger calibration than the 95 p57 clear-text runes, which do *not* have that same ciphertext→plaintext role.

Take the full one-cell clockwise spiral, top-left outward ring first, continuing inward through all four rings. Assign its first 76 tokens to p55 and its next 85 to p56. Under the repository's published base60 reading, reduce each respective table byte modulo29 and compare against the entire known authentic p56 shift schedule. As alternative source controls, test exact reverse spiral and original row-major traversal; repeat with a base59 alphabet omitting F. **No phase, subset or row rotation is optimized.**

## Exact original-input outcome

| Numeric interpretation / traversal | Direct correct shifts /85 | Best arbitrary stationary byte→required-key fit /85 | Forced mismatches |
|---|---:|---:|---:|
| Base60 clockwise spiral | **4** | **75** | **10** |
| Base60 reversed spiral | 3 | 73 | 12 |
| Base60 printed row-major | 3 | 71 | 14 |
| Base59 clockwise spiral | 1 | 75 | 10 |
| Base59 reversed spiral | 4 | 73 | 12 |
| Base59 printed row-major | 6 | 71 | 14 |

For perspective, matching independent GP29 residues by chance would produce about **2.93/85** positions. The base60 clockwise direct inverse of original p56 has GP29 IoC **0.03501400560**, while the authenticated prime-totient inverse yields real p56 text. The direct spiral match count cannot substitute for a recovered passage.

The **all-secret fixed-lookup obstruction** is decisive for this specified operation. For each exact source byte `b` in the 85-cell p56 spiral segment, grant an arbitrary, unknown GP29 output `f(b)`. Repeated occurrences of `b` must still emit the same required key residue. Some original table bytes recur where the authenticated key residues differ. Summing the most frequent required key for every distinct input byte proves the *maximum* possible fit of **75/85**, even with the best secret choice of every output value. The base60 clockwise p56 segment has only **74 distinct input values** among 85, and forces **at least 10** wrong key positions. Neither a different one-to-one base59/base60 token interpretation nor a secret stationary mapping can repair these equality contradictions.

The SFT asserts all 256 original table positions, the four ring lengths, page lengths 76/85/95, the p56 literal-F exception and known plaintext opening, all six original direct-shift counts and all-secret ceilings. A positive source-native plant defines a real fixed byte→rune key on **the same original spiral cells**, encrypts the authentic p56 plaintext and recovers all **85/85** runes with exact forward reencryption. Thus the obstruction concerns the *original* key and printed table, not an inability of the algorithm to recognize a valid map.

## Decision

**Reject a simple spiral-table decoder that derives the authentic p56 prime-key schedule through GP29 byte residues or any stationary byte→29 mapping.** The exterior 76↔p55 geometry remains a physical size observation, but cannot supply the known neighbouring page's 85 shifts under this direct handoff. This does **not** exclude separately keyed stateful transforms, independent encodings per ring, an alternative relation to p55, or hidden external key material. No further spiral phase-search or arbitrary exception-mask fitting is justified without an original instruction supplying the missing state/update rule. Existing [perimeter-to-p55 gates](lp2-p50-76-perimeter-180-interior-source-partition.md) remain independent and unchanged.

Reproducer: [`sims/lp2_spiral_table_p56_authentic_key_sft.cjs`](../sims/lp2_spiral_table_p56_authentic_key_sft.cjs). **Original-source execution passed** on Windows Node.js 22 with the exact positive plant ([GitHub Actions run 43450860537](https://github.com/FlareZ123/liber-primus/actions/runs/43450860537)). Execute using Node.js 22 from the repository root.