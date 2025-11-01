import '../css/upload.css'
import { useState } from "react";
import Results from './Error.jsx';

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [results, setResults] = useState([]); // stochează rezultatele de la backend

  const handleChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => formData.append("file", file));

    try {
      console.log("🟡 Trimit request către backend...");
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,  // ✅ Acum formData este definit!
      });
      
      console.log("🟡 Răspuns primit:", res.status);
      const data = await res.json();
      console.log("📊 Date primite:", data);
      
      if (data.results) {
        setResults(data.results);
      } else {
        console.error("Eroare upload:", data);
      }
    } catch (err) {
      console.error("🔴 Eroare fetch:", err);
    }
  };

  return (
    <div className="upload-div">
        <div className="container-input">
            <input type="file" multiple onChange={handleChange} className="choose-file"/>
            <button onClick={handleUpload} className="upload">
                Upload
            </button>           
        </div>

      <Results results={results} />
    </div>
  );
}
