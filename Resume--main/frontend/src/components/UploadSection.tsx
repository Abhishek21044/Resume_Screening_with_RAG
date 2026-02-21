import { useRef } from 'react';

interface Props {
  onResumeUpload: (file: File) => void;
  onJdUpload: (file: File) => void;
  onAnalyze: () => void;
  hasResume: boolean;
  hasJd: boolean;
  loading: string | null;
}

export function UploadSection({
  onResumeUpload,
  onJdUpload,
  onAnalyze,
  hasResume,
  hasJd,
  loading,
}: Props) {
  const resumeRef = useRef<HTMLInputElement>(null);
  const jdRef = useRef<HTMLInputElement>(null);

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    cb: (f: File) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) cb(file);
    e.target.value = '';
  };

  return (
    <section className="upload-section">
      <h2>Upload Documents</h2>
      <div className="upload-grid">
        <div className="upload-card">
          <h3>Resume</h3>
          <input
            ref={resumeRef}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFile(e, onResumeUpload)}
            hidden
          />
          <button
            className="btn btn-outline"
            onClick={() => resumeRef.current?.click()}
            disabled={loading !== null}
          >
            {loading === 'resume' ? 'Uploading...' : hasResume ? '✓ Uploaded' : 'Choose Resume'}
          </button>
          <span className="hint">PDF or TXT</span>
        </div>
        <div className="upload-card">
          <h3>Job Description</h3>
          <input
            ref={jdRef}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFile(e, onJdUpload)}
            hidden
          />
          <button
            className="btn btn-outline"
            onClick={() => jdRef.current?.click()}
            disabled={loading !== null}
          >
            {loading === 'jd' ? 'Uploading...' : hasJd ? '✓ Uploaded' : 'Choose JD'}
          </button>
          <span className="hint">PDF or TXT</span>
        </div>
      </div>
      {hasResume && hasJd && (
        <button
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={loading === 'analyze'}
        >
          {loading === 'analyze' ? 'Analyzing...' : 'Run Match Analysis'}
        </button>
      )}
    </section>
  );
}
