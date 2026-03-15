import { useState, useEffect } from 'react';
import * as api from '../api/health';

export function useHealth() {
    const [metrics, setMetrics] = useState([]);
    const [entries, setEntries] = useState({});
    const [presets, setPresets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [metricsRes, entriesRes, presetsRes] = await Promise.all([
                api.getHealthMetrics(),
                api.getMetricEntries(),
                api.getHealthPresets()
            ]);
            
            if (metricsRes.data.success) {
                setMetrics(metricsRes.data.data);
            }
            
            if (entriesRes.data.success) {
                const allEntries = entriesRes.data.data;
                const entryMap = {};
                allEntries.forEach(e => {
                    if (!entryMap[e.metric_id]) entryMap[e.metric_id] = [];
                    entryMap[e.metric_id].push(e);
                });
                setEntries(entryMap);
            }
            
            if (presetsRes.data.success) {
                setPresets(presetsRes.data.data);
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

    return { 
        metrics, 
        entries, 
        presets, 
        loading, 
        addMetric, 
        logEntry, 
        refetch: fetchData 
    };
}
