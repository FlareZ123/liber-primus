// Continuation of the calibrated minimum-line-reset inverse.
// Keep all p55-compatible minimum p54 paths (three changes, end phase 2).
// p55 supplies structural phase reachability only, no lexical fit.
#define main previous_line_sft_main
#include "lp2_red8_minimum_line_reset_sft.cpp"
#undef main
Paths conditioned(const string& c,const vector<int>& boundaries,int start=-1,int end=-1){
 int n=c.size();set<int>B(boundaries.begin(),boundaries.end());vector<array<int,8>> d(n+1);
 for(int j=0;j<8;j++)d[n][j]=(end<0||j==end)?0:100000;
 for(int i=n-1;i>=0;i--)for(int p=0;p<8;p++){int x=fixed::val(c[i]),v=100000;
  for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;
   if(!x)v=min(v,z+d[i+1][j]);if(x!=K[j])v=min(v,z+d[i+1][(j+1)%8]);}d[i][p]=v;
 }
 Paths out{start<0?*min_element(d[0].begin(),d[0].end()):d[0][start],{}};
 if(out.cost>=100000)return out;
 Path a;function<void(int,int)> rec=[&](int i,int p){
  if(i==n){a.end=p;out.paths.push_back(a);return;}
  int x=fixed::val(c[i]);
  for(int j=0;j<8;j++){if(j!=p&&!B.count(i))continue;int z=j!=p;if(z)a.reset.push_back(i);
   if(!x&&z+d[i+1][j]==d[i][p]){a.key.push_back(-1);rec(i+1,j);a.key.pop_back();}
   if(x!=K[j]&&z+d[i+1][(j+1)%8]==d[i][p]){a.key.push_back(K[j]);rec(i+1,(j+1)%8);a.key.pop_back();}
   if(z)a.reset.pop_back();
  }
 };
 for(int j=0;j<8;j++)if((start<0||j==start)&&d[0][j]==out.cost){a.start=j;rec(0,j);}
 return out;
}
// Resume only the five incomplete paths from run 45730165072; 83 paths
// were already exhausted. Re-enumerate each incomplete path because the
// old search did not persist per-seed fingerprints.
int main(){try{
 aff::init();fixed::dictionary();
 auto src=fixed::read("resources/liber-primus/lp2-page-groups-54-55-derived.json");
 auto train=fixed::strings(src,"body_groups",src.find("\"heading_groups\": [")),held=fixed::strings(src,"groups",src.rfind("\"p55\""));
 fixed::require(train.size()==48&&join(train).size()==223&&held.size()==17&&join(held).size()==76,"profile");
 vector<int> L55{24,46,68};auto lm=conditioned(join(train),LINE,-1,2),hm=conditioned(join(held),L55,2,-1);
 fixed::require(lm.cost==3&&lm.paths.size()==88&&hm.cost==1&&hm.paths.size()==20,"joint minimum");
 const vector<int> ids{5,6,13,14,15};
 atomic<int> next{0},exhausted{0},candidates{0};mutex output;
 auto worker=[&](){while(true){int q=next.fetch_add(1);if(q>=int(ids.size()))return;int i=ids[q];Search s(train,lm.paths[i]);s.run(360);lock_guard<mutex> guard(output);
 cout<<"RESUME PATH "<<i<<" exhausted="<<(!s.found&&!s.timed&&s.done==s.total)<<" found="<<s.found<<" seeds="<<s.done<<"/"<<s.total<<" nodes="<<s.nodes<<" joins="<<s.joins<<" perms="<<s.perms<<endl;
 if(s.found){candidates++;auto w=split(decode(join(train),lm.paths[i],s.answer),train);int accepted=0;
 for(auto&p:hm.paths){auto h=split(decode(join(held),p,s.answer),held);h[0]=w.back()+h[0];if(all_of(h.begin(),h.end(),[](const string&v){return fixed::dict.count(v); })){accepted++;cout<<"HOLD";for(auto&v:h)cout<<" "<<v;cout<<endl;}}
 cout<<"CANDIDATE "<<aff::str(s.answer)<<" OOV="<<s.oov<<" holdout="<<accepted<<endl;
 }else if(!s.timed&&s.done==s.total)exhausted++;
 }};
 vector<thread> threads;for(unsigned i=0;i<max(1u,min(4u,thread::hardware_concurrency()));i++)threads.emplace_back(worker);for(auto&t:threads)t.join();
 cout<<"RESUME exhausted="<<exhausted<<"/5 prior=83/88 candidates="<<candidates<<endl;
 return exhausted==5?0:1;
 }catch(const exception&e){cerr<<"ERROR "<<e.what()<<endl;return 2;}}
