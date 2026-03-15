import { useState } from 'react';
import { useDiet } from '../hooks/useDiet';
import { format } from 'date-fns';
import { Droplet, Plus, Check, Search, Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useRef } from 'react';
import useLongPress from '../hooks/useLongPress';

export default function Diet() {
  const [date] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { slots, mealLogs, waterLog, categories, foodItems, loading, logMeal, addWater, addSlot, deleteSlot } = useDiet(date);
  const [showAdd, setShowAdd] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const [newSlot, setNewSlot] = useState({ name: '', time: '08:00', protein_estimate: 0, description: '' });

  const [activePhotoSlot, setActivePhotoSlot] = useState(null);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [viewedPhoto, setViewedPhoto] = useState(null);
  const fileInputRef = useRef(null);

  const WATER_TARGET = 2500;
  const PROTEIN_TARGET = 100;
  
  const currentProtein = slots.reduce((acc, slot) => acc + (mealLogs[slot.id]?.checked ? slot.protein_estimate : 0), 0);
  const waterProgress = Math.min(Math.round((waterLog / WATER_TARGET) * 100), 100);
  const proteinProgress = Math.min(Math.round((currentProtein / PROTEIN_TARGET) * 100), 100);

  const getFilteredItems = () => {
    if (!selectedCategory) return [];
    const items = foodItems.filter(i => i.category === selectedCategory);
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

  const handleToggleMeal = (slotId, checked) => {
    if (checked) {
      setActivePhotoSlot(slotId);
      setTempPhoto(null);
    } else {
      logMeal(slotId, false, null);
    }
  };

  const handleDelete = async (id) => {
      if (window.confirm("Delete this meal slot?")) {
          await deleteSlot(id);
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

  if (loading) return <div className="p-4 flex items-center justify-center min-h-[50vh]"><Loader2 className="animate-spin text-primary-light" /></div>;

  const filteredItems = getFilteredItems();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-2 gap-4">
          <div className="card p-5 flex flex-col items-center justify-center cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden group" onClick={() => addWater(250)}>
              <div className="absolute inset-x-0 bottom-0 bg-blue-500/10 h-1 transition-all duration-700" style={{width: `${waterProgress}%`}}></div>
              <Droplet className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={28} />
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{waterLog} <span className="text-[10px] text-slate-400 font-normal tracking-wide uppercase">ml</span></div>
              <div className="text-[10px] font-bold text-blue-500/70 mt-1 uppercase tracking-wider">Tap +250ml</div>
          </div>
          
          <div className="card p-5 flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-x-0 bottom-0 bg-primary-light/10 h-1 transition-all duration-700" style={{width: `${proteinProgress}%`}}></div>
              <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center mb-2 transition-colors ${currentProtein >= PROTEIN_TARGET ? 'bg-primary-light border-primary-light text-white' : 'border-primary-light/30 text-primary-light'}`}>
                   <span className="font-bold text-xs uppercase">Pr</span>
              </div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentProtein} <span className="text-[10px] text-slate-400 font-normal tracking-wide uppercase">g</span></div>
              <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Target: {PROTEIN_TARGET}g</div>
          </div>
      </div>

      <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-semibold">Meals</h2>
          <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full hover:bg-primary-light/90 active:scale-95 transition-all">
              <Plus size={20} />
          </button>
      </div>

      {showAdd && (
          <form className="card p-5 space-y-5 animate-in slide-in-from-top-4 duration-300" onSubmit={handleAdd}>
              <h3 className="font-semibold text-lg">New Meal</h3>
              
              <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                      {categories.map(cat => (
                          <button
                              key={cat}
                              type="button"
                              onClick={() => handleCategorySelect(cat)}
                              className={`px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border-2 transition-all ${
                                  selectedCategory === cat
                                    ? 'bg-primary-light text-white border-primary-light shadow-lg shadow-primary-light/20'
                                    : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-500 hover:border-primary-light/30'
                              }`}
                          >
                              {cat}
                          </button>
                      ))}
                  </div>
              </div>

              {selectedCategory && (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                      <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Food Item</label>
                          <div className="relative">
                              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                  type="text"
                                  placeholder={`Search ${selectedCategory.toLowerCase()}...`}
                                  value={foodSearch}
                                  onChange={e => setFoodSearch(e.target.value)}
                                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-light/50 transition-all text-sm"
                              />
                          </div>

                          {filteredItems.length > 0 && (
                              <div className="mt-2 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto bg-white dark:bg-slate-900 shadow-sm">
                                  {filteredItems.map((food, i) => (
                                      <div
                                          key={i}
                                          onClick={() => handleSelectFood(food)}
                                          className={`flex justify-between items-center px-4 py-3 cursor-pointer transition-colors text-sm border-b last:border-b-0 dark:border-slate-800 ${
                                              foodSearch === food.name
                                                ? 'bg-primary-light/5 text-primary-light font-semibold'
                                                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                          }`}
                                      >
                                          <span>{food.name}</span>
                                          <span className="text-[10px] font-bold text-slate-400">{food.protein}g P</span>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-500 uppercase">Time</label>
                              <input required type="time" value={newSlot.time} onChange={e => setNewSlot({...newSlot, time: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm" />
                          </div>
                          <div className="space-y-1.5">
                              <label className="text-xs font-semibold text-slate-500 uppercase">Est. Protein (g)</label>
                              <input required type="number" value={newSlot.protein_estimate} onChange={e => setNewSlot({...newSlot, protein_estimate: parseInt(e.target.value) || 0})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl outline-none text-sm" />
                          </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                          <button type="button" onClick={() => { setShowAdd(false); setSelectedCategory(''); setFoodSearch(''); }} className="px-5 py-2.5 text-sm font-semibold text-slate-500">Cancel</button>
                          <button type="submit" className="px-7 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20 hover:opacity-90">Save Meal</button>
                      </div>
                  </div>
              )}
          </form>
      )}

      {slots.length === 0 && !showAdd && (
          <div className="card p-10 text-center bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-500 mb-6 font-medium">Tracking meals ensures you meet your nutritional goals. Add your first meal to begin.</p>
              <button onClick={() => setShowAdd(true)} className="px-6 py-2.5 bg-primary-light text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary-light/20">Define First Meal</button>
          </div>
      )}

      <div className="grid gap-3">
          {slots.map(slot => (
              <MealSlotItem 
                key={slot.id} 
                slot={slot} 
                log={mealLogs[slot.id]} 
                onToggle={() => handleToggleMeal(slot.id, !(mealLogs[slot.id]?.checked))}
                onDelete={() => handleDelete(slot.id)}
                activePhotoSlot={activePhotoSlot}
                saveMealWithPhoto={saveMealWithPhoto}
                tempPhoto={tempPhoto}
                setTempPhoto={setTempPhoto}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
                setViewedPhoto={setViewedPhoto}
                setActivePhotoSlot={setActivePhotoSlot}
              />
          ))}
      </div>

      {viewedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setViewedPhoto(null)}>
          <button onClick={() => setViewedPhoto(null)} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full">
            <X size={24} />
          </button>
          <img src={viewedPhoto} className="max-h-[85vh] w-auto max-w-[95%] rounded-2xl shadow-2xl object-contain border border-white/10" alt="Meal Proof" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

function MealSlotItem({ slot, log, onToggle, onDelete, activePhotoSlot, saveMealWithPhoto, tempPhoto, setTempPhoto, fileInputRef, handleFileChange, setViewedPhoto, setActivePhotoSlot }) {
    const checked = log?.checked || false;
    const hasPhoto = log?.proof_image != null;
    
    const longPressProps = useLongPress(
        () => onDelete(),
        () => activePhotoSlot === slot.id ? null : onToggle(),
        { delay: 800 }
    );

    if (activePhotoSlot === slot.id) {
        return (
          <div className="card p-4 space-y-4 animate-in zoom-in-95 duration-300 ring-2 ring-primary-light shadow-xl">
            <div className="flex justify-between items-center">
              <div className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary-light animate-ping"></div>
                  Verify: {slot.name}
              </div>
              <button onClick={() => { setActivePhotoSlot(null); setTempPhoto(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            
            {tempPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner group">
                <img src={tempPhoto} alt="Preview" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all"></div>
                <button onClick={() => setTempPhoto(null)} className="absolute top-2 right-2 p-2 bg-black/60 text-white rounded-full hover:bg-black/80">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 border-2 border-dashed border-primary-light/30 rounded-2xl flex flex-col items-center justify-center text-primary-light cursor-pointer bg-primary-light/5 hover:bg-primary-light/10 transition-all group">
                <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider">Take Photo Proof</span>
              </div>
            )}
            
            <button onClick={saveMealWithPhoto} disabled={!tempPhoto} className="w-full py-3 bg-primary-light text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-light/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:shadow-none">
              Confirm & Log Meal
            </button>
          </div>
        );
    }

    return (
        <div 
            {...longPressProps}
            className={`card p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all select-none border-2 ${
                checked ? 'border-primary-light/20 bg-primary-light/5' : 'border-transparent'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    checked ? 'bg-primary-light border-primary-light text-white rotate-0' : 'border-slate-200 dark:border-slate-700'
                }`}>
                    {checked && <Check size={16} className="animate-in zoom-in duration-300" />}
                </div>
                <div>
                    <div className={`font-semibold transition-all ${checked ? 'text-primary-light' : 'text-slate-700 dark:text-slate-200'}`}>{slot.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {slot.time} {slot.protein_estimate > 0 ? `• ${slot.protein_estimate}g Protein` : ''}
                    </div>
                </div>
            </div>
            {hasPhoto && checked && (
                <button onClick={(e) => { e.stopPropagation(); setViewedPhoto(log.proof_image); }} className="w-10 h-10 flex items-center justify-center bg-primary-light/10 text-primary-light rounded-xl hover:bg-primary-light/20 transition-all border border-primary-light/20">
                    <ImageIcon size={20} />
                </button>
            )}
        </div>
    );
}