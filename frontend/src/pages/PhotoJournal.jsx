import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Camera, Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import * as api from '../api/photos';


export default function PhotoJournal() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPhoto, setNewPhoto] = useState(null);
  const [caption, setCaption] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewedPhoto, setViewedPhoto] = useState(null);
  
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getPhotos();
      if (res.data.success) {
        setPhotos(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!newPhoto) return;
    
    await api.createPhoto({
      date,
      image_data: newPhoto,
      caption
    });
    
    setShowAdd(false);
    setNewPhoto(null);
    setCaption('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    fetchData();
  };

  const deletePhoto = async (id) => {
    await api.deletePhoto(id);
    setViewedPhoto(null);
    fetchData();
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Camera size={24} /> Photo Journal
        </h1>
        <button onClick={() => setShowAdd(true)} className="p-2 bg-primary-light text-white rounded-full shadow-md">
          <Plus size={20} />
        </button>
      </div>

      {/* Add Photo Form */}
      {showAdd && (
        <form className="card p-4 space-y-4 animate-in slide-in-from-top-4" onSubmit={handleSave}>
          <div className="flex justify-between items-center">
            <h3 className="font-medium">New Memory</h3>
            <button type="button" onClick={() => { setShowAdd(false); setNewPhoto(null); }} className="text-slate-400">
              <X size={20} />
            </button>
          </div>
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
          />
          
          {newPhoto ? (
            <div className="relative rounded-lg overflow-hidden border border-[var(--border-color)]">
              <img src={newPhoto} alt="Preview" className="w-full h-48 object-cover" />
              <button 
                type="button" 
                onClick={() => setNewPhoto(null)} 
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full backdrop-blur-sm"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()} 
              className="w-full h-48 border-2 border-dashed border-[var(--border-color)] rounded-lg flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span className="text-sm font-medium">Tap to select photo</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="p-2 border border-[var(--border-color)] rounded-lg text-sm bg-transparent outline-none" 
            />
            <textarea 
              rows={2} 
              value={caption} 
              onChange={e => setCaption(e.target.value)} 
              placeholder="Write a caption..." 
              className="p-2 border border-[var(--border-color)] rounded-lg text-sm bg-transparent outline-none resize-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={!newPhoto}
            className="w-full py-2.5 bg-primary-light text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Memory
          </button>
        </form>
      )}

      {/* Empty State */}
      {photos.length === 0 && !showAdd && (
        <div className="card p-8 text-center bg-black/5 dark:bg-white/5 border-none">
          <Camera className="mx-auto mb-4 text-primary-light/50" size={48} />
          <p className="text-slate-500 mb-4">No photos yet. Start capturing your daily moments and progress.</p>
          <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-primary-light text-white rounded-lg text-sm font-medium">
            Add First Photo
          </button>
        </div>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map(photo => (
          <div 
            key={photo.id} 
            className="aspect-square rounded-xl overflow-hidden relative cursor-pointer group shadow-sm"
            onClick={() => setViewedPhoto(photo)}
          >
            <img 
              src={photo.image_data} 
              alt={photo.caption || 'Journal Entry'} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <span className="text-white text-xs font-medium drop-shadow-md">{photo.date.slice(5)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Photo Viewer Modal */}
      {viewedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={() => setViewedPhoto(null)}>
          <div className="absolute top-4 right-4 flex gap-3">
            <button onClick={(e) => { e.stopPropagation(); deletePhoto(viewedPhoto.id); }} className="p-2 text-white/70 hover:text-red-400 bg-black/20 rounded-full">
              <Trash2 size={20} />
            </button>
            <button onClick={() => setViewedPhoto(null)} className="p-2 text-white/70 hover:text-white bg-black/20 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="max-w-3xl w-full p-4 flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img 
              src={viewedPhoto.image_data} 
              className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-2xl object-contain" 
              alt="Viewed entry"
            />
            
            <div className="w-full max-w-md mt-6 bg-white/10 backdrop-blur border border-white/20 p-4 rounded-xl text-white">
              <div className="text-sm font-medium text-white/60 mb-1">{format(new Date(viewedPhoto.date), 'MMMM d, yyyy')}</div>
              {viewedPhoto.caption ? (
                <p className="text-base">{viewedPhoto.caption}</p>
              ) : (
                <p className="text-white/40 italic text-sm">No caption</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
