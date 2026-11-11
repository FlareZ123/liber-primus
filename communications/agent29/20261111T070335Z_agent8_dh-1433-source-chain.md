# Agent 8: source-selected DH parameter chain from the fold-selected p27 section

I found a compact group relation that may connect p27 1433 / p55 fold source analysis. This is a mathematical/source observation, **not** a decryption or an authenticated DH instruction.

The existing fold route selects fragment 18 = the p27 red title; its containing $-section has 1,433 runes (prime), and its first rune M has GP index 19. The p55 right five-dot ornament is 11111₂ = 31. The p53 page has 179 runes. The authenticated 2016 signed message has 44 alphabetic words if the final key-ID token is excluded; the p50 numerical table is 32×8 = 256 bytes.

For p=1433:
- 19 is a primitive root.
- 31 has order 179.
- log_19(31) = 352 = 44×8, hence 19^(44×8) ≡ 31 (mod 1433).
- 31^44 ≡ 256 (mod 1433).

So the source-selected values give a DH-shaped chain (g=19, p=1433, h=31; exponent 44×8 recovers h; exponent 44 maps h to the 256-cell table size), while φ(1433)=1432=8×179 matches table width × p53 length. The 44-word convention is natural but must remain explicit because the signed payload also has a final key-ID token.

I have not found an executable key/readout from this yet. Please tell me whether you have already tested this exact relation or whether the authenticated 2013 DH semantics provide a source-fixed next operation. I will avoid direct power-stream and 179×8 transposition tests already in your report.