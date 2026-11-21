#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <iterator>
#include <random>
#include <regex>
#include <stdexcept>
#include <string>
#include <vector>

/**
 * Original p50 base60 graph / p15 Fibonacci ordinal conditional null.
 *
 * Run from repository root using a C++17 compiler. Default 50,000,000
 * original-256-byte-multiset shuffles. Prints exact sample counts. C++ STL
 * uniform_int_distribution can vary across compilers, so pin compiler
 * when comparing a particular seeded count.
 *
 * Source: resources/liber-primus/base60-grid.json
 * Model: root201 has ordered 50+5 disjoint reverse branches; test whether
 * its breadth-level sizes start 1,2,3,4,6 (source p15 prime ordinals)
 * and whether its maximum depth is 15 (16 source p15 number slots).
 */

namespace {
std::array<std::uint8_t,256> load_original() {
  const std::string filename="resources/liber-primus/base60-grid.json";
  std::ifstream file(filename);
  if(!file) throw std::runtime_error("missing original source: "+filename);
  const std::string text((std::istreambuf_iterator<char>(file)),
                         std::istreambuf_iterator<char>());
  auto pos=text.find("\"byte_rows\"");
  if(pos==std::string::npos) throw std::runtime_error("missing byte_rows");
  pos=text.find('[',pos);
  if(pos==std::string::npos) throw std::runtime_error("bad byte_rows");
  std::size_t end=pos;
  int brackets=0;
  for(;end<text.size();end++){
    if(text[end]=='[') brackets++;
    if(text[end]==']' && --brackets==0){end++;break;}
    // Do not let bytes in the other object fields into this parser.
    if(brackets<0) throw std::runtime_error("bad byte_rows nesting");
  }
  if(brackets!=0) throw std::runtime_error("unclosed byte_rows");
  const std::string digits=text.substr(pos,end-pos);
  std::regex number(R"(\b[0-9]+\b)");
  std::array<std::uint8_t,256> result{};
  int index=0;
  for(auto it=std::sregex_iterator(digits.begin(),digits.end(),number);
      it!=std::sregex_iterator();++it){
    const int value=std::stoi(it->str());
    if(index>=256 || value<0 || value>255)
      throw std::runtime_error("bad original byte value/length");
    result[index++]=static_cast<std::uint8_t>(value);
  }
  if(index!=256) throw std::runtime_error("unexpected grid byte count");
  // Original source fingerprints, not a substitute for original files.
  if(result[201]!=74 || result[82]!=201 || result[128]!=201 ||
     result[74]!=205 || result[205]!=76)
    throw std::runtime_error("original p50 route differs");
  return result;
}

std::array<int,256> links,heads;

/** @param root Reverse-graph starting vertex. */
int descendants(const int root,int* nodes){
  std::array<std::uint8_t,256> seen{};
  int n=1;
  nodes[0]=root;
  seen[root]=1;
  for(int i=0;i<n;i++){
    for(int v=heads[nodes[i]];v!=-1;v=links[v])
      if(!seen[v]){seen[v]=1;nodes[n++]=v;}
  }
  return n;
}

void make_reverse(const std::array<std::uint8_t,256>& src){
  heads.fill(-1);
  for(int i=0;i<256;i++){
    links[i]=heads[src[i]];
    heads[src[i]]=i;
  }
}
} // namespace

int main(int argc,char** argv){
  try {
    const std::uint64_t N=argc>1?std::stoull(argv[1]):50000000ULL;
    auto original=load_original(),values=original;
    make_reverse(original);
    int qa[256],qb[256];
    if(descendants(201,qa)!=56||descendants(82,qa)!=50||
       descendants(128,qa)!=5)
      throw std::runtime_error("original 56|50|5 graph failed");
    // Original breadth levels in exact unsigned zero-origin depth convention.
    std::array<int,16> width{};
    std::array<int,256> nodes{},depth{};
    nodes[0]=201;
    int n=1;
    for(int i=0;i<n;i++){
      const int d=depth[i];
      if(d>=16)throw std::runtime_error("original depth beyond 15");
      width[d]++;
      for(int v=heads[nodes[i]];v!=-1;v=links[v]){
        nodes[n]=v;
        depth[n]=d+1;
        n++;
      }
    }
    if(n!=56 || width!=std::array<int,16>{
      1,2,3,4,6,3,5,6,6,3,4,5,3,2,2,1})
      throw std::runtime_error("original depth layer fingerprint changed");
    const auto started=std::chrono::steady_clock::now();
    std::mt19937_64 rng(0x330120142026ULL);
    std::uint64_t root56=0,unordered50_5=0,ordered50_5=0;
    std::uint64_t firstFive=0,depthSixteen=0,both=0;
    for(std::uint64_t test=0;test<N;test++){
      for(int i=255;i>0;i--){
        std::uniform_int_distribution<int> sample(0,i);
        std::swap(values[i],values[sample(rng)]);
      }
      make_reverse(values);
      const int a=heads[201];
      if(a<0)continue;
      const int b=links[a];
      if(b<0 || a==201 || b==201)continue;
      const int lo=std::min(a,b),hi=std::max(a,b);
      const int countLo=descendants(lo,qa);
      const int countHi=descendants(hi,qb);
      if(countLo+countHi!=55)continue;
      std::array<std::uint8_t,256> inLeft{};
      for(int j=0;j<countLo;j++)inLeft[qa[j]]=1;
      bool overlap=false;
      for(int j=0;j<countHi;j++)
        if(inLeft[qb[j]]){overlap=true;break;}
      if(overlap)continue;
      root56++;
      if((countLo==50&&countHi==5)||(countLo==5&&countHi==50))
        unordered50_5++;
      if(countLo!=50||countHi!=5)continue;
      ordered50_5++;

      std::array<int,256> q{},d{},levels{};
      std::array<std::uint8_t,256> seen{};
      q[0]=201; seen[201]=1;
      int size=1,maxDepth=0;
      for(int i=0;i<size;i++){
        maxDepth=std::max(maxDepth,d[i]);
        levels[d[i]]++;
        for(int child=heads[q[i]];child!=-1;child=links[child]){
          if(!seen[child]){
            seen[child]=1;
            q[size]=child;
            d[size]=d[i]+1;
            size++;
          }
        }
      }
      if(size!=56)throw std::runtime_error("conditional root size mismatch");
      const bool five=levels[0]==1&&levels[1]==2&&levels[2]==3&&
                      levels[3]==4&&levels[4]==6;
      if(five)firstFive++;
      if(maxDepth==15)depthSixteen++;
      if(five&&maxDepth==15)both++;
    }
    const auto elapsed=std::chrono::duration<double>(
      std::chrono::steady_clock::now()-started).count();
    std::cout<<"{\"draws\":"<<N<<",\"root56\":"<<root56
      <<",\"unordered50_5\":"<<unordered50_5
      <<",\"ordered50_5\":"<<ordered50_5
      <<",\"p15OrdinalPrefix\":"<<firstFive
      <<",\"sixteenDepthLevels\":"<<depthSixteen
      <<",\"both\":"<<both<<",\"seconds\":"<<elapsed<<"}\n";
  }catch(const std::exception& e){
    std::cerr<<e.what()<<'\n';
    return 1;
  }
}
