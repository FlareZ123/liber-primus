# P7/p28-inspired BASE29 whole-word cubic with previous-two-ciphertext carry: original receiver failure

**Agent34, 22 November 2026.** New bounded test of an **explicit reversible, genuinely stateful two-predecessor word-number cipher**, preserving all original words and page carries. **No LP2 plaintext, key, creator-selected rule, or continuation was recovered.** See the [exact read-only SFT](../sims/lp2_p7_p28_wordchain_cubic_source_original_sft.cjs) and [Windows Node22 successful execution 45025566830](https://github.com/FlareZ123/liber-primus/actions/runs/45025566830).

## Clue and competing explanations

The authentic 2013 signed TCP exercise contains an explicitly named **BASE29** number type and modular DH examples. The original p7 first red word is rune ordinal pair **[23,3]**; independent p28 local candidate `READ OUT` invokes a cube operation. The PGP-authenticated 2016 coda says the manuscript's “words are the map, their meaning is the road, and their numbers are the direction.” Unlike fixed per-word power operations, an original printed-word number whose transform receives state from preceding *ciphertext* words may change both terminal frequencies and repeated identical plaintext words. This is useful because earlier [fixed/evolving exponent wordwise models](lp2-signed2013-base29-wordpower-allsecret-terminal-gate.md) cannot change 29-adic terminal order classes and are decisively excluded against native English. The prior [full original word-collision state bound](lp2-allsecret-minimum-finitestate-wordcollision-original-gate.md) likewise shows that predecessor state matters.

**Strongest missing premise:** Neither first-party source instructs the exact two-rune carry, a word-local 29-adic cube, its inversion, or the modulo `29^L` word ring. The historical DH worked example uses prime modulus23, *not* 29^L; the p7 red pair [23,3] should not be retroactively treated as proof of the ring/exponent. This test uses one frozen, low-description-length candidate to explore a distinct route, with no coefficient sweeps, language-trained keys, or exception repairs.

## Exactly invertible model, including all 29^L word-register states

For each complete original GP29 printed word of length `L`, interpret its original digits 0..28 as a big-endian integer `X` mod `29^L`. The two actual ciphertext runes preceding the current word, interpreted as a base29 two-digit number `t=29*C[-2]+C[-1]`, form the input carry. All words are parsed continuously across line and page boundaries, including 32 cross-page carries. The very first word has initial state (0,0), fixed and source-independent.

Define `T_3` on any word integer (including leading zero digit and p-adic nonunits):

```text
T_3(0) = 0
T_3(29^v * u) = 29^v * (u^3 mod 29^(L-v)),
               v=ord_29(X), gcd(u,29)=1

C_word = [T_3(P_word) + t] mod 29^L
P_word = T_3^(-1)([C_word − t] mod 29^L)
```

For each nonzero word, the unit group modulus `29^(L-v)` has Euler totient `28*29^(L-v-1)`, coprime to 3. Hence `d=(3^-1 mod totient)` exists and the exact inverse is `29^v * u^d mod 29^(L-v)`. Each decoded word advances the carry with its *actual ciphertext runes*. Because `t` varies with preceding ciphertext, identical plaintext words can have different ciphertext and word-ending classes can change, avoiding the prior pure-power order-invariance theorem. This is a full 29^L bijection even for rare leading-zero `F` runes; no plaintext F-skipping rule is silently inherited.

## Exact original and planted test

| Original unchanged interval | Decoded runes | GP29 decoded IoC |
| --- | ---: | ---: |
| p3–p7 source red/scroll | **1,145** | **0.03421687483** |
| Independent p16–p21 | **1,613** | **0.03424179165** |
| Independent floral p40–p53 | **3,008** | **0.03444445231** |
| All p0–p55 | **12,956** | **0.03447888641** |

Original full source IoC **0.03447839786**. All 2,896 original words reencrypt exactly, yielding 12,956 original rune indices and preserving 32 genuine cross-page words. The candidate's first hundred decoded p3–p7 runes are `I N X H E OE E M TH J Y EO J T R I I N Y G D NG L L IA N E X OE B J N F X O NG W IA OE P H X G L P TH EO OE AE L X AE R H E I R S D M L NG X N E L I IA M Y Y O P P O OE N E D M OE D D P R R G X T OE R G M B O T C B EA TH`. No source-native English phrase emerges in that or independent sections.

The full-length **genuine GP29-normalized Shakespeare word plant** selects precisely one real source word of each actual original word width and preserves the 2,896 source word lengths. Its GP29 plaintext IoC is **0.06126996470**, its encrypted ciphertext IoC **0.03474496526**, and it exactly decrypts and reencrypts **12,956/12,956** genuine GP letters. The actual solved **p57 95-rune** cleartext is separately forward-encrypted as a single full register and exactly inverted **95/95**.

A stronger *original-cipher* objection than marginal coincidence alone: the authentic LP2 has only **63 identical adjacent ciphertext runes within complete printed words** across 10,060 internal word transitions; the source-native encrypted plant, using this **identical exact word inventory**, has **345**. The original source decrypts into **371** such repeated runes, consistent with a random GP29 decoding rather than an authenticated language register. The planted native plaintext has **306** such events. Thus the proposed codec creates GP29-whitened ciphertext but does **not** generate the manuscript's separate severe anti-repeat property. This is a discriminating source-level failure.

## Decision

Reject **this exact whole-word p-adic cubic plus previous-two-ciphertext additive carry** as the intended direct GP29-English inverse. The general class of stateful word-number ciphers remains open; this law's false ciphertext word-doublet output and nonlinguistic source inversion give no justification for tuning exponents, secret masks, state widths, or salts. A future candidate requires a first-party instruction that selects state evolution **and explains original anti-doublets**, ideally before seeing any plaintext score. No new authoritative decryption statement should enter `results/README.md` on this result alone.
