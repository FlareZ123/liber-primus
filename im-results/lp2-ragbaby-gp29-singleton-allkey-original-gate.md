# Exact all-key GP29 Ragbaby singleton alphabet floor: 12 plaintext types

**18 November 2026 | Agent19 | exact necessary-condition theorem, no recovered unknown plaintext**

## Candidate and original manuscript data

The historically authentic 1955 **Ragbaby** cipher advances one mixed alphabet by the running **printed word number** and the within-word character position. This operation is a *candidate*, suggested only provisionally by Cicada's signed 2016 wording “Its words are the map, their meaning is the road, and their numbers are the direction.” Cicada did **not** authenticate Ragbaby for LP2. Traditional Ragbaby merges some Latin glyphs into 24 symbols; here we test its minimal **lossless 29-symbol** extension for original Gematria Primus and allow the entire 29! secret mixed alphabet to remain unknown. See the [ACA historical cipher reference](https://www.cryptogram.org/downloads/aca.info/ciphers/Ragbaby.pdf).

The original-source parser retains **12,956 rune symbols across physical LP2 pp0–55, exactly 2,896 complete printed words, all 32 cross-page carried words and 83 complete single-rune words**. Original rune order is asserted exactly against `resources/liber-primus/lp2-corpus.json`; the independent input `resources/liber-primus/lp2-transcription.txt` uses hyphen/period as word stops, without treating page wraps or line breaks as word boundaries. This excludes relying on a convenient alternate segmentation.

## Exact all-secret calculation

Let `K` be **any** unknown bijection from the 29 original GP glyphs to ranks `0..28`. The literal Ragbaby emitter is

```text
K(C[w,j]) = K(P[w,j]) + w + j  (mod 29),
w = 1,2,...,2896;  j = 0,1,...
```

When a *complete one-rune ciphertext word* consists of glyph `g` at global word `w`, its corresponding plaintext is necessarily the singleton rune with secret rank `K(g)-w (mod29)`. For every glyph `g`, collect the observed distinct `w mod29` values in a source-exact shift set `W[g]`. All plaintext one-rune words must therefore belong to the set

```text
S(K) = union over all g of { K(g) - w (mod29) : w in W[g] }.
```

The question “What is the *smallest possible number of distinct one-rune plaintext word types* compatible with **any** 29! secret keyed alphabet?” has the **exact mathematical answer 12** on the original source.

### Finite exhaustive proof, with no English score or fitted plaintext

One of the original cipher symbols is `P` (GP index13), whose singleton word residues are `[10,15,16,22,23]`. Because simultaneous rotation of all secret alphabet ranks does not change `|S|`, fix `K(P)=0` without losing any key. Then `S` **must** contain ranks `{6,7,13,14,19}`. For each cardinality `k=5..11`, exhaust **every** candidate `S` consisting of these five mandatory ranks and `k-5` of the remaining 24 ranks; the exact number of tested rank sets is

```text
k=5     1
k=6    24
k=7   276
k=8  2024
k=9 10626
k=10 42504
k=11 134596
TOTAL 190051
```

For each such `S` and original glyph `g`, enumerate **all** candidate secret ranks `r` for which every `r-w mod29`, `w in W[g]`, is a member of `S`. Require one rank for every original glyph and no rank shared by two distinct glyphs. This condition is decided exactly by a **bipartite perfect matching** on 29 glyphs versus 29 secret ranks, with `K(P)=0`. All **190,051** sets of size at most 11 fail. There is no sampling, heuristic model, key-word assumption or statistical score in this obstruction. An early per-glyph domain check rejects all but three candidate size11 sets; the three surviving domains lack any full perfect matching.

The lower bound is **sharp**. At size12, exhaustive enumeration finds a full 29-rank permutation

```text
K[GP index 0..28] =
[21,20,16,14,2,1,28,13,22,18,4,3,9,0,10,19,
 6,17,27,15,11,8,23,24,25,7,12,5,26]

S(K) = {0,1,6,7,13,14,15,19,22,23,25,27}
```

Thus the exact minimum over **all 29! secret keyed alphabets** is **12 different single-rune plaintext word types**. This source-dependent theorem is purely combinatorial. Native ordinary English uses only `A`, `I` and `O` as one-letter printed words; even languages allowing up to 11 such orthographic symbols fail this exact global Ragbaby grammar. The source does **not** establish which language or orthography Cicada intended.

The witness's inverse yields a fully specified **non-English, nonlinguistic** 12,956-symbol artificial plaintext on the exact original 2,896 word shapes and reconstructs **12,956/12,956** ciphertext runes under its forward rule. Its success establishes attainability of the combinatorial lower bound; **it is not a Liber Primus decryption**.

A fixed initial alphabet phase does not affect the count. Any nonzero affine word-step multiplier modulo the prime 29 is also covered: composing the unknown rank permutation with multiplication by that unit makes it equivalent to the tested word-step convention. This includes reversing the direction of the word-number clock. The within-word position is immaterial to the singleton proof because `j=0`.

## Reproduction and scope

- **Exact full-book finite certificate**: [standalone Windows Node22 CommonJS SFT](../sims/lp2_ragbaby_gp29_exact_min_singletons_sft.cjs), [passing Windows CI 44361972578](https://github.com/FlareZ123/liber-primus/actions/runs/44361972578). It asserts the entire unchanged original ciphertext and word parse, exhausts all small singleton-type rank sets and validates the 29-symbol forward inverse witness.
- **Original three-glyph five-residue quick obstruction**: [shorter independent full-book source SFT](../sims/lp2_ragbaby_gp29_singleton_allkey_sft.cjs), [passing Windows Node22 run](https://github.com/FlareZ123/liber-primus/actions/runs/44355471000). Original glyphs `M,T,P` each require five distinct singletons; the complete proof above strengthens the bound to **12**, using all 83 occurrences.

**The statement excludes:** Any globally shared, lossless GP29 Ragbaby secret alphabet under the historical global word-number clock whenever the intended language has at most **11** distinct legitimate one-rune words. No hidden alphabet permutation, initial phase or nonzero affine clock multiplier rescues it.

**The statement does not exclude:** Section-wise new alphabets or reset word clocks, independently modified word-boundaries, historical lossy Latin24 merging, non-language plaintext with 12+ singleton types, or entirely different stateful ciphers. These departures each need new independent source support and a complete reversible inverse. **No original unknown LP2 plaintext, authenticated cipher key, intended destination or continuation is identified.** Retire this global word-clock branch; pursue source-chosen operations and missing real key material rather than further unconstrained Ragbaby variants.
