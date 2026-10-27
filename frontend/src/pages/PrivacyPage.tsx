import React from 'react';
import { ShieldCheck, Lock, Eye, MapPin } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
      <div className="space-y-2 border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-cyan-400" />
          <span>Privacy & Prototype Data Policy</span>
        </h1>
        <p className="text-xs text-slate-400">
          Transparent documentation of how user information, location coordinates, and operational records are handled in this prototype.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-800 space-y-6 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            1. Academic Prototype Scope
          </h2>
          <p>
            UrbanPulse AI is built as a Semester V / IDEA LAB academic system. All data stored within this platform is collected solely for demonstrating smart city operations workflows, mathematical prioritization, and pattern detection. Data is never sold, monetized, or shared with commercial advertising entities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            2. Location Coordinates & Geocoding Privacy
          </h2>
          <p>
            When submitting a report, GPS coordinates or map pin clicks are stored to pinpoint municipal problems (such as road craters or fallen light poles). Public issue views intentionally expose only the general locality name and approximate landmark address. Citizens are never required to enter their personal residential address.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-4 h-4 text-cyan-400" />
            3. Privacy Separation in Public Views
          </h2>
          <p>
            Public reports shown in the explorer hide the submitter's identity, private account details, and internal staff notes. Only authenticated municipal supervisors can review internal notes or assign field crews.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-100">4. User Account & Password Security</h2>
          <p>
            All account passwords are encrypted using one-way bcrypt hashing algorithms prior to storage. Authentication is managed via signed JSON Web Tokens (JWT) with configured expiration periods.
          </p>
        </section>
      </div>
    </div>
  );
};
