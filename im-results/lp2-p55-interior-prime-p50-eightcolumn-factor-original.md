# Original p55 interior prime → p50 eight-column direct factor gate

## Cryptanalytic decision

The 206-bit prime recovered conditionally from the 43 strict interiors of the original p55 words **does not divide any of the eight actual 32-byte columns** of the original p49–51 32×8 table, whether the printed tokens use source-credible radix 60 or the independently discussed radix 59, or either natural byte endianness. This eliminates the most direct columnwise RSA-factor receiver for this numerical candidate. It does not establish a P55 plaintext, prove the original p55 word split was intended, or exclude keyed/nonlinear transforms of the table.

## Why these two artifacts were paired

The solved LP2 parable says to shed circumferences and find divinity within. A *conditional* interpretation strips the first and last rune of each complete printed p55 word, excluding the p54→p55 carried-in singleton. The surviving **43 original GP29 digit values** concatenate to a BASE29 integer **510043531279477768552291351270111060625364732293226050492113768 = 8×P**. The cofactor **P=63755441409934721069036418908763882578170591536653256311514221** is an independently certified 206-bit prime (see [original 2048-bit whole-panel factor test](../sims/lp2_p55_prime_p50_2048bit_factor_original_sft.cjs)).

The adjacent original p49–51 table visibly contains **32 rows and eight columns** of two-character, byte-valued base60-looking tokens. A 32-byte column is exactly 256 bits, so a 206-bit prime factor could, in principle, divide a column interpreted as an integer without choosing an arbitrary substring or offset. This is a narrower, distinct object from the previously tested complete 2048-bit table.

The factor link itself is exploratory: neither the illustration nor the solved text explicitly commands RSA, directs P to this table, or identifies a target column.

## Original-input test and result

For each original column (1–8), and each radix (59 without `f`, 60 with `f`) and byte endianness (big/little), pack the 32 printed values as an unsigned 256-bit integer `N`, then compute exact Euclidean `gcd(P,N)`. **All 32 resulting gcds equal one**, with every remainder nonzero. The test is key-independent and decisive for the fixed direct-factor claim.

The [source-rebuilding CommonJS single-file test](../sims/lp2_p55_prime_p50_eightcolumn_factor_original_sft.cjs) rederives P from the 76 original p55 rune indices and the actual 17 printed word lengths, checks all 256 source table cells, preserves the correct distinct alphabets for both radices, and prints all 32 exact remainders. It also packs and unpacks a planted 255-bit composite `P × (2^48 + 37)`, asserting that the same receiver correctly recovers P as a factor. The original calculation was independently executed against the same GitHub data through an exact BigInt implementation during this invocation: **0/32 direct hits**, synthetic factor gate positive.

## What remains

The original p55 phrase, its word boundaries and the source table do not currently select RSA, a composite construction, or an individual column. This bounded negative prevents promoting the attractive 8×P coincidence into a recoverable p50 private key. An authentic additional authored operation would be required to justify testing a different receiver. The manuscript still has no authenticated new plaintext from this route.
