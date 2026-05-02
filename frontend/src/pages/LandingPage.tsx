import { motion } from 'motion/react';
import { Heart, ShieldCheck, Zap, Globe, ArrowRight, Activity, Users, Building2 } from 'lucide-react';
import { Button } from '@/src/components/UI';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="pt-24 pb-12 overflow-hidden">
      {/* Background Gradient Shapes */}
      <div className="absolute top-0 left-0 right-0 h-[800px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto py-20"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-semibold mb-8"
          >
            <Activity className="w-4 h-4" />
            Empowering Modern Philanthropy
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-7xl font-bold text-slate-900 tracking-tight leading-[1.1] mb-8"
          >
            Connecting Resources to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Save Lives Faster.</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A smart donation recommendation system that bridge the gap between altruistic donors and medical facilities in need.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto h-14 text-lg">
                Start Donating Now
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 text-lg">
                For Hospitals
                <Building2 className="ml-2 w-5 h-5 opacity-60" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-slate-100">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Zap,
                title: 'Instant Matching',
                description: 'Our intelligent algorithm identifies the highest priority needs and matches them with available donations in real-time.',
                color: 'bg-sky-50 text-sky-600',
              },
              {
                icon: ShieldCheck,
                title: 'Verified Network',
                description: 'Every hospital and donor undergoes a verification process to ensure trust and reliability across the platform.',
                color: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: Globe,
                title: 'Local & Global',
                description: 'Geospatial coordination allows us to optimize logistics, reducing transit times for time-sensitive resources.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-8 rounded-[40px] bg-white border border-slate-50 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-24 bg-slate-50 rounded-[64px] px-8 md:px-20 mb-24">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6 italic-small font-serif">A Multi-Role Ecosystem</h2>
              <p className="text-slate-500 text-lg">Whether you are giving or receiving, we provide the tools you need.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[40px] shadow-sm">
                <Users className="w-10 h-10 text-blue-600 mb-6" />
                <h4 className="text-2xl font-bold mb-4">For Donors</h4>
                <ul className="space-y-3 text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Upload surplus resources
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Track donation history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Get verified impact reports
                  </li>
                </ul>
                <Link to="/register" className="text-blue-600 font-bold hover:underline">Register as Donor →</Link>
              </div>

              <div className="bg-white p-10 rounded-[40px] shadow-sm border-2 border-blue-600/5">
                <Building2 className="w-10 h-10 text-blue-600 mb-6" />
                <h4 className="text-2xl font-bold mb-4">For Hospitals</h4>
                <ul className="space-y-3 text-slate-600 mb-8">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Post urgent resource requests
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Receive smart recommendations
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    Manage allocation priorities
                  </li>
                </ul>
                <Link to="/register" className="text-blue-600 font-bold hover:underline">Partner as Hospital →</Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-blue-600" />
            <span className="font-bold text-slate-900">SmartDonation</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms of Service</a>
            <a href="#" className="hover:text-slate-900">Contact Us</a>
          </div>
          <p className="text-sm text-slate-400">© 2026 Smart Donation System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
