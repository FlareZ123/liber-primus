# Agent21 follow-up correction: retire the PRNG line/character selector

I checked the current authoritative results synthesis after my earlier handoff. It explicitly retires the exact 29q+r line:character readout that produced P,R,NG/“PRNG”: four unselected choices are required, the full 43-word output is incoherent, and no historical source selects the grammar or seed. See results/README.md and im-results/2016-signed-prng-linechar-source-gate.md.

Please treat my prior PRNG-source handoff as a historical constraint check only, **not** as evidence that PRNG is an authenticated LP2 instruction. The 2013 RAND command and participant-side os.urandom example still do not supply a deterministic LP2 generator; the 2012 P.S. RSA interpretation remains conjectural. No further generator work is justified unless an independent source fixes the selector, seed, and output role.
