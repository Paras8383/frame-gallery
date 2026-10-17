const seedPhotos = [
  {
    id: 'photo-01',
    title: 'Quiet passage',
    category: 'Architecture',
    date: 'May 18, 2024',
    description: 'A sunlit corridor in the old quarter, found on an unhurried morning walk.',
    src: 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-02',
    title: 'Between the pines',
    category: 'Nature',
    date: 'October 02, 2023',
    description: 'Late afternoon light settling over a quiet stretch of forest.',
    src: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-03',
    title: 'A room of her own',
    category: 'Portraits',
    date: 'March 11, 2024',
    description: 'A soft, candid portrait made in the last light of the day.',
    src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-04',
    title: 'The long way home',
    category: 'Travel',
    date: 'September 09, 2023',
    description: 'The road winding through the high desert, somewhere beyond the last town.',
    src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-05',
    title: 'Still water, morning',
    category: 'Nature',
    date: 'June 24, 2024',
    description: 'The lake held the first color of the morning for just a few minutes.',
    src: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-06',
    title: 'Lines in the light',
    category: 'Architecture',
    date: 'February 16, 2024',
    description: 'Geometry and shadow along a limestone facade in the city.',
    src: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-07',
    title: 'Salt air',
    category: 'Travel',
    date: 'July 30, 2023',
    description: 'A small village facing the sea, where the afternoon seemed to slow down.',
    src: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-08',
    title: 'The in-between',
    category: 'Portraits',
    date: 'April 06, 2024',
    description: 'A quiet moment before the conversation began.',
    src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1400&q=85',
  },
  {
    id: 'photo-09',
    title: 'Open country',
    category: 'Nature',
    date: 'August 12, 2023',
    description: 'The last warm hours on a high-country trail.',
    src: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1400&q=85',
  },
];

let photos = [...seedPhotos];
const objectUrls = new Set();

const pause = (duration = 280) => new Promise((resolve) => window.setTimeout(resolve, duration));

export const galleryService = {
  async list() {
    await pause();
    return photos.map((photo) => ({ ...photo }));
  },

  async add({ file, title, category, src }) {
    await pause(180);
    const objectUrl = src || URL.createObjectURL(file);
    if (objectUrl.startsWith('blob:')) objectUrls.add(objectUrl);
    const created = {
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
      title: title.trim(),
      category,
      date: new Intl.DateTimeFormat('en', { month: 'long', day: '2-digit', year: 'numeric' }).format(new Date()),
      description: 'A photograph recently added to the collection.',
      src: objectUrl,
      isLocal: true,
    };
    photos = [created, ...photos];
    return { ...created };
  },

  async remove(id) {
    await pause(120);
    const target = photos.find((photo) => photo.id === id);
    if (!target) throw new Error('This photograph is no longer in the collection.');
    photos = photos.filter((photo) => photo.id !== id);
    if (objectUrls.has(target.src)) {
      URL.revokeObjectURL(target.src);
      objectUrls.delete(target.src);
    }
    return id;
  },
};
