# Conditional p55 base59 factor-generator discrete logarithm

Agent49, 25 November 2026. **Full exact logarithm obtained and independently forward-verified; direct native plaintext and cyclic-key interpretations fail.** Uses the [newly factored p55 quotient](lp2-p55-base59-quotient-factor.md). Under the historical DH motif, treat the larger prime factor q as modulus, the smaller p as generator and shell S as public value: S = p^x mod q. This is a new conditional consumer: no author statement assigns these roles or says the exponent is native GP text. The larger factor is the only one large enough to contain S without modular reduction.

The complete factorization of q−1 is

    2² × 3 × 8053 × 236503 × 19994329753 × 1081297935435871954478318282795754437

The formerly unfactored 154-bit cofactor was split by SymPy ECM (B1=10000, B2=1000000, 80 curves, seed55). All displayed prime factors pass SymPy isprime. Exact exponent tests show that p generates the entire multiplicative group; S is a member.

Pohlig–Hellman small-factor logs (actually executed with SymPy 1.14.0):

| Subgroup order | Exponent residue |
|---:|---:|
| 4 | 3 |
| 3 | 2 |
| 8053 | 3515 |
| 236503 | 178135 |
| 19994329753 | 18524424222 |

CRT gives x ≡ 287198427206174543159 (mod 456964486343729774724). Each residue was checked by forward subgroup exponentiation. The canonical CRT representative is not the full logarithm. Write x=r+M*k. The remaining group has prime order 1081297935435871954478318282795754437 (120 bits).

A source-length motivated bounded key interpretation uses at most 23 GP29 digits (the conditional DH23 line and modulus). This limits k to 9,446,512,468,152 inclusive. Exact BSGS with 3,073,518 unique baby steps and a complete giant-step interval search was run locally, completing in 4.34 seconds. **No exponent x < 29^23 exists.** This is an exhaustive integer interval exclusion, not a language-model result. A larger exponent is not excluded. The companion SFT includes a constructed positive within the same interval; the original search was executed separately, and the integrated checkout test has not yet been run separately.

A different raw exponentiation cipher interpretation S=m^p mod q is invertible because gcd(p,q−1)=1. The exact raw inverse is m=262615687453827309789825145211532321073044948168245947663 (39 GP29 digits, `WUPRPEICJCOETLGLUIAXGIAEYARJXFFHPHOEECOAPCW`, nonprose), and forward exponentiation restores S. No meaningful plaintext recovered.

The alternate PARI/GP job [45586824018](https://github.com/FlareZ123/liber-primus/actions/runs/45586824018) was cancelled after CADO-NFS completed. Do not repeat either calculation.

Reproduce: `python sims/lp2_p55_base59_factor_dlog_sft.py` (SymPy 1.14.0); full calculation `sims/lp2_p55_base59_factor_dlog.gp`, manual workflow `.github/workflows/agent49-p55-base59-dlog-manual.yml`. No generic 2^60 subgroup brute-force or arbitrary exponent sweep initiated.

## Completed CADO-NFS full discrete logarithm (retrieved 20:56 UTC)

[Manual CADO-NFS run 45590527878](https://github.com/FlareZ123/liber-primus/actions/runs/45590527878) succeeded at 10:09 UTC. Its actual job log records the relative logs modulo ell:

    log(G) = 208853723290923273605159619528352677
    log(S) = 1041668472921325390600978920716283619
    x mod ell = 878269391946287055746067695290266561

Combining with the small-subgroup CRT residue gives the unique canonical exponent:

    x = 179565431637462797271641595095856471872087711711928953231

Independent local Python execution confirmed pow(G,x,q)=S, x mod M=r, and x mod ell=log(S)/log(G) mod ell. The 187-bit exponent has the minimal 24-byte hex representation 0752c02619ecc90890f762787e200974729fab6e4d2aa98f and 39 BASE29 digits:

    [4,23,23,2,28,25,4,10,1,19,7,2,12,17,21,19,20,4,13,1,19,16,6,18,28,17,13,7,10,8,4,18,11,6,5,0,18,1,7]

Native GP transliteration RDDTHEAAERIUMWTHEOBNGMLRPUMTGEEABPWIHREJGCFEUW is nonprose. The exact conditional DLP is solved, not the manuscript.

### Frozen direct key consumer

Use precisely the prior factor-key receiver: complete BASE29 digits as a cyclic additive key, chapter-local phase zero, authentic transparent plaintext-F bypass. Exact all-path cursor DP on canonical original arrays gives first impossible offsets:

| Scope | Offset |
|---|---:|
| p0–2 | 291 |
| p3–7 | 27 |
| p8–14 | 84 |
| p15–22 | 80 |
| p23–26 | 13 |
| p27–32 | 18 |
| p33–39 | 92 |
| p40–53 | 83 |
| p54–55 | 7 |
| p55 alone | 24 |
| p56 wrong-key control | 34 |

Every chapter is impossible under this exact receiver. No arbitrary additional transformation or fitted key was used. The direct exponent-as-plaintext and historical cyclic/F-hold key interpretations both fail. Retain the mathematical logarithm; reopen only on an independently selected receiver. No unknown plaintext/key.

[Replay and consumer SFT](../sims/lp2_p55_base59_full_dlog_consumer_sft.cjs). [Original workflow artifact](https://github.com/FlareZ123/liber-primus/actions/runs/45590527878/artifacts/15010854052), workflow-reported SHA256 7f9bfeb1ef20a965addd8ff405cb4aae91619e67810183d5f260a56840ee8779. Job log inspected; ZIP not downloaded. Current consumer executed on canonical source in connected JS.
