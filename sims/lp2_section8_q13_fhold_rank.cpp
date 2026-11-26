// Rank all legal q13 keys with exact frequency and trigram Viterbi DPs.
#include <algorithm>
#include <array>
#include <cassert>
#include <cmath>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <string>
#include <vector>
using namespace std;
constexpr int q=13,A=29,B=30,S=q*B*B;
constexpr double neg=-1e100;
const string digits="0123456789abcdefghijklmnopqrs";
vector<int> decode(const string&s){vector<int> x;for(char c:s){auto z=digits.find(c);assert(z<29);x.push_back(z);}return x;}
string encodeDigits(const vector<int>&p){string s;for(int x:p)s+=digits.at(x);return s;}
vector<int> encrypt(const vector<int>&p,const vector<int>&k){vector<int>c;int j=0;for(int x:p)c.push_back(x?(x+k[j++%q])%A:0);return c;}
struct LM{
 double logp[B][B][A]{};
 LM(const vector<vector<int>>&texts,int held=-1){
  int u[A]{},v[B][A]{},w[B][B][A]{};int total=0,vc[B]{},wc[B][B]{};
  for(int i=0;i<(int)texts.size();++i)if(i!=held){int a=29,b=29;for(int c:texts[i]){++total;++u[c];++v[b][c];++vc[b];++w[a][b][c];++wc[a][b];a=b;b=c;}}
  for(int a=0;a<B;a++)for(int b=0;b<B;b++)for(int c=0;c<A;c++){
   double p1=(u[c]+0.5)/(total+0.5*A),p2=(v[b][c]+4*p1)/(vc[b]+4.0),p3=(w[a][b][c]+4*p2)/(wc[a][b]+4.0);logp[a][b][c]=log(p3);
  }
 }
 double score(const vector<int>&p)const{double s=0;int a=29,b=29;for(int x:p){s+=logp[a][b][x];a=b;b=x;}return s;}
};
struct VResult{double score;vector<int> p;};
VResult viterbi(const vector<int>&c,const vector<int>&k,const LM&lm,bool trace=false){
 vector<double> a(S,neg),b(S,neg);vector<int> active{29*B+29},next; a[active[0]]=0;
 vector<vector<pair<int,int>>> hist;if(trace)hist.reserve(c.size());
 array<int,S> parent{};
 for(int x:c){
  next.clear();
  auto put=[&](int i,int phase,int y,int last,int prev){int j=(phase*B+last)*B+y;double v=a[i]+lm.logp[prev][last][y];if(b[j]==neg)next.push_back(j);if(v>b[j]){b[j]=v;if(trace)parent[j]=i;}};
  for(int i:active){int s=i/(B*B),pr=(i/B)%B,ls=i%B;if(x==0)put(i,s,0,ls,pr);int y=(x-k[s]+A)%A;if(y)put(i,(s+1)%q,y,ls,pr);a[i]=neg;}
  if(next.empty())return {neg,{}};
  if(trace){vector<pair<int,int>> row;for(int i:next)row.emplace_back(i,parent[i]);hist.push_back(move(row));}
  a.swap(b);active.swap(next);
 }
 int best=*max_element(active.begin(),active.end(),[&](int i,int j){return a[i]<a[j];});double value=a[best];vector<int> p;
 if(trace){for(int t=(int)c.size()-1;t>=0;t--){p.push_back(best%B);auto &r=hist[t];auto it=find_if(r.begin(),r.end(),[&](auto z){return z.first==best;});assert(it!=r.end());best=it->second;}reverse(p.begin(),p.end());assert(encrypt(p,k)==c);assert(abs(lm.score(p)-value)<1e-6);}
 return {value,p};
}
// Each target has independent max path count, as in the previous q9-12 work.
array<int,A> freq(const vector<int>&c,const vector<int>&k){
 array<array<int,A>,q> a,b;for(auto &x:a)x.fill(-100000);a[0].fill(0);
 vector<pair<vector<int>,bool>> seg(1);for(int x:c){if(x==0){seg.back().second=true;seg.emplace_back();}else seg.back().first.push_back(x);}
 for(auto &r:seg){for(auto &x:b)x.fill(-100000);for(int s=0;s<q;s++)if(a[s][0]>=0){
  array<int,A> h{};int e=s;bool legal=true;for(int x:r.first){int y=(x-k[e]+A)%A;if(!y){legal=false;break;}++h[y];e=(e+1)%q;}if(!legal)continue;
  for(int t=0;t<A;t++)b[e][t]=max(b[e][t],a[s][t]+h[t]+(r.second&&t==0));
  if(r.second&&k[e]){int y=A-k[e],d=(e+1)%q;for(int t=0;t<A;t++)b[d][t]=max(b[d][t],a[s][t]+h[t]+(t==y));}
 }a=b;}
 array<int,A> m;m.fill(-100000);for(auto &x:a)for(int t=0;t<A;t++)m[t]=max(m[t],x[t]);return m;
}
int main(int argc,char**argv){
 if(argc!=4)return 2;ifstream fc(argv[1]),ft(argv[2]),fk(argv[3]);string s;fc>>s;auto c=decode(s);vector<vector<int>> texts;while(ft>>s)texts.push_back(decode(s));assert(texts.size()==9);LM lm(texts);
 vector<int> bestkey,ek,ak;double best=neg;int bestE=-1,bestAny=-1,tar=-1;size_t n=0;string tag;
 cout<<setprecision(12);
 while(fk>>tag>>s){assert(tag=="K");auto k=decode(s);assert(k.size()==q);auto f=freq(c,k);assert(f[0]>=0);auto v=viterbi(c,k,lm);assert(v.score>neg/2);++n;
  if(v.score>best){best=v.score;bestkey=k;}if(f[18]>bestE){bestE=f[18];ek=k;}for(int t=1;t<A;t++)if(f[t]>bestAny){bestAny=f[t];tar=t;ak=k;}
  cout<<"KEY "<<s<<" "<<v.score/c.size()<<" "<<f[18]<<" "<<*max_element(f.begin()+1,f.end())<<'\n';
 }
 auto v=viterbi(c,bestkey,lm,true);cout<<"TOTAL "<<n<<" best="<<best/c.size()<<" key="<<encodeDigits(bestkey)<<" E="<<bestE<<" keyE="<<encodeDigits(ek)<<" any="<<bestAny<<" target="<<tar<<" keyAny="<<encodeDigits(ak)<<"\nPLAIN "<<encodeDigits(v.p)<<'\n';
 vector<int> historic{0,10,4,0,1,19,0,18,4,18,9,0,18};
 for(int i=0;i<(int)texts.size();i++){
  LM loo(texts,i);auto ct=encrypt(texts[i],historic);auto r=viterbi(ct,historic,loo,true);int correct=0;for(int j=0;j<(int)texts[i].size();j++)correct+=r.p[j]==texts[i][j];
  auto f=freq(ct,historic);assert(f[18]>=count(texts[i].begin(),texts[i].end(),18));cout<<"CONTROL "<<i<<" n="<<texts[i].size()<<" true="<<loo.score(texts[i])/texts[i].size()<<" best="<<r.score/texts[i].size()<<" recovered="<<correct<<" E="<<f[18]<<'\n';
 }
}
