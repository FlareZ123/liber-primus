#include <algorithm>
#include <chrono>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <vector>
#include "lp2_gp29_moment7.hpp"
using namespace std;
using namespace moment7;
using Tape=vector<uint32_t>;
using Sol=vector<int>;
void require(bool x,const char*m){if(!x)throw runtime_error(m);}
struct Stats{uint64_t nodes=0,tests=0,closures=0,solutions=0,checksum=0;};
struct Shape{uint32_t mask;Moment m;int id;};
template<bool Fast,class Emit> void pack(const Tape& tape,Stats& stats,Emit emit){
 vector<Shape>a;int n=0;for(int i=0;i<(int)tape.size();i++){auto m=moment(tape[i]);n+=m.n;a.push_back({tape[i],m,i});}require(n==29,"shape sizes");
 stable_sort(a.begin(),a.end(),[](auto&x,auto&y){return x.m.n>y.m.n;});Sol trans(a.size());
 auto output=[&](){stats.solutions++;for(int t:trans)stats.checksum=stats.checksum*1099511628211ULL+uint64_t(t+1);emit(trans);};
 auto visit=[&](auto&&self,uint32_t used,Moment mu,vector<Shape> left)->void{
  stats.nodes++;if(left.empty()){output();return;}
  if constexpr(Fast){if(left.size()==2){stats.closures++;auto p=solve(left[0].mask,left[0].m,left[1].mask,left[1].m,used,mu);for(int i=0;i<p.n;i++){trans[left[0].id]=p.x[i][0];trans[left[1].id]=p.x[i][1];output();}return;}}
  int pick=-1;vector<int>options;
  for(int i=0;i<(int)left.size();i++){vector<int>o;for(int t=0;t<N;t++){stats.tests++;if(!(used&rot(left[i].mask,t)))o.push_back(t);}if(o.empty())return;if(pick<0||o.size()<options.size()){pick=i;options=move(o);if(options.size()==1)break;}}
  auto w=left[pick];left.erase(left.begin()+pick);for(int t:options){trans[w.id]=t;Moment next{};if constexpr(Fast)next=sum(mu,shifted(w.m,t));self(self,used|rot(w.mask,t),next,left);}
 };
 visit(visit,a[0].mask,a[0].m,vector<Shape>(a.begin()+1,a.end()));
}
vector<Tape> readMasks(const string&p){ifstream f(p);require(bool(f),"missing JSON");string s((istreambuf_iterator<char>(f)),{});vector<Tape>out;size_t i=0;while((i=s.find("\"masks\"",i))!=string::npos){i=s.find('[',i)+1;auto j=s.find(']',i);Tape m;while(i<j){if(s[i]>='0'&&s[i]<='9'){size_t z;auto x=stoul(s.substr(i),&z);m.push_back(x);i+=z;}else i++;}out.push_back(m);}return out;}
int main(int argc,char**argv){try{
 const auto original=readMasks(argc>1?argv[1]:"im-results/lp2-gp29-two-unplaced-moment-packing.json");require(original.size()==88,"original case count");
 mt19937 rng(3301);vector<Tape> plants;for(int i=0;i<300;i++){vector<int>p(29),cuts(28);iota(p.begin(),p.end(),0);iota(cuts.begin(),cuts.end(),1);shuffle(p.begin(),p.end(),rng);shuffle(cuts.begin(),cuts.end(),rng);int k=3+rng()%4;cuts.resize(k-1);sort(cuts.begin(),cuts.end());cuts.insert(cuts.begin(),0);cuts.push_back(29);Tape t;for(int j=0;j<k;j++){uint32_t m=0;for(int z=cuts[j];z<cuts[j+1];z++)m|=1u<<p[z];t.push_back(rot(m,rng()%29));}plants.push_back(t);}
 auto compare=[&](const vector<Tape>&cases,bool planted){Stats a,b;for(auto&t:cases){vector<Sol>x,y;pack<false>(t,a,[&](auto&s){x.push_back(s);});pack<true>(t,b,[&](auto&s){y.push_back(s);});sort(x.begin(),x.end());sort(y.begin(),y.end());require(x==y,"packing disagreement");if(planted)require(!y.empty(),"plant lost");}cout<<"cases="<<cases.size()<<" solutions="<<b.solutions<<" nodes="<<a.nodes<<"/"<<b.nodes<<" scans="<<a.tests<<"/"<<b.tests<<" closures="<<b.closures<<"\n";};
 compare(original,false);compare(plants,true);
 auto bench=[&](const vector<Tape>&cases,bool fast){Stats stats;auto start=chrono::steady_clock::now();for(int r=0;r<1000;r++)for(auto&t:cases){if(fast)pack<true>(t,stats,[](auto&){});else pack<false>(t,stats,[](auto&){});}double ms=chrono::duration<double,milli>(chrono::steady_clock::now()-start).count();return pair<double,uint64_t>{ms,stats.solutions};};
 for(int rep=0;rep<5;rep++){for(const auto*c:std::array<const vector<Tape>*,2>{&original,&plants}){pair<double,uint64_t>a,b;if(rep%2){b=bench(*c,true);a=bench(*c,false);}else{a=bench(*c,false);b=bench(*c,true);}require(a.second==b.second,"timed result count");cout<<"rep="<<rep<<" cases="<<c->size()<<" baseline_ms="<<a.first<<" moment_ms="<<b.first<<" ratio="<<a.first/b.first<<" solutions="<<a.second<<"\n";}}
 }catch(const exception&e){cerr<<e.what()<<"\n";return 1;}}
