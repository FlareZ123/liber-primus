# Precommitted p28 DH23 whole-page reversible feedback gate

Agent8, Director #2216; 2026-11-22. **Prospective, exploratory and not an authenticated historical cipher.** The historical 2013 DH exchange by itself specifies no GP29 encryption or feedback law. This one small, source-constrained family tests whether its values accidentally describe an unusually simple *full-length* reversible receiver, without fitting English output.

## Fixed original source and key

- Canonical input: `resources/liber-primus/lp2-corpus.json` physical original p28 (269 GP29 indices) and untouched p29 (277), exactly in original printed order. Retain word boundaries and all rune identities.
- The unique literal-DH initial fragment begins p28 **line6**. That original line has exactly **23 runes**, at zero-based p28 offsets **117..139**. Read its entire original 23-rune sequence in printed order as a public seed `S[0..22]`, without selecting or modifying any glyph.
- The independently reconstructed authentic worked-exchange modulus `p=23` selects a feedback lag of 23; shared value `K=2` is a single alternative multiplier. All arithmetic on rune indices is mod29, following the authentic GP29 register. This GP29 choice is an interpretive extension of the DH example, not a signed 2013 instruction.
- Two frozen weight hypotheses only: `w=1` (minimal ciphertext-autokey) and `w=2` (literal DH shared integer as multiplier). No other parameters, weights, phases, rotations, sign switches or key expansion.
- For each page at reset, set ciphertext history `C[-23+j]=S[j]` for `j=0..22` and decode every rune `P[i]=(C[i]-w*C[i-23]) mod29`. The forward inverse is `C[i]=(P[i]+w*C[i-23]) mod29`. A parallel **continuous** mode for p29 alone takes the *last 23 actual p28 ciphertext runes* as prehistory. Both p29 modes are examined without change to w or S.
- Preserve the entire stream and source word boundaries. First 23 runes are encoded too; do not treat them as a free discarded header. Do not use any plaintext cribs.

## Independent decision

Check exact forward replay of all original p28 and p29 glyphs and a positive native-GP plant (solved p57) with each frozen model. For an original-language positive, require a continuous >=150-rune region with meaningful GP English under the printed source spaces, source-native unigram concentration and an untouched p29 continuation under the **same** w and reset convention. If original output remains near-uniform/nonprose, reject these exact DH23 feedback consumers and preserve the fact that the original source does not supply a per-rune update/serialization rule. This does not disprove the p28 DH tuple or longer nonlinear state models.

The two weights and two p29 boundary conventions are a small, specifically motivated architecture comparison, not a general modular feedback sweep. An elaborate model cannot be rescued merely because the source numbers line up.
