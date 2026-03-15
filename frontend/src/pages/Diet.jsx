import { useState } from 'react';
import { useDiet } from '../hooks/useDiet';
import { format } from 'date-fns';
import { Droplet, Plus, Check, Search, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useRef } from 'react';

const MEAL_CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Morning Snack', 'Afternoon Snack', 'Post-Workout'];

const FOOD_DATABASE = {
  'Breakfast': [
    { name: 'Oatmeal', protein: 6 },
    { name: 'Eggs & Toast', protein: 18 },
    { name: 'Pancakes', protein: 8 },
    { name: 'Greek Yogurt Bowl', protein: 15 },
    { name: 'Avocado Toast', protein: 7 },
    { name: 'Smoothie Bowl', protein: 12 },
    { name: 'Cereal & Milk', protein: 8 },
    { name: 'Fruit Bowl', protein: 2 },
    { name: 'Peanut Butter Toast', protein: 10 },
    { name: 'Idli Sambar', protein: 6 },
    { name: 'Poha', protein: 4 },
    { name: 'Paratha & Curd', protein: 6 },
    { name: 'Upma', protein: 5 },
    { name: 'Dosa & Chutney', protein: 4 },
  ],
  'Lunch': [
    { name: 'Chicken Breast & Rice', protein: 40 },
    { name: 'Grilled Fish & Salad', protein: 35 },
    { name: 'Lentil Stew (Dal)', protein: 18 },
    { name: 'Paneer Curry & Roti', protein: 22 },
    { name: 'Turkey Sandwich', protein: 28 },
    { name: 'Veggie Wrap', protein: 12 },
    { name: 'Quinoa Bowl', protein: 14 },
    { name: 'Pasta Primavera', protein: 15 },
    { name: 'Burrito Bowl', protein: 30 },
    { name: 'Rajma Rice', protein: 15 },
    { name: 'Chole & Rice', protein: 14 },
    { name: 'Dal & Rice', protein: 12 },
    { name: 'Chicken Biryani', protein: 20 },
    { name: 'Tofu Stir-fry & Rice', protein: 20 },
  ],
  'Dinner': [
    { name: 'Grilled Salmon', protein: 38 },
    { name: 'Steak & Potatoes', protein: 42 },
    { name: 'Chicken Tikka', protein: 35 },
    { name: 'Fish & Veggies', protein: 30 },
    { name: 'Tofu Stir-fry', protein: 20 },
    { name: 'Pasta Bolognese', protein: 15 },
    { name: 'Soup & Bread', protein: 10 },
    { name: 'Palak Paneer & Naan', protein: 18 },
    { name: 'Egg Curry & Rice', protein: 16 },
    { name: 'Grilled Chicken Salad', protein: 32 },
    { name: 'Shrimp Stir-fry', protein: 28 },
    { name: 'Daal Makhani & Roti', protein: 14 },
  ],
  'Morning Snack': [
    { name: 'Protein Bar', protein: 20 },
    { name: 'Almonds (30g)', protein: 6 },
    { name: 'Apple & Peanut Butter', protein: 7 },
    { name: 'Boiled Eggs (2)', protein: 12 },
    { name: 'Trail Mix', protein: 8 },
    { name: 'Banana', protein: 1 },
    { name: 'Cheese & Crackers', protein: 10 },
  ],
  'Afternoon Snack': [
    { name: 'Greek Yogurt', protein: 15 },
    { name: 'Hummus & Veggies', protein: 6 },
    { name: 'Protein Shake', protein: 25 },
    { name: 'Mixed Nuts', protein: 7 },
    { name: 'Fruit Salad', protein: 2 },
    { name: 'Makhana (Fox Nuts)', protein: 4 },
    { name: 'Roasted Chana', protein: 10 },
  ],
  'Post-Workout': [
    { name: 'Whey Protein Shake', protein: 30 },
    { name: 'Chicken Wrap', protein: 28 },
    { name: 'Eggs & Bread', protein: 18 },
    { name: 'Banana & Whey Shake', protein: 27 },
    { name: 'BCAA Drink', protein: 0 },
    { name: 'Paneer Tikka', protein: 22 },
  ],
};

export default function Diet() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { slots, mealLogs, waterLog, loading, logMeal, addWater, addSlot } = useDiet(date);
  const [showAdd, setShowAdd] = useState(false);
  
  // Two-step form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [newSlot, setNewSlot] = useState({ name: '', time: '08:00', protein_estimate: 0, description: '' });

  // Photo verification state
  const [activePhotoSlot, setActivePhotoSlot] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [viewedPhoto, setViewedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const WATER_TARGET = 2500;
  const PROTEIN_TARGET = 100;
  
  const currentProtein = slots.reduce((acc, slot) => acc + (mealLogs[slot.id]?.checked ? slot.protein_estimate : 0), 0);

  // Get filtered food items based on category and search text
  const getFilteredItems = () => {
    if (!selectedCategory) return [];
    const items = FOOD_DATABASE[selectedCategory] || [];
    if (!foodSearch) return items;
    return items.filter(item => item.name.toLowerCase().includes(foodSearch.toLowerCase()));
  };

  const handleSelectFood = (food) => {
    setFoodSearch(food.name);
    setNewSlot({
      ...newSlot,
      name: `${selectedCategory} - ${food.name}`,
      protein_estimate: food.protein,
      description: food.name
    });
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setFoodSearch('');
    // Auto-set default time based on category
    const timeMap = {
      'Breakfast': '08:00',
      'Morning Snack': '10:30',
      'Lunch': '13:00',
      'Afternoon Snack': '16:00',
      'Dinner': '20:00',
      'Post-Workout': '18:00',
    };
    setNewSlot({ ...newSlot, time: timeMap[cat] || '08:00', name: '' });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    const finalName = newSlot.name || `${selectedCategory} - ${foodSearch}`;
    await addSlot({ ...newSlot, name: finalName });
    setShowAdd(false);
    setSelectedCategory('');
    setFoodSearch('');
    setNewSlot({ name: '', time: '08:00', protein_estimate: 0, description: '' });
  };

  const handleToggleMeal = (slotId, checked, currentPhoto = null) => {
    if (checked) {
      // Trying to check it off - require photo
      setActivePhotoSlot(slotId);
      setTempPhoto(null);
    } else {
      // Unchecking
      logMeal(slotId, false, null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMealWithPhoto = () => {
    if (!tempPhoto || !activePhotoSlot) return;
    logMeal(activePhotoSlot, true, tempPhoto);
    setActivePhotoSlot(null);
    setTempPhoto(null);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Diet & Water</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 flex flex-col justify-center items-center cursor-pointer active:scale-95 transition-transform" onClick={() => addWater(250)}>
              <Droplet className="text-blue-500 mb-2" size={32} />
              <div className="text-xl font-bold">{waterLog} <span className="text-xs text-slate-500 font-normal">/ {WATER_TARGET}ml</span></div>
              <div className="text-xs text-slate-400 mt-1">Tap +250ml</div>
          </div>
          
          <div className="card p-4 flex flex-col justify-center items-center">
              <div className="w-12 h-12 rounded-full border-4 flex items-center justify-center mb-2" style={{borderColor: currentProtein >= PROTEIN_TARGET ? '#4ECFA8' : '#FCD34D'}}>
                   <span className="font-bold text-sm">Pr</span>
              </div>
              <div className="text-xl font-bold">{currentProtein} <span className="text-xs text-slate-500 font-normal">/ {PROTEIN_TARGET}g</span></div>
          </div>
      </div>

      <div className="flex justify-between items-center mt-6">
          <h2 className="text-lg font-medium">Meals</h2>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full">
              <Plus size={20} />
          </button>
      </div>

      {showAdd && (
          <form className="card p-4 space-y-4" onSubmit={handleAdd}>
              <h3 className="font-medium">Add Meal</h3>
              
              {/* Step 1: Category Selection */}
              <div>
                  <label className="block text-xs text-slate-500 mb-2 font-medium">Meal Category</label>
                  <div className="grid grid-cols-3 gap-2">
                      {MEAL_CATEGORIES.map(cat => (
                          <button
                              key={cat}
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                                  selectedCategory === cat
                                    ? 'bg-primary-light text-white border-primary-light'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-light/50'
                              }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              {/* Step 2: Food Item Search (only shows after category selected) */}
              {selectedCategory && (
                  <>
                      <div>
                          <label className="block text-xs text-slate-500 mb-2 font-medium">Search Food Item</label>
                          <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                  type="text"
                                  placeholder={`Search ${selectedCategory.toLowerCase()} items...`}
                                  value={foodSearch}
                                  onChange={e => setFoodSearch(e.target.value)}
                                  className="w-full pl-10 pr-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 outline-none text-sm"
                              />
                          </div>

                          {/* Dropdown results */}
                          {filteredItems.length > 0 && (
                              <div className="mt-2 border rounded-lg overflow-hidden dark:border-slate-700 max-h-48 overflow-y-auto">
                                  {filteredItems.map((food, i) => (
                                      <div
                                          key={i}
                                          onClick={() => handleSelectFood(food)}
                                          className={`flex justify-between items-center px-3 py-2.5 cursor-pointer transition-colors text-sm border-b last:border-b-0 dark:border-slate-800 ${
                                              foodSearch === food.name
                                                ? 'bg-primary-light/10 text-primary-light dark:text-primary-dark'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                          }`}
                                      >
                                          <span className="font-medium">{food.name}</span>
                                          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{food.protein}g protein</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs text-slate-500 mb-1">Time</label>
                              <input required type="time" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-xs text-slate-500 mb-1">Protein (g)</label>
                              <input required type="number" placeholder="Protein" value={newSlot.protein_estimate} onChange={e => setNewSlot({...newSlot, protein_estimate: parseInt(e.target.value) || 0})} className="w-full p-2 border rounded-md dark:bg-slate-800 dark:border-slate-700 outline-none text-sm" />
                          </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                          <button type="button" onClick={() => { setShowAdd(false); setSelectedCategory(''); setFoodSearch(''); }} className="px-4 py-2 text-sm">Cancel</button>
                          <button type="submit" className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add Meal</button>
                      </div>
                  </>
              )}
          </form>
      )}

      {slots.length === 0 && !showAdd && (
          <div className="card p-8 text-center bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-500 mb-4">No meals configured yet. Add your first meal to start tracking.</p>
              <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-primary-light text-white rounded-lg text-sm font-medium">Add First Meal</button>
          </div>
      )}

      <div className="space-y-3">
          {slots.map(slot => {
              const log = mealLogs[slot.id];
              const checked = log?.checked || false;
              const hasPhoto = log?.proof_image != null;
              
              if (activePhotoSlot === slot.id) {
                return (
                  <div key={slot.id} className="card p-4 space-y-4 animate-in fade-in">
                    <div className="flex justify-between items-center">
                      <div className="font-medium text-sm">Verify: {slot.name}</div>
                      <button onClick={() => { setActivePhotoSlot(null); setTempPhoto(null); }} className="text-slate-400">
                        <X size={18} />
                      </button>
                    </div>
                    
                    <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                    
                    {tempPhoto ? (
                      <div className="relative rounded-lg overflow-hidden border border-[var(--border-color)]">
                        <img src={tempPhoto} alt="Meal Proof Preview" className="w-full h-32 object-cover" />
                        <button onClick={() => setTempPhoto(null)} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full">
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-primary-light/30 rounded-lg flex flex-col items-center justify-center text-primary-light cursor-pointer bg-primary-light/5 hover:bg-primary-light/10 transition-colors">
                        <Camera size={28} className="mb-2" />
                        <span className="text-xs font-medium">Add Photo Proof</span>
                      </div>
                    )}
                    
                    <button onClick={saveMealWithPhoto} disabled={!tempPhoto} className="w-full py-2 bg-primary-light text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      Verify & Log
                    </button>
                  </div>
                );
              }

              return (
                  <div key={slot.id} className="card p-4 flex items-center justify-between cursor-pointer active:scale-95 transition-transform" onClick={() => handleToggleMeal(slot.id, !checked, log?.proof_image)}>
                      <div className="flex items-center gap-4">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${checked ? 'bg-primary-light border-primary-light text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                              {checked && <Check size={14} />}
                          </div>
                          <div>
                              <div className="font-medium">{slot.name}</div>
                              <div className="text-xs text-slate-500">{slot.time} {slot.protein_estimate > 0 ? `• ${slot.protein_estimate}g protein` : ''}</div>
                          </div>
                      </div>
                      {hasPhoto && checked && (
                          <button onClick={(e) => { e.stopPropagation(); setViewedPhoto(log.proof_image); }} className="p-2 bg-primary-light/10 text-primary-light rounded-full hover:bg-primary-light/20 transition-colors">
                            <ImageIcon size={18} />
                          </button>
                      )}
                  </div>
              );
          })}
      </div>

      {/* Fullscreen Photo Viewer Modal */}
      {viewedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setViewedPhoto(null)}>
          <button onClick={() => setViewedPhoto(null)} className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 rounded-full">
            <X size={20} />
          </button>
          <img src={viewedPhoto} className="max-h-[80vh] w-auto max-w-full rounded-lg shadow-2xl object-contain" alt="Meal Proof" onClick={e => e.stopPropagation()} />
        </div>
      )}

    </div>
  )
}