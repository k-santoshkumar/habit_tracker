import { useState, useEffect } from 'react';
import * as api from '../api/study';

export function useStudy() {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.getStudyTracks();
            if (res.data.success) {
                setTracks(res.data.data);
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

    const addTrack = async (data) => {
        const res = await api.createStudyTrack(data);
        if (res.data.success) {
            setTracks([...tracks, res.data.data]);
        }
    };

    const addTopic = async (data) => {
        const res = await api.createStudyTopic(data);
        if (res.data.success) {
            fetchData();
        }
    };

    const setTopicStatus = async (topicId, status) => {
        const res = await api.updateTopicStatus(topicId, status);
        if (res.data.success) {
            fetchData();
        }
    };

    return { tracks, loading, addTrack, addTopic, setTopicStatus, refetch: fetchData };
}
