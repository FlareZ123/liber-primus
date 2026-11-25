#include <algorithm>
#include <array>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>

// Matched structural null for the 32x8 p50 panel: each row is eight distinct
// uniform destinations in [0,255], while rows are independent.
int main(int argc, char** argv) {
    constexpr std::uint64_t seed = 20261125;
    int samples = 1000000;
    if (argc > 1) samples = std::stoi(argv[1]);
    std::mt19937_64 rng(seed);
    std::uniform_int_distribution<int> draw(0, 255);
    std::uint64_t exact_2_11 = 0, cyclic_13 = 0, two_cycles = 0, exact_basins = 0;
    for (int rep = 0; rep < samples; ++rep) {
        std::array<int, 256> next{};
        for (int row = 0; row < 32; ++row) {
            std::array<unsigned char, 256> used{};
            for (int col = 0; col < 8; ++col) {
                int x;
                do { x = draw(rng); } while (used[x]);
                used[x] = 1;
                next[row * 8 + col] = x;
            }
        }
        std::array<unsigned char, 256> visited{}, is_cycle{};
        std::vector<int> lengths;
        for (int start = 0; start < 256; ++start) {
            if (visited[start]) continue;
            std::vector<int> path;
            std::array<int, 256> position;
            position.fill(-1);
            int v = start;
            while (!visited[v] && position[v] < 0) {
                position[v] = static_cast<int>(path.size());
                path.push_back(v);
                v = next[v];
            }
            if (position[v] >= 0) {
                int begin = position[v];
                lengths.push_back(static_cast<int>(path.size()) - begin);
                for (int k = begin; k < static_cast<int>(path.size()); ++k) is_cycle[path[k]] = 1;
            }
            for (int x : path) visited[x] = 1;
        }
        std::sort(lengths.begin(), lengths.end());
        int cyclic = std::accumulate(lengths.begin(), lengths.end(), 0);
        if (cyclic == 13) ++cyclic_13;
        if (lengths.size() == 2) ++two_cycles;
        bool exact = lengths.size() == 2 && lengths[0] == 2 && lengths[1] == 11;
        if (exact) ++exact_2_11;
        if (!exact) continue;
        std::array<int, 256> cycle_id;
        cycle_id.fill(-1);
        int id = 0;
        for (int start = 0; start < 256; ++start) {
            if (!is_cycle[start] || cycle_id[start] >= 0) continue;
            int v = start;
            do { cycle_id[v] = id; v = next[v]; } while (v != start);
            ++id;
        }
        std::array<int, 2> basin{};
        for (int start = 0; start < 256; ++start) {
            int v = start, guard = 0;
            while (cycle_id[v] < 0 && guard++ < 256) v = next[v];
            if (cycle_id[v] >= 0) ++basin[cycle_id[v]];
        }
        std::sort(basin.begin(), basin.end());
        if (basin[0] == 4 && basin[1] == 252) ++exact_basins;
    }
    std::cout << "N=" << samples << " seed=" << seed << '\n';
    std::cout << "cycles_2_11=" << exact_2_11 << " p=" << double(exact_2_11) / samples << '\n';
    std::cout << "cyclic_vertices_13=" << cyclic_13 << " p=" << double(cyclic_13) / samples << '\n';
    std::cout << "two_cycles=" << two_cycles << " p=" << double(two_cycles) / samples << '\n';
    std::cout << "cycles_2_11_and_components_4_252=" << exact_basins << " p=" << double(exact_basins) / samples << '\n';
}
