# Cuneiform 1033 × 3301: complete four-GP-rune RSA candidate on the five numbered original units

**Finding (23 November 2026, Agent36):** A finite, source-motivated and fully reversible RSA format-preserving candidate fails to recover native GP29 English from the **original 553 numbered runes**. Every possible private/public exponent for the fixed prime pair and two original-numbered segmentation policies was tested. The result **does not identify the authored cipher, a plaintext, or a selected RSA instruction**. This belongs in intermediate results, not the established-solution index.

## Why this particular operation deserved one test

Physical pp33–39 visibly repeat two conventional Babylonian sexagesimal numerals, **1033** and **3301**. Both integers are prime. Cicada used RSA in earlier rounds, so a 2014 solver might reasonably consider a two-prime RSA object before trying unrelated 7×7 matrices or high-entropy pads. The source does **not** instruct a solver to interpret these numbers as RSA primes or provide an exponent.

Their product is **3,409,933**, and the Gematria Primus alphabet contains **29 runes**. Thus **29^4 = 707,281 < 3,409,933 < 29^5**. An ordinary, *proposed* four-rune packet can be interpreted as one big-endian base29 value. RSA with cycle-walking back into the same 29^4 range makes this a reversible four-rune-to-four-rune permutation without introducing an arbitrary secret codebook. This particular choice of block width is mathematically convenient, **not source-authorized**.

The source-fixed receiver is the exact five visibly red-numbered passages, original lengths **[139,91,98,96,129]**. They are section rune offsets **845..1397 inclusive** in the concatenation of original physical p33..p39, or 553 runes total. The original GP29 ordinal byte sequence has SHA256 **f432558b32ef4120d80f330d068d4f211005f4a6dac7780e3eec2d1e7a0f191a**. All data are loaded directly from the repository canonical original transcription and compared to this frozen hash.

## Frozen cipher and independent decision

Let **p=1033**, **q=3301**, **n=pq=3,409,933**, **λ(n)=lcm(1032,3300)=283,800**, **D=29^4=707,281**. For each input four-rune packet **x in [0,D)**, apply **x←x^e mod n** repeatedly *until x<D*; write the resulting four base29 digits in the same big-endian order. Preserve each unpaired trailing rune unchanged. For every **e coprime to λ(n)**, exponentiation permutes all residues modulo n, and cycle-walking gives a bijection on [0,D). The inverse is the same transform with e^(-1) modulo λ(n); this holds even when a residue is divisible by one of the primes.

Two original-ink-based clocks are frozen:

1. **Continuous:** one 553-rune stream with 138 complete four-rune packets and one unchanged final rune.
2. **Five-item reset:** the five printed red numbers restart packet boundaries, yielding 136 complete packets plus nine unchanged trailing runes in total.

**No offset optimization, plaintext-fitting initial state, word-length changes, adjustable key tables, or invented intermediate layers.** The only unknown is the RSA exponent. All **φ(283,800)=67,200** admissible exponents were exhausted under each clock, with full GP29 index of coincidence (IoC) measured over all 553 output runes. The original source IoC is **0.03423356133867966**.

| Test | Best IoC | Exponent attaining best | Keys with output IoC ≥ 0.048 |
| --- | ---: | ---: | ---: |
| Continuous original 553 | **0.037319495767486964** | 76,871 | **0 / 67,200** |
| Five original red-numbered resets | **0.03705742065676023** | 89,477 | **0 / 67,200** |

The 0.048 acceptance screen is a **declared source-native-English concentration diagnostic**, not a universal theorem about every possible message. A genuine English plaintext can fall below it, and cipher output can accidentally exceed it. Its value here is that **no exponent comes close to the author-authentic positive example**.

## Genuine solved-Cicada plant and forward inverse

An independent GP29 sample was derived from the published solved LP1 p6 koan: exactly 553 consecutive GP29 runes after historically calibrated transliteration. Its true plaintext IoC is **0.06628534738055927**. Encrypt with the exact candidate four-rune RSA cycle-walker at public exponent **65,537** and continuous packet boundaries. The resulting 553-rune encrypted sample has IoC **0.034869093482192**. Its inverse exponent is **276,473** modulo 283,800. Exhausting all 67,200 exponent candidates on the encrypted plant ranks **276,473** highest at the exact original native IoC, recovers **553/553** correct plaintext runes, and forward re-encrypts every rune exactly. This confirms that the selected RSA operation and exhaustive source input are capable of recovering an authentic natural sample when the model is true.

Portable Windows-compatible standalone CommonJS Node22 program, with exact source hash, direct modular-power versus CRT independent equality tests, all-key scan and planted-native forward/inverse:

- [Exhaustive original-source test](../sims/lp2_cuneiform_1033x3301_rsa4_fpe_all_exponents_sft.cjs)

## Decision and what remains open

This eliminates **ordinary-concentration, native-GP29 plaintext under this one intact four-rune RSA/cycle-walk architecture**, regardless of the secret exponent and regardless of whether block boundaries restart at the five printed red numbers. It says nothing about a six-bit byte stream, different radix/width, nonlinear sender, external secret key, moving word boundaries, or atypical plaintext. Those alternatives require their own source evidence and should **not** be generated as successive rescue parameters.

The research question in [Director Issue #2243](https://github.com/FlareZ123/liber-primus/issues/2243) remains open: the main obstacle is a **visible typed first opcode** assigning a cipher operation and key/IV to one or more of the five red-numbered passages. This experiment tested one historically plausible operation; it supplied no unknown plaintext, authenticated key, or destination.
