// SFT: Ghostscript 9.06 Park-Miller unknown-state seed inversion with original
// LP2 p0 red8+5 header and signed 2016 EPIPHANY SEEKS 8+5 plaintext crib.
// Source premise: ICC Artifex in original LP2 JPEGs suggests toolchain;
// 2016 signed message is a possible author-authenticated plaintext clue.
// Full seed space, NO chosen key, run from repo root with C++17 compiler.
// This negative does not prove EPIPHANY SEEKS is the actual plaintext title.
#include <array>
#include <cstdint>
#include <cassert>
#include <iostream>
#include <algorithm>
#include <fstream>
#include <iterator>
#include <stdexcept>
#include <string>
#include <vector>

constexpr std::uint64_t M = 2147483647ULL, A = 16807ULL;
constexpr std::array<int,13> C = {15,8,18,3,6,19,27,0,15,26,18,21,5};
constexpr std::array<int,13> P = {18,13,10,13,8,24,9,26,15,18,18,5,15};
void verifySources() {
  auto read=[](const std::string& name) {
    std::ifstream in(name,std::ios::binary);
    if(!in) throw std::runtime_error("missing source: "+name);
    return std::string((std::istreambuf_iterator<char>(in)),
      std::istreambuf_iterator<char>());
  };
  const auto corpus=read("resources/liber-primus/lp2-corpus.json");
  auto at=corpus.find("\"indices\"");
  if(at==std::string::npos) throw std::runtime_error("source indices missing");
  at=corpus.find('[',at);
  std::vector<int> original;
  while(++at<corpus.size()&&corpus[at]!=']') {
    if(corpus[at]<'0'||corpus[at]>'9') continue;
    int n=0;
    do {n=10*n+(corpus[at++]-'0');}
    while(at<corpus.size()&&corpus[at]>='0'&&corpus[at]<='9');
    if(n<0||n>=29) throw std::runtime_error("invalid GP29 source value");
    original.push_back(n);--at;
  }
  if(original.size()<13 || !std::equal(C.begin(),C.end(),original.begin()))
    throw std::runtime_error("p0 source first13 differs");
  const auto signed2016=read("resources/historical/cicada2016-4gq25-outguess.asc");
  if(signed2016.find("epiphany seeks the devoted")==std::string::npos)
    throw std::runtime_error("signed 2016 phrase missing");
  std::cout<<"SOURCE original p0 red13 and signed2016 phrase checked\n";
}
int mod(int a,int n) {return ((a%n)+n)%n;}
std::uint32_t next(std::uint32_t x) {
  return static_cast<std::uint32_t>((A*x)%M);
}
struct Case {std::string name;int q;std::vector<int> key;};
std::vector<Case> setup() {
  std::vector<Case> out;
  for(int sign:{1,-1}) {
    Case v{"additive_sign"+std::to_string(sign),29,{}};
    for(int i=0;i<13;i++) v.key.push_back(mod(sign*(C[i]-P[i]),29));
    out.push_back(v);
  }
  for(std::string scheme:{"cyclic","sorted"}) {
    std::vector<int> rank;
    for(int i=1;i<13;i++) {
      int r=scheme=="cyclic"?mod(C[i]-C[i-1]-1,29):
        C[i]-(C[i]>C[i-1]?1:0);
      assert(r>=0&&r<28);
      rank.push_back(r);
    }
    for(int sign:{1,-1}) {
      Case v{scheme+"_sign"+std::to_string(sign),28,{}};
      for(int i=0;i<12;i++)
        v.key.push_back(mod(rank[i]-sign*P[i+1],28));
      out.push_back(v);
    }
  }
  return out;
}
int proj(std::uint32_t x,int q,bool scaled) {
  return scaled?static_cast<int>((std::uint64_t(x)*q)/M):int(x%q);
}
struct Output {
  std::uint64_t checked=0;
  std::array<std::uint64_t,14> prefix{};
  int best=0;
  std::uint32_t bestState=0;
  std::vector<std::uint32_t> full;
};
Output check(const Case& c,bool scaled) {
  const int n=static_cast<int>(c.key.size());
  assert(n==12||n==13);
  Output out;
  std::uint64_t first=0,last=0,step=1;
  if(scaled) {
    first=std::max<std::uint64_t>(1,
      (std::uint64_t(c.key[0])*M+c.q-1)/c.q);
    last=std::min<std::uint64_t>(M-1,
      (std::uint64_t(c.key[0]+1)*M+c.q-1)/c.q-1);
  } else {
    first=c.key[0]?c.key[0]:c.q;
    last=M-1;step=c.q;
  }
  for(std::uint64_t raw=first;raw<=last;raw+=step) {
    ++out.checked;
    std::uint32_t x=raw;
    int matches=1;
    while(matches<n) {
      x=next(x);
      if(proj(x,c.q,scaled)!=c.key[matches]) break;
      matches++;
    }
    if(matches>out.best) {out.best=matches;out.bestState=raw;}
    for(int k=2;k<=std::min(n,8);k++)
      if(matches>=k) out.prefix[k]++;
    if(matches==n) out.full.push_back(raw);
  }
  return out;
}
int main() {
  verifySources();
  const auto cases=setup();
  const std::array<std::array<std::uint64_t,4>,12> expected={{
    {{2551056,88023,3030,103}}, {{2555464,88180,3044,112}},
    {{2555462,88040,3036,105}}, {{2555464,88040,3032,107}},
    {{2737996,97752,3494,124}}, {{2737995,97720,3493,124}},
    {{2737997,97740,3493,124}}, {{2742560,98039,3488,117}},
    {{2737997,97713,3493,122}}, {{2737997,97726,3486,124}},
    {{2737998,97714,3506,123}}, {{2737998,97742,3492,119}}
  }};
  int j=0;
  for(const auto& c:cases) for(bool scaled:{false,true}) {
    const auto o=check(c,scaled);
    assert(o.full.empty());
    assert(o.best==6 && o.prefix[8]==0);
    assert((std::array<std::uint64_t,4>{o.prefix[2],o.prefix[3],
      o.prefix[4],o.prefix[5]}==expected[j++]));
    std::cout<<"ORIGINAL "<<c.name<<" "<<(scaled?"scale":"mod")
      <<" q="<<c.q<<" length="<<c.key.size()<<" firststates="
      <<o.checked<<" first2="<<o.prefix[2]<<" first3="<<o.prefix[3]
      <<" first4="<<o.prefix[4]<<" first5="<<o.prefix[5]
      <<" maximalPrefix="<<o.best<<" full="<<o.full.size()<<"\n";
  }
  // True 13-step Park-Miller native-GP plant with known first emitted seed.
  Case plant{"positive_3301",29,{}};
  std::uint32_t state=3301;
  for(int i=0;i<13;i++) {
    plant.key.push_back(proj(state,29,false));
    state=next(state);
  }
  const auto positive=check(plant,false);
  assert(positive.full.size()==1 && positive.full[0]==3301);
  std::cout<<"POSITIVE unique full-13-rune Park-Miller seed 3301 recovered\n"
    <<"PASS: all 12 source-anchored original inverse models rejected\n";
}
