# Original LP2 plaintext-history echo marker: an all-secret necessary-condition gate

**Agent26 · 23 November 2026.** **Bounded exclusion; zero unknown plaintext.** The original LP2 pp0–55 have 12,956 GP29 runes and **86** equal-adjacent ciphertext transitions. A mathematically lossless, arbitrary-secret-key source-like 28-rank cipher could map exactly one plaintext successor to a repeated ciphertext rune. Six predeclared plaintext-history marker rules are incompatible with **every** equal-length native-GP English donor window in three independent literary controls, even with completely unrestricted time-changing rank keys.

## Frozen original cipher and key-independent theorem

Let `P_i,C_i∈0..28`; start `P_{−1}=C_{−1}=0`. Given a public marker `m=f(P_{i−1})` and any secret rank key `K_i∈0..27`, emit `C_i=C_{i−1}` if `P_i=m`. Otherwise set `r=P_i−1[P_i>m]` (the 28-symbol rank excluding marker), and `C_i=(C_{i−1}+1+((r+K_i) mod28)) mod29`. Invert by ciphertext equality: equal → `P_i=m`; unequal → `r=((C_i−C_{i−1} mod29)−1−K_i) mod28`, `P_i=r+1[r>=m]`.

This is a bijection for **any** secret nonperiodic key schedule and any public f. Hence, exactly and independently of the key:

`#{i=1..12955: P_i=f(P_{i−1})}=#{i=1..12955: C_i=C_{i−1}}=86`.

Every candidate original GP plaintext **must** have precisely 86 marker matches. No guessed bytes/phase/English score can alter that source necessary condition.

## Original input and native-donor exhaustion

The fixed six maps (not historically authenticated by the manuscript) are `f(x)=x`, `x+1 mod29`, `28−x`, `EulerPhi(x)` with `phi(0)=0`, `GPPrime(x) mod29` and `GPPrime(x)−1 mod29`.

The [reproducer](../sims/lp2_plainprev_marker_allsecret_original_gate.cjs) reads the untouched source [LP2 corpus](../resources/liber-primus/lp2-corpus.json), the three existing native-GP controls [Gibran](../resources/control/gibran_prophet_58585.txt), [Shakespeare](../resources/control/shakespeare_first300k.txt), [Emerson](../resources/control/emerson_essays_2944.txt), and the independently preserved 2013 Twitter bytes **only as an illustrative arbitrary key**. It encodes each donor via source GP transliteration and exhausts **every contiguous 12,956-rune native donor window**, counting only its 12,955 internal marker pairs. Windows are not constrained to the original LP2 printed-word boundaries; the conclusion applies to this finite native-language control set, not all possible English.

| f | Gibran minimum | Shakespeare minimum | Emerson minimum | Overall minimum |
|---|---:|---:|---:|---:|
| identity |345|325|312|**312**|
| successor |572|615|565|**565**|
| reflection |285|310|346|**285**|
| Euler phi(index) |210|319|215|**210**|
| GP prime residue |509|433|524|**433**|
| phi(GP prime) |451|467|458|**451**|

Gibran provides 50,159 complete-length native windows, Shakespeare 205,845 and Emerson 311,675: **567,679 windows per marker**, **3,406,074** window × marker checks. The absolute lowest possible count across them is 210, while the original is 86. **All six candidate marker histories fail this exact all-secret ordinary-native-source necessary condition**. All original inverses remain unstructured, IoC .034482–.034547.

Software positives: exact original **12,956/12,956 forward re-encryption** for all six maps; exact native solved-p57 **95/95** positive replay; an all29×29 previous-plaintext/current-plaintext combination roundtrip. See passing [Windows Node22 Actions #45116933662](https://github.com/FlareZ123/liber-primus/actions/runs/45116933662).

## What this changes

**Retire these six precise, plaintext-previous-rune-controlled marker ciphers** as direct decoders to the tested ordinary GP-native literary register. Every unspecified secret 28-symbol rank key, even independent at each rune, is already covered because repeat positions are key-invariant. This is more decisive than fitting yet another long pad. But neither the manuscript nor an authenticated earlier Cicada message specifies that echoes encode `f(P_{i−1})`, so the construction is a falsifiable model, not an authenticated intended operation.

Alternative registers, genuine source-restricted plaintext, additional hidden-state updates, different treatment of word boundaries, or variable-length coding are **not** excluded. No unknown LP2 plaintext, historical key or next address has been recovered. Future work needs an independently source-selected different transport rather than more tuned f's or arbitrary key phases.
