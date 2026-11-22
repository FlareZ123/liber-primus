# Published April 2026 fixed-key LP2 "confirmed plaintext" claims: original-cipher test

**Decision:** The two complete periodic GP29 keys published in [Wulfic/Cicada3301-Liber_Primus `MASTER_TRACKER.md`, §3, archive pages 18–19](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md) do **not** recover their claimed prose on the untouched original runes. This checks *the published fixed keys and explicit modular operations only*, without tuning keys or deciding whether a more complex undocumented cipher could exist. No original unknown LP2 plaintext is recovered.

## Source and exact map

The 2014 archive's scan numbers 18.jpg and 19.jpg correspond to this repository's LP2 physical **p1** and **p2**, respectively. The complete GP29 rune sequences in the external `pages/page_18/runes.txt` (266 runes) and `pages/page_19/runes.txt` (201 runes) are **byte-for-glyph index identical** to local canonical `resources/liber-primus/lp2-corpus.json` p1 and p2. In particular, the external tracker incorrectly says p18 has 260 runes; both actual source sequences contain 266. The corpus indexes use the documented 29-symbol GP29 order, preserving the original source glyphs.

This avoids a mistaken source-mapping dismissal: the published formulas really are being tested on the exact ciphertext their respective transcripts contain.

## Fixed original decode

Wulfic §3 publishes a 53-entry key for archive p18 and specifies `P[i]=(C[i]-K[i mod 53]) mod29`, claiming opening “BEING OF ALL ...”. For archive p19 it publishes a 47-entry key and `P[i]=(C[i]+K[i mod 47]) mod29`, claiming “REARRANGING THE PRIMES NUMBERS ... DEOR”. Using those **unaltered** keys on the complete, original LP2 pages gives:

| Source/claim | Exact decoded prefix (GP29 token transliteration) | Whole page normalized IoC |
|---|---|---:|
| Archive p18 = LP2 p1; subtract period 53; 266 runes | `P R E A P A P E G I M P H X X U O G D Y W U M N X L X R E I C W N N E H R EO AE H` | 1.007121577529 |
| Archive p19 = LP2 p2; add period 47; 201 runes | `B C O O L N D U X A Y N AE S A X M D T X C M EO D H IA J EO F AE Y OE TH P P A G A Y U` | 0.996965174129 |

For comparison, **original clear p57** has normalized GP29 IoC **1.818589025756**. Neither resulting output is the quoted English phrase. The numerical IoC mismatch alone is a diagnostic; the contradictory complete output is the decisive fact. Conventional GP digraph transliteration makes the discrepancy immediately visible. Applying either periodic key to independently constructed ciphertext from the authentic 95-rune clear p57 recovers all **95/95** original runes in a positive check, so the modular sign and periodic-key implementations are not broken.

## Consequence and limits

Do not treat either external `KEY CONFIRMED`/“plaintext verified” designation as an authenticated unknown-page solution, a sourced `DEOR` instruction, or a license to initiate another dependent Deor-running-key search. The stated original keys do not yield the alleged plaintext. Because a more complex rule has not been supplied and frozen, this is **not** a universal proof against cipher mechanisms or poetry as an independently sourced key.

The exact complete-source read-only Windows Node/CommonJS reproducer is [`sims/lp2_wulfic_p18_p19_fixed_claim_sft.cjs`](../sims/lp2_wulfic_p18_p19_fixed_claim_sft.cjs). Original ciphertext source: [`resources/liber-primus/lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json). External claimed [53-key](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md#page-18--vigen%C3%A8re-sub-key-length-53) and [47-key](https://github.com/Wulfic/Cicada3301-Liber_Primus/blob/main/MASTER_TRACKER.md#page-19--vigen%C3%A8re-add-key-length-47) are reproduced verbatim in the SFT. This limited source-exact check does not change the established no-solution state in `results/README.md`.
