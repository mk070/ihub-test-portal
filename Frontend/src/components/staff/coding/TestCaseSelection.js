import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function TestCaseSelection({ selectedProblem, onSelectProblem }) {
  const [problems, setProblems] = useState([]);
  const location = useLocation();

  // Retrieve contest_id and student_id from the location state
  const { contest_id, student_id } = location.state || {}; 

  // Fetch problems dynamically based on contest_id and student_id
  useEffect(() => {
    if (!contest_id || !student_id) {
      console.error("Contest ID or Student ID is missing.");
      return;
    }

    fetch('http://localhost:8000/api/start_test/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contest_id, student_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.problems) {
          setProblems(data.problems);
        } else {
          console.error("No problems found in API response.");
        }
      })
      .catch((error) => console.error("Error fetching problems:", error));
  }, [contest_id, student_id]);

  return (
    <div className="mb-4">
      <label className="text-lg font-semibold">Select a problem to solve:</label>
      <select
        value={selectedProblem}
        onChange={(e) => onSelectProblem(parseInt(e.target.value, 10))}
        className="w-full mt-2 p-2 border rounded"
      >
        {problems.length > 0 ? (
          problems.map((problem, index) => (
            <option key={index} value={problem.id}>
              {problem.title}
            </option>
          ))
        ) : (
          <option disabled>Loading problems...</option>
        )}
      </select>
    </div>
  );
}

export default TestCaseSelection;
