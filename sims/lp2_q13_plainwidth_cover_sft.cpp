#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <random>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=13,A=29; constexpr unsigned ALL=(1u<<Q)-1;
constexpr array<int,A> W={1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,1,1,1,2,2,1,1,2,1,2,2};
constexpr array<int,7> W2={2,12,21,22,25,27,28};
using Key=array<int,Q>; using Tape=vector<int>;
int mod(int v){return (v+A)%A;}
int digit(char c){return c<='9'?c-'0':c-'a'+10;}
char sym(int x){return x<10?'0'+x:'a'+x-10;}
string str(const Key&k){string s;for(auto x:k)s+=sym(x);return s;}
Tape parse(string s){Tape p;for(char c:s){int x=digit(c);assert(x>=0&&x<A);p.push_back(x);}return p;}
Tape readTape(const string&path){ifstream in(path);string s;in>>s;if(s.empty())throw runtime_error("empty tape");return parse(s);}
struct Word {Tape p,phase;int end,cover;};
Word word(Tape p){Word w{p,{},0,0};int t=0;unsigned m=0;for(int x:p){w.phase.push_back(x?t:-1);if(x){m|=1u<<t;t=(t+W[x])%Q;}}w.end=t;w.cover=__builtin_popcount(m);return w;}
vector<Word> readBank(const string&path){ifstream in(path);string s;vector<Word> v;while(in>>s){v.push_back(word(parse(s)));assert(v.back().cover>=11);}return v;}
unsigned rol(unsigned m,int n){return ((m<<n)|(m>>(Q-n)))&ALL;}
unsigned ror(unsigned m,int n){return ((m>>n)|(m<<(Q-n)))&ALL;}
struct Trans {array<unsigned,A> one{},two{};};
Trans transition(const Key&k){Trans x;array<unsigned,A> blocked{};unsigned unknown=0;
 for(int t=0;t<Q;t++){unsigned b=1u<<t;if(k[t]<0){unknown|=b;continue;}blocked[k[t]]|=b;for(int p:W2)x.two[(k[t]+p)%A]|=b;}
 for(int c=0;c<A;c++){x.one[c]=(ALL&~(blocked[c]|x.two[c]))|unknown;x.two[c]|=unknown;}return x;
}
unsigned next(const Trans&t,int c,unsigned m){return rol(m&t.one[c],1)|rol(m&t.two[c],2)|(c==0?m:0);}
unsigned prev(const Trans&t,int c,unsigned m){return (ror(m,1)&t.one[c])|(ror(m,2)&t.two[c])|(c==0?m:0);}
unsigned fwd(const Tape&c,const Trans&t,int lo,int hi,unsigned m){for(int i=lo;i<hi&&m;i++)m=next(t,c[i],m);return m;}
unsigned back(const Tape&c,const Trans&t,int lo,int hi,unsigned m){for(int i=hi-1;i>=lo&&m;i--)m=prev(t,c[i],m);return m;}
bool fits(const Tape&c,const Trans&t,int lo,int hi,int at,int end,int phase){if(at-lo>hi-end)return back(c,t,lo,at,1)&&fwd(c,t,end,hi,1u<<phase);return fwd(c,t,end,hi,1u<<phase)&&back(c,t,lo,at,1);}
unsigned brute(const Key&k,int c,unsigned m,bool reverse){unsigned out=0;for(int t=0;t<Q;t++){if(c==0&&(m&(1u<<t)))out|=1u<<t;for(int a=0;a<A;a++)if(k[t]<0||k[t]==a){int p=mod(c-a);if(!p)continue;int u=(t+W[p])%Q;if(reverse){if(m&(1u<<u))out|=1u<<t;}else if(m&(1u<<t))out|=1u<<u;}}return out;}
void toy(){mt19937 rng(3301);for(int i=0;i<10000;i++){Key k;for(int&t:k)t=int(rng()%30)-1;Trans x=transition(k);unsigned m=rng()&ALL;int c=rng()%A;assert(next(x,c,m)==brute(k,c,m,false));assert(prev(x,c,m)==brute(k,c,m,true));}cerr<<"toy transition comparisons 20000/20000\n";}
struct Counts{uint64_t placements=0,partial=0,complete=0,relaxRejected=0,exactTested=0,local=0,continuous=0,shared=0;};
int main(int argc,char**argv){if(argc<4)return 1;string mode=argv[1];auto c=readTape(argv[2]);auto words=readBank(argv[3]);vector<int>cuts;Key truth{};int truthWord=-1,truthAt=-1,truthPhase=0;bool truthFound=false;
 if(mode=="original"){assert(c.size()==12956&&words.size()==57);uint32_t h=2166136261u;for(int x:c)h=(h^x)*16777619u;assert(h==4267951341u);cuts={0,729,1874,3603,5506,6527,7960,9640,12648,12956};}
 else if(mode=="plant"){assert(argc==7);truthWord=stoi(argv[4]);truthAt=stoi(argv[5]);uint32_t seed=stoul(argv[6]);for(int&x:truth){seed=seed*1664525u+1013904223u;x=seed%A;}const auto&w=words.at(truthWord);assert(truthAt>=0&&truthAt+(int)w.p.size()<=(int)c.size());copy(w.p.begin(),w.p.end(),c.begin()+truthAt);int phase=0;for(int i=0;i<(int)c.size();i++){if(i==truthAt)truthPhase=phase;int p=c[i];if(p){c[i]=(p+truth[phase])%A;phase=(phase+W[p])%Q;}}cuts={0,(int)c.size()};rotate(truth.begin(),truth.begin()+truthPhase,truth.end());cerr<<"truth "<<truthWord<<" "<<truthAt<<" "<<str(truth)<<"\n";}
 else return 1;
 toy();vector<Counts>rows(words.size());Counts total;
 for(int wi=0;wi<(int)words.size();wi++){const auto&w=words[wi];auto&z=rows[wi];int n=w.p.size(),missing=Q-w.cover;uint64_t completions=1;for(int i=0;i<missing;i++)completions*=A;
  for(int j=0;j+1<(int)cuts.size();j++){int lo=cuts[j],hi=cuts[j+1];for(int at=lo;at+n<=hi;at++){z.placements++;Key k;k.fill(-1);bool ok=true;for(int i=0;i<n;i++){int t=w.phase[i],x=c[at+i],p=w.p[i];if(t<0){if(x){ok=false;break;}continue;}int a=mod(x-p);if(k[t]>=0&&k[t]!=a){ok=false;break;}k[t]=a;}if(!ok)continue;z.partial++;z.complete+=completions;
    if(missing&& !fits(c,transition(k),lo,hi,at,at+n,w.end)){z.relaxRejected+=completions;continue;}
    auto dfs=[&](auto&&self,int pos)->void{if(pos==Q){z.exactTested++;Trans t=transition(k);if(!fits(c,t,lo,hi,at,at+n,w.end))return;z.local++;bool cont=fits(c,t,0,c.size(),at,at+n,w.end),shared=true;for(int a=0;a+1<(int)cuts.size();a++)if(a!=j&&!fwd(c,t,cuts[a],cuts[a+1],ALL)){shared=false;break;}z.continuous+=cont;z.shared+=shared;
       if(wi==truthWord&&at==truthAt&&k==truth)truthFound=true;
       cout<<"C "<<wi<<" "<<j<<" "<<at<<" "<<str(k)<<" "<<cont<<" "<<shared<<"\n";return;}
      if(k[pos]>=0){self(self,pos+1);return;}for(int x=0;x<A;x++){k[pos]=x;self(self,pos+1);}k[pos]=-1;
    };dfs(dfs,0);
  }}
  assert(z.complete==z.relaxRejected+z.exactTested);
  cout<<"W "<<wi<<" "<<w.cover<<" "<<z.placements<<" "<<z.partial<<" "<<z.complete<<" "<<z.relaxRejected<<" "<<z.exactTested<<" "<<z.local<<" "<<z.continuous<<" "<<z.shared<<"\n";cout.flush();
  total.placements+=z.placements;total.partial+=z.partial;total.complete+=z.complete;total.relaxRejected+=z.relaxRejected;total.exactTested+=z.exactTested;total.local+=z.local;total.continuous+=z.continuous;total.shared+=z.shared;
 }
 cout<<"T "<<total.placements<<" "<<total.partial<<" "<<total.complete<<" "<<total.relaxRejected<<" "<<total.exactTested<<" "<<total.local<<" "<<total.continuous<<" "<<total.shared<<"\n";
 if(mode=="plant"){cout<<"P "<<truthFound<<"\n";assert(truthFound);}return 0;
}
