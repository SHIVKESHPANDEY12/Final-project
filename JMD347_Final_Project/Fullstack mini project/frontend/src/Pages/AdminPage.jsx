import React, { useState, useEffect } from 'react';
import { Input, Select, Row, Col, Card, Table, Typography, Button, Modal, notification, List, Avatar } from 'antd'; // Import notification
import { SearchOutlined } from '@ant-design/icons';
import { fetchEmployees, fetchStatistics, fetchTopPerformers, fetchDiscussions } from './api';

import axios from '../config/axiosConfig'

const { Title } = Typography;
const { Option } = Select;

const AdminPage = () => {
  const [employees, setEmployees] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [stats, setStats] = useState({});
  const [discussions, setDiscussions] = useState([]);
  const [department, setDepartment] = useState(undefined);
  const [team, setTeam] = useState(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // States for Create User section
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // States for modal
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');

  // States for Create Team modal
  const [isCreateTeamModalVisible, setIsCreateTeamModalVisible] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDepartment, setNewTeamDepartment] = useState(undefined);

  const fetchDepartments = async () => {
    const response = await fetch('http://localhost:5000/api/departments');
    const data = await response.json();
    if (data.success) {

      setDepartments(data.departments);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const employeeData = await fetchEmployees(department, team);
      console.log(employeeData);

      const statistics = await fetchStatistics();
      const performers = await fetchTopPerformers();
      const discussionMessages = await fetchDiscussions();
      setEmployees(employeeData);
      setStats(statistics);
      setTopPerformers(performers);
      setDiscussions(discussionMessages);
    };
    fetchData();
  }, [department, team]);




  const [departments, setDepartments] = useState([]);
  useEffect(() => {

    fetchDepartments();
  }, []);

  const [newUserDepartment, setNewUserDepartment] = useState(null);
  const [newUserTeam, setNewUserTeam] = useState(null);
  const [teams, setTeams] = useState([]);

  // Handle department change
  const handleDepartmentChange = (value) => {
    setNewUserDepartment(value);

    // Find the selected department and set its teams
    const selectedDepartment = departments.find(dep => dep._id === value);
    if (selectedDepartment) {
      setTeams(selectedDepartment.teams); // Update teams based on selected department
      setNewUserTeam(null); // Reset team selection
    }
  };




  const columns = [
    { title: 'Employee ID', dataIndex: 'id', key: 'id' },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Department', dataIndex: 'department.name', key: 'department' }, // Accessing nested name
    { title: 'Team', dataIndex: 'team.name', key: 'team' }, // Accessing nested name
    { title: 'Courses Completed', dataIndex: 'coursesCompleted', key: 'coursesCompleted' },
    { title: 'Total Time (hours)', dataIndex: 'totalTime', key: 'totalTime' },
    { title: 'Avg Quiz Score', dataIndex: 'averageQuizScore', key: 'averageQuizScore' },
  ];


  const EmployeeTable = ({ filteredEmployees }) => {
    // Transform the data to match the table structure
    const formattedData = filteredEmployees.map((employee, index) => ({
      id: index + 1, // Using index + 1 for Employee ID
      name: employee.name,
      department: employee.department.name, // Accessing the nested department name
      team: employee.team.name, // Accessing the nested team name
      coursesCompleted: employee.coursesCompleted,
      totalTime: employee.totalTime,
      averageQuizScore: employee.averageQuizScore,
    }));

    const columns = [
      { title: 'Employee ID', dataIndex: 'id', key: 'id' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Department', dataIndex: 'department', key: 'department' },
      { title: 'Team', dataIndex: 'team', key: 'team' },
      { title: 'Courses Completed', dataIndex: 'coursesCompleted', key: 'coursesCompleted' },
      { title: 'Total Time (hours)', dataIndex: 'totalTime', key: 'totalTime' },
      { title: 'Avg Quiz Score', dataIndex: 'averageQuizScore', key: 'averageQuizScore' },
    ];

    return (
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Table dataSource={formattedData} columns={columns} rowKey="id" />
        </Col>
      </Row>
    );
  };




  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateUser = async () => {
    // Validate input fields
    if (!username || !email || !password || !newUserTeam || !newUserDepartment) {
      notification.error({
        message: 'Error',
        description: 'All fields are required.',
        placement: 'topRight',
      });
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/create', {
        username,
        email,
        password,
        team: newUserTeam,
        department: newUserDepartment,
      });

      if (response.data.success) {
        console.log({ username, email, password, newUserTeam, newUserDepartment });

        // Show notification after user creation
        notification.success({
          message: 'User Created Successfully',
          description: `The user ${username} has been created successfully.`,
          placement: 'topRight', // You can change this to 'bottomLeft', 'bottomRight', etc.
        });

        // Reset fields after user creation
        setUsername('');
        setEmail('');
        setPassword('');
        setNewUserTeam(undefined);
        setNewUserDepartment(undefined);
      } else {
        notification.error({
          message: 'Error',
          description: response.data.message || 'Failed to create user.',
          placement: 'topRight',
        });
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to create user. Please try again.',
        placement: 'topRight',
      });
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    if (!newDepartmentName) {
      alert("Department name is required");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/departments/createDepartment', { name: newDepartmentName });

      if (response.data.success) {
        await fetchDepartments()
        console.log('New Department:', newDepartmentName);
        setNewDepartmentName(''); // Reset input
        setIsModalVisible(false); // Close modal
      } else {
        console.error('Error creating department:', response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Failed to create department:', error);
      alert("Failed to create department. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showCreateTeamModal = () => {
    setIsCreateTeamModalVisible(true);
  };

  const handleCreateTeamOk = async () => {
    if (!newTeamName || !newTeamDepartment) {
      alert("Both Team Name and Department are required");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:5000/api/departments/${newTeamDepartment}/createTeam`, {
        name: newTeamName,
      });

      console.log(response);


      if (response.data.success) {
        await fetchDepartments()
        setNewTeamName(''); // Reset input
        setNewTeamDepartment(undefined); // Reset department selection
        setIsCreateTeamModalVisible(false); // Close modal
      } else {
        console.error('Error creating team:', response.data.message);
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Failed to create team:', error);
      alert("Failed to create team. Please try again.");
    }
  };

  const handleCreateTeamCancel = () => {
    setIsCreateTeamModalVisible(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Admin Dashboard</Title>

      {/* Create User Section */}
      <div style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9f9f9' }}>
        <Title level={4}>Create New User</Title>
        <Row gutter={[30, 16]} align="middle">
          <Col span={4}>
            <Input
              style={{ width: '100%', height: '50px' }} // Equal height and width
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Input
              style={{ width: '100%', height: '50px' }} // Equal height and width
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Input.Password
              style={{ width: '100%', height: '50px' }} // Equal height and width
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Department"
              style={{ width: '100%', height: '50px' }} // Equal height and width
              value={newUserDepartment}
              onChange={handleDepartmentChange} // Update to handle department change
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Button type="link" onClick={showModal}>
                    Create New Department
                  </Button>
                </>
              )}
            >
              {departments.map(dep => (
                <Option key={dep._id} value={dep._id}>{dep.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Team"
              style={{ width: '100%', height: '50px' }} // Equal height and width
              value={newUserTeam}
              onChange={(value) => setNewUserTeam(value)} // Handle team change
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <Button type="link" onClick={showCreateTeamModal}>
                    Create New Team
                  </Button>
                </>
              )}
            >
              {/* Map teams based on the selected department */}
              {teams.map(team => (
                <Option key={team._id} value={team._id}>{team.name}</Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={handleCreateUser}>
              Create User
            </Button>
          </Col>
        </Row>
      </div>

      {/* Search and Filter Section */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search Employee"
            value={searchTerm}
            onChange={handleSearch}
            style={{ height: '50px' }} // Equal height
          />
        </Col>
        <Col span={12}>
          <Select
            placeholder="Select Department"
            style={{ width: '100%', height: '40px' }} // Equal height
            onChange={(value) => {
              setDepartment(value);
              const selectedDepartment = departments.find(dep => dep._id === value);
              if (selectedDepartment) {
                setTeams(selectedDepartment.teams); // Update teams based on selected department
                setNewUserTeam(null); // Reset team selection
              }
            }}
            value={department}
          >
            {departments.map(dep => (
              <Option key={dep._id} value={dep._id}>{dep.name}</Option>
            ))}
          </Select>
        </Col>
        <Col span={12}>
          <Select
            placeholder="Select Team"
            style={{ width: '100%', height: '40px' }} // Equal height
            onChange={(value) => setTeam(value)}
            value={team}
          >
            {teams.map(team => (
              <Option key={team._id} value={team._id}>{team.name}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Statistics Section */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={6}>
          <Card>
            <Title level={4}>Total Employees</Title>
            <p>{stats.totalEmployees}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4}>Total Hours Spent</Title>
            <p>{stats.totalTime}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4}>Total Courses</Title>
            <p>{stats.coursesCompleted}</p>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Title level={4}>Average Quiz Score</Title>
            <p>{stats.averageQuizScore}</p>
          </Card>
        </Col>
      </Row>

      {/* Top Performers Section */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Top Performers</Title>
            <Table dataSource={topPerformers} columns={[{ title: 'Name', dataIndex: 'name' }, { title: 'Score', dataIndex: 'totalScore' }]} />
          </Card>
        </Col>
      </Row>

      {/* Employee List Section */}
      {/* <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Table dataSource={filteredEmployees} columns={columns} />
        </Col>
      </Row> */}
      <EmployeeTable filteredEmployees={filteredEmployees} />

      {/* Discussions Section */}
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col span={24}>
          <Card>
            <Title level={4}>Discussions</Title>
            <List
              style={{ marginTop: 20 }}
              bordered
              dataSource={discussions}
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

        </Col>
      </Row>

      {/* Modal for New Department */}
      <Modal title="Create New Department" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Input placeholder="Department Name" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} />
      </Modal>

      {/* Modal for Create New Team */}
      <Modal
        title="Create New Team"
        visible={isCreateTeamModalVisible}
        onOk={handleCreateTeamOk}
        onCancel={handleCreateTeamCancel}
      >
        <Input
          placeholder="Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
        />
        <Select
          placeholder="Department"
          style={{ width: '100%', marginTop: '10px' }}
          value={newTeamDepartment}
          onChange={(value) => setNewTeamDepartment(value)}
        >
          {departments.map(dep => (
            <Option key={dep._id} value={dep._id}>{dep.name}</Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default AdminPage;
