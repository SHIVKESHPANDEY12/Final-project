import React, { useState } from 'react';
import { Card, Button, Radio, Typography, Progress, Space, notification } from 'antd';
import { Link, useParams } from 'react-router-dom'; // Make sure to import Link from react-router-dom
import { useSelector } from 'react-redux';
import axios from '../config/axiosConfig'

const { Title, Text } = Typography;

const QuizDetails = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question
  const [selectedOption, setSelectedOption] = useState(null); // Track the selected answer
  const [score, setScore] = useState(0); // Track the score
  const [showResult, setShowResult] = useState(false); // Show results after quiz completion
  const { id } = useParams()
  const user = useSelector((state) => state.user.user);

  // Sample quiz questions
  const questions = [
    {
      question: 'What is React?',
      options: ['A JavaScript library', 'A CSS framework', 'A Database', 'None of the above'],
      correctAnswer: 'A JavaScript library',
    },
    {
      question: 'What is the use of useState in React?',
      options: ['Manage state', 'Manage routes', 'Handle API requests', 'None of the above'],
      correctAnswer: 'Manage state',
    },
    {
      question: 'Which hook is used for side effects in React?',
      options: ['useEffect', 'useState', 'useContext', 'useReducer'],
      correctAnswer: 'useEffect',
    },
  ];

  const totalQuestions = questions.length;

  // Handle option selection
  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  // Handle submit of the current question

  const handleSubmit = async () => {
    let ans = score;
    if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
      ans = score + 1;
      setScore(score + 1);
    }

    console.log(ans);


    // Calculate the score percentage
    let finalScore;
    if (ans === 1) {
      finalScore = 33;
    } else if (ans === 2) {
      finalScore = 66;
    } else if (ans == 3) {
      finalScore = 100;
    }


    // Move to the next question or show result
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      // Save quiz score to the database
      try {
        const userId = user._id; // Replace with actual user ID
        const courseId = id; // Replace with actual course ID

        const response = await axios.post('http://localhost:5000/api/courses/saveQuizResult', {
          userId,
          courseId,
          score: finalScore,
        });

        if (response.data.success) {
          notification.success({
            message: 'Quiz Completed!',
            description: 'Yay! You completed the quiz! Your score has been saved.',
            placement: 'topRight',
          });
        } else {
          notification.error({
            message: 'Error',
            description: 'Failed to save your quiz score. Please try again later.',
            placement: 'topRight',
          });
        }
      } catch (error) {
        console.error('Error saving quiz score:', error);
        notification.error({
          message: 'Error',
          description: 'An error occurred while saving your quiz score.',
          placement: 'topRight',
        });
      }

      setShowResult(true);
    }
  };


  // Restart quiz
  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowResult(false);
    setSelectedOption(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      {showResult ? (
        <Card style={{ textAlign: 'center', backgroundColor: '#f0f9ff', borderRadius: '10px' }}>
          <Title level={2}>
            {score >= 0.8 * totalQuestions
              ? 'Congratulations Bro you cleared the milestone!'
              : 'Try Again!'}
          </Title>
          <Text>You scored {score} out of {totalQuestions}.</Text>
          <Progress
            percent={(score / totalQuestions) * 100}
            status={score === totalQuestions ? 'success' : 'normal'}
            style={{ marginTop: '20px', marginBottom: '20px' }}
          />
          {score >= 0.8 * totalQuestions ? ( // Condition to check if score is greater than or equal to 80%
            <Link to="/dashboard">
              <Button type="primary">Dashboard</Button>
            </Link>
          ) : (
            <Button type="primary" onClick={handleRestart}>
              Restart Quiz
            </Button>
          )}
        </Card>
      ) : (
        <Card
          title={`Question ${currentQuestionIndex + 1}/${totalQuestions}`}
          bordered={false}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #e6f7ff 30%, #ffccff 100%)',
            borderRadius: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Title level={4}>{questions[currentQuestionIndex].question}</Title>
          <Radio.Group onChange={handleOptionChange} value={selectedOption} style={{ marginTop: '20px' }}>
            <Space direction="vertical">
              {questions[currentQuestionIndex].options.map((option, index) => (
                <Radio key={index} value={option}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>

          <Space style={{ marginTop: '20px', justifyContent: 'center', display: 'flex' }}>
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={selectedOption === null}
              style={{ width: '150px' }}
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default QuizDetails;
