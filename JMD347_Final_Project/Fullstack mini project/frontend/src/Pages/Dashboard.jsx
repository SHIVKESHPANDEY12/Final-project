import { Card, Space, Typography, Avatar, Button, Layout, Input, List, Progress, Row, Col, Calendar } from "antd";
import { useEffect, useState } from "react";
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Link, useNavigate } from "react-router-dom";


import axios from 'axios'
import { useSelector } from "react-redux";

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;

function Dashboard() {
    const user = useSelector((state) => state.user.user);

    const [courses, setCourses] = useState([]);
    const [recentlyEnrolled, setRecentlyEnrolled] = useState([]);

    const [completedQuizzes, setCompletedQuizzes] = useState([]);
    const [top5Quizzes, setTop5Quizzes] = useState([]);

    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [message, setMessage] = useState("");



    const [currentCourseIndex, setCurrentCourseIndex] = useState(0);

    const navigate = useNavigate()

    const getData = async () => {
        const res = await axios.get(`http://localhost:5000/api/users/user-data/${user._id}`);
        console.log(res.data);

        setRecentlyEnrolled(res.data.enrolledCourses);
        setDiscussionMessages(res.data.discussions);
        setCompletedQuizzes(res.data.recentQuizzes);
        setCourses(res.data.availableCourses);
        setTop5Quizzes(res.data.topScorers);
    }


    useEffect(() => {


        getData();
    }, [])


    const handleNext = () => {
        setCurrentCourseIndex((prevIndex) => (prevIndex + 1) % courses.length);
    };

    const handlePrev = () => {
        setCurrentCourseIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length);
    };

    const handlePostMessage = async () => {
        if (message.trim() === "") return;

        const newMessage = {
            userId: user._id,
            message: message,
        };

        try {
            const response = await axios.post(`http://localhost:5000/api/users/addNewDiscussionMessage`, newMessage);
            if (response.data.success) {
                await getData();
                setMessage("");
            };
        } catch (error) {
            alert("Error posting message:", error);
            console.error("Error posting message:", error);
        }
    };



    const enrollIn = async (id, userId, deadlineDate) => {
        try {
            const enrollmentData = {
                userId,
                courseId: id,
                deadlineDate,
            };

            const response = await axios.post("http://localhost:5000/api/courses/enroll", enrollmentData);


            if (response.data.success) {
                await getData();
            }
        } catch (error) {
            console.error("Error enrolling in course:", error.response ? error.response.data.message : error.message);
        }
    };


    return (
        <Layout>
            <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#001529", padding: "0 20px" }}>
                <Space size={20}>
                    <Link to="/courses">
                        <Button type="primary">Courses</Button>
                    </Link>
                    <Link to="/discussion">
                        <Button type="primary">Discussion</Button>
                    </Link>
                </Space>

                <div style={{ display: "flex", alignItems: "center", color: 'white' }}>
                    <Avatar size={40} src="https://i.pravatar.cc/300" />
                    <Typography.Text style={{ fontSize: 16, marginLeft: 10, color: 'white' }}>{user.name}</Typography.Text>
                </div>
            </Header>

            <Layout>
                <Content style={{ padding: "20px", width: '100%' }}>
                    <Typography.Title level={1}>Employee Dashboard</Typography.Title>
                    <Space size={20} direction="vertical" style={{ width: "100%" }}>

                        {/* Featured Courses */}
                        <Typography.Title level={3}>Featured Courses</Typography.Title>
                        <Row gutter={[100, 100]} justify="space-evenly" align="middle">
                            <Col>
                                <Button onClick={handlePrev}>
                                    <LeftOutlined />
                                </Button>
                            </Col>
                            <Col>
                                <Row gutter={[16, 16]}>
                                    {courses.slice(currentCourseIndex, currentCourseIndex + 3).map((course, index) => (
                                        <Col xs={20} sm={12} md={8} key={index}>
                                            <Card style={{ width: "100%" }}>
                                                <img alt={course.title} src={course.thumbnail} style={{ width: "100%", height: '150px', objectFit: 'cover' }} />
                                                <Typography.Title level={5}>{course.title}</Typography.Title>
                                                <Typography.Text>{course.description}</Typography.Text>
                                                <div style={{ marginTop: 8 }}>
                                                    <Typography.Text strong>Rating: {course.rating}</Typography.Text>
                                                </div>
                                                <Button type="primary" style={{ marginTop: 10 }} onClick={() => {
                                                    const enrollmentDeadline = new Date();
                                                    enrollmentDeadline.setDate(
                                                        enrollmentDeadline.getDate() + course.deadline
                                                    );
                                                    enrollIn(course._id, user._id, enrollmentDeadline);
                                                }}>
                                                    Enroll
                                                </Button>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Col>
                            <Col>
                                <Button onClick={handleNext}>
                                    <RightOutlined />
                                </Button>
                            </Col>
                        </Row>


                        {/* Recently Enrolled Courses */}
                        <Typography.Title level={3}>Recently Enrolled Courses</Typography.Title>
                        <Row gutter={[16, 16]}>
                            {recentlyEnrolled.map((course, index) => (
                                <Col xs={24} sm={12} md={12} lg={8} key={index}>
                                    <Card style={{ display: 'flex', alignItems: 'center', width: '100%', borderRadius: 8 }}>
                                        <img alt={course.courseId.title} src={course.courseId.thumbnail} style={{ width: 150, height: 100, marginRight: 16, objectFit: 'cover', borderRadius: 4 }} />
                                        <div style={{ flexGrow: 1 }}>
                                            <Typography.Title level={5}>{course.courseId.title}</Typography.Title>
                                            <Progress percent={course.progressPercentage} />
                                            <Button type="primary" style={{ marginTop: 10 }} onClick={() => {
                                                navigate(`/quiz/${course.courseId._id}`)
                                            }}>
                                                Continue Course
                                            </Button>
                                        </div>
                                    </Card>
                                </Col>
                            ))}
                        </Row>

                        {/* Recently Completed Quizzes */}
                        <Typography.Title level={3}>Recently Completed Quizzes</Typography.Title>
                        <Row gutter={[16, 16]}>
                            {completedQuizzes.map((item, index) => (
                                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                                    <Card style={{ width: '100%', borderRadius: 8 }}>
                                        <Card.Meta
                                            title={<Typography.Title level={4}>{item.courseId.title}</Typography.Title>}
                                            description={
                                                <div>
                                                    <Typography.Text>Total Time: {item.timeSpent || 'N/A'}</Typography.Text>
                                                    <br />
                                                    <Typography.Text strong style={{ color: item.score > 80 ? 'green' : item.score > 50 ? 'orange' : 'red' }}>
                                                        Score: {item.score} marks
                                                    </Typography.Text>
                                                </div>
                                            }
                                        />
                                        <Button
                                            type="primary"
                                            style={{ marginTop: 10 }}
                                            onClick={() => alert(`Details for ${item.name}`)}
                                        >
                                            View Details
                                        </Button>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                        {/* Discussion Forum */}
                        <Typography.Title level={3}>Discussion Forum</Typography.Title>
                        <Card style={{ width: "100%" }}>
                            <TextArea
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Post your message..."
                            />
                            <Button
                                type="primary"
                                style={{ marginTop: 10 }}
                                onClick={handlePostMessage}
                            >
                                Post Message
                            </Button>

                            <List
                                style={{ marginTop: 20 }}
                                bordered
                                dataSource={discussionMessages}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            avatar={<Avatar src="https://i.pravatar.cc/150?img=1" />}
                                            title={`${item.userId.username} - ${item.createdAt}`}
                                            description={item.message}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>

                    </Space>
                </Content>

                {/* Sider with Top Performers */}
                <Sider width={380} style={{ background: "#fff", padding: "20px" }}>
                    <Typography.Title level={3}>Top 5 Quiz Scorers</Typography.Title>
                    <List
                        dataSource={top5Quizzes}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<Avatar src='https://i.pravatar.cc/150?img=1' />}
                                    title={item.name}
                                    description={`Score: ${item.totalScore}`}
                                />
                            </List.Item>
                        )}
                    />

                    {/* Calendar Component */}
                    <Typography.Title level={3} style={{ marginTop: 50 }}>Calendar</Typography.Title>
                    <div style={{ width: '300px', height: '300px', overflow: 'hidden' }}>
                        <Calendar
                            style={{ width: '100%', height: '100%', border: '1px solid #d9d9d9' }}
                            fullscreen={false}
                            dateCellRender={(value) => <div>{value.date()}</div>} // Show only the date
                        />
                    </div>
                </Sider>


            </Layout>
        </Layout>
    );
}

export default Dashboard;
