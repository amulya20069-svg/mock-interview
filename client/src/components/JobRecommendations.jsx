import { useEffect, useState } from "react";
import { API_URL } from "../config";

function JobRecommendations({ resumeAnalysis, setStep }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadJobs() {
      try {
        const res = await fetch(`${API_URL}/api/interview/job-recommendations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resumeAnalysis })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Job recommendation failed");
        setJobs(data.jobRecommendations || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (resumeAnalysis) loadJobs();
  }, [resumeAnalysis]);

  return (
    <section className="card">
      <h2>Resume-Based Job Discovery</h2>
      <p>
        These roles are ranked using resume evidence, role fit, missing skills, and application readiness.
      </p>

      {loading && <p>Finding suitable roles...</p>}
      {error && <p className="error">{error}</p>}

      <div className="role-grid">
        {jobs.map((job, index) => (
          <div className="role-card" key={index}>
            <h3>{job.title}</h3>
            <p><b>{job.company}</b> · {job.location}</p>
            <p className="score">{job.matchScore}% Match</p>

            <h4>Why this fits</h4>
            <ul>{(job.whyFits || []).map((item, i) => <li key={i}>{item}</li>)}</ul>

            <h4>Skills to improve before applying</h4>
            <ul>{(job.missingSkills || []).map((item, i) => <li key={i}>{item}</li>)}</ul>

            <p><b>Action:</b> {job.suggestedApplicationAction}</p>
          </div>
        ))}
      </div>

      <button onClick={() => setStep("roles")}>Continue to Interview Roles</button>
    </section>
  );
}

export default JobRecommendations;
