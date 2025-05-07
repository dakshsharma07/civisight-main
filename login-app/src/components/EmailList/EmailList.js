import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import './EmailList.css';

const EmailList = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError('');

      // Create a query to get all users sorted by email
      const q = query(collection(db, 'users'), orderBy('email'));
      const querySnapshot = await getDocs(q);

      // Extract emails from the documents
      const emailsList = querySnapshot.docs.map(doc => doc.data().email);
      setEmails(emailsList);
    } catch (err) {
      console.error('Error fetching emails:', err);
      setError('Failed to fetch emails. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="email-list-container">
      <h2>Registered Emails</h2>
      
      {loading && (
        <div>Loading emails...</div>
      )}

      {error && (
        <div className="error-message">{error}</div>
      )}

      {!loading && !error && (
        <div className="emails-list">
          {emails.length === 0 ? (
            <div>No emails found</div>
          ) : (
            <ul>
              {emails.map((email, index) => (
                <li key={index}>{email}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button onClick={fetchEmails} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh List'}
      </button>
    </div>
  );
};

export default EmailList;
