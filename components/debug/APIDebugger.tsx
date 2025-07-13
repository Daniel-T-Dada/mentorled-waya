'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { getApiUrl, API_ENDPOINTS } from '@/lib/utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function APIDebugger() {
    const { data: session } = useSession();
    const [results, setResults] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

    const testEndpoint = async (name: string, endpoint: string, method: string = 'GET', body?: any) => {
        setLoading(prev => ({ ...prev, [name]: true }));

        try {
            const response = await fetch(getApiUrl(endpoint), {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.user?.accessToken}`,
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json();

            setResults(prev => ({
                ...prev,
                [name]: {
                    status: response.status,
                    statusText: response.statusText,
                    data: data,
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (error) {
            setResults(prev => ({
                ...prev,
                [name]: {
                    error: error instanceof Error ? error.message : 'Unknown error',
                    timestamp: new Date().toISOString()
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    const testAllInCategory = async (category: string, endpoints: any[]) => {
        for (const { name, endpoint, method } of endpoints) {
            await testEndpoint(name, endpoint, method);
            // Add a small delay between requests to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    };

    const testEndpoints = [
        {
            category: 'Authentication',
            endpoints: [
                { name: 'Health Check', endpoint: API_ENDPOINTS.HEALTH_CHECK, method: 'GET' },
            ]
        },
        {
            category: 'Children',
            endpoints: [
                { name: 'List Children', endpoint: API_ENDPOINTS.LIST_CHILDREN, method: 'GET' },
            ]
        },
        {
            category: 'Tasks & Chores',
            endpoints: [
                { name: 'List Tasks', endpoint: API_ENDPOINTS.LIST_TASKS, method: 'GET' },
                { name: 'Chore Summary', endpoint: API_ENDPOINTS.CHORE_SUMMARY, method: 'GET' },
                { name: 'Child Chores', endpoint: API_ENDPOINTS.CHILD_CHORES, method: 'GET' },
            ]
        },
        {
            category: 'Family Wallet',
            endpoints: [
                { name: 'Wallet', endpoint: API_ENDPOINTS.WALLET, method: 'GET' },
                { name: 'Wallet Dashboard Stats', endpoint: API_ENDPOINTS.WALLET_DASHBOARD_STATS, method: 'GET' },
                { name: 'Wallet Earnings Chart', endpoint: API_ENDPOINTS.WALLET_EARNINGS_CHART, method: 'GET' },
                { name: 'Wallet Savings Breakdown', endpoint: API_ENDPOINTS.WALLET_SAVINGS_BREAKDOWN, method: 'GET' },
                { name: 'Children Wallets', endpoint: API_ENDPOINTS.CHILDREN_WALLETS, method: 'GET' },
                { name: 'Children Wallets Analysis', endpoint: API_ENDPOINTS.CHILDREN_WALLETS_ANALYSIS, method: 'GET' },
            ]
        },
        {
            category: 'Transactions',
            endpoints: [
                { name: 'Transactions', endpoint: API_ENDPOINTS.TRANSACTIONS, method: 'GET' },
                { name: 'Recent Activities', endpoint: API_ENDPOINTS.TRANSACTIONS_RECENT, method: 'GET' },
            ]
        },
        {
            category: 'Allowances',
            endpoints: [
                { name: 'Allowances', endpoint: API_ENDPOINTS.ALLOWANCES, method: 'GET' },
            ]
        },
        {
            category: 'Insights',
            endpoints: [
                { name: 'Insight Dashboard', endpoint: API_ENDPOINTS.INSIGHT_CHORES, method: 'GET' },
            ]
        },
        {
            category: 'Settings',
            endpoints: [
                { name: 'User Profile', endpoint: API_ENDPOINTS.USER_PROFILE, method: 'GET' },
                { name: 'Notification Settings', endpoint: API_ENDPOINTS.NOTIFICATION_SETTINGS, method: 'GET' },
                { name: 'Reward Settings', endpoint: API_ENDPOINTS.REWARD_SETTINGS, method: 'GET' },
            ]
        },
    ];

    const clearAllResults = () => {
        setResults({});
    };

    if (!session) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>API Debugger</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Please sign in to test API endpoints</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>API Debugger</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <h3 className="font-semibold mb-2">Session Info:</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded">
                        {JSON.stringify({
                            userId: session.user?.id,
                            email: session.user?.email,
                            role: session.user?.role,
                            hasAccessToken: !!session.user?.accessToken,
                            tokenPreview: session.user?.accessToken?.substring(0, 20) + '...'
                        }, null, 2)}
                    </pre>
                </div>

                <div>
                    <h3 className="font-semibold mb-2">Test Endpoints:</h3>
                    <div className="space-y-4">
                        {testEndpoints.map(({ category, endpoints }) => (
                            <div key={category} className="border rounded p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium text-blue-600">{category}</h4>
                                    <Button
                                        onClick={() => testAllInCategory(category, endpoints)}
                                        size="sm"
                                        variant="secondary"
                                        disabled={endpoints.some(({ name }) => loading[name])}
                                    >
                                        Test All {category}
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {endpoints.map(({ name, endpoint, method }) => (
                                        <div key={name} className="flex items-center space-x-2">
                                            <Button
                                                onClick={() => testEndpoint(name, endpoint, method)}
                                                disabled={loading[name]}
                                                size="sm"
                                                variant="outline"
                                            >
                                                {loading[name] ? 'Testing...' : `Test ${name}`}
                                            </Button>
                                            <span className="text-sm text-muted-foreground">
                                                {method} {endpoint}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Results:</h3>
                        {Object.keys(results).length > 0 && (
                            <Button
                                onClick={clearAllResults}
                                size="sm"
                                variant="destructive"
                            >
                                Clear All Results
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {Object.entries(results).map(([name, result]) => (
                            <div key={name} className="border rounded p-2">
                                <h4 className="font-medium">{name}</h4>
                                <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                    {JSON.stringify(result, null, 2)}
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
