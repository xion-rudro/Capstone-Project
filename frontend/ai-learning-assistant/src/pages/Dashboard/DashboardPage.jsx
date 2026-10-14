import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
 
  const [loading, setLoading] = useState(true);
  
  const titleName = user?.username?.split(' ')[0] || 'there';
  return <div>
    <div className="welcome-row"><div><span className="eyebrow">Your learning, in one place</span><h1>Good to see you, {titleName}.</h1><p>Your study space is ready whenever you are.</p></div></div>
   
  </div>;
}
