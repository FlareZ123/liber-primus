// Validate the sole q8 ci5 relaxed hit against the real strict-repeat sender.
// Candidate came from run 46126305161: t=6285, K=[24,24,19,10,9,6,19,9].
#include <array>
#include <cctype>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>
using std::array;using std::string;using std::vector;
static constexpr int N=29,Q=8,T=6285,M=15;
static int mod29(int x){x%=N;return x<0?x+N:x;}
static vector<int> tape(const string&p){
  std::ifstream f(p);std::ostringstream ss;ss<<f.rdbuf();string s=ss.str();vector<int>o;size_t pos=0;
  while((pos=s.find("\"page\"",pos))!=string::npos){
    size_t c=s.find(':',pos);c++;while(c<s.size()&&isspace((unsigned char)s[c]))c++;
    int pg=0;while(c<s.size()&&isdigit((unsigned char)s[c]))pg=pg*10+s[c++]-'0';
    size_t ip=s.find("\"indices\"",c),lb=s.find('[',ip),rb=s.find(']',lb);
    if(pg<=55){size_t x=lb+1;while(x<rb){while(x<rb&&!isdigit((unsigned char)s[x]))x++;if(x>=rb)break;int v=0;while(x<rb&&isdigit((unsigned char)s[x]))v=v*10+s[x++]-'0';o.push_back(v);}}
    pos=rb+1;
  }
  if(o.size()!=12956)throw std::runtime_error("bad tape");return o;
}
static vector<int> dec(const string&s){const string A="0123456789abcdefghijklmnopqrstuvwxyz";vector<int>o;for(char ch:s){auto p=A.find(ch);if(p==string::npos||p>=29)throw std::runtime_error("bad P");o.push_back((int)p);}return o;}
struct W{int phase0,last0,retries,prefixEnd;vector<int>E,retainedIdx,retryAt;};
int main(){
  const vector<int>P=dec("7i5o9hik3lo9nhi4a68g");
  const array<int,Q>K={24,24,19,10,9,6,19,9};
  const vector<int>C=tape("resources/liber-primus/lp2-corpus.json");
  vector<int>target(C.begin()+T,C.begin()+T+M);
  vector<W>wins;
  for(int phase0=0;phase0<Q;phase0++)for(int lastCode=-1;lastCode<N;lastCode++){
    int phase=phase0,last=lastCode,retries=0;vector<int>E,retryAt;
    for(int i=0;i<(int)P.size();i++){
      while(true){
        int z=mod29(P[i]+K[phase]);phase=(phase+1)%Q;
        if(last>=0&&z==last){retries++;retryAt.push_back(i);if(retries>8)break;continue;}
        E.push_back(z);last=z;break;
      }
      if(retries>8)break;
    }
    if(E.size()!=P.size())continue;
    // Match target as a subsequence, recording the earliest retained positions.
    int j=0,prefixEnd=-1;vector<int>idx;
    for(int i=0;i<(int)E.size()&&j<M;i++)if(E[i]==target[j]){idx.push_back(i);j++;if(j==M)prefixEnd=i;}
    if(j==M){
      // Count only retries at/before the plaintext symbol producing the mth retained emission.
      int used=0;for(int x:retryAt)if(x<=prefixEnd)used++;
      if(used<=2)wins.push_back({phase0,lastCode,used,prefixEnd,E,idx,retryAt});
    }
  }
  // Map target start into project page/local rune offset.
  int rem=T,page=-1,local=-1;
  std::ifstream f("resources/liber-primus/lp2-corpus.json");std::ostringstream ss;ss<<f.rdbuf();string s=ss.str();size_t pos=0;
  while((pos=s.find("\"page\"",pos))!=string::npos){
    size_t c=s.find(':',pos);c++;while(c<s.size()&&isspace((unsigned char)s[c]))c++;int pg=0;while(c<s.size()&&isdigit((unsigned char)s[c]))pg=pg*10+s[c++]-'0';
    size_t rc=s.find("\"runic_count\"",c),colon=s.find(':',rc);colon++;while(colon<s.size()&&isspace((unsigned char)s[colon]))colon++;int n=0;while(colon<s.size()&&isdigit((unsigned char)s[colon]))n=n*10+s[colon++]-'0';
    if(pg<=55){if(rem<n){page=pg;local=rem;break;}rem-=n;}pos=colon;
  }
  std::cout<<"{\"t\":"<<T<<",\"page\":"<<page<<",\"local\":"<<local<<",\"m\":"<<M<<",\"key\":[";
  for(int i=0;i<Q;i++){if(i)std::cout<<",";std::cout<<K[i];}
  std::cout<<"],\"target\":[";for(int i=0;i<M;i++){if(i)std::cout<<",";std::cout<<target[i];}
  std::cout<<"],\"strict_witnesses\":"<<wins.size();
  if(!wins.empty()){
    const auto&w=wins.front();std::cout<<",\"first\":{\"phase0\":"<<w.phase0<<",\"last0\":"<<w.last0<<",\"retries\":"<<w.retries<<",\"prefix_end\":"<<w.prefixEnd<<",\"retained_indices\":[";
    for(size_t i=0;i<w.retainedIdx.size();i++){if(i)std::cout<<",";std::cout<<w.retainedIdx[i];}
    std::cout<<"],\"retry_at\":[";for(size_t i=0;i<w.retryAt.size();i++){if(i)std::cout<<",";std::cout<<w.retryAt[i];}
    std::cout<<"],\"accepted\":[";for(size_t i=0;i<w.E.size();i++){if(i)std::cout<<",";std::cout<<w.E[i];}std::cout<<"]}";
  }
  std::cout<<"}\n";
}
