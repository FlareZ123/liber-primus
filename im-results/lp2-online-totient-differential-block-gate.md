# Online totient differential-block framing — exact original rejection (#3159)

## Hypothesis and decision

LP1 p5 names primes and totients, and the actual rune alphabet assigns each GP29 coordinate its prime. I proposed (not an authenticated instruction) the causal block length L(next)=phi(GPprime(C(last consumed)))=GPprime(C(last consumed))-1. At the first consume in a block allow an entirely arbitrary secret additive IV; subsequent consuming symbols obey C_i=C_prev+P_i mod29. Literal plaintext F emits zero without updating block state, clock, or prior ciphertext. This is length preserving, has a fixed-key inverse once the IVs and hold mask are given, and independently determines each following block length from the transmitted symbols. Equal consuming ciphertexts inside a block require P_i=0 and so are impossible. This is specifically a differential-block construction, not a test of arbitrary Hill or block permutations.

Use state (remaining consumes, last consumed ciphertext); on zero branch hold as well as consume; if inside a block the consume transition requires x != last; if at a block start all ciphertext values are permitted by an independent unrestricted IV. The full last block may be truncated. No dictionary, key fitting, page reset, or score is used. A stronger relaxation grants each chapter any initial length 1..108, retaining its internal physical carries. Every chapter is impossible even under this relaxation.

|Pages|Runes|Adjacent repeats|Fixed origin first dead offset|All 108 initial lengths first dead offset|
|---|---:|---:|---:|---:|
|0–2|729|4|122|456|
|3–7|1145|6|53|180|
|8–14|1729|9|107|142|
|15–22|1903|10|249|1004|
|23–26|1021|11|128|265|
|27–32|1433|13|15|84|
|33–39|1680|12|152|182|
|40–53|3008|18|526|526|
|54–55|308|3|20|156|

Offsets are zero-based within the chapter. Counts total 86 adjacent repeats. This consumes the corrected corpus with physical page concatenation (including empty p50); no extra reset at page boundaries.

## Controls

16 native 729-rune Gibran/Shakespeare plants, fresh independent arbitrary block IV digits, literal F hold. All 16 forward/inverse replays recover the entire original plant with its true IVs and holds, and all 16 are accepted by the exact path gate. Wrong-schedule plants use L=GPprime(C(last)) instead of phi(GPprime(C(last))) with otherwise identical machinery; 0/16 fail the stronger free-first-length gate. The held-out negative rate is descriptive only: the original contradiction is exact regardless of calibration. Reproducer: `sims/lp2_online_totient_block_gate_sft.cjs`. Computational core executed against connected source files in V8; standalone Node wrapper not executed locally.

## Scope

Retire the proposed online GP-totient differential construction. The first length is not independently selected by the source, but even granting all its possible values does not save the model. There is no authenticated variable block operator, rule for independent block IV generation, or recovered unknown plaintext. A different block transform need not obey the internal-repeat restriction; this does not rule out general ciphertext-driven lengths.
