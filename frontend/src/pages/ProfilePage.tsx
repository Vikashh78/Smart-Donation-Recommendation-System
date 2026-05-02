import { motion } from 'motion/react';
import { User, Mail, ShieldCheck, LogOut, Settings, Bell, ShieldAlert } from 'lucide-react';
import { Button, Card } from '@/src/components/UI';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName') || 'User';
  const email = localStorage.getItem('userEmail') || 'user@example.com';
  const role = localStorage.getItem('role') || 'donor';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      <div className="mb-12 flex items-center gap-6">
        <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-200">
          {userName[0]}
        </div>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">{userName}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider">{role}</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3 h-3" />
              Verified Account
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-slate-400" />
            Account Details
          </h3>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Email Address</label>
              <p className="text-slate-900 font-medium">verma.navneet312@gmail.com</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Account Role</label>
              <p className="text-slate-900 font-medium capitalize">{role}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Member Since</label>
              <p className="text-slate-900 font-medium">April 2026</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              Preferences
            </h3>
            <div className="space-y-4">
              <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Notifications</span>
                </div>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-700">Two-Factor Auth</span>
                </div>
                <div className="w-10 h-5 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </button>
            </div>
          </Card>

          <Button 
            variant="outline" 
            className="w-full h-14 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 gap-3"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout from Account
          </Button>
        </div>
      </div>
    </div>
  );
}
