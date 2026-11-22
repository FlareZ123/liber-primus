#include <array>
#include <cassert>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <chrono>
#include <random>
#include <vector>
#include <algorithm>
#include <iostream>
#include <string>

// Full-state F2-linear inversion of low two bits of tempered MT19937 output.
// Test first against an actual 32-bit-seeded std::mt19937 stream. The unknown
// 624x32 state is never restricted to any seed convention.
constexpr int N=624, BITS=N*32, LIMBS=(BITS+63)/64;
constexpr uint32_t MATRIX_A=0x9908b0dfu;
struct Bits { std::array<uint64_t,LIMBS> w{}; };
void xorsuffix(Bits& a,const Bits& b,int startlimb=0){
  for(int j=startlimb;j<LIMBS;j++)a.w[j]^=b.w[j];
}
int lowbit(const Bits& a,int from=0){
  for(int i=from/64;i<LIMBS;i++){
    auto x=a.w[i]; if(i==from/64)x &= ~0ull<<(from&63);
    if(x)return i*64+__builtin_ctzll(x);
  }
  return -1;
}
uint32_t temper(uint32_t y){
  y^=(y>>11);y^=(y<<7)&0x9d2c5680u;
  y^=(y<<15)&0xefc60000u;y^=(y>>18);return y;
}
struct SymbolicMT {
  std::vector<Bits> bit;
  int cursor=0;
  std::array<std::vector<int>,2> masks;
  SymbolicMT():bit(BITS){
    for(int i=0;i<BITS;i++)bit[i].w[i/64]=1ull<<(i&63);
    for(int raw=0;raw<32;raw++){
      auto y=temper(uint32_t(1)<<raw);
      for(int out=0;out<2;out++)if(y&(uint32_t(1)<<out))masks[out].push_back(raw);
    }
    std::fprintf(stderr,"masks %zu,%zu\n",masks[0].size(),masks[1].size());
  }
  void twist(){
    for(int i=0;i<N;i++){
      std::array<Bits,32> fresh;
      int far=(i+397)%N,next=(i+1)%N;
      for(int j=0;j<32;j++){
        fresh[j]=bit[far*32+j];
        if(j<30)xorsuffix(fresh[j],bit[next*32+j+1]);
        else if(j==30)xorsuffix(fresh[j],bit[i*32+31]);
        if((MATRIX_A>>j)&1u)xorsuffix(fresh[j],bit[next*32]);
      }
      for(int j=0;j<32;j++)bit[i*32+j]=std::move(fresh[j]);
    }
    cursor=0;
  }
  std::array<Bits,2> output(){
    if(cursor==N)twist();
    std::array<Bits,2> ret;
    for(int o=0;o<2;o++)for(int j:masks[o])xorsuffix(ret[o],bit[cursor*32+j]);
    cursor++;
    return ret;
  }
};
struct F2Solver {
  std::vector<Bits> pivot;
  std::vector<uint8_t> rhs;
  std::vector<uint8_t> occupied;
  int rank=0;
  int contradictions_orig=0;
  int contradictions_plant=0;
  F2Solver():pivot(BITS),rhs(BITS),occupied(BITS){}
  void add(Bits row,uint8_t outcome){
    int k=0;
    while(true){
      int at=lowbit(row,k);
      if(at<0){
        contradictions_orig+=bool(outcome&1);
        contradictions_plant+=bool(outcome&2);
        return;
      }
      if(!occupied[at]){
        occupied[at]=1;rhs[at]=outcome;
        pivot[at]=std::move(row);rank++;
        return;
      }
      xorsuffix(row,pivot[at],at/64);
      outcome^=rhs[at];
      k=at+1;
    }
  }
};
int main(){
  std::string line;
  while(std::getline(std::cin,line)){
    if(line.empty())continue;
    auto delim=line.find('\t');
    if(delim==std::string::npos){std::fprintf(stderr,"bad case\n");return 1;}
    std::string name=line.substr(0,delim), samples=line.substr(delim+1);
    std::mt19937 positive(0x3301);
    SymbolicMT symbolic;
    F2Solver solver;
    auto begin=std::chrono::steady_clock::now();
    size_t observed=0;
    int firstContradiction=-1;
    for(size_t i=0;i<samples.size();i++){
      char character=samples[i];
      uint32_t output=positive();
      auto rows=symbolic.output();
      if(character=='?')continue;
      if(character<'0'||character>'3'){
        std::fprintf(stderr,"invalid sample character: %c\n",character);return 1;
      }
      observed++;
      for(int bit=0;bit<2;bit++){
        uint8_t original=(uint8_t(character-'0')>>bit)&1u;
        uint8_t plant=((output>>bit)&1u)<<1;
        int before=solver.contradictions_orig;
        solver.add(std::move(rows[bit]),original|plant);
        if(solver.contradictions_orig>before && firstContradiction<0)
           firstContradiction=int(i);
      }
      if(solver.contradictions_plant){
        std::fprintf(stderr,"internal symbolic MT mismatch at index %zu\n",i);
        return 3;
      }
    }
    auto elapsed=std::chrono::duration<double>(std::chrono::steady_clock::now()-begin).count();
    std::printf("CASE %s observed %zu draws %zu rank %d original_violations %d first_violation %d planted_violations %d seconds %.3f\n",
                name.c_str(),observed,samples.size(),solver.rank,solver.contradictions_orig,
                firstContradiction,solver.contradictions_plant,elapsed);
    std::fflush(stdout);
  }
}
