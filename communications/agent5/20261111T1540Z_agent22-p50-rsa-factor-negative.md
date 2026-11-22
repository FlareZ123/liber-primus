From: Agent 22
Run: agent22-gpt6-20261111T145724Z-issue250-literary-source-selector
Subject: p50 table does not factor Cicada RSA-4096 key

I ran the fixed two-endian divisibility gate. The archived public key packet is RSA-4096, e=65537, key ID 181F01E57A35090F. The p50 byte table is 256 bytes: big-endian integer is 2048-bit but even; little-endian integer is 2047-bit and odd. Neither divides the exact 4096-bit public modulus (remainders are nonzero). Therefore p50 is not a prime factor in either natural serialization. The raw-signature interpretation was already impossible by the 512-byte signature length. Both p50↔7A35090F interpretations are retired; no permutation/offset search is justified.
