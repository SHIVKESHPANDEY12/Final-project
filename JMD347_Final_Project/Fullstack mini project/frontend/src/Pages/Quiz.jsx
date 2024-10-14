import React, { useState, useEffect } from 'react';
import {
  Input,
  Progress,
  Checkbox,
  Typography,
  List,
  Card,
  Button,
  Row,
  Col,
  Collapse,
  Upload,
  Layout,
  Space,
  Avatar,
  Rate,
  message,
} from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import Confetti from 'react-confetti';
import { Link, useNavigate } from 'react-router-dom';




import './CourseModule.css'; // Import CSS file

// import QuizDetails from './QuizDetails';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Header, Content } = Layout;

const CourseModule = () => {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [completedItems, setCompletedItems] = useState([]);
  const [progressComplete, setProgressComplete] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(false);
  const [discussionText, setDiscussionText] = useState('');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const [enrollId, setEnrollId] = useState(null);

  const { id } = useParams();

  // Timer logic for time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeSpentFormatted = `${Math.floor(timeSpent / 60)} min ${timeSpent % 60} sec`;

  // Static course data with chapters and modules
  const [courseData, setCourseData] = useState({
    title: '',
    description:
      '',
    prerequisites:
      'You need to complete the "Intermediate React" and "Basic Node.js" courses before starting.',
    rating: 0,
    modulesCount: 9,
    thumbnail: '',
    videoUrl: '',
    chapters: [
      {
        id: 1,
        title: 'Chapter 1: Basic React',
        items: [
          { id: 1, title: 'Hello World', description: 'Learn foundational concepts of React.', documentation: 'https://reactjs.org/docs/getting-started.html' },
          { id: 2, title: 'React Frameworks', description: 'Deep dive into React frameworks.', documentation: 'https://reactjs.org/docs/framework.html' },
          { id: 3, title: 'React Library', description: 'Explore popular React libraries.', documentation: 'https://reactjs.org/docs/library.html' },
        ],
      },
      {
        id: 2,
        title: 'Chapter 2: React Backend',
        items: [
          { id: 4, title: 'All About React Backend', description: 'Learn how to handle the backend in React.', documentation: 'https://reactjs.org/docs/backend.html' },
          { id: 5, title: 'Backend Services', description: 'Introduction to backend services.', documentation: 'https://reactjs.org/docs/backend-services.html' },
          { id: 6, title: 'React Router DOM', description: 'Explore React Router DOM for navigation.', documentation: 'https://reactjs.org/docs/react-router-dom.html' },
        ],
      },
      {
        id: 3,
        title: 'Chapter 3: Full-Stack Development',
        items: [
          { id: 7, title: 'Connecting React with Node.js', description: 'Build full-stack applications by connecting React with Node.js.', documentation: 'https://reactjs.org/docs/nodejs.html' },
          { id: 8, title: 'API Development', description: 'Understand API development and best practices.', documentation: 'https://reactjs.org/docs/api-development.html' },
          { id: 9, title: 'Full-Stack Quiz', description: 'Test your understanding of full-stack development.', documentation: 'https://reactjs.org/docs/full-stack-quiz.html' },
        ],
      },
    ],
  });

  const getData = async () => {

    try {
      const res = await axios.get(`http://localhost:5000/api/courses/course/enrollment`, {
        params: {
          userId: user._id,
          courseId: id
        }
      });
      console.log(res.data);

      if (res.data.success) {
        const course = res.data.enrollment.courseId;
        setEnrollId(res.data.enrollment._id)
        setProgressPercentage(res.data.enrollment.progressPercentage);

        setCourseData((prevData) => ({
          ...prevData,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          videoUrl: course.videoUrl,
          rating: course.rating,
        }));
      }
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };



  const getAllDiscussions = async () => {
    try {
      console.log(id);

      const res = await axios.get(`http://localhost:5000/api/users/course/${id}/discussions`);
      if (res.data.success) {
        setDiscussions(res.data.discussions)
      }
      console.log(res.data);
    } catch (error) {
      console.error("Error fetching discussions:", error);
    }
  };



  useEffect(() => {
    getData();
    getAllDiscussions();

  }, [])




  const handleCheck = (id) => {
    setCompletedItems((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];

      const totalItems = courseData.chapters.reduce(
        (total, chapter) => total + chapter.items.length,
        0
      );
      const completedCount = updated.length;
      const progressPercentage =
        totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

      // Update progressComplete, confetti, and feedback visibility if all items are completed
      if (completedCount === totalItems) {
        setProgressComplete(true);
        setConfettiVisible(true);
        setFeedbackVisible(true);
        setTimeout(() => setConfettiVisible(false), 4000);
      }

      // Log or use the progress percentage
      console.log("Updated Progress Percentage:", progressPercentage);

      // Update the local state with the new progress percentage
      setProgressPercentage(progressPercentage);

      // Call the API to update the progress on the server
      updateProgressOnServer(progressPercentage);

      return updated;
    });
  };

  // Function to call the backend API to update progress
  const updateProgressOnServer = async (progressPercentage) => {
    try {
      const enrollmentId = enrollId
      const response = await axios.put("http://localhost:5000/api/courses/update-progress", {
        enrollmentId,
        progressPercentage,
      });

      if (response.data.success) {
        console.log("Progress updated successfully:", response.data);
      } else {
        console.error("Failed to update progress:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };






  const handleWatchVideo = () => {
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
  };

  const handleDiscussionSubmit = async () => {
    if (discussionText.trim()) {
      const newDiscussion = {
        message: discussionText.trim(),
        userId: user._id,
        courseId: id,
      };

      try {
        const res = await axios.post("http://localhost:5000/api/users/course/discussion", newDiscussion);


        if (res.data.success) {
          await getAllDiscussions();
        }

        setDiscussionText('');
      } catch (error) {
        console.error("Error submitting discussion:", error);
      }
    }
  };


  const handleDeleteDiscussion = async (id) => {
    try {
      // Send delete request to the server
      await axios.delete(`http://localhost:5000/api/users/course/discussions/${id}`);
      await getAllDiscussions()
    } catch (error) {
      console.error('Error deleting discussion:', error.response ? error.response.data : error.message);
    }
  };




  const handleFeedbackSubmit = async () => {
    // Capture rating and feedback text
    const feedbackData = {
      rating,
      messageText: feedbackText,
    };

    // User and Course IDs (replace with actual values from your state or props)
    const userId = user._id;  // Replace with actual user ID
    const courseId = id;  // Replace with actual course ID

    try {
      const response = await axios.post('http://localhost:5000/api/courses//submitFeedback', {
        userId,
        courseId,
        rating,
        feedbackText,
      });

      if (response.data.success) {


        // Reset feedback form
        console.log('Feedback submitted:', { rating, feedbackText });
        setFeedbackVisible(false);
        setRating(0);
        setFeedbackText('');
      } else {
        notification.error({
          message: 'Error',
          description: 'Failed to submit feedback. Please try again later.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while submitting feedback.',
        placement: 'topRight',
      });
    }
  };

  return (
    <Layout>
      {/* Header copied from Dashboard */}
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#001529', padding: '0 20px' }}>
        <Space size={20}>
          <Link to="/courses"><Button type="primary">Courses</Button></Link>
          <Link to="/dashboard"><Button type="primary">Dashboard</Button></Link>
          <Link to="/discussion"><Button type="primary">Discussion</Button></Link>
        </Space>
        <div style={{ display: 'flex', alignItems: 'center', color: 'white' }}>
          <Avatar size={40} src="https://i.pravatar.cc/300" />
          <Typography.Text style={{ fontSize: 16, marginLeft: 10, color: 'white' }}>{user.name}</Typography.Text>
        </div>
      </Header>

      <Content style={{ padding: '20px' }}>
        {confettiVisible && <Confetti />}
        <Card>
          <Row gutter={16}>
            <Col span={8}>
              {showVideo ? (
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe width="100%" height="100%" src={courseData.videoUrl} title="YouTube Video" frameBorder="0" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, borderRadius: '10px' }}></iframe>
                  <Button onClick={handleCloseVideo} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1 }}>Close</Button>
                </div>
              ) : (
                <img src={courseData.thumbnail} alt="Course Thumbnail" style={{ width: '100%', height: 'auto', borderRadius: '10px', cursor: 'pointer' }} onClick={handleWatchVideo} />
              )}
            </Col>
            <Col span={16}>
              <Title level={2}>{courseData.title}</Title>
              <Text>{courseData.description}</Text>
              <br />
              <Text strong>Prerequisites: </Text>
              <Text>{courseData.prerequisites}</Text>
              <br />
              <Text strong>Rating: </Text>
              <Text>{courseData.rating} ⭐</Text>
              <br />
              <Text strong>Total Modules: </Text>
              <Text>{courseData.modulesCount}</Text>
              <br />
              <Progress percent={progressPercentage} status={progressComplete ? 'success' : 'normal'} style={{ marginTop: '10px' }} />
            </Col>
          </Row>
        </Card>

        {courseData.chapters.map((chapter) => (
          <Collapse key={chapter.id} defaultActiveKey={[chapter.id]}>
            <Panel header={`Chapter ${chapter.id}: ${chapter.title}`}>
              <Collapse>
                {chapter.items.map((module) => (
                  <Panel header={module.title} key={module.id}>
                    <Text>{module.description}</Text>
                    <br />
                    <Button type="link" href={module.documentation} target="_blank">Documentation</Button>
                    <Checkbox checked={completedItems.includes(module.id)} onChange={() => handleCheck(module.id)}>Mark as Completed</Checkbox>
                  </Panel>
                ))}
              </Collapse>
            </Panel>
          </Collapse>
        ))}

        {/* Discussion Section */}
        <Card title="Discussion Forum" style={{ marginTop: '20px' }}>
          <Input.TextArea value={discussionText} onChange={(e) => setDiscussionText(e.target.value)} placeholder="Write your discussion..." rows={4} />
          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              setUploadedImage(URL.createObjectURL(file));
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} style={{ marginTop: '10px' }}>Upload Image</Button>
          </Upload>
          <Button type="primary" onClick={handleDiscussionSubmit} style={{ marginTop: '10px' }}>Submit</Button>

          <List
            itemLayout="horizontal"
            dataSource={discussions}
            renderItem={(discussion) => (
              <List.Item
                actions={
                  discussion.userId && user._id === discussion.userId._id
                    ? [<DeleteOutlined key="delete" onClick={() => handleDeleteDiscussion(discussion._id)} />]
                    : []
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={discussion.userId?.avatarUrl} />}
                  title={discussion.userId?.username}
                  description={discussion.message}
                />
              </List.Item>
            )}
          />

        </Card>

        {/* Feedback Section */}

        {feedbackVisible && (
          <Card title=" Quiz and Feedback" style={{ marginTop: '20px' }}>
            <Button type="primary" onClick={() => {
              navigate(`/quizdetails/${id}`)
            }} style={{ marginTop: '10px' }}>Start Quiz</Button>
            <Title level={4}>We value your feedback!</Title>
            <Rate onChange={setRating} value={rating} />
            <Input.TextArea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              style={{ marginTop: '10px' }}
            />
            <Button type="primary" onClick={handleFeedbackSubmit} style={{ marginTop: '10px' }}>Submit Feedback</Button>

          </Card>
        )}
      </Content>
    </Layout>
  );
};

export default CourseModule;

