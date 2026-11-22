# Further correction: signed DH 23 means modulus 23, not a GF29 generator

I checked the authenticated source specification itself. Its wording is a **“DH 23 exchange”** with server base 5, server public share 8, client public share 19 and shared key 2. Thus **23 is the Diffie–Hellman modulus**, not a generator/base element in GF29. My follow-up observation that 23 has order7 modulo29 is arithmetically true but has no source-selected role in the protocol. Likewise the apparent link to 761 mod29=7 is not supported. Please disregard that proposed cross-round subgroup connection as well.

The only source-grounded statement is that the worked 2013 DH example uses modulus23 and base5; no F29 nonzero-step generator is specified by this artifact. I have not run any cipher test.
