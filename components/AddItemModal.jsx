import React, { useEffect, useState } from 'react';

export default function AddItemModal({ isOpen, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Task');
  const [tags, setTags] = useState('');
  const [files, setFiles] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/folders')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data.folders)) setFolders(data.folders);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const onFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleAdd = async () => {
    if (!title || title.trim().length === 0) {
      alert('Title is required');
      return;
    }

    if (!selectedFolder) {
      const ok = window.confirm('No folder selected. Do you want to save in the root storage folder?');
      if (!ok) return;
    }

    const fd = new FormData();
    fd.append('title', title);
    fd.append('description', description);
    fd.append('type', type);
    fd.append('tags', tags);
    fd.append('folder', selectedFolder);
    if (files) {
      for (let i = 0; i < files.length; i++) {
        fd.append('files', files[i]);
      }
    }

    try {
      setSaving(true);
      const res = await fetch('/api/items', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to save item');
      } else {
        alert('Item saved');
        if (onSaved) onSaved(data.item);
        // Reset form
        setTitle('');
        setDescription('');
        setType('Task');
        setTags('');
        setFiles(null);
        setSelectedFolder('');
        onClose();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  const modalStyle = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    padding: 20,
    borderRadius: 8,
    boxShadow: '0 6px 24px rgba(0,0,0,0.2)',
    width: 600,
    maxHeight: '80vh',
    overflowY: 'auto',
    zIndex: 1000,
  };

  return (
    <div style={modalStyle} role="dialog" aria-modal="true">
      <h3>Add New Item</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        <label>
          Title *
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%' }} />
        </label>
        <div>
          <label style={{ marginRight: 12 }}>
            <input type="radio" name="type" checked={type === 'Task'} onChange={() => setType('Task')} /> Task
          </label>
          <label>
            <input type="radio" name="type" checked={type === 'Note'} onChange={() => setType('Note')} /> Note
          </label>
        </div>
        <label>
          Tags (comma-separated)
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={{ width: '100%' }} />
        </label>
        <label>
          Files
          <input type="file" multiple onChange={onFileChange} />
        </label>
        <label>
          Target Folder
          <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} style={{ width: '100%' }}>
            <option value="">-- None (root) --</option>
            {folders.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} disabled={saving} type="button">
            Cancel
          </button>
          <button onClick={handleAdd} disabled={saving} type="button">
            {saving ? 'Saving...' : 'Add Item'}
          </button>
        </div>
      </div>
    </div>
  );
}
