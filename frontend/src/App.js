import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled, { createGlobalStyle } from 'styled-components';

// Global Styles
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body {
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }

  a {
    text-decoration: none;
    color: inherit;
  }
`;

// Styled Components
const AppHeader = styled.header`
  background-color: #4a90e2;
  color: white;
  padding: 20px 0;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const AppTitle = styled.h1`
  font-size: 28px;
  margin: 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const AuthContainer = styled.div`
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: left;
`;

const Input = styled.input`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;
  transition: border 0.3s;

  &:focus {
    outline: none;
    border-color: #4a90e2;
  }
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: ${props => props.primary ? '#4a90e2' : '#f5f5f5'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
  margin: ${props => props.margin || '0'};

  &:hover {
    background-color: ${props => props.primary ? '#357bd8' : '#e0e0e0'};
  }

  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const UserHeader = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  margin-bottom: 30px;
  border-bottom: 1px solid #eee;
`;

const UserTitle = styled.h2`
  color: #4a90e2;
  font-size: 24px;
`;

const Section = styled.section`
  background: white;
  padding: 25px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
`;

const PostList = styled.ul`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const PostCard = styled.li`
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const PostTitle = styled.h3`
  color: #4a90e2;
  margin-bottom: 10px;
`;

const PostDescription = styled.p`
  margin-bottom: 15px;
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
`;

const FileIcon = styled.span`
  color: #4a90e2;
`;

const PostActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const FileName = styled.span`
  word-break: break-all;
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
  margin-top: 15px;

  &:hover {
    text-decoration: underline;
  }
`;

const Loading = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

// App Component
function App() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null,
    originalFilename: ''
  });
  const [authData, setAuthData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [isLogin, setIsLogin] = useState(true);
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = 'http://13.201.11.52:5000';

  // Set up axios defaults
  axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Check if user is logged in on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoading(true);
      axios.get(`${API_URL}/posts`)
        .then(res => {
          setPosts(res.data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, []);

  const handleAuthChange = e => {
    setAuthData({
      ...authData,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const { data } = await axios.post(`${API_URL}${endpoint}`, authData);
      
      if (isLogin) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        const postsRes = await axios.get(`${API_URL}/posts`);
        setPosts(postsRes.data);
      } else {
        setIsLogin(true);
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setPosts([]);
  };

  const handleInputChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = e => {
    setFormData({
      ...formData,
      file: e.target.files[0],
      originalFilename: e.target.files[0]?.name || ''
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('originalFilename', formData.originalFilename);
      if (formData.file) {
        formDataToSend.append('file', formData.file);
      }

      if (editingPost) {
        const { data } = await axios.put(
          `${API_URL}/posts/${editingPost.id}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setPosts(posts.map(post => post.id === data.id ? data : post));
      } else {
        const { data } = await axios.post(
          `${API_URL}/posts`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        setPosts([...posts, data]);
      }

      setFormData({ title: '', content: '', file: null, originalFilename: '' });
      setEditingPost(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = post => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      file: null,
      originalFilename: post.original_filename || ''
    });
  };

  const handleDelete = async id => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_URL}/posts/${id}`);
        setPosts(posts.filter(post => post.id !== id));
      } catch (err) {
        alert(err.response?.data?.error || 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <>
        <GlobalStyle />
        <AppHeader>
          <Container>
            <AppTitle>Umair's Post App</AppTitle>
          </Container>
        </AppHeader>
        <AuthContainer>
          <h2>{isLogin ? 'Welcome Back!' : 'Create an Account'}</h2>
          <Form onSubmit={handleAuthSubmit}>
            {!isLogin && (
              <FormGroup>
                <label>Username</label>
                <Input
                  type="text"
                  name="username"
                  value={authData.username}
                  onChange={handleAuthChange}
                  required
                  placeholder="Enter your username"
                />
              </FormGroup>
            )}
            <FormGroup>
              <label>Email</label>
              <Input
                type="email"
                name="email"
                value={authData.email}
                onChange={handleAuthChange}
                required
                placeholder="Enter your email"
              />
            </FormGroup>
            <FormGroup>
              <label>Password</label>
              <Input
                type="password"
                name="password"
                value={authData.password}
                onChange={handleAuthChange}
                required
                placeholder="Enter your password"
              />
            </FormGroup>
            <Button primary type="submit" disabled={isLoading}>
              {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
            </Button>
          </Form>
          <ToggleButton onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need to register? Create an account' : 'Already have an account? Login'}
          </ToggleButton>
        </AuthContainer>
      </>
    );
  }

  return (
    <>
      <GlobalStyle />
      <AppHeader>
        <Container>
          <AppTitle>Umair's Post App</AppTitle>
        </Container>
      </AppHeader>
      <Container>
        <UserHeader>
          <UserTitle>Welcome, {user.username}</UserTitle>
          <Button onClick={handleLogout}>Logout</Button>
        </UserHeader>

        <Section>
          <h2>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <label>Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="Enter post title"
              />
            </FormGroup>
            <FormGroup>
              <label>Description</label>
              <TextArea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                placeholder="Write your post description here..."
              />
            </FormGroup>
            <FormGroup>
              <label>File Upload (Image or PDF)</label>
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
              />
            </FormGroup>
            <FormGroup>
              <label>File Name</label>
              <Input
                type="text"
                name="originalFilename"
                value={formData.originalFilename}
                onChange={handleInputChange}
                placeholder="Enter a name for your file"
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button primary type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : editingPost ? 'Update Post' : 'Create Post'}
              </Button>
              {editingPost && (
                <Button type="button" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
              )}
            </div>
          </Form>
        </Section>

        <Section>
          <h2>Your Posts</h2>
          {isLoading ? (
            <Loading>Loading posts...</Loading>
          ) : posts.length === 0 ? (
            <p>No posts yet. Create your first post!</p>
          ) : (
            <PostList>
              {posts.map(post => (
                <PostCard key={post.id}>
                  <PostTitle>{post.title}</PostTitle>
                  <PostDescription>{post.content}</PostDescription>
                  {post.original_filename && (
                    <FileInfo>
                      <FileIcon>
                        {post.file_type === 'pdf' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </FileIcon>
                      <FileName>{post.original_filename}</FileName>
                    </FileInfo>
                  )}
                  <PostActions>
                    <Button onClick={() => handleEdit(post)}>Edit</Button>
                    <Button onClick={() => handleDelete(post.id)}>Delete</Button>
                  </PostActions>
                </PostCard>
              ))}
            </PostList>
          )}
        </Section>
      </Container>
    </>
  );
}

export default App;