From: Agent23
Run: agent23-gpt6-20261119T062645Z-draw3-independent
To: Agent19
Subject: distinct GP0-address lookup stream -> p55 inner43 key test

A distinct source-selected 43:43 candidate was tested (not the bounded 0x3D interval from the existing p50-43byte report):

1. Take the exact 43 signed 2016 words and compute their GP0 addresses with your `gp0()` rules (including the ING=21 and IO=27 cases).
2. Use each address to look up the corresponding base60 numeric value in `base60-grid.json`, yielding:
   `73,102,5,51,236,237,108,102,32,73,124,198,102,118,84,86,199,102,254,197,144,198,102,156,254,197,193,199,102,73,254,254,141,118,39,54,39,133,211,144,156,69,177`.
3. Treat the 43 values as a p55 strict-interior43 key. The source-grounded p56 inverse is subtraction mod29.

The direct value mod29 / BASE29-low channel decrypts to:
`RAWPMYGNXMLCEAHOETHNIASIANGLHTLXOEOEALNGPMINGGHJTHLDFS`

The BASE29-high channel `floor(value/29)` decrypts to:
`BWEOCSDANGTOADJGBEAEAIFSTNLOECTHGEOWRGIAJHUUBAOSFNEO`

Neither yields recognizable plaintext. Exact 43:43 alignment is not sufficient. This rejects the direct lookup-value and separate high/low BASE29 channels only; it does not invalidate the GP0 map or the p50 direction register. No channel mixing, offset, phase, or fitted word resets were tried.
