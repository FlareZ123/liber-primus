// Exact GP29 q13 source-crib gate with arbitrary deletion and no retry events.
// Tests the four longest repeated solved-LP1 formulas on the full p0-p55 tape.
// C++17, no dependencies.
#include <array>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <algorithm>

using std::array;
using std::string;
using std::vector;
static constexpr int N=29, Q=13;
static constexpr uint32_t ALL=(uint32_t(1)<<29)-1;

static int mod29(int x){ x%=N; return x<0?x+N:x; }

static vector<int> parseTape(const string& path){
  std::ifstream f(path);
  if(!f) throw std::runtime_error("cannot open corpus");
  std::ostringstream ss; ss<<f.rdbuf(); string s=ss.str();
  vector<int> out;
  size_t pos=0;
  while((pos=s.find("\"page\"",pos))!=string::npos){
    size_t c=s.find(':',pos); if(c==string::npos) break; c++;
    while(c<s.size() && isspace((unsigned char)s[c])) c++;
    int page=0; while(c<s.size() && isdigit((unsigned char)s[c])) page=page*10+(s[c++]-'0');
    size_t ip=s.find("\"indices\"",c); if(ip==string::npos) break;
    size_t lb=s.find('[',ip), rb=s.find(']',lb);
    if(lb==string::npos||rb==string::npos) throw std::runtime_error("bad indices");
    if(page>=0 && page<=55){
      size_t p=lb+1;
      while(p<rb){
        while(p<rb && !isdigit((unsigned char)s[p])) p++;
        if(p>=rb) break;
        int v=0; while(p<rb && isdigit((unsigned char)s[p])) v=v*10+(s[p++]-'0');
        out.push_back(v);
      }
    }
    pos=rb+1;
  }
  if(out.size()!=12956) throw std::runtime_error("original length "+std::to_string(out.size()));
  return out;
}

static vector<int> decode(const string& x){
  const string A="0123456789abcdefghijklmnopqrstuvwxyz";
  vector<int> p; p.reserve(x.size());
  for(char ch:x){ auto z=A.find(ch); if(z==string::npos || z>=29) throw std::runtime_error("bad crib"); p.push_back((int)z); }
  return p;
}

struct Gate {
  const vector<int>& P;
  const vector<int>& O;
  int m=0;
  array<int,Q> key{};
  array<array<uint32_t,N>,Q> allowed{};
  uint64_t nodes=0, relaxedLeaves=0, cspLeaves=0;
  bool found=false;
  int foundT=-1;
  array<int,Q> foundKey{};

  Gate(const vector<int>& p,const vector<int>& o,int mm):P(p),O(o),m(mm){
    key.fill(-1);
    // allowed[s][prev] is the bitset of K_s values compatible with all
    // no-repeat inequalities on transitions phase s-1 -> s.
    array<uint32_t,Q> forbiddenDelta{}; forbiddenDelta.fill(0);
    for(int i=1;i<(int)P.size();i++){
      int s=i%Q;
      int d=mod29(P[i-1]-P[i]); // K_s-K_prev may not equal this.
      forbiddenDelta[s] |= uint32_t(1)<<d;
    }
    for(int s=0;s<Q;s++) for(int prev=0;prev<N;prev++){
      uint32_t mask=ALL;
      uint32_t fd=forbiddenDelta[s];
      while(fd){
        int d=__builtin_ctz(fd); fd&=fd-1;
        int cur=mod29(prev+d);
        mask &= ~(uint32_t(1)<<cur);
      }
      allowed[s][prev]=mask;
    }
  }

  bool completeNoRepeat(array<int,Q>& completion){
    array<uint32_t,Q> dom{};
    for(int s=0;s<Q;s++) dom[s]=(key[s]<0?ALL:uint32_t(1)<<key[s]);
    for(int k0=0;k0<N;k0++) if(dom[0]&(uint32_t(1)<<k0)){
      array<array<int,N>,Q> parent; for(auto& a:parent) a.fill(-1);
      uint32_t reach=uint32_t(1)<<k0;
      bool dead=false;
      for(int s=1;s<Q;s++){
        uint32_t next=0;
        uint32_t rr=reach;
        while(rr){
          int prev=__builtin_ctz(rr); rr&=rr-1;
          uint32_t cand=allowed[s][prev]&dom[s];
          uint32_t cc=cand;
          while(cc){
            int cur=__builtin_ctz(cc); cc&=cc-1;
            if(parent[s][cur]<0) parent[s][cur]=prev;
          }
          next|=cand;
        }
        reach=next;
        if(!reach){dead=true;break;}
      }
      if(dead) continue;
      uint32_t rr=reach;
      while(rr){
        int k12=__builtin_ctz(rr); rr&=rr-1;
        if(!(allowed[0][k12]&(uint32_t(1)<<k0))) continue;
        completion[12]=k12;
        for(int s=12;s>=2;s--) completion[s-1]=parent[s][completion[s]];
        completion[0]=k0;
        return true;
      }
    }
    return false;
  }

  void dfs(int t,int i,int j){
    if(found) return;
    nodes++;
    if(j==m){
      relaxedLeaves++;
      array<int,Q> completion{};
      if(completeNoRepeat(completion)){
        cspLeaves++; found=true; foundT=t; foundKey=completion;
      }
      return;
    }
    if(i==(int)P.size() || j+((int)P.size()-i)<m) return;
    int s=i%Q;
    int d=mod29(O[t+j]-P[i]);
    int old=key[s];
    if(old<0 || old==d){
      if(old<0) key[s]=d;
      dfs(t,i+1,j+1);
      if(old<0) key[s]=-1;
    }
    if(found) return;
    if((int)P.size()-(i+1) >= m-j) dfs(t,i+1,j);
  }

  bool run(){
    for(int t=0;t+m<=(int)O.size();t++){
      key.fill(-1); dfs(t,0,0);
      if(found) return true;
    }
    return false;
  }
};

static uint32_t xr=0x3301u;
static uint32_t xorshift(){xr^=xr<<13; xr^=xr>>17; xr^=xr<<5; return xr;}
static int rnd(int n){return int(xorshift()%uint32_t(n));}

static bool directTrueWitness(const vector<int>& P,const vector<int>& O,int m,const array<int,Q>& K,const vector<int>& keep){
  int j=0;
  for(int i=0;i<(int)P.size() && j<m;i++) if(keep[i]){
    if(j>=(int)O.size() || O[j]!=mod29(P[i]+K[i%Q])) return false;
    j++;
  }
  return j==m;
}

int main(){
  const array<string,4> raw={
    "783o4iq317837af8ifg3fg1nq8i4iof5in2ijofgi4",
    "93g783q31o4i783o4iq317837af8ifg3fg1nq8i4i",
    "2ijofgi4783o4iq317837af8ifg3fg1nq8i4i",
    "783o4iq317837af8ifg3fg1nq8i4i"
  };
  const array<int,4> mins={32,31,28,22};
  vector<int> C=parseTape("resources/liber-primus/lp2-corpus.json");

  // Positive controls: random q13 keys are rejected until the whole crib has
  // no adjacent equal accepted outputs; random deletion masks are rejected
  // until the same >=75% visible threshold is met.
  int controlPass=0;
  for(int ci=0;ci<4;ci++){
    vector<int>P=decode(raw[ci]);
    for(int z=0;z<6;z++){
      array<int,Q>K{};
      vector<int>E(P.size()), keep(P.size());
      for(;;){
        for(int s=0;s<Q;s++) K[s]=rnd(N);
        bool ok=true;
        for(int i=0;i<(int)P.size();i++){
          E[i]=mod29(P[i]+K[i%Q]);
          if(i && E[i]==E[i-1]){ok=false;break;}
        }
        if(ok) break;
      }
      int cnt=0;
      do{
        cnt=0;
        for(int i=0;i<(int)P.size();i++){keep[i]=(rnd(36)<29); cnt+=keep[i];}
      }while(cnt<mins[ci]);
      vector<int> O; for(int i=0;i<(int)P.size();i++) if(keep[i]) O.push_back(E[i]);
      if(!directTrueWitness(P,O,mins[ci],K,keep)) throw std::runtime_error("control truth construction");
      Gate g(P,O,mins[ci]);
      if(!g.run()) throw std::runtime_error("control gate missed planted no-retry deletion");
      controlPass++;
    }
  }

  std::cout<<"{\"method\":\"q13 GP29 arbitrary deletion, no retries; exact periodic-difference subsequence plus no-repeat CSP\",";
  std::cout<<"\"controls_passed\":"<<controlPass<<",\"original\":[";
  for(int ci=0;ci<4;ci++){
    if(ci) std::cout<<",";
    vector<int>P=decode(raw[ci]); Gate g(P,C,mins[ci]); bool hit=g.run();
    std::cout<<"{\"ci\":"<<ci<<",\"L\":"<<P.size()<<",\"m\":"<<mins[ci]
             <<",\"nodes\":"<<g.nodes<<",\"relaxed_leaves\":"<<g.relaxedLeaves
             <<",\"csp_leaves\":"<<g.cspLeaves<<",\"hit\":"<<(hit?"true":"false");
    if(hit){
      std::cout<<",\"t\":"<<g.foundT<<",\"key\":[";
      for(int s=0;s<Q;s++){if(s)std::cout<<",";std::cout<<g.foundKey[s];}
      std::cout<<"]";
    }
    std::cout<<"}";
  }
  std::cout<<"]}\n";
  return 0;
}
