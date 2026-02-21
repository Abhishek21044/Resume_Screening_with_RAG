import type { MatchAnalysisData, ParsedResume } from '../types';

interface Props {
  data: MatchAnalysisData;
  parsed?: ParsedResume | null;
}

export function MatchAnalysis({ data, parsed }: Props) {
  const scoreColor =
    data.matchScore >= 70 ? 'var(--success)' :
    data.matchScore >= 50 ? 'var(--warning)' : 'var(--error)';

  return (
    <section className="match-section">
      <h2>Match Analysis</h2>
      <div className="score-card" style={{ '--score-color': scoreColor } as React.CSSProperties}>
        <div className="score-circle">
          <span className="score-value">{data.matchScore}%</span>
        </div>
        <p className="score-label">Match</p>
      </div>

      <div className="insights-grid">
        <div className="insight-card strengths">
          <h3>✅ Strengths</h3>
          <ul>
            {data.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="insight-card gaps">
          <h3>❌ Gaps</h3>
          <ul>
            {data.gaps.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      </div>

      {data.keyInsights.length > 0 && (
        <div className="insight-card key-insights">
          <h3>Key Insights</h3>
          <ul>
            {data.keyInsights.map((k, i) => (
              <li key={i}>{k}</li>
            ))}
          </ul>
        </div>
      )}

      {data.overallAssessment && (
        <div className="assessment">
          <h3>Overall Assessment</h3>
          <p>{data.overallAssessment}</p>
        </div>
      )}

      {parsed && (parsed.skills.length > 0 || parsed.experience.length > 0) && (
        <div className="resume-highlights">
          <h3>Resume Highlights</h3>
          {parsed.summary && <p className="summary">{parsed.summary}</p>}
          {parsed.skills.length > 0 && (
            <div>
              <strong>Skills:</strong>{' '}
              {parsed.skills.slice(0, 15).join(', ')}
              {parsed.skills.length > 15 && '...'}
            </div>
          )}
          {parsed.experience.length > 0 && (
            <div>
              <strong>Experience:</strong>
              <ul>
                {parsed.experience.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          {parsed.education.length > 0 && (
            <div>
              <strong>Education:</strong> {parsed.education.join('; ')}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
