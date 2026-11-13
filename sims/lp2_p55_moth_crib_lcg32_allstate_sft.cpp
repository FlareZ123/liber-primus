/*
 * LP2 physical p55 conditional 30-rune moth-crib key: exhaustive 32-bit
 * LCG high-15-output gate. This is a source-crib CONDITIONAL exclusion.
 *
 * Original ciphertext: p55 rune indices 46..75, canonical 29-rune alphabet.
 * Proposed plaintext: "THE TOTIENT FUNCTION IS SACRED ALL THINGS" (solved
 * LP1 p05, same Cicada insect artwork). This crib is UNVERIFIED.
 * Use source-calibrated spellings ING and IO as one GP rune each.
 *
 * Enumerates every 2^32 possible observed 32-bit internal states for each
 * conventional LCG recurrence and each of three additive/Beaufort signs,
 * including arbitrary initial seed and any unknown phase/offset. There is
 * no optimization or key fitting to a language score. A match of 30 symbols
 * would be required to support the crib+specific-key-generator conjunction.
 *
 * Test output function: ((state >> 16) & 32767) % 29
 * State evolves (a*state + b) mod 2^32.
 * No claimed Cicada source selects these generators/output mapping. The
 * finite negatives neither disprove the crib nor exclude other PRNGs or
 * GP29 encipherment. No new unknown plaintext is asserted.
 *
 * Example (Windows 11, C++17): compile this file with your C++17 compiler,
 * then run its executable; exits nonzero if a full original match appears,
 * or if the independent planted exact-key implementation control fails.
 */
#include <array>
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <chrono>
#include <algorithm>

constexpr std::array<uint8_t,30> ciphertext{{
  12,18,28,18,10,6,14,6,15,18,15,12,2,2,18,15,2,22,5,28,10,19,5,14,23,11,1,17,18,10
}};
constexpr std::array<uint8_t,30> proposed_plaintext{{
  2,18,16,3,16,10,18,9,16,0,1,9,5,16,27,9,10,15,15,24,5,4,18,23,24,20,20,2,21,15
}};
constexpr std::array<std::array<uint8_t,30>,3> expected_keys{{
  {{10,0,12,15,23,25,25,26,28,18,14,3,26,15,20,6,21,7,19,4,5,15,16,20,28,20,10,15,26,24}},
  {{14,7,15,21,26,16,3,15,2,18,16,21,7,18,16,24,12,8,20,23,15,23,23,8,18,2,21,19,10,25}},
  {{19,0,17,14,6,4,4,3,1,11,15,26,3,14,9,23,8,22,10,25,24,14,13,9,1,9,19,14,3,5}}
}};

struct LCG { const char* name; uint32_t a,b; };
constexpr std::array<LCG,5> lcgs{{
  {"MSVC",214013U,2531011U},
  {"ANSI",1103515245U,12345U},
  {"NumericalRecipes",1664525U,1013904223U},
  {"Borland",22695477U,1U},
  {"TurboPascal",134775813U,1U}
}};
static inline uint32_t step(uint32_t s,LCG l){return s*l.a+l.b;}
static inline uint8_t output(uint32_t s){return uint8_t(((s>>16)&32767U)%29U);}
static inline uint8_t mod29(int x){return uint8_t((x+29)%29);}

static std::array<std::array<uint8_t,30>,3> derive_keys(){
  std::array<std::array<uint8_t,30>,3> k{};
  for(int i=0;i<30;i++){
    k[0][i]=mod29(int(ciphertext[i])-proposed_plaintext[i]);
    k[1][i]=mod29(int(ciphertext[i])+proposed_plaintext[i]);
    k[2][i]=mod29(int(proposed_plaintext[i])-ciphertext[i]);
  }
  assert(k==expected_keys);
  return k;
}

static int prefix(uint32_t state,LCG l,const std::array<uint8_t,30>& key){
  int n=0;
  for(;n<30;n++){
    if(output(state)!=key[n])break;
    state=step(state,l);
  }
  return n;
}
struct ScanResult { int max_prefix=0; uint32_t at_state=0; uint32_t prefix6=0; uint32_t exact_matches=0; };
static ScanResult exhaustive(LCG l,const std::array<uint8_t,30>& key){
  ScanResult out{};
  // Every 32-bit state is uniquely (h<<16)|lo. Only the first observed
  // output depends on h, so its mismatch rules out all 65,536 low states.
  for(uint32_t h=0;h<65536;h++){
    if(((h&32767U)%29U)!=key[0])continue;
    for(uint32_t lo=0;lo<65536;lo++){
      const uint32_t state=(h<<16)|lo;
      const int n=prefix(state,l,key);
      if(n>=6)out.prefix6++;
      if(n>out.max_prefix){out.max_prefix=n;out.at_state=state;}
      if(n==30)out.exact_matches++;
    }
  }
  return out;
}
int main(){
  const auto key=derive_keys();
  // Plant: exact 30-rune LCG word recovered after an arbitrary source offset.
  // Use a different known state for each family and require exact matching.
  for(const LCG l:lcgs){
    const uint32_t planted_state=0x33012014U;
    std::array<uint8_t,30> planted{};
    uint32_t s=planted_state;
    for(auto& x:planted){x=output(s);s=step(s,l);}
    assert(prefix(planted_state,l,planted)==30);
    if(l.a==214013U){
      const ScanResult planted_result=exhaustive(l,planted);
      assert(planted_result.exact_matches>=1);
      assert(planted_result.max_prefix==30);
      std::printf("Positive plant: exhaustive MSVC-state recovery >=1, full length 30\n");
    }
    // Only the same method, same output mapping, and full 30-rune equality
    // are valid success predicates. This positive control is not a real key.
  }
  for(const LCG l:lcgs){
    const auto t0=std::chrono::steady_clock::now();
    for(int model=0;model<3;model++){
      const ScanResult z=exhaustive(l,key[model]);
      std::printf("%s sign=%d longest=%d first_state=%u prefix6=%u full=%u\n",
        l.name,model,z.max_prefix,z.at_state,z.prefix6,z.exact_matches);
      if(z.exact_matches!=0)return 2;
    }
    const double elapsed=std::chrono::duration<double>(
      std::chrono::steady_clock::now()-t0).count();
    std::printf("%s elapsed_seconds=%.3f\n",l.name,elapsed);
  }
  return 0;
}
