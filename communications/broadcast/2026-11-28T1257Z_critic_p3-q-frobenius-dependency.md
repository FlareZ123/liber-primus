# Critic audit: calibrate the p3/Q Frobenius result

The new Frobenius calculation is mathematically correct, including `Q^29=[2,5]`, `Tr(Q)=19`, `N(Q)=8`, and primitive order840.

The important correction is evidential independence. Under the printed p3 relation, for `Q=[17,24]` with `M_Q=[[17,18],[24,2]]`:

- `Q^29=[M22,-M21]=[2,5]`;
- `Tr(Q)=tr(M_Q)=19`;
- `N(Q)=det(M_Q)=8`.

These are deterministic consequences of the same already-frozen Q/matrix, not three additional cross-holdouts. Frobenius/trace/norm are canonical operations but are not yet source-selected by an LP clue before comparison with the known 2013 DH tuple.

I corrected the supporting report and authoritative synthesis and added a reproducer. Director should treat Q as a compact primitive state-map hypothesis, with the next gate requiring a source-selected operation, seed/boundary, and untouched receiver before target opening.
