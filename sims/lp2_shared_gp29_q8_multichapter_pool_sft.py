#!/usr/bin/env python3
"""Blind pooled-vs-independent GP29 q8 common-cycle control.

The three shortest pinned solved-native GP29 records are used as plaintext
donors only: jpg229 (18 groups), p57_parable (20), p56_an_end (25).
Each is split 80/20 by source group; the decoder receives only the training
cipher groups and a fixed dictionary. It does not use inter-word order,
grammar, adjacency, or holdout plaintext.

Plant: one shared permutation pi fixing F, and one unrelated primitive q8
shift vector per donor. Each word has an independent hidden start phase and
literal plaintext-F holds do not advance that phase. One planted key per
plant is all-nonzero/all-distinct; all other keys are sampled uniformly from
the unrestricted primitive-q8 family.

Pooled model: one shared pi and separate q8 vectors.
Rival: separate pi and q8 vector for each chapter (equivalent to independent
fits on the same samples).

A separate known-plaintext/known-phase linear rank calculation is reported
only as an algebraic ceiling; it is not supplied to the blind solver.
"""

from __future__ import annotations

import argparse
import collections
import json
import pathlib
import random
import re

from ortools.sat.python import cp_model
import lp2_shared_gp29_q8_smt as s

ROOT = pathlib.Path(__file__).resolve().parents[1]
NATIVE = ROOT / "resources/external/relikd-solved-gp29-native-v1.json"
LEX = ROOT / "resources/control/english_wordfreq_textblob.txt"
FIXTURE = ROOT / "im-results/lp2-shared-gp29-q8-terminal-corrected-fixtures.json"
MOD = 29
CHAPTERS = ("jpg229", "p57_parable", "p56_an_end")
TRAIN_NUM, TRAIN_DEN = 4, 5


def primitive_q8(key):
    return any(key[j] != key[j + 4] for j in range(4))


def same_key_orbit(a, b):
    """Whether two vectors are related by phase rotation and nonzero scale."""
    for shift in range(8):
        rotated = b[shift:] + b[:shift]
        for scale in range(1, MOD):
            if [scale * x % MOD for x in rotated] == a:
                return True
    return False


def load_inputs():
    native = json.loads(NATIVE.read_text(encoding="utf-8"))
    rune_index = {r: i for i, r in enumerate(native["runes"])}
    fixture = json.loads(FIXTURE.read_text(encoding="utf-8"))
    dictionary = s.load_dictionary(LEX, fixture["added"])
    by_name = {section["name"]: section for section in native["sections"]}
    chapters = []
    for name in CHAPTERS:
        section = by_name[name]
        tokens = re.findall(r"[\u16a0-\u16ff]+", section["source_text"])
        words = [tuple(rune_index[r] for r in token) for token in tokens]
        assert words, name
        assert all(word in dictionary for word in words), (
            name, [word for word in words if word not in dictionary][:10]
        )
        cut = len(words) * TRAIN_NUM // TRAIN_DEN
        chapters.append({
            "name": name,
            "source": section["source"],
            "all_truth": words,
            "train_truth": words[:cut],
            "holdout_truth": words[cut:],
            "train_lengths": [len(w) for w in words[:cut]],
            "holdout_lengths": [len(w) for w in words[cut:]],
        })
    return dictionary, chapters


def random_primitive_key(rng):
    while True:
        key = [rng.randrange(MOD) for _ in range(8)]
        if primitive_q8(key):
            return key


def make_pi(rng):
    values = list(range(1, MOD))
    rng.shuffle(values)
    pi = [0] + values
    scale = pow(pi[1], -1, MOD)
    pi = [x * scale % MOD for x in pi]
    assert pi[0] == 0 and pi[1] == 1 and sorted(pi) == list(range(MOD))
    return pi


def make_plant(chapters, plant):
    rng = random.Random(3301 + plant)
    pi = make_pi(rng)
    raw_keys = []
    for chapter_index in range(len(chapters)):
        if chapter_index == 0:
            key = rng.sample(range(1, MOD), 8)  # explicit all-nonzero/all-distinct case
        else:
            key = random_primitive_key(rng)
        while any(same_key_orbit(key, old) for old in raw_keys):
            key = random_primitive_key(rng)
        raw_keys.append(key)

    planted = []
    for chapter, raw_key in zip(chapters, raw_keys):
        all_truth = chapter["all_truth"]
        starts = [rng.randrange(8) for _ in all_truth]
        all_cipher = [
            s.encode(word, pi, raw_key, phase)
            for word, phase in zip(all_truth, starts)
        ]
        ntrain = len(chapter["train_truth"])
        train_cipher = all_cipher[:ntrain]
        anchor = max(
            range(len(train_cipher)),
            key=lambda g: (0 not in train_cipher[g], len(train_cipher[g]), -g),
        )
        rotation = starts[anchor]
        key = raw_key[rotation:] + raw_key[:rotation]
        normalized_starts = [(phase - rotation) % 8 for phase in starts]
        assert normalized_starts[anchor] == 0
        for word, cipher, phase in zip(all_truth, all_cipher, normalized_starts):
            assert s.encode(word, pi, key, phase) == cipher
        planted.append({
            **chapter,
            "pi": pi,
            "key": key,
            "raw_key": raw_key,
            "starts": normalized_starts,
            "train_cipher": train_cipher,
            "holdout_cipher": all_cipher[ntrain:],
            "anchor": anchor,
            "key_all_nonzero": all(x != 0 for x in raw_key),
            "key_all_distinct": len(set(raw_key)) == 8,
            "key_primitive": primitive_q8(raw_key),
        })
    assert all(
        not same_key_orbit(planted[i]["raw_key"], planted[j]["raw_key"])
        for i in range(len(planted)) for j in range(i)
    )
    return planted


def gf29_rank(rows, columns):
    matrix = [[x % MOD for x in row] for row in rows]
    rank = 0
    for column in range(columns):
        pivot = next((r for r in range(rank, len(matrix))
                      if matrix[r][column] % MOD), None)
        if pivot is None:
            continue
        matrix[rank], matrix[pivot] = matrix[pivot], matrix[rank]
        inverse = pow(matrix[rank][column], -1, MOD)
        matrix[rank] = [(x * inverse) % MOD for x in matrix[rank]]
        for r in range(len(matrix)):
            if r == rank:
                continue
            factor = matrix[r][column] % MOD
            if factor:
                matrix[r] = [
                    (x - factor * y) % MOD
                    for x, y in zip(matrix[r], matrix[rank])
                ]
        rank += 1
        if rank == len(matrix):
            break
    return rank


def linear_rows(chapter, key_offset, key_count):
    columns = 27 + 8 * key_count
    rows = []
    for plain, cipher, start in zip(
        chapter["train_truth"], chapter["train_cipher"], chapter["starts"]
    ):
        phase = start
        for p, c in zip(plain, cipher):
            if p == 0:
                assert c == 0
                continue
            row = [0] * columns
            if c >= 2:
                row[c - 2] = (row[c - 2] + 1) % MOD
            if p >= 2:
                row[p - 2] = (row[p - 2] - 1) % MOD
            row[27 + 8 * key_offset + phase] = (
                row[27 + 8 * key_offset + phase] - 1
            ) % MOD
            rows.append(row)
            phase = (phase + 1) % 8
    return rows


def rank_ceiling(chapters):
    pooled_rows = []
    independent = []
    for i, chapter in enumerate(chapters):
        rows = linear_rows(chapter, 0, 1)
        independent.append({
            "chapter": chapter["name"],
            "rank": gf29_rank(rows, 35),
            "unknowns": 35,
            "equations": len(rows),
        })
        pooled_rows.extend(linear_rows(chapter, i, len(chapters)))
    return {
        "meaning": "known-plaintext AND known-word-start-phase upper bound; not blind recovery",
        "pooled": {
            "rank": gf29_rank(pooled_rows, 27 + 8 * len(chapters)),
            "unknowns": 27 + 8 * len(chapters),
            "equations": len(pooled_rows),
        },
        "independent": independent,
        "independent_rank_sum": sum(x["rank"] for x in independent),
        "independent_unknown_sum": sum(x["unknowns"] for x in independent),
    }


def add_primitive_constraint(model, key, prefix):
    differences = []
    for j in range(4):
        different = model.new_bool_var(f"{prefix}_primitive_{j}")
        model.add(key[j] != key[j + 4]).only_enforce_if(different)
        model.add(key[j] == key[j + 4]).only_enforce_if(different.Not())
        differences.append(different)
    model.add_bool_or(differences)


def new_rank(model, prefix):
    rank = [model.new_int_var(0, 28, f"{prefix}_pi_{i}") for i in range(29)]
    model.add_all_different(rank)
    model.add(rank[0] == 0)
    model.add(rank[1] == 1)
    return rank


def add_chapter_constraints(model, rank, key, chapter, dictionary):
    by_length = collections.defaultdict(list)
    for word in sorted(dictionary):
        by_length[len(word)].append(word)
    ciphertext_words = chapter["train_cipher"]
    anchor = chapter["anchor"]
    domains = []
    for group_index, cipher in enumerate(ciphertext_words):
        phase = model.new_int_var(0, 7, f"{chapter['name']}_phase_{group_index}_0")
        if group_index == anchor:
            model.add(phase == 0)
        plain_vars = []
        for i, x in enumerate(cipher):
            p = model.new_int_var(0 if x == 0 else 1, 28,
                                  f"{chapter['name']}_p_{group_index}_{i}")
            plain_vars.append(p)
            hold = None
            if x == 0:
                hold = model.new_bool_var(f"{chapter['name']}_hold_{group_index}_{i}")
                model.add(p == 0).only_enforce_if(hold)
                model.add(p != 0).only_enforce_if(hold.Not())

            plain_coordinate = model.new_int_var(
                0, 28, f"{chapter['name']}_pi_plain_{group_index}_{i}"
            )
            model.add_element(p, rank, plain_coordinate)
            key_shift = model.new_int_var(
                0, 28, f"{chapter['name']}_key_phase_{group_index}_{i}"
            )
            model.add_element(phase, key, key_shift)
            wrap = model.new_bool_var(
                f"{chapter['name']}_wrap_{group_index}_{i}"
            )
            equation = model.add(
                rank[x] == plain_coordinate + key_shift - 29 * wrap
            )
            if hold is not None:
                equation.only_enforce_if(hold.Not())

            if i + 1 < len(cipher):
                next_phase = model.new_int_var(
                    0, 7, f"{chapter['name']}_phase_{group_index}_{i + 1}"
                )
                increment = [(j, (j + 1) % 8) for j in range(8)]
                if hold is not None:
                    model.add(next_phase == phase).only_enforce_if(hold)
                    model.add_allowed_assignments(
                        [phase, next_phase], increment
                    ).only_enforce_if(hold.Not())
                else:
                    model.add_allowed_assignments([phase, next_phase], increment)
                phase = next_phase

        allowed = [
            word for word in by_length[len(cipher)]
            if s.candidate(word, cipher)
        ]
        if not allowed:
            model.add(False)
        else:
            model.add_allowed_assignments(plain_vars, allowed)
        domains.append(len(allowed))
        truth = chapter["train_truth"][group_index]
        assert truth in allowed, (chapter["name"], group_index, truth, len(allowed))
    return domains


def build_model(selected, dictionary, pooled):
    model = cp_model.CpModel()
    if pooled:
        shared_pi = new_rank(model, "shared")
        ranks = {chapter["name"]: shared_pi for chapter in selected}
    else:
        ranks = {
            chapter["name"]: new_rank(model, chapter["name"])
            for chapter in selected
        }
    keys = {}
    domains = {}
    for chapter in selected:
        name = chapter["name"]
        key = [model.new_int_var(0, 28, f"{name}_k_{j}") for j in range(8)]
        add_primitive_constraint(model, key, name)
        keys[name] = key
        domains[name] = add_chapter_constraints(
            model, ranks[name], key, chapter, dictionary
        )
    return model, ranks, keys, domains


def evaluate_solution(selected, dictionary, ranks, keys, solver):
    results = []
    for chapter in selected:
        name = chapter["name"]
        pi = [solver.value(x) for x in ranks[name]]
        key = [solver.value(x) for x in keys[name]]
        train_present = 0
        hold_present = 0
        hold_unique = 0
        for truth, cipher in zip(chapter["train_truth"], chapter["train_cipher"]):
            decoded = s.decode(cipher, pi, key, dictionary)
            train_present += truth in decoded
        for truth, cipher in zip(chapter["holdout_truth"], chapter["holdout_cipher"]):
            decoded = s.decode(cipher, pi, key, dictionary)
            hold_present += truth in decoded
            hold_unique += len(decoded) == 1 and truth in decoded
        exact = s.same_action(pi, key, chapter["pi"], chapter["key"])
        results.append({
            "chapter": name,
            "effective_action_recovered": exact,
            "training_truth_present": train_present,
            "training_groups": len(chapter["train_truth"]),
            "holdout_truth_present": hold_present,
            "holdout_groups": len(chapter["holdout_truth"]),
            "holdout_unique": hold_unique,
            "holdout_chapters_with_unique_truth": int(hold_unique > 0),
            "recovered_pi": pi,
            "planted_pi": chapter["pi"],
            "recovered_key": key,
            "planted_key": chapter["key"],
            "key_profile": {
                "all_nonzero": chapter["key_all_nonzero"],
                "all_distinct": chapter["key_all_distinct"],
                "primitive": chapter["key_primitive"],
            },
        })
    return results


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--plant", type=int, choices=[0, 1], required=True)
    parser.add_argument("--mode", choices=["pooled", "independent"], required=True)
    parser.add_argument("--chapter", type=int, choices=range(len(CHAPTERS)))
    parser.add_argument("--seconds", type=int, default=1200)
    parser.add_argument("--workers", type=int, default=4)
    args = parser.parse_args()
    if args.mode == "pooled" and args.chapter is not None:
        parser.error("--chapter is only valid in independent mode")
    if args.mode == "independent" and args.chapter is None:
        parser.error("--chapter is required in independent mode")

    dictionary, base_chapters = load_inputs()
    planted = make_plant(base_chapters, args.plant)
    selected = planted if args.mode == "pooled" else [planted[args.chapter]]
    ceiling = rank_ceiling(planted)
    model, ranks, keys, domains = build_model(
        selected, dictionary, pooled=(args.mode == "pooled")
    )
    error = model.validate()
    if error:
        raise ValueError(error)

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = args.seconds
    solver.parameters.num_search_workers = args.workers
    solver.parameters.random_seed = 3301 + args.plant
    print(model.model_stats(), flush=True)
    print(json.dumps({
        "mode": args.mode,
        "plant": args.plant,
        "chapters": [x["name"] for x in selected],
        "candidate_domains": domains,
        "known_plaintext_phase_rank_ceiling": ceiling,
    }, separators=(",", ":")), flush=True)

    status = solver.solve(model)
    status_name = solver.status_name(status)
    out = {
        "experiment": "q8-multichapter-shared-cycle-pooling",
        "plant": args.plant,
        "mode": args.mode,
        "independent_chapter_index": args.chapter,
        "source_records": [
            {
                "name": x["name"],
                "source": x["source"],
                "total_groups": len(x["all_truth"]),
                "total_runes": sum(map(len, x["all_truth"])),
                "training_groups": len(x["train_truth"]),
                "training_runes": sum(map(len, x["train_truth"])),
                "holdout_groups": len(x["holdout_truth"]),
                "holdout_runes": sum(map(len, x["holdout_truth"])),
                "training_length_profile": x["train_lengths"],
                "holdout_length_profile": x["holdout_lengths"],
                "anchor_group_index": x["anchor"],
            }
            for x in selected
        ],
        "decoder_uses_interword_order": False,
        "decoder_uses_word_adjacency_or_grammar": False,
        "dictionary_size": len(dictionary),
        "primitive_q8_definition": "at least one k[j] != k[j+4], j=0..3",
        "key_profiles": {
            x["name"]: {
                "all_nonzero": x["key_all_nonzero"],
                "all_distinct": x["key_all_distinct"],
                "primitive": x["key_primitive"],
            }
            for x in selected
        },
        "known_plaintext_phase_rank_ceiling": ceiling,
        "solver": {
            "status": status_name,
            "wall_time": solver.wall_time,
            "branches": solver.num_branches,
            "conflicts": solver.num_conflicts,
            "model_stats": model.model_stats(),
            "candidate_domains": domains,
        },
    }
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        evaluated = evaluate_solution(selected, dictionary, ranks, keys, solver)
        out["recovery"] = evaluated
        out["passed"] = (
            all(x["effective_action_recovered"] for x in evaluated)
            and all(x["training_truth_present"] == x["training_groups"] for x in evaluated)
            and all(x["holdout_truth_present"] == x["holdout_groups"] for x in evaluated)
            and (
                args.mode != "pooled"
                or sum(x["holdout_unique"] > 0 for x in evaluated) >= 2
            )
        )
    else:
        out["recovery"] = None
        out["passed"] = False

    suffix = (
        f"pooled-plant{args.plant}"
        if args.mode == "pooled"
        else f"independent-plant{args.plant}-chapter{args.chapter}"
    )
    path = ROOT / f"im-results/lp2-q8-multichapter-{suffix}.json"
    path.write_text(json.dumps(out, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(out, indent=2), flush=True)


if __name__ == "__main__":
    main()
