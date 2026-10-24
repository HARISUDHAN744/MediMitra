import React, { useState, useEffect, useMemo } from 'react';
import {
  Dna,
  Activity,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Info,
  Sparkles,
  Download,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Clock,
  Layers,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { LanguageDetail } from '../services/languageService';
import {
  fetchDemoPatients,
  fetchLabInsights,
  fetchTestTrend,
  downloadLabReportPdf,
  InsightsResponse,
  TrendResponse,
  DemoPatient,
  InsightCard as InsightCardType,
  CrossMarkerPattern,
} from '../services/labsService';

interface LabDiagnosticsViewProps {
  language: LanguageDetail;
}

// ── Interactive SVG Trend Chart ──────────────────────────────────────────
const TrendModalChart: React.FC<{
  trend: TrendResponse | null;
  loading: boolean;
  onClose: () => void;
}> = ({ trend, loading, onClose }) => {
  if (!trend && !loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-sky-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>

        {loading || !trend ? (
          <div className="py-16 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Calculating historical trajectory...</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-sky-100 text-sky-800">
                  {trend.panel}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    trend.trend_label === 'Improving'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trend.trend_label === 'Worsening'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {trend.trend_label}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mt-1">{trend.test_name}</h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {trend.data_points_count} Historical Reports Recorded • Unit: {trend.unit}
              </p>
            </div>

            {/* Safety Disclaimer Banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Trend estimate, not a diagnosis</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Projections are mathematical Ordinary Least Squares (OLS) trajectories intended solely for physician consultation.
                </p>
              </div>
            </div>

            {trend.status === 'insufficient_data' ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-sm">Not enough data for a trend yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{trend.reason}</p>
              </div>
            ) : (
              <>
                {/* SVG Chart Rendering */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-2">
                    <span>Longitudinal Trajectory</span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Actual
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-sky-200 border border-sky-400 border-dashed inline-block"></span> Forecast Band
                      </span>
                    </span>
                  </div>

                  <div className="w-full overflow-x-auto">
                    {(() => {
                      const points = trend.data_points;
                      const proj = trend.projected_range;
                      const allVals = [
                        ...points.map((p) => p.value),
                        ...(proj ? [proj.lower_bound, proj.upper_bound, proj.midpoint] : []),
                        ...(trend.reference_low ? [trend.reference_low] : []),
                        ...(trend.reference_high ? [trend.reference_high] : []),
                      ];
                      const minVal = Math.max(0, Math.min(...allVals) * 0.9);
                      const maxVal = Math.max(...allVals) * 1.1;
                      const range = maxVal - minVal || 1;

                      const svgWidth = 520;
                      const svgHeight = 220;
                      const padLeft = 45;
                      const padRight = 80;
                      const padTop = 20;
                      const padBottom = 35;
                      const chartWidth = svgWidth - padLeft - padRight;
                      const chartHeight = svgHeight - padTop - padBottom;

                      const totalPoints = points.length + (proj ? 1 : 0);
                      const getX = (idx: number) => padLeft + (idx / (totalPoints - 1 || 1)) * chartWidth;
                      const getY = (val: number) => padTop + chartHeight - ((val - minVal) / range) * chartHeight;

                      // Coordinate path
                      const polylinePoints = points.map((p, idx) => `${getX(idx)},${getY(p.value)}`).join(' ');

                      // Projected forecast cone
                      const lastIdx = points.length - 1;
                      const projIdx = points.length;
                      const lastX = getX(lastIdx);
                      const lastY = getY(points[lastIdx].value);
                      const projX = getX(projIdx);

                      const upperY = proj ? getY(proj.upper_bound) : lastY;
                      const lowerY = proj ? getY(proj.lower_bound) : lastY;
                      const midY = proj ? getY(proj.midpoint) : lastY;

                      return (
                        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-56 select-none font-sans">
                          {/* Reference range shaded zone */}
                          {trend.reference_low !== null &&
                            trend.reference_high !== null &&
                            trend.reference_low !== undefined &&
                            trend.reference_high !== undefined && (
                              <rect
                                x={padLeft}
                                y={getY(trend.reference_high)}
                                width={chartWidth + padRight - 20}
                                height={Math.max(2, getY(trend.reference_low) - getY(trend.reference_high))}
                                fill="#22c55e"
                                fillOpacity={0.08}
                              />
                            )}

                          {/* Grid lines */}
                          {[0, 0.33, 0.66, 1].map((pct, i) => {
                            const val = minVal + pct * range;
                            const y = getY(val);
                            return (
                              <g key={i}>
                                <line x1={padLeft} y1={y} x2={svgWidth - 20} y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <text x={padLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="monospace">
                                  {val.toFixed(1)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Uncertainty Cone polygon */}
                          {proj && (
                            <polygon
                              points={`${lastX},${lastY} ${projX},${upperY} ${projX},${lowerY}`}
                              fill="#0284c7"
                              fillOpacity={0.15}
                            />
                          )}

                          {/* Dashed forecast line */}
                          {proj && (
                            <line
                              x1={lastX}
                              y1={lastY}
                              x2={projX}
                              y2={midY}
                              stroke="#0284c7"
                              strokeWidth={2}
                              strokeDasharray="4 4"
                            />
                          )}

                          {/* Historical trend solid line */}
                          <polyline fill="none" stroke="#0284c7" strokeWidth={2.5} points={polylinePoints} />

                          {/* Historical Data dots */}
                          {points.map((p, idx) => {
                            const cx = getX(idx);
                            const cy = getY(p.value);
                            return (
                              <g key={idx}>
                                <circle cx={cx} cy={cy} r={5} fill="#0284c7" stroke="white" strokeWidth={2} />
                                <text
                                  x={cx}
                                  y={cy - 9}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fill="#0f172a"
                                  fontFamily="monospace"
                                >
                                  {p.value}
                                </text>
                                <text x={cx} y={svgHeight - 12} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace">
                                  {p.date.slice(5)}
                                </text>
                              </g>
                            );
                          })}

                          {/* Projected Point Marker */}
                          {proj && (
                            <g>
                              {/* Upper bound tick */}
                              <line x1={projX - 4} y1={upperY} x2={projX + 4} y2={upperY} stroke="#0369a1" strokeWidth={1.5} />
                              <text x={projX + 7} y={upperY + 3} fontSize="8" fill="#0369a1" fontFamily="monospace">
                                High: {proj.upper_bound}
                              </text>

                              {/* Lower bound tick */}
                              <line x1={projX - 4} y1={lowerY} x2={projX + 4} y2={lowerY} stroke="#0369a1" strokeWidth={1.5} />
                              <text x={projX + 7} y={lowerY + 3} fontSize="8" fill="#0369a1" fontFamily="monospace">
                                Low: {proj.lower_bound}
                              </text>

                              {/* Forecast Point */}
                              <circle cx={projX} cy={midY} r={5} fill="#f59e0b" stroke="white" strokeWidth={2} />
                              <text x={projX} y={svgHeight - 12} textAnchor="middle" fontSize="9" fill="#0284c7" fontWeight="bold">
                                {proj.projected_date}*
                              </text>
                            </g>
                          )}
                        </svg>
                      );
                    })()}
                  </div>

                  {trend.projected_range && (
                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800">Forecasted Range (Next 60 Days): </span>
                        <span className="font-mono font-bold text-sky-800">
                          {trend.projected_range.lower_bound} – {trend.projected_range.upper_bound} {trend.unit}
                        </span>
                        <span className="text-[11px] text-slate-400 ml-1.5">(±{trend.projected_range.uncertainty_margin} band)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Slope: {trend.slope_per_month ? `${trend.slope_per_month > 0 ? '+' : ''}${trend.slope_per_month}` : '0'}/mo • R²={trend.r_squared}
                      </span>
                    </div>
                  )}
                </div>

                {/* Explanation text */}
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                  <h5 className="text-xs font-bold text-sky-900 uppercase tracking-wide">Analysis Reason:</h5>
                  <p className="text-xs text-sky-950 mt-1 leading-relaxed">{trend.reason}</p>
                </div>
              </>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Close Trend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main View Component ──────────────────────────────────────────────────
export const LabDiagnosticsView: React.FC<LabDiagnosticsViewProps> = ({ language }) => {
  const [patients, setPatients] = useState<DemoPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('P101');
  const [reportDate, setReportDate] = useState<string>('');
  const [insightsData, setInsightsData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'All' | 'High' | 'Low' | 'Normal' | 'Critical'>('All');
  const [selectedPanel, setSelectedPanel] = useState<string>('All');
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);

  // Modal Trend Chart
  const [activeTrendTest, setActiveTrendTest] = useState<string | null>(null);
  const [trendData, setTrendData] = useState<TrendResponse | null>(null);
  const [trendLoading, setTrendLoading] = useState<boolean>(false);

  // Compare Two Dates Mode
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [compareDateA, setCompareDateA] = useState<string>('');
  const [compareDateB, setCompareDateB] = useState<string>('');
  const [compareDataA, setCompareDataA] = useState<InsightsResponse | null>(null);
  const [compareDataB, setCompareDataB] = useState<InsightsResponse | null>(null);

  // PDF Download State
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Load Demo Patients list on mount
  useEffect(() => {
    fetchDemoPatients()
      .then((data) => {
        setPatients(data);
      })
      .catch((err) => {
        console.warn('Could not fetch patients from backend:', err);
      });
  }, []);

  // Fetch Insights whenever patientId or reportDate changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLabInsights(selectedPatientId, undefined, reportDate || undefined)
      .then((data) => {
        setInsightsData(data);
        if (data.document_date && !reportDate) {
          setReportDate(data.document_date);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load insights:', err);
        setError('Could not connect to Lab Diagnostics service. Please ensure backend is running at http://localhost:8000.');
        setLoading(false);
      });
  }, [selectedPatientId, reportDate]);

  // Load comparison reports when Compare Mode is active
  useEffect(() => {
    if (!isCompareMode) return;
    if (compareDateA) {
      fetchLabInsights(selectedPatientId, undefined, compareDateA).then(setCompareDataA).catch(console.error);
    }
    if (compareDateB) {
      fetchLabInsights(selectedPatientId, undefined, compareDateB).then(setCompareDataB).catch(console.error);
    }
  }, [isCompareMode, compareDateA, compareDateB, selectedPatientId]);

  // Handle open trend
  const handleOpenTrend = async (testKey: string) => {
    setActiveTrendTest(testKey);
    setTrendLoading(true);
    try {
      const res = await fetchTestTrend(testKey, selectedPatientId);
      setTrendData(res);
    } catch (e) {
      console.error(e);
      setTrendData(null);
    } finally {
      setTrendLoading(false);
    }
  };

  // Handle PDF Download
  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    try {
      const blob = await downloadLabReportPdf(selectedPatientId, reportDate, language.code || 'en');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MediMitra_Lab_Report_${selectedPatientId}_${reportDate || '2026'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error(e);
      alert('Could not download PDF report. Ensure the backend server is running.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    if (!insightsData) return [];
    return insightsData.insights.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.panel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.what_it_measures.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        selectedStatus === 'All' ||
        (selectedStatus === 'Critical' && c.is_critical) ||
        (selectedStatus === 'High' && c.status === 'High') ||
        (selectedStatus === 'Low' && c.status === 'Low') ||
        (selectedStatus === 'Normal' && c.status === 'Normal');

      const matchesPanel = selectedPanel === 'All' || c.panel === selectedPanel;

      return matchesSearch && matchesStatus && matchesPanel;
    });
  }, [insightsData, searchTerm, selectedStatus, selectedPanel]);

  const panelsList = useMemo(() => {
    if (!insightsData) return [];
    return ['All', ...insightsData.panels];
  }, [insightsData]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Strict Medical Disclaimer Banner ── */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 shadow-xs flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold uppercase tracking-wider text-amber-950 font-mono">
            Medical Non-Diagnostic Safety Disclaimer:
          </span>{' '}
          MediMitra evaluates laboratory biomarker thresholds against published guidelines (ICMR/ADA/WHO) for patient health literacy and doctor consultation. It does{' '}
          <b>NOT</b> diagnose conditions, recommend medication alterations, or set clinical targets. Always consult a licensed physician.
          {insightsData?.summary.critical_count && insightsData.summary.critical_count > 0 ? (
            <div className="mt-2 font-bold text-rose-800 flex items-center gap-1.5 bg-rose-100 p-2 rounded-lg border border-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Attention: Critical biomarker values detected. Please contact a doctor soon. In an emergency call 112.</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── Top Header Card (Primary Sky Blue - Keeping Existing Visual Brand) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0284C7] via-[#0EA5E9] to-[#38BDF8] text-white border border-sky-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-white/20 border border-white/30 text-white shadow-sm">
            <Dna className="w-8 h-8 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-mono tracking-wide">
                Biomarker & Lab Diagnostics Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20 text-white font-bold border border-white/20">
                Longitudinal Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              Automated demographic reference evaluation, explainable multi-marker patterns & regression trends.
            </p>
          </div>
        </div>

        {/* Action Controls & Download Report */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2.5 rounded-2xl bg-white text-sky-900 font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-sky-50 transition-all border border-sky-100 active:scale-95 disabled:opacity-75"
          >
            {isDownloadingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
            ) : (
              <Download className="w-4 h-4 text-sky-600" />
            )}
            <span>Download Full Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* ── Patient Profile & Report Selector Toolbar ── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Patient Selector */}
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-700">Patient:</span>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                setReportDate('');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none focus:border-sky-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sex.charAt(0).toUpperCase() + p.sex.slice(1)}, {p.age}y) — {p.reports_count} Reports
                </option>
              ))}
            </select>
          </div>

          {/* Report Date Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-700">Report Date:</span>
            <span className="px-3 py-1.5 rounded-xl border border-slate-200 bg-sky-50 text-sky-900 text-xs font-mono font-bold">
              {reportDate || insightsData?.document_date || 'Latest'}
            </span>
          </div>
        </div>

        {/* Compare Dates Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompareMode(!isCompareMode)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
              isCompareMode
                ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-sky-400'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isCompareMode ? 'Exit Comparison' : 'Compare Two Dates'}</span>
          </button>
        </div>
      </div>

      {/* ── Compare Two Dates View ── */}
      {isCompareMode && (
        <div className="p-6 rounded-3xl bg-sky-950 text-white border border-sky-800 shadow-xl space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-800/80 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <span>Longitudinal Delta Comparison</span>
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                Compare physiological marker changes between two historical report dates.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="date"
                value={compareDateA}
                onChange={(e) => setCompareDateA(e.target.value)}
                placeholder="Date A"
                className="px-3 py-1.5 rounded-xl bg-sky-900 text-white border border-sky-700 text-xs font-mono"
              />
              <ArrowRight className="w-4 h-4 text-sky-400" />
              <input
                type="date"
                value={compareDateB}
                onChange={(e) => setCompareDateB(e.target.value)}
                placeholder="Date B"
                className="px-3 py-1.5 rounded-xl bg-sky-900 text-white border border-sky-700 text-xs font-mono"
              />
            </div>
          </div>

          {compareDataA && compareDataB ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {compareDataA.insights.map((cardA) => {
                const cardB = compareDataB.insights.find((b) => b.test_key === cardA.test_key);
                if (!cardB) return null;
                const delta = Number((cardB.value - cardA.value).toFixed(2));
                return (
                  <div key={cardA.test_key} className="p-3.5 rounded-2xl bg-sky-900/60 border border-sky-700 text-xs">
                    <span className="text-[10px] font-bold text-sky-300 uppercase">{cardA.panel}</span>
                    <h5 className="font-bold text-white text-sm mt-0.5">{cardA.name}</h5>
                    <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-sky-800">
                      <div>
                        <p className="text-[10px] text-sky-300">Baseline ({compareDateA.slice(5) || 'A'})</p>
                        <p className="font-mono font-bold text-slate-200">
                          {cardA.value} {cardA.unit}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
                      <div>
                        <p className="text-[10px] text-sky-300">Follow-up ({compareDateB.slice(5) || 'B'})</p>
                        <p className="font-mono font-bold text-white">
                          {cardB.value} {cardB.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-sky-300">Delta</p>
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono font-bold text-[11px] ${
                            delta > 0
                              ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                              : delta < 0
                              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-sky-300 italic">Select two historical dates above to display side-by-side values.</p>
          )}
        </div>
      )}

      {/* ── Summary Metrics Bar (Retains Existing Sky Pill Design) ── */}
      {insightsData && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Layers className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Total Evaluated</p>
              <p className="text-base font-bold text-slate-900 font-mono">{insightsData.summary.total_markers} Tests</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">In Range</p>
              <p className="text-base font-bold text-emerald-700 font-mono">{insightsData.summary.normal_count} Normal</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Attention Needed</p>
              <p className="text-base font-bold text-rose-700 font-mono">{insightsData.summary.high_count} High</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Below Range</p>
              <p className="text-base font-bold text-amber-700 font-mono">{insightsData.summary.low_count} Low</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-sky-200 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="p-2.5 rounded-xl bg-sky-100 text-sky-700">
              <Sparkles className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-mono font-bold">Lab Wellness Overview</p>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-sky-800 font-mono">
                  {insightsData.summary.wellness_score || 85}
                </span>
                <span className="text-[10px] text-slate-400">/ 100</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Key Items for Doctor Discussion ── */}
      {insightsData && insightsData.summary.top_discussion_items.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-sky-700" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-950 font-mono">
              Top Items to Discuss with Your Doctor:
            </h4>
          </div>
          <ul className="space-y-1.5 text-xs text-sky-900">
            {insightsData.summary.top_discussion_items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Cross-Marker Explainable Patterns Noticed ── */}
      {insightsData && insightsData.patterns_detected.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide font-mono">
              Explainable Patterns Noticed ({insightsData.patterns_detected.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insightsData.patterns_detected.map((pat) => (
              <div
                key={pat.rule_id}
                className="p-5 rounded-2xl bg-amber-50/70 border border-amber-300 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                      Rule {pat.rule_id} • {pat.panel}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Pattern Noticed</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1.5">{pat.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed mb-3">{pat.description}</p>
                </div>

                <div className="pt-3 border-t border-amber-200/60 space-y-2">
                  <div className="text-[11px] text-amber-900 bg-amber-100/50 p-2.5 rounded-xl border border-amber-200/50">
                    <p className="font-bold">Discussion prompt for physician:</p>
                    <p className="mt-0.5">{pat.recommendation}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono italic">Source: {pat.guideline_source}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Search, Status & Panel Filters ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search biomarkers, panels, or terms..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-sky-500 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Critical', 'High', 'Low', 'Normal'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedStatus(filter)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === filter
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-sky-400'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Panel Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1">Panels:</span>
          {panelsList.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPanel(p)}
              className={`px-3 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedPanel === p
                  ? 'bg-sky-100 text-sky-900 border border-sky-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── Biomarker Cards Grid (Retaining Existing Card Design) ── */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600">Evaluating clinical biomarkers against reference ranges...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 space-y-2">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="font-bold text-sm">Failed to load lab data</p>
          <p className="text-xs text-rose-600">{error}</p>
        </div>
      ) : filteredCards.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
          <Filter className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching biomarkers found</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or filter tags.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCards.map((test) => {
            const isHigh = test.status === 'High';
            const isCrit = test.is_critical;
            const isLow = test.status === 'Low';
            const isExpanded = expandedCardKey === test.test_key;

            return (
              <div
                key={test.test_key}
                className={`p-5 rounded-2xl bg-white border transition-all shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isCrit
                    ? 'border-red-400 bg-red-50/20 ring-1 ring-red-300'
                    : isHigh
                    ? 'border-rose-300'
                    : isLow
                    ? 'border-amber-300'
                    : 'border-slate-200 hover:border-sky-400'
                }`}
              >
                <div>
                  {/* Top Category & Status Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider font-mono">
                      {test.panel}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                        isCrit
                          ? 'bg-red-600 text-white animate-pulse'
                          : isHigh
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : isLow
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {test.severity_label}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm mb-1">{test.name}</h4>

                  {/* Value and Reference Range Display */}
                  <div className="flex items-baseline gap-1.5 mb-2">
                    <span className="text-xl font-black font-mono text-sky-800">{test.value}</span>
                    <span className="text-xs text-slate-500 font-semibold">{test.unit}</span>
                    <span className="text-[11px] text-slate-400 ml-auto font-mono">
                      Ref: {test.range_used}
                    </span>
                  </div>

                  {test.is_converted && (
                    <p className="text-[10px] text-sky-600 font-mono mb-2">
                      ✓ Unit converted to standard {test.unit}
                    </p>
                  )}

                  {/* Plain Language Summary Note */}
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      {test.high_low_meaning}
                    </p>
                  </div>
                </div>

                {/* Collapsible Educational Details */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedCardKey(isExpanded ? null : test.test_key)}
                      className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'What it measures & questions'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* View Trend Prediction Button */}
                    <button
                      onClick={() => handleOpenTrend(test.test_key)}
                      className="text-[11px] font-bold text-slate-700 hover:text-sky-600 flex items-center gap-1 bg-slate-100 hover:bg-sky-50 px-2 py-1 rounded-lg transition-colors border border-slate-200"
                    >
                      <TrendingUp className="w-3 h-3 text-sky-600" />
                      <span>Trend</span>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-700 animate-fade-in border border-slate-200/60">
                      <div>
                        <span className="font-bold text-slate-900">What this test measures: </span>
                        <span>{test.what_it_measures}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">Non-medical factors: </span>
                        <span className="text-slate-600">{test.non_medical_factors}</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-900">General lifestyle info: </span>
                        <span className="text-slate-600">{test.lifestyle_info}</span>
                      </div>
                      {test.questions_for_doctor.length > 0 && (
                        <div className="pt-1.5 border-t border-slate-200/60">
                          <span className="font-bold text-sky-800">Questions to ask your doctor:</span>
                          <ul className="list-disc pl-4 space-y-1 mt-1 text-[11px] text-slate-700">
                            {test.questions_for_doctor.map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 font-mono mt-1">
                        Reference Source: {test.range_source}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Documented Prescription Medications ── */}
      {insightsData && insightsData.medicines_from_prescription.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono">
              Medications from your uploaded prescription:
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {insightsData.medicines_from_prescription.map((med, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-semibold border border-slate-200"
              >
                {med}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 italic">
            * Citing exclusively medications documented on your own uploaded prescription. MediMitra does not alter or recommend medical prescriptions.
          </p>
        </div>
      )}

      {/* ── Trend Analysis Modal ── */}
      {activeTrendTest && (
        <TrendModalChart
          trend={trendData}
          loading={trendLoading}
          onClose={() => {
            setActiveTrendTest(null);
            setTrendData(null);
          }}
        />
      )}
    </div>
  );
};
