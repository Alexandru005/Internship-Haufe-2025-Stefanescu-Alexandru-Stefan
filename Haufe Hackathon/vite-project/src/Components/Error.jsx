export default function Error({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="results">
      <h3>📊 Rezultate Analiză Cod</h3>
      {results.map((r, i) => (
        <div key={i} className="result-item">
          <h4>📄 {r.file}</h4>
          
          <div className="analysis-section">
            <strong>🔍 Analiză Erori:</strong>
            <div className={`output ${r.lint.includes('❌') ? 'error' : r.lint.includes('✅') ? 'success' : 'info'}`}>
              {r.lint.split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>

          <div className="analysis-section">
            <strong>🤖 Recomandări Îmbunătățire:</strong>
            <div className="output llm">
              {r.llm.split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}