import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';
import { Button } from '@/src/components/UI';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="text-[12rem] font-bold text-slate-100 leading-none select-none">404</div>
        <div className="relative -mt-20">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Page not found</h1>
          <p className="text-slate-500 max-w-sm mx-auto mb-10 text-lg">
            Sorry, the page you're looking for doesn't exist or has been moved to a new address.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button size="lg" className="w-full sm:w-auto gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
              <Search className="w-4 h-4" />
              Search the Site
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
