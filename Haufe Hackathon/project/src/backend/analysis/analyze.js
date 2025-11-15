import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export const analyzeFiles = async (files) => {
  console.log("🚀 AI ANALYZER STARTED - Files:", files.map(f => f.name));

  const results = [];

  for (const file of files) {
    try {
      console.log(`📖 Processing: ${file.name}`);
      
      let code = "";
      
      if (file.tempFilePath) {
        code = fs.readFileSync(file.tempFilePath, "utf8");
      } else if (file.data) {
        code = file.data.toString();
      } else {
        throw new Error("Cannot read file content");
      }

      const fileExtension = path.extname(file.name).toLowerCase();
      const language = getLanguageFromExtension(fileExtension);
      
      console.log(`🔍 Detected language: ${language} for ${file.name}`);

      let lintResults = "";
      let llmSuggestions = "";

      // === ANALIZĂ CU OLLAMA OPTIMIZATĂ ===
      try {
        // Folosim un singur apel mai rapid în loc de două
        const analysis = await analyzeWithOllamaOptimized(code, file.name, language);
        lintResults = analysis.lint;
        llmSuggestions = analysis.suggestions;

      } catch (ollamaError) {
        console.error(`Ollama error for ${file.name}:`, ollamaError.message);
        // Fallback la analiză rapidă
        lintResults = generateQuickAnalysis(code, file.name, language);
        llmSuggestions = generateSmartSuggestions(code, file.name, language);
      }

      results.push({
        file: file.name,
        lint: lintResults,
        llm: llmSuggestions
      });

    } catch (fileError) {
      console.error(`❌ File processing error for ${file.name}:`, fileError);
      results.push({
        file: file.name,
        lint: `❌ Error: ${fileError.message}`,
        llm: "❌ Could not analyze"
      });
    }
  }

  console.log(`✅ AI analysis completed for ${results.length} files`);
  return results;
};

// === DETECȚIE LIMBAJ ===
function getLanguageFromExtension(extension) {
  const languageMap = {
    '.js': 'JavaScript', '.jsx': 'JavaScript', '.ts': 'TypeScript', '.tsx': 'TypeScript',
    '.py': 'Python', '.java': 'Java', '.cpp': 'C++', '.c': 'C', '.html': 'HTML',
    '.css': 'CSS', '.php': 'PHP', '.rb': 'Ruby', '.go': 'Go', '.rs': 'Rust'
  };
  return languageMap[extension] || 'Unknown';
}

// === ANALIZĂ OLLAMA OPTIMIZATĂ (PROMPT SCURT) ===
async function analyzeWithOllamaOptimized(code, filename, language) {
  try {
    // PROMPT SCURT ȘI EFICIENT
    const prompt = `
Analizează rapid acest cod ${language}:

\`\`\`
${code.substring(0, 1500)} ${code.length > 1500 ? '...' : ''}
\`\`\`

Răspunde în ROMÂNĂ cu:
1. Erori găsite (sau "Nicio eroare")
2. 2-3 sugestii de îmbunătățire

Răspuns concis!`;

    console.log(`🟡 Sending request to Ollama for ${filename}...`);
    
    const ollamaCmd = `ollama run llama2 "${prompt.replace(/"/g, '\\"')}"`;
    
    const { stdout } = await execAsync(ollamaCmd, { 
      timeout: 15000, // 15 secunde (scăzut de la 30)
      maxBuffer: 1024 * 512 // 512KB buffer (mai mic)
    });

    if (!stdout || stdout.trim().length < 10) {
      throw new Error("Răspuns Ollama gol");
    }

    console.log(`✅ Ollama response received for ${filename}`);

    // Procesează răspunsul
    const response = stdout.trim();
    const lines = response.split('\n');
    
    let lintPart = "🔍 Analiză Ollama:\n" + response;
    let suggestionsPart = "💡 Sugestii Ollama:\n" + response;

    // Încercă să sepără automat erorile de sugestii
    if (response.includes('1.') && response.includes('2.')) {
      const parts = response.split(/\d\./).filter(p => p.trim());
      if (parts.length >= 2) {
        lintPart = "🔍 Erori identificate:\n" + parts[0].trim();
        suggestionsPart = "💡 Sugestii:\n" + parts.slice(1).map(p => p.trim()).join('\n');
      }
    }

    return {
      lint: lintPart,
      suggestions: suggestionsPart
    };

  } catch (error) {
    console.error(`Ollama analysis failed for ${filename}:`, error.message);
    throw error;
  }
}

// === ANALIZĂ DE REZERVĂ ===
function generateQuickAnalysis(code, filename, language) {
  const issues = [];
  const lines = code.split('\n');

  // Verificări rapide
  if ((code.match(/{/g) || []).length !== (code.match(/}/g) || []).length) {
    issues.push("❌ Acolade neechilibrate");
  }
  if ((code.match(/\(/g) || []).length !== (code.match(/\)/g) || []).length) {
    issues.push("❌ Paranteze neechilibrate");
  }
  if (code.includes('console.log(') && !code.includes('console')) {
    issues.push("❌ console.log folosit incorect");
  }

  return issues.length > 0 
    ? `🔍 Verificare rapidă - ${issues.length} probleme:\n${issues.join('\n')}`
    : "✅ Nicio problemă evidentă găsită (verificare rapidă)";
}

function generateSmartSuggestions(code, filename, language) {
  return `💡 Pentru ${language}:

• Testează cu diverse input-uri
• Adaugă comentarii pentru logica complexă
• Folosește un IDE cu suport ${language}

🔧 Ollama este instalat! Analiza AI ar trebui să funcționeze.`;
}