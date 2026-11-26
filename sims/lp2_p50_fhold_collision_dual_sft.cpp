// Agent34 #2972. Integer max-sum dual certificate over all legal F-hold paths.
// Each run state is (entering holds, trailing F hold or consume).
// The chain contains within-run collisions; one factor per run pair contains
// exact cross-run collisions. Every integer reparameterization is a valid
// upper bound: max chain + sum max residual pair factors.
#include <algorithm>
#include <array>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <map>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
using I=int64_t;
constexpr I NEG=-(I(1)<<55), SCALE=1024;
void require(bool p,const string&s){if(!p)throw runtime_error(s);}
string read(const string&p){ifstream f(p);require(bool(f),"read "+p);return string(istreambuf_iterator<char>(f),{});}
vector<int> numbers(const string&s,size_t a,size_t b){vector<int> out;for(size_t i=a;i<b;){if(s[i]<'0'||s[i]>'9'){i++;continue;}size_t j=i;while(j<b&&s[j]>='0'&&s[j]<='9')j++;out.push_back(stoi(s.substr(i,j-i)));i=j;}return out;}
vector<int> corpus(){auto s=read("resources/liber-primus/lp2-corpus.json");vector<int> out;for(int p=40;p<=53;p++){auto i=s.find("\"page\": "+to_string(p)+",");require(i!=string::npos,"page");i=s.find("\"indices\":",i);auto a=s.find('[',i),b=s.find(']',a);require(b!=string::npos,"indices");auto x=numbers(s,a+1,b);out.insert(out.end(),x.begin(),x.end());}require(out.size()==3008&&count(out.begin(),out.end(),0)==125,"corpus dimensions");return out;}
vector<int> grid(){auto s=read("resources/liber-primus/lp2-grid-256.json");vector<int> out;map<string,int> ids;size_t i=0;while((i=s.find("\"tokens\":",i))!=string::npos){auto a=s.find('[',i),b=s.find(']',a);require(b!=string::npos,"tokens");for(size_t j=a+1;j<b;){auto k=s.find('"',j);if(k>=b)break;auto z=s.find('"',k+1);require(z<b,"token string");auto t=s.substr(k+1,z-k-1);if(!ids.count(t))ids[t]=ids.size();out.push_back(ids[t]);j=z+1;}i=b+1;}require(out.size()==256&&ids.size()==161,"grid dimensions");return out;}
struct State{int h,d;vector<uint16_t> cells;I unary=0;};
struct Factor{
 int a,b,na,nb;vector<int16_t> w;vector<I> ma,mb;
 Factor(int a_,int b_,int na_,int nb_):a(a_),b(b_),na(na_),nb(nb_),w(size_t(na)*nb,-1),ma(na),mb(nb){}
 vector<I> marginal(bool first)const{
  vector<I> v(first?na:nb,NEG);
  for(int i=0;i<na;i++){const int16_t*row=w.data()+size_t(i)*nb;I ai=ma[i];for(int j=0;j<nb;j++)if(row[j]>=0){I x=I(row[j])*SCALE-ai-mb[j];I&z=v[first?i:j];if(x>z)z=x;}}
  return v;
 }
 I maxval()const{I z=NEG;for(int i=0;i<na;i++){const int16_t*row=w.data()+size_t(i)*nb;I ai=ma[i];for(int j=0;j<nb;j++)if(row[j]>=0)z=max(z,I(row[j])*SCALE-ai-mb[j]);}return z;}
};
struct Problem{
 vector<int>x,ids;int Hmin,Hmax,R,L;vector<vector<State>> st;vector<Factor> fac;vector<vector<int>> incidence;
 Problem(vector<int> x_,vector<int> ids_,int lo,int hi):x(move(x_)),ids(move(ids_)),Hmin(lo),Hmax(hi){
  vector<pair<int,int>>runs;int a=0;for(int i=0;i<int(x.size());i++)if(!x[i]){runs.push_back({a,i});a=i+1;}runs.push_back({a,int(x.size())});R=runs.size();
  require(lo>=0&&hi>=lo&&hi<R,"hold range");L=(*max_element(ids.begin(),ids.end())+1)*29;st.resize(R);incidence.resize(R);
  for(int r=0;r<R;r++){auto [a,b]=runs[r];int z=r+1<R;for(int h=max(0,Hmin-(R-1-r));h<=min(r,Hmax);h++)for(int d=0;d<=z;d++){
    if(h+d>Hmax||h+d+(R-1-r-z)<Hmin)continue;
    State s;s.h=h;s.d=d;vector<int> ct(L);for(int i=a;i<b+z-d;i++){int cell=ids[(i-h)%ids.size()]*29+x[i];s.cells.push_back(cell);s.unary+=I(ct[cell]++)*SCALE;}st[r].push_back(move(s));
  }require(!st[r].empty(),"empty state domain");}
  size_t nstate=0;for(auto&v:st)nstate+=v.size();
  // State histograms only for construction. Cross score = dot product of
  // consumed-cell histograms. Pair compatibility is necessary for any path.
  vector<vector<vector<uint8_t>>> hist(R);
  for(int r=0;r<R;r++){for(auto&s:st[r]){vector<uint8_t> h(L);for(int c:s.cells){require(h[c]<255,"hist overflow");h[c]++;}hist[r].push_back(move(h));}}
  size_t entries=0,valid=0;
  for(int r=0;r<R;r++)for(int s=r+1;s<R;s++){
   int id=fac.size();fac.emplace_back(r,s,st[r].size(),st[s].size());incidence[r].push_back(id);incidence[s].push_back(id);auto&f=fac.back();entries+=f.w.size();
   for(int i=0;i<f.na;i++)for(int j=0;j<f.nb;j++){auto&A=st[r][i];auto&B=st[s][j];if(B.h<A.h+A.d||B.h>A.h+A.d+s-r-1)continue;
    int v=0;if(A.cells.size()<B.cells.size()){for(int c:A.cells)v+=hist[s][j][c];}else{for(int c:B.cells)v+=hist[r][i][c];}
    require(v<=32767,"factor score overflow");f.w[size_t(i)*f.nb+j]=v;valid++;
   }
  }
  if(R>20)cout<<"states "<<nstate<<" factors "<<fac.size()<<" dense entries "<<entries<<" valid "<<valid<<endl;
 }
 vector<vector<I>> suffix()const{
  vector<vector<I>> v(R+1,vector<I>(Hmax+1,NEG));for(int h=Hmin;h<=Hmax;h++)v[R][h]=0;
  for(int r=R-1;r>=0;r--)for(auto&s:st[r])if(v[r+1][s.h+s.d]!=NEG)v[r][s.h]=max(v[r][s.h],s.unary+v[r+1][s.h+s.d]);
  return v;
 }
 I certificate()const{I v=suffix()[0][0];require(v!=NEG,"chain infeasible");for(auto&f:fac){I m=f.maxval();require(m!=NEG,"factor infeasible");v+=m;}return v;}
 void sweep(){
  auto back=suffix();vector<I> pre(Hmax+1,NEG);pre[0]=0;
  for(int r=0;r<R;r++){
   int n=st[r].size();vector<I> A(n),total(n);I mx=NEG;
   for(int i=0;i<n;i++){auto&s=st[r][i];require(pre[s.h]!=NEG&&back[r+1][s.h+s.d]!=NEG,"state outside chain");A[i]=pre[s.h]+s.unary+back[r+1][s.h+s.d];mx=max(mx,A[i]);}
   for(int i=0;i<n;i++)total[i]=A[i]-mx;
   vector<vector<I>> marg;for(int e:incidence[r]){auto&f=fac[e];auto B=f.marginal(f.a==r);I m=*max_element(B.begin(),B.end());for(int i=0;i<n;i++){require(B[i]!=NEG,"pair state impossible");B[i]-=m;total[i]+=B[i];}marg.push_back(move(B));}
   I den=I(incidence[r].size())+1;for(int i=0;i<n;i++){I target=total[i]/den; // integer rounding preserves certificate
    for(int j=0;j<int(incidence[r].size());j++){auto&f=fac[incidence[r][j]];I delta=marg[j][i]-target;auto&v=f.a==r?f.ma:f.mb;v[i]+=delta;st[r][i].unary+=delta;}
   }
   vector<I> next(Hmax+1,NEG);for(auto&s:st[r])next[s.h+s.d]=max(next[s.h+s.d],pre[s.h]+s.unary);pre.swap(next);
  }
 }
 int edgeId(int a,int b)const{return a*(2*R-a-1)/2+b-a-1;}
 struct StarResult{I upper,primal;vector<int> outer;vector<vector<int>> local;int differences=0;};
 StarResult star(bool paths=true)const{
  const int S=Hmax+1;vector<vector<I>> extra(R);
  // Condition each residual star on the target run's state. All earlier
  // states in the star share a single legal prefix path.
  for(int s=0;s<R;s++){
   int nb=st[s].size();vector<I> pre(size_t(nb)*S,NEG),next(pre.size());for(int b=0;b<nb;b++)pre[size_t(b)*S]=0;
   for(int r=0;r<s;r++){
    auto&f=fac[edgeId(r,s)];fill(next.begin(),next.end(),NEG);
    for(int a=0;a<f.na;a++){auto&v=st[r][a];const int16_t*row=f.w.data()+size_t(a)*nb;I ma=f.ma[a];int h=v.h,hh=h+v.d;
     for(int b=0;b<nb;b++)if(row[b]>=0){size_t i=size_t(b)*S;I u=pre[i+h];if(u==NEG)continue;I val=u+I(row[b])*SCALE-ma-f.mb[b];I&dst=next[i+hh];if(val>dst)dst=val;}
    }pre.swap(next);
   }
   extra[s].resize(nb);for(int b=0;b<nb;b++){extra[s][b]=pre[size_t(b)*S+st[s][b].h];require(extra[s][b]!=NEG,"star target infeasible");}
  }
  // Outer chain enforces a common target-state trajectory, unlike the
  // independent sum of star maxima. Reparameterized unary terms exactly
  // cancel their respective residual factor messages on any full path.
  vector<I> pre(S,NEG);pre[0]=0;vector<vector<int>> trace(R,vector<int>(S,-1));
  for(int r=0;r<R;r++){vector<I> next(S,NEG);for(int a=0;a<int(st[r].size());a++){auto&v=st[r][a];if(pre[v.h]==NEG)continue;I u=pre[v.h]+v.unary+extra[r][a];if(u>next[v.h+v.d]){next[v.h+v.d]=u;trace[r][v.h+v.d]=a;}}pre.swap(next);}
  int h=int(max_element(pre.begin()+Hmin,pre.end())-pre.begin());StarResult out;out.upper=pre[h];out.primal=0;require(out.upper!=NEG,"outer infeasible");
  if(!paths)return out;
  out.outer.resize(R);for(int r=R-1;r>=0;r--){int a=trace[r][h];require(a>=0,"outer traceback");out.outer[r]=a;h=st[r][a].h;}require(h==0,"outer start");
  vector<int> hist(L);for(int r=0;r<R;r++)for(int c:st[r][out.outer[r]].cells)out.primal+=hist[c]++;
  out.local.resize(R);
  // Recompute only each selected star's best prefix for the integer
  // subgradient. No hidden solution or reference plaintext is used.
  for(int s=1;s<R;s++){
   int b=out.outer[s];vector<I> dp(S,NEG);dp[0]=0;vector<vector<int>> tr(s,vector<int>(S,-1));
   for(int r=0;r<s;r++){
    auto&f=fac[edgeId(r,s)];vector<I> next(S,NEG);
    for(int a=0;a<f.na;a++){auto&v=st[r][a];int w=f.w[size_t(a)*f.nb+b];if(w<0||dp[v.h]==NEG)continue;I u=dp[v.h]+I(w)*SCALE-f.ma[a]-f.mb[b];if(u>next[v.h+v.d]){next[v.h+v.d]=u;tr[r][v.h+v.d]=a;}}
    dp.swap(next);
   }
   h=st[s][b].h;require(dp[h]==extra[s][b],"star traceback score");out.local[s].resize(s);
   for(int r=s-1;r>=0;r--){int a=tr[r][h];require(a>=0,"star traceback");out.local[s][r]=a;out.differences+=a!=out.outer[r];h=st[r][a].h;}require(h==0,"star start");
  }
  require(out.upper>=out.primal*SCALE,"primal above certificate");return out;
 }
 void starStep(const StarResult&s,I eta){
  require(eta>=0,"step");for(int b=1;b<R;b++)for(int a=0;a<b;a++){int i=s.outer[a],j=s.local[b][a];if(i==j)continue;auto&f=fac[edgeId(a,b)];f.ma[i]-=eta;f.ma[j]+=eta;st[a][i].unary-=eta;st[a][j].unary+=eta;}
 }
 I blockBound(int B,bool verbose=false)const{
  const int S=Hmax+1;require(B>=1,"block size");vector<int> offset(R+1);vector<vector<vector<int>>> by(R,vector<vector<int>>(S));
  for(int r=0;r<R;r++){offset[r+1]=offset[r]+st[r].size();for(int a=0;a<int(st[r].size());a++)by[r][st[r][a].h].push_back(a);}
  vector<I> outer(S,NEG);outer[0]=0;
  for(int s=0;s<R;s+=B){
   int e=min(R,s+B),P=offset[s],depth=e-s;
   // Transposed cross-score vectors: each target state contributes one
   // contiguous vector over all preceding states. Prefix feasibility is
   // imposed by the actual chain DP, not by independent pair maxima.
   vector<vector<vector<int16_t>>> cross(depth);
   for(int t=s;t<e;t++){
    cross[t-s].assign(st[t].size(),vector<int16_t>(P));
    for(int r=0;r<s;r++){auto&f=fac[edgeId(r,t)];for(int a=0;a<f.na;a++)for(int b=0;b<f.nb;b++){
     int v=f.w[size_t(a)*f.nb+b];if(v>=0)cross[t-s][b][offset[r]+a]=v;
    }}
   }
   vector<vector<int>> reward(depth+1,vector<int>(P));vector<int> hist(L);
   vector<I> next(S,NEG),pre(S),buf(S);int64_t leaves=0;int hstart=0;
   // Each leaf fixes the ENTIRE target-block path. Its cross reward is
   // optimized against one coherent preceding trajectory ending at hstart.
   auto walk=[&](auto&&self,int r,int h,I within)->void{
    if(r==e){leaves++;fill(pre.begin(),pre.end(),NEG);pre[0]=0;
     for(int k=0;k<s;k++){fill(buf.begin(),buf.end(),NEG);int lo=max(0,hstart-(s-k)),hi=min(k,hstart);
      for(int j=lo;j<=hi;j++)if(pre[j]!=NEG)for(int a:by[k][j]){auto&v=st[k][a];int hh=j+v.d;if(hh>hstart||hh+(s-k-1)<hstart)continue;buf[hh]=max(buf[hh],pre[j]+reward[depth][offset[k]+a]);}
      pre.swap(buf);
     }
     require(pre[hstart]!=NEG,"block prefix infeasible");next[h]=max(next[h],outer[hstart]+within+pre[hstart]);return;
    }
    int d=r-s;
    for(int a:by[r][h]){auto&v=st[r][a];auto&cv=cross[d][a];for(int j=0;j<P;j++)reward[d+1][j]=reward[d][j]+cv[j];I z=within;for(int c:v.cells)z+=hist[c]++;
     self(self,r+1,h+v.d,z);for(int c:v.cells)hist[c]--;
    }
   };
   for(int h=0;h<S;h++)if(outer[h]!=NEG){hstart=h;walk(walk,s,h,0);}
   outer.swap(next);if(verbose)cout<<"BLOCK "<<s<<" "<<e<<" leaves "<<leaves<<" upper "<<*max_element(outer.begin(),outer.end())<<endl;
  }
  return *max_element(outer.begin()+Hmin,outer.end());
 }
 I exactMask(uint64_t mask)const{
  int h=0,z=0;vector<int> hist(L);I score=0;for(int i=0;i<int(x.size());i++){if(!x[i]&&((mask>>(z++))&1)){h++;continue;}int c=ids[(i-h)%ids.size()]*29+x[i];score+=hist[c]++;}return h>=Hmin&&h<=Hmax?score:NEG;
 }
};
void selftest(){mt19937 g(297234);int cases=0;for(int t=0;t<64;t++){vector<int>x(18),ids(5);for(auto&v:x)v=g()%4;for(auto&v:ids)v=g()%3;int z=count(x.begin(),x.end(),0),lo=z?g()%(z+1):0,hi=lo+(g()%(z-lo+1));Problem p(x,ids,lo,hi);I best=NEG;for(uint64_t m=0;m<(uint64_t(1)<<z);m++)best=max(best,p.exactMask(m));require(p.blockBound(1)>=best&&p.blockBound(3)>=best&&p.blockBound(p.R)==best,"block bound test");for(int i=0;i<5;i++){require(p.certificate()>=best*SCALE,"dual underbound");auto q=p.star();require(q.upper>=best*SCALE,"star underbound");p.starStep(q,100);p.sweep();}require(p.certificate()>=best*SCALE,"final underbound");cases++;}cout<<"SELFTEST "<<cases<<" exhaustive toy optima bounded"<<endl;}
int main(int argc,char**argv){try{
 require(argc==4||argc==5,"args sweeps minH maxH [star]");int sweeps=stoi(argv[1]),lo=stoi(argv[2]),hi=stoi(argv[3]);require(sweeps>=1&&sweeps<=1000,"sweeps");selftest();auto x=corpus(),ids=grid();auto start=chrono::steady_clock::now();Problem p(x,ids,lo,hi);
 if(argc==5&&string(argv[4])=="block"){require(sweeps<=16,"block max");I b=p.blockBound(sweeps,true);cout<<"CERTIFIED_BLOCK_MAX "<<b<<" H "<<lo<<" "<<hi<<" block "<<sweeps<<" sec "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;return 1;}
 if(argc==5){require(string(argv[4])=="star","mode");I best=NEG,lower=0;
  for(int i=0;i<=sweeps;i++){auto q=p.star();if(i==0||q.upper<best)best=q.upper;lower=max(lower,q.primal);if(i==0||i%10==0||best/SCALE<1882||i==sweeps)cout<<"STAR "<<i<<" scaled "<<q.upper<<" best "<<best/SCALE<<" lower "<<lower<<" disagreement "<<q.differences<<" sec "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;
   if(best/SCALE<1882||!q.differences)break;I eta=max<I>(1,(q.upper-lower*SCALE)/(max(1,2*q.differences)*(2+i/100)));p.starStep(q,eta);
  }cout<<"CERTIFIED_STAR_MAX "<<best/SCALE<<" H "<<lo<<" "<<hi<<"; relaxed lower "<<lower<<"; no key recovery"<<endl;return 1;
 }
 I best=p.certificate();cout<<"BOUND 0 scaled "<<best<<" floor "<<best/SCALE<<endl;for(int i=1;i<=sweeps;i++){p.sweep();I v=p.certificate();best=min(best,v);cout<<"BOUND "<<i<<" scaled "<<v<<" floor "<<v/SCALE<<" best "<<best/SCALE<<" sec "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<endl;if(best/SCALE<1882)break;}cout<<"CERTIFIED_MAX "<<best/SCALE<<" H "<<lo<<" "<<hi<<"; no key recovery"<<endl;return 1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
