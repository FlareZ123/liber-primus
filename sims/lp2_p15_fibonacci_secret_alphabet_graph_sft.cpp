// Build: g++ -O3 -std=c++17 sims/lp2_p15_fibonacci_secret_alphabet_graph_sft.cpp -o fibgraph
// Prepare data with companion Python --prepare DIR [--cmu].
// Run: fibgraph DIR common|separate 0|1 [word-count=2]
// All selected words contain no ciphertext zero; phases are relaxed independently
// except for the necessary bound from the number of preceding literal-zero sites.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <string>
#include <vector>
using namespace std;
int mod(int v){return (v%29+29)%29;}
int val(char c){return c<='9'?c-'0':c-'a'+10;}
struct DSU{
 array<int,58> p,d;
 DSU(){for(int i=0;i<58;i++)p[i]=i,d[i]=0;}
 int root(int x){if(p[x]!=x){int old=p[x];p[x]=root(old);d[x]=mod(d[x]+d[old]);}return p[x];}
 bool add(int a,int b,int k){int ra=root(a),rb=root(b),x=d[a],y=d[b];if(ra==rb)return mod(y-x)==k;p[rb]=ra;d[rb]=mod(k+x-y);return true;}
 bool inject(bool common){array<unsigned,58> a{},b{};for(int i=1;i<29;i++){int r=root(i);unsigned bit=1u<<d[i];if(a[r]&bit)return false;a[r]|=bit;}if(!common)for(int i=30;i<58;i++){int r=root(i);unsigned bit=1u<<d[i];if(b[r]&bit)return false;b[r]|=bit;}return true;}
};
struct Word {int off,len;};
struct Cand{string p;int t;};
vector<int>C;vector<string> D[14];vector<int>K;bool common;
vector<Word>W={{159,13},{1844,12},{322,12},{341,12},{1807,12}};
int zeros(int a,int b){return count(C.begin()+a,C.begin()+b,0);}
bool phaseok(Word a,int ta,Word b,int tb){if(a.off>b.off)return phaseok(b,tb,a,ta);int d=b.off-a.off,z=zeros(a.off,b.off);for(int h=0;h<=z;h++)if((ta+d-h)%14==tb)return true;return false;}
bool extend(DSU &s,Word w,const Cand&c){for(int j=0;j<w.len;j++)if(!s.add(val(c.p[j])+(common?0:29),C[w.off+j],K[(c.t+j)%14]))return false;return s.inject(common);}
vector<vector<Cand>> A;long long nodes[8]{},survive[8]{},full=0;
constexpr long long cap=1000000000;bool capped=false;vector<Cand> cur;
void dfs(DSU s,int i){
 if(capped)return;
 if(i==(int)W.size()){full++;if(full<=10){cout<<"candidate";for(auto&x:cur)cout<<" "<<x.t<<":"<<x.p;cout<<endl;}return;}
 for(auto&c:A[i]){
  if(++nodes[i]>cap){capped=true;return;}
  bool ok=true;for(int j=0;j<i;j++)if(!phaseok(W[j],cur[j].t,W[i],c.t)){ok=false;break;}
  if(!ok)continue;DSU t=s;if(!extend(t,W[i],c))continue;survive[i]++;cur.push_back(c);dfs(t,i+1);cur.pop_back();
  if(capped)return;
 }
}
int main(int argc,char**argv){
 if(argc<4||argc>5)return 2;string dir=argv[1];common=string(argv[2])=="common";int type=atoi(argv[3]),n=argc>4?atoi(argv[4]):2;
 if(n<1||n>5||type<0||type>1)return 2;W.resize(n);
 K=type==0?vector<int>{5,27,3,1,4,5,9,14,23,8,2,10,12,22}:vector<int>{1,6,7,13,20,4,24,28,23,22,16,9,25,5};
 ifstream f(dir+"/fib_source.txt");string l;while(f>>l)for(char c:l)C.push_back(val(c));if(C.size()!=1903)return 3;
 ifstream g(dir+"/fib_lexicon.txt");while(g>>l)D[l.size()].push_back(l);
 for(auto w:W){
  if(zeros(w.off,w.off+w.len))return 4;
  vector<Cand>a;for(int t=0;t<14;t++)for(auto&p:D[w.len]){DSU s;Cand c{p,t};if(extend(s,w,c))a.push_back(c);}
  cout<<"word "<<w.off<<" "<<w.len<<" candidates "<<a.size()<<endl;A.push_back(move(a));
 }
 auto start=chrono::steady_clock::now();dfs(DSU{},0);cout<<"complete "<<!capped<<" full "<<full<<" nodes ";
 for(int i=0;i<n;i++)cout<<nodes[i]<<":"<<survive[i]<<" ";cout<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;
}
