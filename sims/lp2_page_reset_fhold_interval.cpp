#include <algorithm>
#include <array>
#include <bit>
#include <chrono>
#include <numeric>
#include <random>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {
constexpr int alphabet_size = 29;
constexpr int row_limit = 5;
constexpr uint32_t full_row = (1u << alphabet_size) - 1;

#ifndef PHASES
#define PHASES 13
#endif
constexpr int phases = PHASES;
using Rows = std::array<uint32_t, phases>;
using Options = std::vector<Rows>;
using Domain = std::vector<const Rows*>;

struct Page {
    int number;
    int held_count;
    std::vector<int> tape;
    Options masks;
};

Rows all_rows() {
    Rows rows;
    rows.fill(full_row);
    return rows;
}

Rows intersect(const Rows& left, const Rows& right) {
    Rows result;
    for (int phase = 0; phase < phases; ++phase) {
        result[phase] = left[phase] & right[phase];
    }
    return result;
}

bool enough(const Rows& rows, int threshold) {
    int capacity = row_limit * phases;
    for (uint32_t row : rows) {
        const int count = std::popcount(row);
        if (count == 0) return false;
        capacity -= std::max(0, row_limit - count);
        if (capacity < threshold) return false;
    }
    return true;
}

void enumerate(const std::vector<int>& tape, size_t position, int phase, int held,
               const Rows& start, Options& masks, int threshold) {
    Rows rows = start;
    while (position < tape.size()) {
        const int label = tape[position++];
        if (label == held) {
            enumerate(tape, position, phase, held, rows, masks, threshold);
        }
        rows[phase] &= ~(1u << label);
        if (rows[phase] == 0) return;
        phase = (phase + 1) % phases;
    }
    if (enough(rows, threshold)) masks.push_back(rows);
}

void build_masks(Page& page, int held, int threshold, bool anchor) {
    const Rows seed = all_rows();
    for (int phase = 0; phase < (anchor ? 1 : phases); ++phase) {
        enumerate(page.tape, 0, phase, held, seed, page.masks, threshold);
    }
    std::sort(page.masks.begin(), page.masks.end());
    page.masks.erase(std::unique(page.masks.begin(), page.masks.end()), page.masks.end());
}

int rank(const Page& page) {
    return static_cast<int>(page.tape.size()) - 15 * page.held_count;
}

enum class Status { empty, feasible, incomplete };

struct Search {
    int threshold;
    std::chrono::steady_clock::time_point deadline;
    uint64_t nodes = 0;
    uint64_t comparisons = 0;
    Rows winning_support{};

    Status visit(Rows rows, std::vector<Domain> domains) {
        ++nodes;
        if (std::chrono::steady_clock::now() >= deadline) return Status::incomplete;
        if (domains.empty()) {
            winning_support = rows;
            return Status::feasible;
        }

        // Every valid common subset survives in at least one mask per page.
        // A cell absent from their union cannot survive that page.
        for (;;) {
            Rows tightened = rows;
            for (auto& domain : domains) {
                Rows union_rows{};
                auto write = domain.begin();
                for (const Rows* mask : domain) {
                    const Rows common = intersect(rows, *mask);
                    ++comparisons;
                    if (!enough(common, threshold)) continue;
                    *write++ = mask;
                    for (int phase = 0; phase < phases; ++phase) {
                        union_rows[phase] |= common[phase];
                    }
                }
                domain.erase(write, domain.end());
                if (domain.empty()) return Status::empty;
                tightened = intersect(tightened, union_rows);
            }
            if (!enough(tightened, threshold)) return Status::empty;
            if (tightened == rows) break;
            rows = tightened;
        }

        auto chosen = std::min_element(domains.begin(), domains.end(),
            [](const Domain& a, const Domain& b) { return a.size() < b.size(); });
        const Domain alternatives = std::move(*chosen);
        domains.erase(chosen);
        Options unique;
        unique.reserve(alternatives.size());
        for (const Rows* alternative : alternatives) unique.push_back(intersect(rows, *alternative));
        std::sort(unique.begin(), unique.end());
        unique.erase(std::unique(unique.begin(), unique.end()), unique.end());
        for (const Rows& alternative : unique) {
            const Status status = visit(alternative, domains);
            if (status != Status::empty) return status;
        }
        return Status::empty;
    }
};

bool exhaustive(const Rows& support, const std::vector<Domain>& domains,
                size_t index, int threshold) {
    if (index == domains.size()) return enough(support, threshold);
    for (const Rows* option : domains[index]) {
        if (exhaustive(intersect(support, *option), domains, index + 1, threshold)) return true;
    }
    return false;
}

void test() {
    std::mt19937 rng(3301);
    int feasible = 0;
    int excluded = 0;
    for (int trial = 0; trial < 180; ++trial) {
        std::vector<Options> fixtures(3);
        for (auto& page : fixtures) {
            for (int option = 0; option < 5; ++option) {
                Rows cells{};
                for (auto& row : cells) row = 1u | (rng() & ((1u << 9) - 1));
                page.push_back(cells);
            }
        }
        std::vector<Domain> domains;
        for (auto& page : fixtures) {
            Domain alternatives;
            for (const auto& mask : page) alternatives.push_back(&mask);
            domains.push_back(std::move(alternatives));
        }
        const int threshold = phases + trial % (4 * phases + 1);
        const bool expected = exhaustive(all_rows(), domains, 0, threshold);
        Search search{threshold, std::chrono::steady_clock::time_point::max()};
        const auto result = search.visit(all_rows(), domains);
        if ((result == Status::feasible) != expected) throw std::runtime_error("Domain test mismatch");
        feasible += expected;
        excluded += !expected;
    }

    for (int trial = 0; trial < 80; ++trial) {
        Page original{trial, 0, {}, {}};
        const int held = trial % alphabet_size;
        for (int index = 0; index < 70; ++index) {
            const int label = index % 13 == 0 ? held : rng() % alphabet_size;
            original.tape.push_back(label);
            original.held_count += label == held;
        }

        for (bool anchor : {true, false}) {
            const int threshold = phases * row_limit;
            Options direct;
            for (int start = 0; start < (anchor ? 1 : phases); ++start) {
                for (unsigned holds = 0; holds < (1u << original.held_count); ++holds) {
                    int phase = start;
                    unsigned hold_index = 0;
                    Rows rows = all_rows();
                    for (int label : original.tape) {
                        if (label == held && ((holds >> hold_index++) & 1u)) continue;
                        rows[phase] &= ~(1u << label);
                        phase = (phase + 1) % phases;
                    }
                    if (enough(rows, threshold)) direct.push_back(rows);
                }
            }
            std::sort(direct.begin(), direct.end());
            direct.erase(std::unique(direct.begin(), direct.end()), direct.end());
            Page split = original;
            build_masks(split, held, threshold, anchor);
            if (split.masks != direct) throw std::runtime_error("Path enumeration mismatch");
        }
    }
    if (feasible == 0 || excluded == 0) throw std::runtime_error("Incomplete toy coverage");
    std::cout << "Domain fixtures: " << feasible << " feasible, " << excluded
              << " excluded. Exact held-path set comparisons: 160/160.\n";
}

int decode_digit(char value) {
    const int label = value >= 'a' ? value - 'a' + 10 : value - '0';
    if (label < 0 || label >= alphabet_size) throw std::runtime_error("Bad GP29 value");
    return label;
}

void plant(const std::string& file, int held, uint32_t seed) {
    std::ifstream input(file);
    std::string text;
    if (!(input >> text) || held < 0 || held >= alphabet_size) {
        throw std::runtime_error("Invalid plant");
    }
    std::vector<int> source;
    for (char value : text) source.push_back(decode_digit(value));
    std::mt19937 rng(seed);
    std::array<std::array<int, alphabet_size>, phases> alphabets;
    for (auto& row : alphabets) {
        std::iota(row.begin(), row.end(), 0);
        std::shuffle(row.begin(), row.end(), rng);
    }
    std::vector<Page> pages;
    Rows true_support = all_rows();
    for (int index = 0; index < 6; ++index) {
        Page page{index, 0, {}, {}};
        int phase = index == 0 ? 0 : rng() % phases;
        const size_t start = rng() % source.size();
        for (size_t position = 0; position < 135; ++position) {
            const int rune = source[(start + position) % source.size()];
            if (rune == 0) {
                page.tape.push_back(held);
            } else {
                const int ciphertext = alphabets[phase][rune];
                page.tape.push_back(ciphertext);
                true_support[phase] &= ~(1u << ciphertext);
                phase = (phase + 1) % phases;
            }
        }
        pages.push_back(std::move(page));
    }
    const int threshold = phases * row_limit;
    if (!enough(true_support, threshold)) throw std::runtime_error("Plant lacks four absent non-F labels");
    std::vector<Domain> domains;
    for (size_t index = 0; index < pages.size(); ++index) {
        build_masks(pages[index], held, threshold, index == 0);
        Domain domain;
        for (const auto& mask : pages[index].masks) domain.push_back(&mask);
        const bool true_path_retained = std::any_of(domain.begin(), domain.end(), [&](const Rows* mask) {
            return intersect(*mask, true_support) == true_support;
        });
        if (!true_path_retained) throw std::runtime_error("Plant path rejected");
        domains.push_back(std::move(domain));
    }
    Search search{threshold, std::chrono::steady_clock::now() + std::chrono::seconds(60)};
    if (search.visit(all_rows(), domains) != Status::feasible) {
        throw std::runtime_error("Plant lacks verified feasible support");
    }
    std::cout << "Native plant phases=" << phases << " held=" << held << " seed=" << seed
              << " pages=6 status=sat nodes=" << search.nodes << '\n';
}
}

int main(int argc, char** argv) {
    if (argc == 2 && std::string(argv[1]) == "test") {
        test();
        return 0;
    }
    if (argc == 5 && std::string(argv[1]) == "plant") {
        plant(argv[2], std::stoi(argv[3]), std::stoul(argv[4]));
        return 0;
    }
    if (argc != 8 && argc != 10) {
        std::cerr << "Usage: interval pages.txt held rare_limit groups group timeout_seconds max_held [first_page last_page]\n";
        return 2;
    }
    const int held = std::stoi(argv[2]);
    const int threshold = phases * row_limit - std::stoi(argv[3]);
    const int groups = std::stoi(argv[4]);
    const int group = std::stoi(argv[5]);
    const int seconds = std::stoi(argv[6]);
    const int max_held = std::stoi(argv[7]);
    const int first_page = argc == 10 ? std::stoi(argv[8]) : 0;
    const int last_page = argc == 10 ? std::stoi(argv[9]) : 55;
    std::ifstream input(argv[1]);
    if (!input || held < 0 || held >= alphabet_size || threshold < phases ||
        threshold > row_limit * phases || group < 0 || group >= groups) {
        throw std::runtime_error("Invalid case");
    }

    std::vector<Page> pages;
    int page_number;
    std::string line;
    while (input >> page_number >> line) {
        if (page_number < first_page || page_number > last_page) continue;
        Page page{page_number, 0, {}, {}};
        for (char value : line) {
            const int label = decode_digit(value);
            page.tape.push_back(label);
            page.held_count += (label == held);
        }
        pages.push_back(std::move(page));
    }
    std::sort(pages.begin(), pages.end(), [](const Page& a, const Page& b) {
        return rank(a) == rank(b) ? a.number < b.number : rank(a) > rank(b);
    });

    // The original rank determines disjoint groups. The held-count filter merely
    // omits costly pages within a group, preserving a valid lower bound.
    std::vector<Page> selected;
    for (size_t index = group; index < pages.size(); index += groups) {
        if (pages[index].held_count <= max_held && pages[index].tape.size() >= 120) {
            selected.push_back(std::move(pages[index]));
        }
    }
    std::vector<Domain> domains;
    for (size_t index = 0; index < selected.size(); ++index) {
        build_masks(selected[index], held, threshold, index == 0);
        Domain domain;
        for (const Rows& rows : selected[index].masks) domain.push_back(&rows);
        domains.push_back(std::move(domain));
    }
    Search search{threshold, std::chrono::steady_clock::now() + std::chrono::seconds(seconds)};
    const Status status = search.visit(all_rows(), domains);
    const char* label = status == Status::empty ? "unsat" : status == Status::feasible ? "sat" : "unknown";
    std::cout << first_page << '-' << last_page << ' '
              << phases << ' ' << group << ' ' << held << ' ' << label
              << " nodes=" << search.nodes << " comparisons=" << search.comparisons << " pages=";
    for (const auto& page : selected) std::cout << page.number << ':' << page.masks.size() << ',';
    std::cout << '\n';
}
