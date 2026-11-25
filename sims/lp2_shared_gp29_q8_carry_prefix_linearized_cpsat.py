#!/usr/bin/env python3
"""GF(29)-linearized CP-SAT encoding of the shared q8 carry-prefix receiver.

For each consuming rune, the common-cycle relation is exactly
    pi(cipher) - pi(plain) - k[phase] == 0 (mod 29).
The alphabet coordinate pi is a permutation fixing F at zero; k[0]=1 is the
generator/phase gauge. Since the unreduced difference lies in [-56,28], the
modular equation is represented exactly by one Boolean wrap variable.
This replaces eight commuting permutation rows and their centralizer
constraints with 29 alphabet coordinates and eight phase shifts.
"""

from __future__ import annotations

import collections

from ortools.sat.python import cp_model
import lp2_shared_gp29_q8_carry_prefix_sft as base


def model_linearized(C, D, prefix_index, prefix_domain, max_oov):
    m = cp_model.CpModel()
    pi = [m.new_int_var(0, 28, "pi_%d" % c) for c in range(29)]
    m.add(pi[0] == 0)
    m.add_all_different(pi)

    key = [m.new_int_var(1, 1, "k0")] + [
        m.new_int_var(0, 28, "k%d" % j) for j in range(1, 8)
    ]
    differences = []
    for j in range(4):
        different = m.new_bool_var("primitive_%d" % j)
        m.add(key[j] != key[j + 4]).only_enforce_if(different)
        m.add(key[j] == key[j + 4]).only_enforce_if(different.Not())
        differences.append(different)
    m.add_bool_or(differences)

    by = collections.defaultdict(list)
    for word in sorted(D):
        by[len(word)].append(word)

    domains = []
    inlex = []
    oov = []
    for g, cipher in enumerate(C):
        phase = m.new_int_var(0, 7, "phase%d_0" % g)
        plain_vars = []
        for i, x in enumerate(cipher):
            p = m.new_int_var(0 if x == 0 else 1, 28, "p%d_%d" % (g, i))
            plain_vars.append(p)

            pi_plain = m.new_int_var(0, 28, "pi_plain%d_%d" % (g, i))
            m.add_element(p, pi, pi_plain)
            key_phase = m.new_int_var(0, 28, "key_phase%d_%d" % (g, i))
            m.add_element(phase, key, key_phase)
            wrap = m.new_bool_var("wrap%d_%d" % (g, i))
            equation = (pi[x] - pi_plain - key_phase + 29 * wrap == 0)

            if x == 0:
                hold = m.new_bool_var("hold%d_%d" % (g, i))
                m.add(p == 0).only_enforce_if(hold)
                m.add(p != 0).only_enforce_if(hold.Not())
                m.add(equation).only_enforce_if(hold.Not())
            else:
                m.add(equation)

            if i + 1 < len(cipher):
                nxt = m.new_int_var(0, 7, "phase%d_%d" % (g, i + 1))
                increment = [(j, (j + 1) % 8) for j in range(8)]
                if x == 0:
                    m.add(nxt == phase).only_enforce_if(hold)
                    m.add_allowed_assignments([phase, nxt], increment).only_enforce_if(hold.Not())
                else:
                    m.add_allowed_assignments([phase, nxt], increment)
                phase = nxt

        words = (
            [w for w in prefix_domain if base.s.candidate(w, cipher)]
            if g == prefix_index
            else [w for w in by[len(cipher)] if base.s.candidate(w, cipher)]
        )
        domains.append(len(words))
        flag = m.new_bool_var("inlex%d" % g)
        inlex.append(flag)
        if g == prefix_index:
            if words:
                m.add(flag == 1)
                m.add_allowed_assignments(plain_vars, words)
            else:
                m.add(False)
        elif words:
            m.add_allowed_assignments(plain_vars, words).only_enforce_if(flag)
            oov.append(flag.Not())
        else:
            m.add(flag == 0)
            oov.append(flag.Not())

    m.add(sum(oov) <= max_oov)
    return m, pi, key, domains, inlex


def solve_linearized(C, D, prefix_index, prefix_domain, max_oov, seconds, workers, seed):
    model, pi_vars, key_vars, domains, inlex = model_linearized(
        C, D, prefix_index, prefix_domain, max_oov
    )
    error = model.validate()
    if error:
        raise ValueError(error)
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = seconds
    solver.parameters.num_search_workers = workers
    solver.parameters.random_seed = seed
    status = solver.solve(model)
    out = {
        "encoding": "GF29 linearized coordinate equations",
        "status": solver.status_name(status),
        "wall_time": solver.wall_time,
        "branches": solver.num_branches,
        "conflicts": solver.num_conflicts,
        "domains": domains,
        "model_stats": model.model_stats(),
    }
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        found_pi = [solver.value(v) for v in pi_vars]
        found_key = [solver.value(v) for v in key_vars]
        oov_indices = [
            i for i, flag in enumerate(inlex)
            if i != prefix_index and solver.value(flag) == 0
        ]
        out.update(pi=found_pi, k=found_key, oov_indices=oov_indices)
        return out, found_pi, found_key
    return out, None, None


base.solve = solve_linearized

if __name__ == "__main__":
    base.main()
