import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, ArrowRightLeft, Calculator, ShieldCheck, TrendingUp, Info, AlertTriangle, Sparkles } from 'lucide-react';

const TaxOptimizerContent: React.FC = () => {
  const [salePrice, setSalePrice] = useState(50000000); // 5 Cr
  const [costBasis, setCostBasis] = useState(20000000); // 2 Cr
  const [showPlan, setShowPlan] = useState(false);

  const calculateSavings = () => {
    const gain = salePrice - costBasis;
    const taxRate = 0.20; // 20% Capital Gains
    const potentialTax = gain * taxRate;
    
    return {
      capitalGain: gain,
      estimatedTax: potentialTax,
      deferredAmount: potentialTax,
      reinvestmentPower: salePrice
    };
  };

  const results = calculateSavings();

  return (
    <section aria-labelledby="tax-heading">
      <div>
        <div className="mb-7">
          <div className="mb-5 inline-flex items-center space-x-2 rounded-full bg-[#A86A12]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[#A86A12]">
            <Landmark size={14} />
            <span>Tax Optimization Suite</span>
          </div>
          <h2 id="tax-heading" className="mb-4 text-[1.9rem] font-bold normal-case leading-[1.1] tracking-tight text-[#063D30] sm:text-[2.6rem] lg:text-[3.5rem]">1031 <span className="not-italic text-[#A86A12]">Exchange</span> Optimizer</h2>
          <p className="max-w-2xl text-[15px] leading-7 text-[#5F6F6A] sm:text-base">
            Leverage Section 1031 to defer capital gains tax by reinvesting in high-yield agricultural land. Our AI suggests the best "Like-Kind" assets.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 lg:items-start gap-6 lg:gap-8">
          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[28px] p-7 border border-black/5 shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <Calculator size={24} className="mr-3 text-[#A86A12]" />
                Asset Particulars
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Estimated Sale Price (Current Asset)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary">₹</span>
                    <input 
                      type="number" 
                      value={salePrice}
                      onChange={(e) => setSalePrice(parseInt(e.target.value))}
                      className="w-full bg-gray-50 border border-black/5 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#A86A12]/20 font-bold text-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Original Purchase Price (Cost Basis)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-primary">₹</span>
                    <input 
                      type="number" 
                      value={costBasis}
                      onChange={(e) => setCostBasis(parseInt(e.target.value))}
                      className="w-full bg-gray-50 border border-black/5 rounded-2xl py-3.5 pl-12 pr-6 outline-none focus:ring-2 focus:ring-[#A86A12]/20 font-bold text-lg"
                    />
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-start space-x-4">
                  <AlertTriangle size={24} className="text-orange-500 flex-shrink-0" />
                  <p className="text-xs text-orange-800 leading-relaxed italic">
                    Note: A 1031 Exchange requires identifying a replacement property within 45 days of sale and closing within 180 days.
                  </p>
                </div>

                <button 
                  onClick={() => setShowPlan(true)}
                  className="w-full bg-[#A86A12] text-white py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-all flex items-center justify-center space-x-3 group"
                >
                  <Sparkles size={20} />
                  <span>Analyze Tax Strategy</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Results Side */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AnimatePresence mode="wait">
              {!showPlan ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center bg-[#A86A12]/5 rounded-[28px] border-2 border-dashed border-[#A86A12]/20 p-6 text-center">
                  <ArrowRightLeft size={40} className="text-[#A86A12]/40 mb-4" />
                  <h4 className="text-xl font-bold mb-2">Simulate Reinvestment</h4>
                  <p className="text-sm text-text-muted">Enter your asset values to see how much tax you can defer with IGO Agri Estates.</p>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-primary p-8 rounded-[28px] text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-full opacity-5 pointer-events-none">
                      <Landmark size={300} className="-mr-32 -mt-32" />
                    </div>
                    
                    <div className="relative z-10">
                      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Tax Deferral Potential</p>
                      <h2 className="text-5xl font-bold mb-6">₹{(results.deferredAmount / 10000000).toFixed(2)} Cr</h2>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md">
                          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Capital Gain</p>
                          <p className="text-xl font-bold">₹{(results.capitalGain / 10000000).toFixed(2)} Cr</p>
                        </div>
                        <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md">
                          <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Reinvestment Power</p>
                          <p className="text-xl font-bold">₹{(results.reinvestmentPower / 10000000).toFixed(2)} Cr</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-[28px] border border-black/5 shadow-xl">
                    <h4 className="font-bold text-primary mb-4 flex items-center">
                      <Sparkles size={20} className="mr-2 text-[#A86A12]" />
                      AI Recommended Replacement Estates
                    </h4>
                    <div className="space-y-4">
                      {[
                        { title: 'The Royal Teak Plantation', price: '3.8 Cr', match: '98%', region: 'Karnataka' },
                        { title: 'Golden Harvest Vineyards', price: '5.2 Cr', match: '94%', region: 'Maharashtra' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-[#A86A12] hover:text-white transition-all cursor-pointer group">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest group-hover:text-white/60 text-text-muted mb-1">{item.region}</p>
                            <h5 className="font-bold">{item.title}</h5>
                            <p className="text-sm">Value: {item.price}</p>
                          </div>
                          <div className="text-right">
                            <span className="bg-[#A86A12]/10 text-[#A86A12] group-hover:bg-white/20 group-hover:text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">
                              {item.match} Match
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-5 bg-primary/5 rounded-[28px] border border-primary/10">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <ShieldCheck size={18} className="text-secondary" />
                    </div>
                    <p className="text-xs text-text-muted leading-relaxed">
                      By deferring <span className="font-bold text-primary">₹{(results.deferredAmount / 100000).toFixed(1)} Lakhs</span> in taxes, you increase your long-term compounding base by <span className="font-bold text-primary">24%</span> over a 10-year period.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TaxOptimizerContent;
