'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import debounce from 'lodash/debounce'; // Make sure to install lodash

const CategoryDropdown = ({ selectedCategory, setSelectedCategory }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`rounded-xl px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium ${
          selectedCategory ? 'bg-[#ffc351] text-white' : 'bg-white text-[#111418] border border-[#dce0e5]'
        }`}
      >
        {selectedCategory ? `#${selectedCategory}` : '#Category'}
      </button>
      {isDropdownOpen && (
        <div className="absolute left-0 sm:right-0 mt-1 w-40 sm:w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {['Daily Journal', 'Mind Dump', 'Interview Notes', 'Meeting Notes', 'Others'].map((category) => (
              <button
                key={category}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                role="menuitem"
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TextEditor = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [creationDate, setCreationDate] = useState(new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [noteId, setNoteId] = useState(null);
  const titleRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchNote = async () => {
      const id = new URLSearchParams(window.location.search).get('id');
      if (id) {
        setNoteId(id);
        try {
          const response = await axios.get(`${API_URL}/notes/${id}`);
          const note = response.data;
          console.log('Fetched note:', note); // Add this line
          if (note) {
            setTitle(note.title);
            setContent(note.content);
            setSelectedCategory(note.category);
            if (note.timestamp) {
              setCreationDate(new Date(note.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));
            }
          }
        } catch (error) {
          console.error('Error fetching note:', error);
        }
      }
    };

    fetchNote();
  }, []);

  const saveNote = useCallback(async (shouldNavigate = false) => {
    const newNote = {
      title: title || `New Note at ${new Date().toLocaleString()}`,
      content: content,
      category: selectedCategory || 'Others',
    };
    console.log('Saving note:', newNote); // Add this line

    try {
      if (noteId) {
        await axios.put(`${API_URL}/notes/${noteId}`, newNote);
      } else {
        const response = await axios.post(`${API_URL}/notes`, newNote);
        setNoteId(response.data._id);
        router.replace(`/textedit?id=${response.data._id}`, undefined, { shallow: true });
      }
      if (shouldNavigate) {
        router.push('/');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [title, content, selectedCategory, router, noteId]);

  const debouncedSave = useCallback(
    debounce(() => {
      if (title || content) {
        saveNote(false);
      }
    }, 1000),
    [saveNote, title, content]
  );

  useEffect(() => {
    if (title || content) {
      debouncedSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [title, content, selectedCategory, debouncedSave]);

  const handleBackClick = () => {
    debouncedSave.cancel();
    if (title || content) {
      saveNote(true);
    } else {
      router.push('/');
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target === titleRef.current) {
      e.preventDefault();
      textareaRef.current.focus();
    } else if (e.key === 'ArrowUp' && e.target === textareaRef.current && textareaRef.current.selectionStart === 0) {
      e.preventDefault();
      titleRef.current.focus();
    } else if (e.key === 'ArrowDown' && e.target === titleRef.current) {
      e.preventDefault();
      textareaRef.current.focus();
    } else if (e.key === 'Escape') {
      handleBackClick();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center whitespace-nowrap px-4 sm:px-6 md:px-10 py-3">
        <button
          onClick={handleBackClick}
          className="text-black hover:text-[#1980e6]"
          aria-label="Back to Notes"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 14.828 12 12m0 0 2.828-2.828M12 12 9.172 9.172M12 12l2.828 2.828M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
        </button>
      </header>
      <div className="flex-grow p-4 sm:p-6 md:p-8 pt-16 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <CategoryDropdown selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
          </div>
          <div className="flex items-end justify-between mb-6">
            <div className="flex-grow">
              <input
                ref={titleRef}
                type="text"
                className="w-full text-2xl sm:text-3xl md:text-4xl font-bold border-none focus:outline-none focus:ring-0 text-[#111418]"
                placeholder="Untitled"
                value={title}
                onChange={handleTitleChange}
                onKeyDown={handleKeyDown}
              />
            </div>
            <div className="flex flex-col items-end justify-end ml-2 sm:ml-4">
              <span className="text-xs sm:text-sm text-[#637588]">{creationDate}</span>
            </div>
          </div>
          <textarea
            ref={textareaRef}
            className="w-full h-full resize-none text-[#111418] focus:outline-none focus:ring-0 bg-white placeholder:text-[#bbc4ce] text-sm sm:text-base font-normal leading-normal"
            placeholder="Start writing"
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            style={{ minHeight: 'calc(100vh - 250px)' }}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
