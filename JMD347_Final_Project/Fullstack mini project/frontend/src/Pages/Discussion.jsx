import React, { useEffect, useState } from 'react';
import { Layout, Card, List, Avatar, Input, Button, Typography, Space, Upload, Tooltip, message } from 'antd';
import { Link } from 'react-router-dom';
import { DeleteOutlined, BoldOutlined, ItalicOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import axios from 'axios'
import { useSelector } from 'react-redux';
const { Header, Content, Sider } = Layout;
const { TextArea } = Input;

function Discussion() {

    const user = useSelector((state) => state.user.user);


    const [discussionMessages, setDiscussionMessages] = useState([]);
    const [message, setMessage] = useState("");


    const [uploadedImage, setUploadedImage] = useState(null); // State for the uploaded image
    const [timeSpent, setTimeSpent] = useState(0);



    const getData = async () => {
        const res = await axios.get(`http://localhost:5000/api/users/getDiscussionMessages`);
        console.log(res.data);
        setDiscussionMessages(res.data.messages);
    }


    useEffect(() => {
        getData();
    }, [])







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

    const handleDeleteMessage = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/users/deleteDiscussionMessage/${id}`);


            if (response.data.success) {
                await getData()
            }
        } catch (error) {
            console.error("Error deleting message:", error);
        }
    };

    const formatMessage = (format) => {
        let formattedText = message;
        switch (format) {
            case 'bold':
                formattedText = `<b>${message}</b>`;
                break;
            case 'italic':
                formattedText = `<i>${message}</i>`;
                break;
            case 'link':
                const link = prompt("Enter a URL");
                if (link) {
                    formattedText = `${message} <a href="${link}" target="_blank">${link}</a>`;
                }
                break;
            default:
                break;
        }
        setMessage(formattedText); // Update the message with formatting
    };

    // Handle image upload
    const handleUpload = (file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result); // Save the uploaded image as a data URL
            message.success('Image uploaded successfully! You can write about it before posting.');
        };
        reader.readAsDataURL(file); // Read the file as a data URL
        return false; // Prevent default upload behavior
    };

    return (
        <Layout>
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
                    <Typography.Text style={{ fontSize: 16, marginLeft: 10, color: 'white' }}>{user.name}</Typography.Text>
                </div>
            </Header>

            <Layout>
                <Content style={{ padding: "20px", width: '100%' }}>
                    <Typography.Title level={1}>Discussion Forum</Typography.Title>
                    <Space size={20} direction="vertical" style={{ width: "100%" }}>
                        <Card style={{ width: "100%" }}>
                            <Space style={{ marginBottom: 10 }}>
                                <Tooltip title="Bold">
                                    <Button icon={<BoldOutlined />} size="small" onClick={() => formatMessage('bold')} />
                                </Tooltip>
                                <Tooltip title="Italic">
                                    <Button icon={<ItalicOutlined />} size="small" onClick={() => formatMessage('italic')} />
                                </Tooltip>
                                <Tooltip title="Link">
                                    <Button icon={<LinkOutlined />} size="small" onClick={() => formatMessage('link')} />
                                </Tooltip>
                                <Upload showUploadList={false} accept="image/*" beforeUpload={handleUpload}>
                                    <Button icon={<PictureOutlined />} size="small">Upload Image</Button>
                                </Upload>
                            </Space>
                            <TextArea
                                rows={4}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write about your image or message..."
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
                                renderItem={(item, index) => (
                                    <List.Item
                                        actions={
                                            item.userId && user._id === item.userId._id
                                            ? [<DeleteOutlined key="delete" onClick={() => handleDeleteMessage(item._id)} />]
                                            : []
                                        }
                                    >
                                        <List.Item.Meta
                                            avatar={<Avatar src="https://i.pravatar.cc/150?img=2" />}
                                            title={`${item.userId.username} - ${item.createdAt}`}
                                            description={
                                                <div>
                                                    <span dangerouslySetInnerHTML={{ __html: item.message }} />
                                                    {item.image && <img src={item.image} alt="uploaded" style={{ maxWidth: '100%', marginTop: 10 }} />} {/* Display the image if present */}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>
                    </Space>
                </Content>

                {/* Sider can remain empty or you can include additional content */}
                <Sider width={380} style={{ background: "#fff", padding: "20px" }}>
                    {/* You can add any additional components or content here */}
                </Sider>
            </Layout>
        </Layout>
    );
}

export default Discussion;
