import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Filter, Zap } from 'lucide-react';
import { Button, Card } from '@/src/components/UI';
import { EmptyState } from '@/src/components/States';
import { matchService, recommendService, handleApiError } from '@/src/services/api';

export default function MatchPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationStats, setRecommendationStats] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const featureDescriptions: Record<string, string> = {
    urgency_deadline_interaction: 'Combined urgency and deadline pressure; critical short deadlines get the biggest boost.',
    urgency_score: 'Maps request urgency from low to critical, where critical has highest priority.',
    deadline_tightness: 'Inversely scales the deadline; shorter deadlines are treated as more urgent.',
    category_score: 'Scores the resource category by medical importance for prioritization.',
    quantity_norm: 'Normalizes request quantity so very large orders do not dominate the score.',
    days_posted: 'Older unresolved requests gain a small priority boost over time.',
    staleness_boost: 'Adds extra urgency for requests older than 3 days.',
    item_priority: 'Item-level criticality score tied to the resource category.',
  };

  const fetchData = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const [matchResponse, recommendResponse, statsResponse] = await Promise.all([
        matchService.getMatches(),
        recommendService.getRecommendations(),
        recommendService.getStats(),
      ]);

      setMatches(matchResponse.data?.matches || []);
      setRecommendations(recommendResponse.data?.recommendations || []);
      setRecommendationStats(statsResponse.data || null);
    } catch (err) {
      const message = handleApiError(err);
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-32">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold mb-4 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            AI Algorithm Enabled
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Smart Recommendations</h1>
          <p className="text-slate-500 text-lg">
            Our recommendation engine has analyzed the latest donor resources and hospital requests to find the most optimal matches.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" onClick={fetchData} disabled={isLoading}>
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2" onClick={fetchData} disabled={isLoading}>
            <Zap className="w-4 h-4" />
            Recalculate
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-600">{error}</div>
      )}
      {recommendations.length === 0 ? (
        <EmptyState 
          title="Optimal matches in progress"
          description="We are currently calculating the best distributions for your requests. Try posting a new request to trigger the algorithm."
          action={
            <div className="flex gap-4">
               <Button variant="primary" onClick={fetchData} disabled={isLoading}>Refresh Algorithm</Button>
               <Button variant="ghost">View Guidelines</Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto] items-start">
            <div className="space-y-2 text-sm text-slate-500">
              <span>{matches.length} smart matches retrieved</span>
              <span>{recommendations.length} recommendations available</span>
            </div>
            {recommendationStats ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 shadow-sm">
                <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Model Summary</div>
                <div className="grid gap-2">
                  <div className="flex justify-between gap-4">
                    <span>Model</span>
                    <strong>{recommendationStats.model_type || 'RandomForestRegressor'}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Test RMSE</span>
                    <strong>{recommendationStats.test_rmse ?? 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Test R²</span>
                    <strong>{recommendationStats.test_r2 ?? 'N/A'}</strong>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>CV R²</span>
                    <strong>{recommendationStats.cv_r2_mean ? `${recommendationStats.cv_r2_mean} ± ${recommendationStats.cv_r2_std}` : 'N/A'}</strong>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200">
                  <div className="mb-3 text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">Feature Importance</div>
                  <div className="space-y-3">
                    {Object.entries(recommendationStats.feature_importances || {})
                      .sort((a, b) => (b[1] as number) - (a[1] as number))
                      .slice(0, 6)
                      .map(([feature, importance]) => {
                        const descriptions: Record<string, string> = {
                          urgency_deadline_interaction: 'Combined urgency and deadline pressure; critical short deadlines are weighted highest.',
                          urgency_score: 'Urgency level mapping from low to critical.',
                          deadline_tightness: 'Shorter deadlines are treated as more urgent.',
                          category_score: 'Item category importance based on medical criticality.',
                          quantity_norm: 'Normalized quantity so large requests do not dominate scores.',
                          days_posted: 'Requests gain priority the longer they remain open.',
                          staleness_boost: 'Older requests get a small extra urgency boost.',
                          item_priority: 'Item-level importance based on resource type.',
                        };
                        const description = descriptions[feature] || '';
                        return (
                          <div key={feature} className="space-y-2">
                            <div className="flex justify-between text-xs text-slate-600">
                              <span title={description}>{feature.replace(/_/g, ' ')}</span>
                              <span>{(importance as number).toFixed(2)}</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min((importance as number) * 100, 100)}%` }}
                              />
                            </div>
                            {description && (
                              <div className="text-2xs text-slate-400">{description}</div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Loading model performance...
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((item, index) => (
              <Card key={index} className="border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">{item.item}</h3>
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{item.urgency}</span>
                </div>
                <p className="text-sm text-slate-600 mb-4">Hospital: {item.hospital_email}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
                <p className="mt-4 text-sm font-semibold text-slate-900">Priority Score: {item.priority_score}</p>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Recommended allocation Preview (Visual only) */}
      <section className="mt-24 py-16 border-t border-slate-100">
        <h3 className="text-2xl font-bold text-slate-900 mb-8">Priority Queue Visualization</h3>
        <div className="relative overflow-hidden bg-slate-50 rounded-[48px] p-8 md:p-12 border border-slate-100">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles className="w-32 h-32 text-blue-600" />
           </div>
           
           <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                 <h4 className="text-3xl font-bold text-slate-900 mb-4 italic-small font-serif">How we match?</h4>
                 <p className="text-slate-500 leading-relaxed mb-8">
                    Our system uses a multi-factor weighting algorithm considering:
                 </p>
                 <div className="space-y-6">
                    {[
                      { l: 'Urgency Level', d: 'Prioritizing critical life-saving requests.', p: 40 },
                      { l: 'Proximity', d: 'Minimizing travel distance for efficiency.', p: 30 },
                      { l: 'Resource Quality', d: 'Checking expiry dates and item conditions.', p: 20 },
                      { l: 'Donor Rating', d: 'Historical reliability and response time.', p: 10 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between items-end mb-2">
                           <span className="font-semibold text-slate-800">{item.l}</span>
                           <span className="text-blue-600 font-bold">{item.p}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.p}%` }}
                            className="h-full bg-blue-600 rounded-full" 
                           />
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{item.d}</p>
                      </div>
                    ))}
                 </div>
              </div>
              
              <div className="p-8 bg-white rounded-[40px] shadow-sm border border-slate-100">
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                       <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h5 className="font-bold text-slate-900">Allocation Status</h5>
                       <p className="text-xs text-slate-400">Next update in 14:20</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center opacity-50">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200" />
                          <div className="h-4 w-24 bg-slate-200 rounded" />
                       </div>
                       <div className="h-4 w-12 bg-slate-200 rounded" />
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center opacity-50">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200" />
                          <div className="h-4 w-16 bg-slate-200 rounded" />
                       </div>
                       <div className="h-4 w-12 bg-slate-200 rounded" />
                    </div>
                 </div>
                 <p className="text-xs text-center text-slate-400 mt-8">Real-time data visualization placeholder</p>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}
