// Debug session and token information
import { useSession } from 'next-auth/react';

export default function DebugSession() {
    const { data: session, status } = useSession();

    console.log('Session status:', status);
    console.log('Session data:', session);

    if (status === 'loading') {
        return <div>Loading session...</div>;
    }

    if (!session) {
        return <div>No session found</div>;
    }

    return (
        <div className="p-4 bg-gray-100 rounded-lg">
            <h3 className="font-bold mb-2">Session Debug Info</h3>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User ID:</strong> {session.user?.id}</p>
            <p><strong>Email:</strong> {session.user?.email}</p>
            <p><strong>Role:</strong> {session.user?.role}</p>
            <p><strong>Access Token:</strong> {session.user?.accessToken ? 'Present' : 'Missing'}</p>
            <p><strong>Token Preview:</strong> {session.user?.accessToken?.substring(0, 20)}...</p>
        </div>
    );
}
