import React, { useState } from 'react';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB

const IssueForm = ({ onSubmit }) => {
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > MAX_IMAGE_SIZE) {
      setError('Image size should be less than 2MB.');
      setImage(null);
      setPreview(null);
      return;
    }
    setError('');
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !image) {
      setError('Please provide both an image and a description.');
      return;
    }
    setError('');

    // ✅ Use FormData for file + text
    const formData = new FormData();
    formData.append('description', description);
    formData.append('image', image);
    formData.append('date', new Date().toISOString());
    formData.append('status', 'Pending');

    onSubmit(formData);

    // Reset form
    setDescription('');
    setImage(null);
    setPreview(null);
  };

  return (
    <form className="issue-form flex flex-col gap-4" onSubmit={handleSubmit}>
      <label className="font-semibold">Upload Image (max 2MB):
        <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
      </label>
      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="image-preview mx-auto rounded shadow"
          style={{ maxWidth: '220px', maxHeight: '160px', objectFit: 'cover' }}
        />
      )}
      <label className="font-semibold">Description:
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          className="mt-2 rounded border p-2 w-full"
        />
      </label>
      {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      <button type="submit" className="bg-blue-700 text-white py-2 px-6 rounded hover:bg-blue-900 transition">
        Submit Issue
      </button>
    </form>
  );
};

export default IssueForm;
