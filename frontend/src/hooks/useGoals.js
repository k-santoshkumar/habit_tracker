import { useState, useEffect } from 'react';
import * as api from '../api/goals';

export function useGoals() {
    const [goals, setGoals] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [goalsRes, catsRes] = await Promise.all([
                api.getGoals(),
                api.getGoalCategories()
            ]);
            
            if (goalsRes.data.success) {
                setGoals(goalsRes.data.data);
            }
            if (catsRes.data.success) {
                setCategories(catsRes.data.data);
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

    const addGoal = async (data) => {
        await api.createGoal(data);
        fetchData();
    };

    const deleteGoal = async (id) => {
        await api.deleteGoal(id);
        fetchData();
    };

    const updateProgress = async (id, value) => {
        await api.updateGoalProgress(id, value);
        fetchData();
    };

    const toggleMilestone = async (msId) => {
        await api.toggleMilestone(msId);
        fetchData();
    };

    const addMilestone = async (goalId, title) => {
        await api.addMilestone(goalId, title);
        fetchData();
    };

    return { 
        goals, 
        categories, 
        loading, 
        addGoal, 
        deleteGoal, 
        updateProgress, 
        toggleMilestone, 
        addMilestone,
        refetch: fetchData 
    };
}
