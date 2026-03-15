import { useState, useEffect } from 'react';
import * as api from '../api/health';

export function useHealth() {
    const [metrics, setMetrics] = useState([]);
    const [entries, setEntries] = useState({});
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.getHealthMetrics();
            if (res.data.success) {
                const fetchedMetrics = res.data.data;
                setMetrics(fetchedMetrics);
                
                // Fetch entries for all metrics
                const entryData = {};
                for (const m of fetchedMetrics) {
                    const eRes = await api.getMetricEntries(m.id);
                    if (eRes.data.success) {
                        entryData[m.id] = eRes.data.data;
                    }
                }
                setEntries(entryData);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addMetric = async (data) => {
        const res = await api.createHealthMetric(data);
        if (res.data.success) {
            fetchData();
        }
    };

    const logEntry = async (data) => {
        const res = await api.addMetricEntry(data);
        if (res.data.success) {
            fetchData();
        }
    };

    return { metrics, entries, loading, addMetric, logEntry, refetch: fetchData };
}
