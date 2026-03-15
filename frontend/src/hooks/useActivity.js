import { useState, useEffect } from 'react';
import * as api from '../api/activity';

export function useActivity(date) {
    const [types, setTypes] = useState([]);
    const [logs, setLogs] = useState({});
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [typesRes, logsRes, suggRes] = await Promise.all([
                api.getActivityTypes(),
                api.getActivityLogs(date),
                api.getActivitySuggestions()
            ]);
            
            if (typesRes.data.success) {
                setTypes(typesRes.data.data);
            }
            if (logsRes.data.success) {
                const logData = {};
                logsRes.data.data.forEach(l => {
                    logData[l.activity_type_id] = l;
                });
                setLogs(logData);
            }
            if (suggRes.data.success) {
                setSuggestions(suggRes.data.data);
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

    const addType = async (data) => {
        const res = await api.createActivityType(data);
        if (res.data.success) {
            setTypes([...types, res.data.data]);
        }
    };

    const toggleActivity = async (typeId, currentLog) => {
        const payload = {
            date,
            activity_type_id: typeId,
            done: currentLog ? !currentLog.done : true
        };
        const res = await api.logActivity(payload);
        if (res.data.success) {
            fetchData();
        }
    };

    const deleteType = async (id) => {
        const res = await api.deleteActivityType(id);
        if (res.data.success) {
            setTypes(types.filter(t => t.id !== id));
        }
    };

    return { types, logs, suggestions, loading, addType, toggleActivity, deleteType, refetch: fetchData };
}
