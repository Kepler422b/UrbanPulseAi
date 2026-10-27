import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { Globe, Heart, ShieldCheck, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#050D18] border-t border-slate-800 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Identity */}
          <div className="space-y-3 md:col-span-1">
            <Logo showTagline={true} />
            <p className="text-slate-400 text-xs leading-relaxed mt-2">
              Transforming scattered citizen complaints into structured, location-aware operational intelligence for modern municipal services.
            </p>
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium text-[11px] pt-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>Pilot Context: Mira-Bhayandar, India</span>
            </div>
          </div>

          {/* Col 2: Platform Navigation */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-cyan-400 transition-colors">City Operations Portal</Link>
              </li>
              <li>
                <Link to="/issues" className="hover:text-cyan-400 transition-colors">Public Issue Explorer</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-cyan-400 transition-colors">Submit Civic Report</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">Operational Workflow</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">Academic Project Context</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operations & AI */}
          <div>
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase mb-3">Operations</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/admin/dashboard" className="hover:text-cyan-400 transition-colors">Administrative Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/issues" className="hover:text-cyan-400 transition-colors">Issue Priority Queue</Link>
              </li>
              <li>
                <Link to="/admin/insights" className="hover:text-cyan-400 transition-colors">AI Pattern Engine</Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy & Data Handling</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Demonstration</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Academic Prototype & SDG 11 */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-xs tracking-wider uppercase">Alignment</h4>
            <div className="p-3 rounded-lg bg-[#0B1728] border border-cyan-500/20 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold text-[11px]">
                <Globe className="w-3.5 h-3.5" />
                <span>UN SDG Goal 11</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sustainable Cities and Communities: fostering responsive, inclusive, and resource-efficient municipal infrastructure.
              </p>
            </div>

            <div className="text-[11px] text-slate-500 leading-tight">
              Semester V / IDEA LAB urban-system project. Not officially affiliated with MBMC without configured credentials.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} UrbanPulse AI. Academic Engineering Prototype.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <span>&bull;</span>
            <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-slate-400">
              Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for smarter cities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
