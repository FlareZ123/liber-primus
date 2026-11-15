# Terminal 256 runes versus the 256-byte table: independent solved-p56 arithmetic bridge

**Original-cipher finding, 15 November 2026, Agent 38. Status: concrete cross-artifact congruence, candidate checksum; no recovered unknown plaintext, cipher key or final destination.** [Read-only Node.js 22 / Windows CJS reproducer](../sims/lp2_terminal256_solved56_grid_gcd_sft.cjs).

## The source-selected decision

The original LP2 numerical table, physical pages 49–51, has exactly **256** two-character source cells, printed in **32 rows of eight**. Its conventional row-major base60 reading supplies 256 bytes. The original final three physical rune pages contain exactly **76 + 85 + 95 = 256** glyphs. Physical p55 is unsolved; p56 is **independently and authentically deciphered** by the prime-totient shift with one literal unencrypted F at local offset 56; p57 is originally cleartext. The original p57 language about shedding circumferences provides a preexisting conceptual connection to the table geometry, though no authorial source instructs the arithmetic test below.

The **new finite question** is whether the entire base-29 terminal integer has a common factor with the table's original base-256 integer, and whether replacing *only the genuinely known p56 ciphertext* by its solved plaintext changes that relationship. This involves one externally known decoder, no fitted p55 rune, and no new language-dependent key.

Define the table's row-major byte integer

\[
N=\sum_{i=0}^{255} B_i\,256^{255-i}.
\]

The unchanged 256-byte source has SHA-256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290** and exact 2,048-bit width. For the terminal base29 reading, use the canonical **zero-based GP29 indices** (0–28) in printed page order. Define two 256-rune integers:

- `T_C`: original **p55 ciphertext (76)**, original **p56 ciphertext (85)**, original **p57 clear runes (95)**.
- `T_P`: the **same 76 source p55 ciphertext runes**, followed by **the 85 known p56 plaintext runes** and the same **95 p57 clear runes**.

P56's exact known transform is `P56[i]=(C56[i]−(prime[clock]−1)) mod29`, with zero-based prime clock starting at prime2; `C56[56]=F=0` is literal and does not advance the prime clock. The resulting authentic GP spelling begins `ANENDWITHINTHEDEEPWEBTHEREEXISTS`. For each terminal variant, evaluate its full 256-digit radix29 numeral and its **exact Euclidean GCD with N**.

## Exact original-source result

| Independently defined terminal interpretation | GCD with original 256-byte N | Remainder modulo 3,024 |
| --- | ---: | ---: |
| **T_C:** original unsolved+encrypted+clear page sequence | **4** | **1,756** |
| **T_P:** same stream, only authentically solved p56 substituted | **3,024** | **0** |

The observed **3,024 = 2⁴ × 3³ × 7** is an exact divisor of the original table integer. Indeed the independently established canonical original table factorization is

\[
N=2^4\cdot3^3\cdot7\cdot13\cdot29\cdot179^2\cdot Q,
\]

with `Q` a 2,013-bit composite. Hence `gcd(N,T_P)=3024` draws a precise nontrivial factor from the source table, whereas the unchanged terminal ciphertext's GCD is only four. No characters on unknown p55 are guessed, replaced or omitted.

The **important restriction** is the deliberately hybrid terminal register: the 76 positions of p55 remain **ciphertext**, p56 alone is true **plaintext**, and p57 is clear. There is no first-party evidence prescribing such a hybrid 256-digit base29 integer. This result therefore establishes a mathematical relation, not an authenticated checksum protocol or plaintext.

## The exact conditional p55 residue certificate

The GCD result supplies a particularly compact, original-source **candidate** for a future p55 checksum:

- The table-selected divisor is `m=3,024`.
- The GP29 radix has exact multiplicative order **36** modulo m: `29^36 ≡ 1 (mod 3024)`.
- The independently known p56+p57 suffix contains **180 = 5×36** runes. Thus `29^180 ≡ 1 (mod 3024)`, and the terminal base29 integer `T_P = A×29^180 + B` obeys `T_P ≡ A+B (mod3024)`.
- The 76-rune **p55 ciphertext** integer `A` has exact residue **64** modulo3024.
- The 180-rune **authentic p56 plaintext + p57 clear** integer `B` has exact residue **2,960** modulo3024, equal to `−64`.

The two terminal components each share the table's factor **16 separately**: `gcd(N,A)=16` and `gcd(N,B)=16`. Assembled, their sum gains the extra factor `3³×7=189`, giving `gcd(N,T_P)=3024`. Modulo 189, the two residues are 64 and 125, whose sum is 189. The perfect-cube expressions `64=4³` and `125=5³` are consequences of those already selected residues, **not independent evidence of a cube-based instruction**.

Hence `(64+2960) mod3024 = 0` gives the full 256-rune congruence independently of the two giant terminal-integer magnitudes. This is an executable **12-bit-class necessary condition** *if* a first-party source eventually selects such a modular check. It can score a proposed p55 decoder by computing its plaintext integer `A'` and asking whether `A' mod3024=64`.

**Limit:** the printed unsolved p55 *ciphertext already satisfies the residue*, before any decryption. The condition therefore cannot identify even one p55 plaintext rune on its own, and using it to filter unrelated cipher candidates assumes the very checksum rule we are trying to establish. Neither `m=3024`, its order36, nor the special residue64 is an authenticated Cicada instruction.

## Can this relationship independently select the genuine p56 key?

The exact same source procedure was applied to **2,032 frozen alternative p56 prime-totient decoders**, using first-prime indices **0–1,015** (1,016 shifts) and either additive sign, always keeping the authentic visible F bypass at local56 and leaving the p55 ciphertext and p57 clear material unchanged.

- The authentic **first-prime index 0, subtraction** candidate has GCD **3,024**, ranking **8th of 2,032** by GCD magnitude.
- Exactly **two** of these 2,032 generated terminal integers are divisible by **3,024**: the genuine start index **0** / subtraction, and start index **621** / subtraction. This is an exact within-family count.
- The maximum alternative GCD is **8,592** (start index **531**, subtraction). This is larger than the authentic one, with visibly nonlinguistic decoded p56 text. Other alternatives therefore imitate or exceed the numerical relationship.
- The original terminal ciphertext register has GCD **4**, without any alternative decoder.

The authentic decoder's numerical rank, **8/2,032**, is a useful discrimination within that *particular fixed family*. The family, selection of GCD, the 3,024 threshold, the mixed source register and the numeric serialization were all chosen in a long-running exploratory project. **The empirical rank is not a discovery-adjusted p-value and does not establish an intentional relation.** In particular, 3,024 was inspected after the source factorization and after knowing the genuine p56 result, while the arbitrary decoder family includes many implausible prime clocks.

## Cryptanalytic consequence

The authentic solved-page transform gives a **new exact, checkable terminal-number congruence** potentially useful if an independently visible instruction ever specifies a table-to-terminal **GCD/modular-checksum consumer**. It could then constrain a p55 decoder without introducing new secret numeric parameters. At present it imposes only a 3,024-residue condition on a 76-rune unknown page, and the printed p55 ciphertext *already* satisfies that condition in the hybrid sequence. **It does not recover a single previously unknown p55 rune.**

The next useful decision is an **independent author-source selection of the actual operation** and whether the terminal numeral should include p55 plaintext rather than ciphertext. Repeating 2,032 phases, changing the radix, fitting a new divisor, or asserting “GCD = 3,024 proves the puzzle” would mistake an intermediate result for decryption.

**Executed on the unchanged original-source GitHub repository:** the dedicated manual Node.js 22 job [run 43766874567](https://github.com/FlareZ123/liber-primus/actions/runs/43766874567) completed **successfully**, including every listed assertion. This executes the actual checked-in reproducer rather than only repeating an independent in-tool calculation.

The complete reproducible CJS script asserts original table SHA-256 and all three exact page lengths; recomputes p56 from the historical prime-totient rule; checks `gcd(N,T_C)=4`, `gcd(N,T_P)=3024`, both remainders, all 2,032 alternatives, exact two 3,024-divisible candidates, and the authentic eighth-place rank. It does not write a file, consult an external language model, or require a secret key.
