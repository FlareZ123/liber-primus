#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <map>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <tuple>
#include <vector>
using namespace std;
constexpr int A=29,Q=13,MS=Q*9;
constexpr double NEG=-1e100,EPS=.005,REPAIR=.8/28.,UNREPAIRED=.2;
const string chars="abcdefghijklmnopqrstuvwxyzABC";
using V=vector<int>;using K=array<int,Q>;
int mod(int x){return x<0?x+29:x>=29?x-29:x;}
string enc(const V& p){string s;for(auto z:p)s+=chars.at(z);return s;}
V dec(const string&s){V p;for(char c:s)p.push_back(int(chars.find(c)));return p;}
string keystr(const K&k,int q){return enc(V(k.begin(),k.begin()+q));}
string canon(const K&k,int q){auto s=keystr(k,q),b=s;for(int j=1;j<q;j++)b=min(b,s.substr(j)+s.substr(0,j));return b;}
bool original(const string& n){return n.find('-')!=string::npos&&n[0]=='p';}
struct LM{
 double u[A]{},b[A][A]{},t[A][A][A]{};double lu[A]{},lb[A][A]{},lt[A][A][A]{};
 LM(const map<string,V>&data,const string&exclude){
  double uc[A]{},bc[A][A]{},tc[A][A][A]{},bn[A]{},tn[A][A]{},n=0;
  for(auto&[name,p]:data)if(name!=exclude&&!original(name))for(size_t i=0;i<p.size();i++){
   int z=p[i];uc[z]++;n++;if(i){bc[p[i-1]][z]++;bn[p[i-1]]++;}if(i>1){tc[p[i-2]][p[i-1]][z]++;tn[p[i-2]][p[i-1]]++;}
  }
  for(int z=0;z<A;z++){u[z]=(uc[z]+.5)/(n+.5*A);lu[z]=log(u[z]);}
  for(int a=0;a<A;a++)for(int z=0;z<A;z++){b[a][z]=(bc[a][z]+6*u[z])/(bn[a]+6);lb[a][z]=log(b[a][z]);}
  for(int a=0;a<A;a++)for(int x=0;x<A;x++)for(int z=0;z<A;z++){t[a][x][z]=(tc[a][x][z]+8*b[x][z])/(tn[a][x]+8);lt[a][x][z]=log(t[a][x][z]);}
 }
};
// Mode 0: ordinary advance; 1: repaired collision holds phase; 2: literal F holds phase.
struct Tape{
 V c;int q,n;bool literal;const LM& lm;int prev[Q]{},next[Q]{};
 Tape(V C,int q_,bool f,const LM& l):c(move(C)),q(q_),n(int(c.size())),literal(f),lm(l){for(int j=0;j<q;j++){prev[j]=(j+q-1)%q;next[j]=(j+1)%q;}}
 double prob(int i,int j,int m,const K&k,double eps)const{
  if(m==2)return literal&&c[i]==0?1.:0.;
  if(m==1&&(i==0||c[i]==c[i-1]))return 0.;
  int p=mod(c[i-(m==1)]-k[j]);double factor=literal&&p==0?eps:1.;
  return factor*(m==1?REPAIR:i&&c[i]==c[i-1]?UNREPAIRED:1.);
 }
 int out(int j,int m)const{return m==0?next[j]:j;}
 int in(int j,int m)const{return m==0?prev[j]:j;}
 int plain(int i,int j,int m,const K&k)const{return m==2?0:mod(c[max(0,i-(m==1))]-k[j]);}
 double unigram(const K&k,int cut,bool em,K* updated=nullptr,double eps=EPS)const{
  vector<array<double,Q>> alpha(cut+1);vector<double> scales(cut);
  for(int j=0;j<q;j++)alpha[0][j]=1./q;double score=0;
  for(int i=0;i<cut;i++){
   auto& a=alpha[i];auto& b=alpha[i+1];double total=0;
   for(int j=0;j<q;j++)for(int m=0;m<3;m++){
    double w=prob(i,j,m,k,eps);if(w==0)continue;
    b[out(j,m)]+=a[j]*w*lm.u[plain(i,j,m,k)];
   }
   for(int j=0;j<q;j++)total+=b[j];if(total<=0)return NEG;scales[i]=total;score+=log(total);for(int j=0;j<q;j++)b[j]/=total;
  }
  if(!em)return score;
  double counts[Q][A]{};array<double,Q> back{},older{};for(int j=0;j<q;j++)back[j]=1;
  for(int i=cut-1;i>=0;i--){older.fill(0);for(int j=0;j<q;j++)for(int m=0;m<3;m++){
    double w=prob(i,j,m,k,eps);if(w==0)continue;
    double z=w*lm.u[plain(i,j,m,k)]*back[out(j,m)]/scales[i];older[j]+=z;
    if(m!=2)counts[j][c[i-(m==1)]]+=alpha[i][j]*z;
   }back=older;}
  *updated=k;for(int j=0;j<q;j++){
   double best=NEG;int bestK=k[j];for(int z=0;z<A;z++){
    double v=0;for(int x=0;x<A;x++){int p=mod(x-z);v+=counts[j][x]*(lm.lu[p]+(literal&&p==0?log(eps):0));}
    if(v>best+1e-10){best=v;bestK=z;}
   }(*updated)[j]=bestK;
  }return score;
 }
 // Exact scaled bigram marginal; eps>0 is only a search relaxation.
 double bigram(const K&k,int cut,int end,double eps=EPS,double* prefix=nullptr)const{
  double a[Q*3]{},b[Q*3]{};double score=0;
  for(int j=0;j<q;j++)for(int m=0;m<3;m++){
   double w=prob(0,j,m,k,eps);if(w)a[out(j,m)*3+m]+=w*lm.u[plain(0,j,m,k)]/q;
  }
  for(int i=0;i<end;i++){
   if(i){fill(b,b+q*3,0.);for(int j=0;j<q;j++){
     double pprev[3];int zprev[3];for(int pm=0;pm<3;pm++){pprev[pm]=a[j*3+pm];zprev[pm]=plain(i-1,in(j,pm),pm,k);}
     for(int m=0;m<3;m++){
      double w=prob(i,j,m,k,eps);if(!w)continue;int z=plain(i,j,m,k);
      double sum=0;for(int pm=0;pm<3;pm++)sum+=pprev[pm]*lm.b[zprev[pm]][z];b[out(j,m)*3+m]+=w*sum;
     }
    }copy(b,b+q*3,a);}
   double total=accumulate(a,a+q*3,0.);if(total<=0)return NEG;score+=log(total);for(int s=0;s<q*3;s++)a[s]/=total;if(i+1==cut&&prefix)*prefix=score;
  }return score;
 }
 // Exact trigram Viterbi: (outgoing phase, last mode, penultimate mode).
 static int st(int j,int m,int pm){return j*9+m*3+pm;}
 double viterbi(const K&k,int end,double eps=0,V* decoded=nullptr,V* modes=nullptr,int* initPhase=nullptr)const{
  double a[MS],b[MS];fill(a,a+q*9,NEG);vector<array<int16_t,MS>> back;if(decoded)back.resize(end);
  for(int j=0;j<q;j++)for(int m=0;m<3;m++){
   double w=prob(0,j,m,k,eps);if(!w)continue;int s=st(out(j,m),m,0);a[s]=log(w)+lm.lu[plain(0,j,m,k)]-log(q);
  }
  for(int i=1;i<end;i++){
   fill(b,b+q*9,NEG);for(int j=0;j<q;j++)for(int m=0;m<3;m++){
    double w=prob(i,j,m,k,eps);if(!w)continue;double lw=log(w);int z=plain(i,j,m,k),to=out(j,m);
    for(int pm=0;pm<3;pm++){
     int h=in(j,pm),zp=plain(i-1,h,pm,k);int dst=st(to,m,pm);double best=NEG;int bestPrev=-1;
     if(i==1){int src=st(j,pm,0);if(a[src]>NEG/2){best=a[src]+lm.lb[zp][z];bestPrev=src;}}
     else for(int ppm=0;ppm<3;ppm++){
      int src=st(j,pm,ppm);if(a[src]<=NEG/2)continue;int zpp=plain(i-2,in(h,ppm),ppm,k);double s=a[src]+lm.lt[zpp][zp][z];if(s>best){best=s;bestPrev=src;}
     }
     if(bestPrev>=0){b[dst]=best+lw;if(decoded)back[i][dst]=bestPrev;}
    }
   }copy(b,b+q*9,a);
  }
  int s=int(max_element(a,a+q*9)-a);double score=a[s];if(score<=NEG/2||!decoded)return score;
  decoded->resize(end);modes->resize(end);int initial=-1;
  for(int i=end-1;i>=0;i--){int j=s/9,m=(s%9)/3,h=in(j,m);(*decoded)[i]=plain(i,h,m,k);(*modes)[i]=m;if(i)s=back[i][s];else initial=h;}
  int j=initial;for(int i=0;i<end;i++){
   int p=(*decoded)[i],m=(*modes)[i],x=mod(p+k[j]);if(m==2){if(!literal||p!=0||c[i]!=0)throw runtime_error("bad F hold");}
   else if(m==1){if((literal&&p==0&&eps==0)||!i||x!=c[i-1]||x==c[i])throw runtime_error("bad collision repair");}
   else{if((literal&&p==0&&eps==0)||x!=c[i])throw runtime_error("bad normal");j=next[j];}
  }if(initPhase)*initPhase=initial;return score;
 }
};
struct Candidate{K key{};double score=NEG;};
struct Search{Candidate best;int emIters=0,emHits=0,refineHits=0,evals=0,unique=0;};
Search solve(const Tape&t,int cut,int restarts,int shortlist,int seed,const K*truth){
 mt19937 rng(seed);uniform_int_distribution<int> digit(0,A-1);map<string,Candidate> pool;Search r;auto keep=[&](const K&k,double s){string id=canon(k,t.q);auto it=pool.find(id);if(it==pool.end()||s>it->second.score)pool[id]={k,s};};
 for(int attempt=0;attempt<restarts;attempt++){
  K k{};for(int j=0;j<t.q;j++)k[j]=digit(rng);K next{};double score;
  for(int it=0;it<45;it++){score=t.unigram(k,cut,true,&next);r.emIters++;if(next==k)break;k=next;}
  score=t.unigram(k,cut,false);keep(k,score);if(truth&&canon(k,t.q)==canon(*truth,t.q))r.emHits++;
 }
 vector<Candidate> cand;for(auto&[_,c]:pool)cand.push_back(c);sort(cand.begin(),cand.end(),[](auto&a,auto&b){return a.score>b.score;});r.unique=int(cand.size());if((int)cand.size()>shortlist)cand.resize(shortlist);
 V order(t.q);iota(order.begin(),order.end(),0);for(auto&c:cand){K k=c.key;double score=t.bigram(k,cut,cut);r.evals++;
  for(int sweep=0;sweep<10;sweep++){
   bool changed=false;shuffle(order.begin(),order.end(),rng);for(int j:order){int old=k[j],best=old;double hi=score;
    for(int z=0;z<A;z++)if(z!=old){k[j]=z;double v=t.bigram(k,cut,cut);r.evals++;if(v>hi+1e-8){hi=v;best=z;}}
    k[j]=best;if(best!=old){changed=true;score=hi;}
   }if(!changed)break;
  }if(truth&&canon(k,t.q)==canon(*truth,t.q))r.refineHits++;
  double exact=t.bigram(k,cut,cut,0.);r.evals++;if(exact>r.best.score)r.best={k,exact};
 }
 return r;
}
V plant(const V&P,const K&k,int q,bool literal,uint32_t seed){mt19937 rng(seed);V C;int j=0;for(int p:P){if(literal&&p==0){C.push_back(0);continue;}int c=mod(p+k[j]);if(!C.empty()&&c==C.back()&&rng()%5!=0)c=mod(c+1+rng()%28);else j=(j+1)%q;C.push_back(c);}return C;}
int main(int argc,char**argv){
 int restarts=argc>1?stoi(argv[1]):256,shortlist=argc>2?stoi(argv[2]):16;string filter=argc>3?argv[3]:"controls";map<string,V> data;string name,s;while(cin>>name>>s)data[name]=dec(s);
 vector<tuple<string,int,bool,int>> cases;for(bool literal:{false,true}){cases.push_back({"0_welcome",8,literal,365});cases.push_back({"0_koan_1",13,literal,500});cases.push_back({"0_loss_of_divinity",8,literal,500});cases.push_back({"0_loss_of_divinity",13,literal,500});}
 for(auto n:{"p0-2","p3-7","p54-55"})for(bool f:{false,true})for(int q:{8,13})cases.push_back({n,q,f,int(data[n].size()*2/3)});
 cout<<fixed<<setprecision(6);
 for(int ix=0;ix<(int)cases.size();ix++){auto[name,q,literal,cut]=cases[ix];bool orig=original(name);if(filter=="controls"&&orig)continue;if(filter=="original"&&!orig)continue;if(filter!="controls"&&filter!="original"&&filter!="all"&&stoi(filter)!=ix)continue;
  auto& P=data.at(name);K truth{};mt19937 r(0x3f042eab+ix*971U);for(int j=0;j<q;j++)truth[j]=r()%29;V C=orig?P:plant(P,truth,q,literal,0x662f1ac4+ix*2163U);LM lm(data,orig?"":name);Tape t(C,q,literal,lm);auto begin=chrono::steady_clock::now();auto found=solve(t,cut,restarts,shortlist,0x42a631d9+ix*14147U,orig?nullptr:&truth);
  K k=found.best.key;double prefix=NEG,full=t.bigram(k,cut,t.n,0.,&prefix);V dec,mode;int phase=-1;double vit=t.viterbi(k,t.n,0.,&dec,&mode,&phase);double oracleHold=NEG;int correct=-1,held=-1,oracleHeld=-1;if(!orig){double pref=NEG;double oracle=t.bigram(truth,cut,t.n,0.,&pref);oracleHold=oracle-pref;V p,m;int init;double ov=t.viterbi(truth,t.n,0.,&p,&m,&init);if(ov>NEG/2)oracleHeld=inner_product(p.begin()+cut,p.end(),P.begin()+cut,0,plus<>(),equal_to<>());if(vit>NEG/2){correct=inner_product(dec.begin(),dec.begin()+cut,P.begin(),0,plus<>(),equal_to<>());held=inner_product(dec.begin()+cut,dec.end(),P.begin()+cut,0,plus<>(),equal_to<>());}}
  cout<<"case="<<ix<<" "<<name<<" q="<<q<<" literal="<<literal<<" N="<<t.n<<" cut="<<cut<<" unique="<<found.unique<<" EMiters="<<found.emIters<<" EMhits="<<found.emHits<<" refinedHits="<<found.refineHits<<" evals="<<found.evals<<" key="<<keystr(k,q)<<" truth="<<(orig?"NA":canon(truth,q))<<" correctKey="<<(!orig&&canon(k,q)==canon(truth,q))<<" train="<<prefix/cut<<" hold="<<(full-prefix)/(t.n-cut)<<" oracleHold="<<(orig?string("NA"):to_string(oracleHold/(t.n-cut)))<<" trainCorrect="<<correct<<" heldCorrect="<<held<<" oracleHeld="<<oracleHeld<<" viterbi="<<vit/t.n<<" initPhase="<<phase<<" repairs="<<count(mode.begin(),mode.end(),1)<<" F="<<count(mode.begin(),mode.end(),2)<<" seconds="<<chrono::duration<double>(chrono::steady_clock::now()-begin).count()<<"\n";
  if(!dec.empty())cout<<"preview="<<enc(V(dec.begin()+cut,dec.begin()+min(t.n,cut+160)))<<"\n";cout<<flush;
 }
}
