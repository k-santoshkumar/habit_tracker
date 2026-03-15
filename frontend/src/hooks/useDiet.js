import { useState, useEffect } from 'react';
import * as api from '../api/diet';

export function useDiet(date) {
    const [slots, setSlots] = useState([]);
    const [mealLogs, setMealLogs] = useState({});
    const [waterLog, setWaterLog] = useState(0);
    const [categories, setCategories] = useState([]);
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [slotsRes, logsRes, catsRes, foodRes] = await Promise.all([
                api.getDietSlots(),
                api.getDietLogs(date),
                api.getDietCategories(),
                api.getFoodItems()
            ]);
            
            if (slotsRes.data.success) {
                setSlots(slotsRes.data.data);
            }
            if (logsRes.data.success) {
                const logs = logsRes.data.data;
                const mLogs = {};
                logs.meals.forEach(m => {
                    // Convert meal_slot_id to string for consistency if needed, 
                    // though if it was int in DB it might still be int. 
                    // With Mongo 'id' is a string.
                    mLogs[m.meal_slot_id] = { checked: m.checked, proof_image: m.proof_image };
                });
                setMealLogs(mLogs);
                setWaterLog(logs.water ? logs.water.amount_ml : 0);
            }
            if (catsRes.data.success) {
                setCategories(catsRes.data.data);
            }
            if (foodRes.data.success) {
                setFoodItems(foodRes.data.data);
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

    return { 
        slots, 
        mealLogs, 
        waterLog, 
        categories, 
        foodItems, 
        loading, 
        logMeal, 
        addWater, 
        addSlot, 
        refetch: fetchData 
    };
}
