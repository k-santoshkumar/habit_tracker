import { useState, useEffect } from 'react';
import * as api from '../api/diet';

export function useDiet(date) {
    const [slots, setSlots] = useState([]);
    const [mealLogs, setMealLogs] = useState({});
    const [waterLog, setWaterLog] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [slotsRes, logsRes] = await Promise.all([
                api.getDietSlots(),
                api.getDietLogs(date)
            ]);
            if (slotsRes.data.success) {
                setSlots(slotsRes.data.data);
            }
            if (logsRes.data.success) {
                const logs = logsRes.data.data;
                const mLogs = {};
                logs.meals.forEach(m => mLogs[m.meal_slot_id] = { checked: m.checked, proof_image: m.proof_image });
                setMealLogs(mLogs);
                setWaterLog(logs.water ? logs.water.amount_ml : 0);
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

    const logMeal = async (slotId, checked, proof_image = null) => {
        setMealLogs(prev => ({ ...prev, [slotId]: { checked, proof_image } }));
        await api.logDietMeal({ date, meal_slot_id: slotId, checked, proof_image });
    };

    const addWater = async (amount) => {
        const newTotal = waterLog + amount;
        setWaterLog(newTotal);
        await api.logDietWater({ date, amount_ml: newTotal });
    };

    const addSlot = async (data) => {
        const res = await api.createDietSlot(data);
        if (res.data.success) {
            setSlots([...slots, res.data.data]);
        }
    };

    return { slots, mealLogs, waterLog, loading, logMeal, addWater, addSlot, refetch: fetchData };
}
