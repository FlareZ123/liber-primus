// GP29 q13 source-crib necessary-condition gate:
// arbitrary accepted-output deletions plus at most one arbitrary key-phase skip.
// A real sender with at most one strict adjacent-repeat retry is a subset.
// C++17; one crib index per run for parallel CI.
#include <array>
#include <atomic>
#include <cctype>
#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>
using std::array; using std::string; using std::vector;
static constexpr int N=29,Q=13;
static int mod29(int x){x%=N;return x<0?x+N:x;}

static vector<int> parseTape(const string& path){
  std::ifstream f(path); if(!f) throw std::runtime_error("cannot open corpus");
  std::ostringstream ss; ss<<f.rdbuf(); string s=ss.str(); vector<int> out; size_t pos=0;
  while((pos=s.find("\"page\"",pos))!=string::npos){
    size_t c=s.find(':',pos); if(c==string::npos) break; c++;
    while(c<s.size()&&isspace((unsigned char)s[c])) c++;
    int page=0; while(c<s.size()&&isdigit((unsigned char)s[c])) page=page*10+(s[c++]-'0');
    size_t ip=s.find("\"indices\"",c),lb=s.find('[',ip),rb=s.find(']',lb);
    if(ip==string::npos||lb==string::npos||rb==string::npos) throw std::runtime_error("bad corpus");
    if(page>=0&&page<=55){
      size_t p=lb+1; while(p<rb){while(p<rb&&!isdigit((unsigned char)s[p]))p++; if(p>=rb)break;
        int v=0; while(p<rb&&isdigit((unsigned char)s[p]))v=v*10+(s[p++]-'0'); out.push_back(v);}
    }
    pos=rb+1;
  }
  if(out.size()!=12956) throw std::runtime_error("original length "+std::to_string(out.size()));
  return out;
}
static vector<int> decode(const string& x){
  const string A="0123456789abcdefghijklmnopqrstuvwxyz"; vector<int> p;
  for(char ch:x){auto z=A.find(ch);if(z==string::npos||z>=29)throw std::runtime_error("bad crib");p.push_back((int)z);}return p;
}
struct Search {
  const vector<int>& P; const vector<int>& O; int m;
  array<int,Q> key{}; const array<int,Q>* truth=nullptr;
  uint64_t nodes=0,leaves=0; bool found=false; int foundT=-1,foundShift=-1;
  Search(const vector<int>&p,const vector<int>&o,int mm):P(p),O(o),m(mm){key.fill(-1);}
  void dfs(int t,int i,int j,int shifts){
    if(found)return; nodes++;
    if(j==m){
      leaves++;
      if(truth){for(int s=0;s<Q;s++)if(key[s]>=0&&key[s]!=(*truth)[s])return;}
      found=true;foundT=t;foundShift=shifts;return;
    }
    if(i==(int)P.size()||j+((int)P.size()-i)<m)return;
    const int maxExtra=(shifts==0?1:0);
    for(int extra=0;extra<=maxExtra&&!found;extra++){
      int r=shifts+extra,phase=(i+r)%Q,d=mod29(O[t+j]-P[i]),old=key[phase];
      if(old<0||old==d){
        if(old<0)key[phase]=d;
        dfs(t,i+1,j+1,r);
        if(old<0)key[phase]=-1;
      }
      if((int)P.size()-(i+1)>=m-j)dfs(t,i+1,j,r);
    }
  }
  bool runRange(int begin,int end,const array<int,Q>* want=nullptr){
    truth=want;
    for(int t=begin;t<end&&!found;t++){key.fill(-1);dfs(t,0,0,0);}
    return found;
  }
};
static uint32_t xr=0x1337c3301u;
static uint32_t rng(){xr^=xr<<13;xr^=xr>>17;xr^=xr<<5;return xr;}
static int rnd(int n){return int(rng()%uint32_t(n));}

struct Plant{array<int,Q>K{};vector<int>E,keep,O;int retries=0,retryAt=-1;};
static Plant makePlant(const vector<int>&P,int m){
  for(;;){
    Plant x; for(int s=0;s<Q;s++)x.K[s]=rnd(N);
    int phase=0,last=-1; bool bad=false;
    for(int i=0;i<(int)P.size();i++){
      int retry=0,c;
      while((c=mod29(P[i]+x.K[phase]))==last){
        phase=(phase+1)%Q; retry++; x.retries++;
        if(x.retries>1||retry>1){bad=true;break;}
        x.retryAt=i;
      }
      if(bad)break;
      if(i==0&&retry){bad=true;break;} // keep P0 accepted at phase 0 for the fixed gauge.
      x.E.push_back(c); last=c; phase=(phase+1)%Q;
    }
    if(bad||x.retries!=1)continue;
    int cnt;
    do{x.keep.assign(P.size(),0);cnt=0;for(size_t i=0;i<P.size();i++){x.keep[i]=(rnd(36)<29);cnt+=x.keep[i];}}while(cnt<m);
    for(size_t i=0;i<P.size();i++)if(x.keep[i])x.O.push_back(x.E[i]);
    return x;
  }
}

int main(int argc,char**argv){
  if(argc!=2)throw std::runtime_error("usage: <crib-index 0..3>");
  int ci=std::stoi(argv[1]);if(ci<0||ci>3)throw std::runtime_error("crib index");
  const array<string,4> raw={
    "783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4",
    "93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i",
    "2ijofgi4783o4iq317837af8ifg3fg1nq8i4i",
    "783o4iq317837af8ifg3fg1nq8i4i"};
  const array<int,4> mins={32,31,28,22};
  vector<int>P=decode(raw[ci]),C=parseTape("resources/liber-primus/lp2-corpus.json");

  int controls=0;
  for(int z=0;z<8;z++){
    Plant x=makePlant(P,mins[ci]);
    Search s(P,x.O,mins[ci]);
    if(!s.runRange(0,(int)x.O.size()-mins[ci]+1,&x.K))
      throw std::runtime_error("missed true one-retry plant");
    controls++;
  }

  int total=(int)C.size()-mins[ci]+1;
  unsigned nt=std::thread::hardware_concurrency(); if(nt<2)nt=2; if(nt>8)nt=8;
  vector<uint64_t> nodes(nt),leaves(nt); std::atomic<bool> any(false);
  vector<std::thread> th;
  for(unsigned k=0;k<nt;k++)th.emplace_back([&,k]{
    Search s(P,C,mins[ci]);
    for(int t=(int)k;t<total&&!any.load(std::memory_order_relaxed);t+=(int)nt){
      s.key.fill(-1);s.dfs(t,0,0,0);
      if(s.found){any.store(true);break;}
    }
    nodes[k]=s.nodes;leaves[k]=s.leaves;
  });
  for(auto&x:th)x.join();
  uint64_t nodeSum=0,leafSum=0;for(auto x:nodes)nodeSum+=x;for(auto x:leaves)leafSum+=x;

  std::ostringstream out;
  out<<"{\"method\":\"GP29 q13 arbitrary deletion plus at most one arbitrary phase skip; necessary relaxation of <=1 retry\","
     <<"\"ci\":"<<ci<<",\"L\":"<<P.size()<<",\"m\":"<<mins[ci]
     <<",\"threads\":"<<nt<<",\"controls_true_key_passed\":"<<controls
     <<",\"nodes\":"<<nodeSum<<",\"relaxed_leaves\":"<<leafSum
     <<",\"hit\":"<<(any.load()?"true":"false")<<"}\n";
  std::cout<<out.str();
  if(const char* p=std::getenv("SFT_OUTPUT")){std::ofstream f(p);f<<out.str();}
  return 0;
}
