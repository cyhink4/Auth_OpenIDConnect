import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, checkAuthentication } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // const fetchUsers = useCallback(async () => {
  //   try {
  //     setIsLoading(true);
  //     const data = await getAllUsers();
  //     if (Array.isArray(data)) {
  //       setUsers(data);
  //       setError('');
  //     }
  //   } catch (err) {
  //     console.error('Error fetching users:', err);
  //     if (err.response?.status === 401 || err.response?.status === 403) {
  //       const isValid = await checkAuthentication();
  //       if (isValid) {

  //         const retryData = await getAllUsers();
  //         if (Array.isArray(retryData)) {
  //           setUsers(retryData);
  //           setError('');
  //           return;
  //         }
  //       }
  //       navigate('/login');
  //     }
  //     setError('Failed to fetch users');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, [checkAuthentication, navigate]);

  useEffect(() => {
    const initData = async () => {
      try {
        const [isValid, usersData] = await Promise.all([checkAuthentication(), getAllUsers()]);
        if (!isValid) {
          navigate('/login');
          return;
        }
        if (Array.isArray(usersData)) {
          setUsers(usersData);
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message || 'Error initializing data');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [checkAuthentication, navigate]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="home">
      <div className="users-list">
        {users && users.length > 0 ? (
          users.map((value) => (
            <div key={value._id} className="user-card">
              <h3>{value.name}</h3>
              <p>{value.email}</p>
            </div>
          ))
        ) : (
          <div className="no-users">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;