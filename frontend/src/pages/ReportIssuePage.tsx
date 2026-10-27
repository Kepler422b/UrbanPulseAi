import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LocationPicker } from '../components/map/LocationPicker';
import {
  PlusCircle,
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Camera,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';

const LOCALITIES = [
  'Silver Park',
  'Kanakia Park',
  'Poonam Sagar',
  'Shanti Nagar',
  'Bhayandar West',
  'Bhayandar East',
  'Mira Road East',
  'Kashimira',
  'Deepak Hospital Area',
  'Golden Nest',
  'Maxus Mall Area',
  'Jesal Park',
  'Uttan Road',
  'Beverly Park',
];

const LOCALITY_DEFAULT_COORDS: Record<string, [number, number]> = {
  'Silver Park': [19.2882, 72.8643],
  'Kanakia Park': [19.2864, 72.8688],
  'Poonam Sagar': [19.2891, 72.8611],
  'Shanti Nagar': [19.2845, 72.8612],
  'Bhayandar West': [19.3082, 72.8465],
  'Bhayandar East': [19.311, 72.859],
  'Mira Road East': [19.2812, 72.8561],
  'Kashimira': [19.2785, 72.8715],
  'Deepak Hospital Area': [19.292, 72.858],
  'Golden Nest': [19.2985, 72.856],
  'Maxus Mall Area': [19.3015, 72.851],
  'Jesal Park': [19.304, 72.842],
  'Uttan Road': [19.28, 72.805],
  'Beverly Park': [19.2825, 72.867],
};

export const ReportIssuePage: React.FC = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState<string>('potholes_damaged_roads');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locality, setLocality] = useState(LOCALITIES[0]);
  const [approximateAddress, setApproximateAddress] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [latitude, setLatitude] = useState<number | null>(LOCALITY_DEFAULT_COORDS[LOCALITIES[0]][0]);
  const [longitude, setLongitude] = useState<number | null>(LOCALITY_DEFAULT_COORDS[LOCALITIES[0]][1]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReport, setSuccessReport] = useState<{ id: string; public_id: string } | null>(null);

  const handleLocalityChange = (newLocality: string) => {
    setLocality(newLocality);
    const coords = LOCALITY_DEFAULT_COORDS[newLocality];
    if (coords) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size must be smaller than 5MB.');
      return;
    }

    setErrorMessage(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        const uploadRes = await api.uploadImage(imageFile);
        uploadedImageUrl = uploadRes.image_url;
      }

      const res = await api.submitReport({
        category,
        title,
        description,
        locality,
        approximate_address: approximateAddress,
        latitude,
        longitude,
        severity,
        image_url: uploadedImageUrl,
      });

      setSuccessReport({
        id: res.report?.id || res.public_report_id,
        public_id: res.public_report_id,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (successReport) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-[#101F33] border border-cyan-500/40 shadow-2xl text-center space-y-5 animate-in fade-in">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-100">Report Successfully Submitted!</h2>
          <p className="text-xs text-slate-400">
            Your civic complaint has been registered in the Mira-Bhayandar municipal operations database.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Assigned Public Report Identifier
          </span>
          <p className="text-2xl font-mono font-extrabold text-cyan-400">
            {successReport.public_id}
          </p>
          <span className="text-[10px] text-slate-400 block pt-1">
            Keep this identifier to track repair progress and view audit timeline.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to={`/issues/${successReport.public_id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
          >
            <span>View Report Timeline</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={() => {
              setSuccessReport(null);
              setTitle('');
              setDescription('');
              setApproximateAddress('');
              removeImage();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-6">
      <div className="space-y-1 border-b border-slate-800 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2.5">
          <PlusCircle className="w-7 h-7 text-cyan-400" />
          <span>Report an Urban Issue</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Provide accurate details and pinpoint the map location to help municipal teams inspect and resolve civic problems.
        </p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category & Severity Card */}
        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-700/80 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            1. Issue Classification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Civic Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="potholes_damaged_roads">Potholes & Damaged Roads</option>
                <option value="garbage_overflow">Garbage Overflow & Waste Collection</option>
                <option value="broken_streetlights">Broken or Malfunctioning Streetlights</option>
                <option value="water_drainage_leakage">Water & Drainage Leakage (Beta)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Observed Severity <span className="text-rose-400">*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="low">Low — Minor aesthetic or small defect</option>
                <option value="medium">Medium — Noticeable impediment, moderate traffic flow effect</option>
                <option value="high">High — Significant safety hazard or health risk</option>
                <option value="critical">Critical — Immediate structural or life hazard</option>
              </select>
            </div>
          </div>
        </div>

        {/* Title & Description Card */}
        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-700/80 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            2. Problem Summary
          </h2>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Concise Issue Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep pothole causing skids near Cineworld Junction"
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">5 to 150 characters</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Detailed Description <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what is broken, approximate dimensions, safety hazards, or when it started..."
              className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500 leading-relaxed"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">10 to 2000 characters</span>
          </div>
        </div>

        {/* Location & Map Card */}
        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-700/80 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            3. Geographic Location (Mira-Bhayandar)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Locality / Ward Sector <span className="text-rose-400">*</span>
              </label>
              <select
                value={locality}
                onChange={(e) => handleLocalityChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400"
              >
                {LOCALITIES.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Street Address / Landmark <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={200}
                value={approximateAddress}
                onChange={(e) => setApproximateAddress(e.target.value)}
                placeholder="e.g. Near Bus Stop #4, Opposite Market Gate"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-cyan-400 placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <LocationPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
              }}
              className="h-80"
            />
          </div>
        </div>

        {/* Photo Upload Card */}
        <div className="p-6 rounded-2xl bg-[#101F33] border border-slate-700/80 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            4. Photo Attachment (Optional)
          </h2>

          {imagePreview ? (
            <div className="relative w-48 h-36 rounded-xl overflow-hidden border border-slate-700">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/80 text-rose-400 hover:text-rose-300 transition-colors"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/40">
              <Camera className="w-8 h-8 text-cyan-400 mb-2" />
              <span className="text-xs font-semibold text-slate-200">Upload on-site photograph</span>
              <span className="text-[11px] text-slate-500 mt-1">JPEG, PNG, or WEBP up to 5MB</span>
              <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500">
            Reports are immediately recorded in the operations database and visible in the public explorer.
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 hover:from-cyan-300 hover:to-teal-300 shadow-lg shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting Report...' : 'Submit Civic Report'}
          </button>
        </div>
      </form>
    </div>
  );
};
