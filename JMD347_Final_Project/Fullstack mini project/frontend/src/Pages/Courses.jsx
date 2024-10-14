import React, { useEffect, useState } from 'react';
import { Layout, Card, Avatar, Button, Typography, Space, notification, Progress } from 'antd';
import { Link } from 'react-router-dom';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

const enrolledCourses = [
    {
        id: 1,
        title: 'Course Title 1',
        description: 'Short description for course 1.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
        deadline: new Date(Date.now() + 86400000), // 1 day from now
        videoUrl: 'https://www.youtube.com/watch?v=toSAAgLUHuk'
    },
    {
        id: 2,
        title: 'Course Title 2',
        description: 'Short description for course 2.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
        deadline: new Date(Date.now() + 172800000), // 2 days from now
        videoUrl: 'https://www.youtube.com/watch?v=toSAAgLUHuk'
    },
    {
        id: 3,
        title: 'Course Title 3',
        description: 'Short description for course 3.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
        deadline: new Date(Date.now() + 259200000), // 3 days from now
        videoUrl: 'https://www.youtube.com/watch?v=toSAAgLUHuk'
    },
    {
        id: 4,
        title: 'Course Title 4',
        description: 'Short description for course 4.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
        deadline: new Date(Date.now() + 345600000), // 4 days from now
        videoUrl: 'https://www.youtube.com/watch?v=toSAAgLUHuk'
    },
];

const availableCourses = [
    {
        id: 5,
        title: 'Available Course Title 1',
        description: 'Short description for available course 1.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
    },
    {
        id: 6,
        title: 'Available Course Title 2',
        description: 'Short description for available course 2.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
    },
    {
        id: 7,
        title: 'Available Course Title 3',
        description: 'Short description for available course 3.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
    },
    {
        id: 8,
        title: 'Available Course Title 4',
        description: 'Short description for available course 4.',
        thumbnail: 'https://img.youtube.com/vi/toSAAgLUHuk/hqdefault.jpg',
    },
];

function Courses() {
    const [timeRemaining, setTimeRemaining] = useState(enrolledCourses.map(() => 0));
    const [enrolledStatus, setEnrolledStatus] = useState(availableCourses.map(() => false));
    const [api, contextHolder] = notification.useNotification();

    useEffect(() => {
        const intervals = enrolledCourses.map((course, index) => {
            return setInterval(() => {
                const now = new Date();
                const remainingTime = Math.max(0, course.deadline - now);
                setTimeRemaining((prev) => {
                    const newRemaining = [...prev];
                    newRemaining[index] = Math.floor(remainingTime / 1000);
                    return newRemaining;
                });
            }, 1000);
        });

        return () => intervals.forEach((interval) => clearInterval(interval));
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}m ${secs}s`;
    };

    const openNotification = (index) => {
        let countdown = 10; // 10 seconds countdown
        let pause = false;

        const timer = setInterval(() => {
            if (!pause) {
                countdown -= 1;
                if (countdown <= 0) {
                    clearInterval(timer);
                    api.close(`enroll_${index}`);
                } else {
                    api.open({
                        key: `enroll_${index}`,
                        message: 'Enrolled Successfully',
                        description: `You have enrolled in ${availableCourses[index].title}. Go watch it now!`,
                        duration: 0, // To prevent auto-close
                        progress: <Progress percent={100 - (countdown * 10)} showInfo={false} />,
                        onMouseEnter: () => { pause = true; },  // Pause when hovering
                        onMouseLeave: () => { pause = false; }, // Resume when hovering ends
                    });
                }
            }
        }, 1000);

        api.open({
            key: `enroll_${index}`,
            message: 'Enrolled Successfully',
            description: `You have enrolled in ${availableCourses[index].title}. Go watch it now!`,
            duration: 0,
            closeIcon: <Progress percent={100} showInfo={false} />,
            onMouseEnter: () => { pause = true; },  // Pause when hovering
            onMouseLeave: () => { pause = false; }, // Resume countdown when hovering ends
        });
    };

    const handleEnroll = (index) => {
        setEnrolledStatus((prev) => {
            const newStatus = [...prev];
            newStatus[index] = true;
            return newStatus;
        });
        openNotification(index);
    };

    return (
        <Layout>
            {contextHolder}
            <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#001529", padding: "0 20px" }}>
                <Space size={20}>
                    <Link to="/courses">
                        <Button type="primary">Courses</Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button type="primary">Dashboard</Button>
                    </Link>
                    <Link to="/discussion">
                        <Button type="primary">Discussion</Button>
                    </Link>
                </Space>

                <div style={{ display: "flex", alignItems: "center", color: 'white' }}>
                    <Avatar size={40} src="https://i.pravatar.cc/300" />
                </div>
            </Header>

            <Content style={{ padding: "20px" }}>
                <Typography.Title level={2}>Enrolled Courses</Typography.Title>
                <Space size={40} wrap>
                    {enrolledCourses.map((course, index) => (
                        <Card
                            key={course.id}
                            hoverable
                            style={{ width: 300, margin: '10px', textAlign: 'center' }} // Increase card size and add margin
                            cover={<img alt="thumbnail" src={course.thumbnail} style={{ height: '180px', objectFit: 'cover' }} />}
                            actions={[<Button type="primary"><a href={course.videoUrl} target="_blank" rel="noopener noreferrer">Continue Course</a></Button>]}>
                            <Card.Meta title={course.title} description={course.description} />
                            <Space style={{ marginTop: 10 }}>
                                <ClockCircleOutlined />
                                <Typography.Text>{formatTime(timeRemaining[index])}</Typography.Text>
                            </Space>
                        </Card>
                    ))}
                </Space>

                <Typography.Title level={2} style={{ marginTop: '40px' }}>Available Courses</Typography.Title>
                <Space size={40} wrap>
                    {availableCourses.map((course, index) => (
                        <Card
                            key={course.id}
                            hoverable
                            style={{ width: 300, margin: '10px', textAlign: 'center' }} // Increase card size and add margin
                            cover={<img alt="thumbnail" src={course.thumbnail} style={{ height: '180px', objectFit: 'cover' }} />}
                            actions={[
                                <Button type="primary" onClick={() => handleEnroll(index)} disabled={enrolledStatus[index]}>
                                    {enrolledStatus[index] ? 'Enrolled' : 'Enroll'}
                                </Button>
                            ]}>
                            <Card.Meta title={course.title} description={course.description} />
                        </Card>
                    ))}
                </Space>
            </Content>
        </Layout>
    );
}

export default Courses;
