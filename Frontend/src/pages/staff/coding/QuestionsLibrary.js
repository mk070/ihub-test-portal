import React, { useState, useEffect } from "react";

const CodingQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data from Django API on mount
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/questions/") // Replace with your Django API endpoint
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data);
        setFilteredQuestions(data); // Initialize filtered questions
      })
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  // Filter questions based on search query
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = questions.filter(
      (q) =>
        q.name.toLowerCase().includes(query) ||
        q.description.toLowerCase().includes(query)
    );
    setFilteredQuestions(filtered);
  };

  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    heading: {
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "bold",
      marginBottom: "20px",
    },
    searchContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "20px",
    },
    searchInput: {
      padding: "10px",
      width: "100%",
      maxWidth: "300px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    section: {
      marginBottom: "20px",
    },
    sectionHeading: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    questionList: {
      listStyleType: "none",
      padding: "0",
    },
    questionItem: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
    },
    checkbox: {
      marginRight: "10px",
    },
    questionDetails: {
      display: "flex",
      flexDirection: "column",
    },
    questionName: {
      fontWeight: "bold",
    },
    questionDescription: {
      fontSize: "14px",
      color: "#666",
    },
  };

  const renderSection = (title) => (
    <div style={styles.section}>
      <h3 style={styles.sectionHeading}>{title}</h3>
      <ul style={styles.questionList}>
        {filteredQuestions.map((question) => (
          <li key={question.id} style={styles.questionItem}>
            <input type="checkbox" style={styles.checkbox} />
            <div style={styles.questionDetails}>
              <span style={styles.questionName}>{question.name}</span>
              <span style={styles.questionDescription}>
                {question.description}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Coding Questions</h1>
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={handleSearch}
          style={styles.searchInput}
        />
      </div>
      {renderSection("Questions Library")}
      {renderSection("Create Questions")}
      {renderSection("Bulk Upload")}
    </div>
  );
};

export default CodingQuestions;
