import { useState } from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import { UploadSection } from './components/UploadSection';
import { MatchAnalysis } from './components/MatchAnalysis';
import { ChatSection } from './components/ChatSection';
import type { MatchAnalysisData, ParsedResume } from './types';

const API_BASE = '/api';

export default function App() {
  const [sessionId] = useState(() => uuidv4());
  const [analysis, setAnalysis] = useState<MatchAnalysisData | null>(null);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [hasJd, setHasJd] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const headers = { 'X-Session-Id': sessionId };

  const handleResumeUpload = async (file: File) => {
    setLoading('resume');
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/upload/resume`, {
        method: 'POST',
        headers,
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setParsed(data.parsed);
      if (data.analysis) setAnalysis(data.analysis);
      setHasResume(true);
      if (data.analysis) setHasJd(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload resume');
    } finally {
      setLoading(null);
    }
  };

  const handleJdUpload = async (file: File) => {
    setLoading('jd');
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_BASE}/upload/job-description`, {
        method: 'POST',
        headers,
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      if (data.analysis) setAnalysis(data.analysis);
      setHasJd(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to upload job description');
    } finally {
      setLoading(null);
    }
  };

  const handleAnalyze = async () => {
    setLoading('analyze');
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/upload/analyze`, {
        method: 'POST',
        headers,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Resume Screening Tool</h1>
        <p>Upload a resume and job description to get an AI-powered match analysis and ask questions.</p>
      </header>

      <main className="main">
        <UploadSection
          onResumeUpload={handleResumeUpload}
          onJdUpload={handleJdUpload}
          onAnalyze={handleAnalyze}
          hasResume={hasResume}
          hasJd={hasJd}
          loading={loading}
        />

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {analysis && (
          <MatchAnalysis data={analysis} parsed={parsed} />
        )}

        {hasResume && hasJd && (
          <ChatSection sessionId={sessionId} />
        )}
      </main>
    </div>
  );
}
