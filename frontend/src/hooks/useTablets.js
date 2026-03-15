import { useState, useEffect } from 'react';
import * as api from '../api/tablets';

export function useTablets(date) {
    const [tablets, setTablets] = useState([]);
    const [logs, setLogs] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [tabsRes, logsRes] = await Promise.all([
                api.getTablets(),
                api.getTabletLogs(date)
            ]);
            if (tabsRes.data.success) {
                setTablets(tabsRes.data.data);
            }
            if (logsRes.data.success) {
                const logMap = {};
                logsRes.data.data.forEach(l => {
                    logMap[l.tablet_id] = l.status;
                });
                setLogs(logMap);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [date]);

    const logTablet = async (tabletId, status) => {
        try {
            // Optimistic update
            setLogs(prev => ({ ...prev, [tabletId]: status }));
            await api.logTablet({ date, tablet_id: tabletId, status });
        } catch (e) {
            console.error(e);
            fetchData(); // Rollback
        }
    };

    const addTablet = async (data) => {
        try {
            const res = await api.createTablet(data);
            if (res.data.success) {
                setTablets(prev => [...prev, res.data.data]);
            }
        } catch(e) {
            console.error(e);
        }
    };

    return { tablets, logs, loading, logTablet, addTablet, refetch: fetchData };
}
