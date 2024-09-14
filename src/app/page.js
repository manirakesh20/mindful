'use client';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5001/api';

const captureNote = async (title, noteContent, selectedCategory, fetchNotes, setTitle, setNoteContent, setSelectedCategory) => {
  if (noteContent.trim()) {
    const newNote = {
      title: title.trim() || `New Note at ${new Date().toLocaleString()}`,
      content: noteContent,
      category: selectedCategory || 'Others',
    };
  
    try {
      await axios.post(`${API_URL}/notes`, newNote);
      fetchNotes(); // Refresh the notes list
      setTitle('');
      setNoteContent('');
      setSelectedCategory('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }
};

export default function Home() {
  const [title, setTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [notes, setNotes] = useState([]);
  const textareaRef = useRef(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('All Notes');
  const [editingNoteId, setEditingNoteId] = useState(null);

  const dropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotes();
  }, [router.asPath]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get(`${API_URL}/notes`);
      console.log('Fetched notes:', response.data);
      response.data.forEach(note => {
        console.log(`Note ID: ${note._id}, Title: ${note.title}`);
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  useEffect(() => {
    const adjustTextareaHeight = () => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
      }
    };

    adjustTextareaHeight();
    
    // Add a small delay to recalculate after initial render
    const timer = setTimeout(adjustTextareaHeight, 0);

    return () => clearTimeout(timer);
  }, [noteContent]);

  const handleTextareaChange = (e) => {
    setNoteContent(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
  };

  const handleFilterCategoryChange = (category) => {
    setFilterCategory(category);
  };

  const deleteNote = async (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await axios.delete(`${API_URL}/notes/${noteId}`);
        setNotes(notes.filter(note => note._id !== noteId));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  const updateNoteCategory = async (noteId, newCategory) => {
    try {
      await axios.put(`${API_URL}/notes/${noteId}`, { category: newCategory });
      setNotes(notes.map(note => 
        note._id === noteId ? { ...note, category: newCategory } : note
      ));
      setEditingNoteId(null);
    } catch (error) {
      console.error('Error updating note category:', error);
    }
  };

  const toggleCategoryEdit = (noteId) => {
    setEditingNoteId(editingNoteId === noteId ? null : noteId);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        captureNote(title, noteContent, selectedCategory, fetchNotes, setTitle, setNoteContent, setSelectedCategory);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [title, noteContent, selectedCategory]);

  useEffect(() => {
    console.log('categoryDropdownRef:', categoryDropdownRef.current);
  }, []);

  useEffect(() => {
    console.log('isDropdownOpen changed:', isDropdownOpen);
  }, [isDropdownOpen]);

  const handleExpandClick = () => {
    router.push('/textedit');
  };

  return (
    <>
      <div className="relative flex min-h-screen flex-col bg-white overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] px-4 sm:px-6 md:px-10 py-3">
            <div className="flex items-center gap-4 text-[#111418]">
              <div className="w-4 h-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_543)">
                    <path
                      d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z"
                      fill="currentColor"
                    ></path>
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0346 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_543"><rect width="48" height="48" fill="white"></rect></clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em]">Mindful</h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                aria-label="Add new note"
                className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 bg-[#f0f2f4] text-[#111418] gap-2 text-sm font-bold leading-normal tracking-[0.015em] px-2.5"
              >
                <div className="text-[#111418]" data-icon="Plus" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </div>
              </button>
              <div
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-10 h-10"
                style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/2aa8816a-20fc-4294-9889-bfa0fa3c3135.png")'}}
              ></div>
            </div>
          </header>
          <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
            <div className="flex flex-col w-full max-w-[960px]">
              <h2 className="text-[#111418] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-3 pt-5">What's on your mind?</h2>
              <div className="flex flex-wrap items-end gap-4 px-2 sm:px-4 py-3">
                <input
                  id="note-title"
                  name="note-title"
                  placeholder="Enter title"
                  className="form-input flex w-full min-w-0 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#bbc4ce] p-4 text-base font-normal leading-normal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex items-center px-2 sm:px-4 py-3 gap-3 overflow-visible">
                <div className="flex w-full rounded-xl border border-[#dce0e5] overflow-visible">
                  <div className="flex-shrink-0 bg-white p-3 sm:p-4 rounded-l-xl">
                    <div
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-8 h-8 sm:w-10 sm:h-10"
                      style={{backgroundImage: 'url("https://cdn.usegalileo.ai/sdxl10/edf6ceac-abde-450e-a53b-fd9c6f37a5cc.png")'}}
                    ></div>
                  </div>
                  <div className="flex-grow flex flex-col overflow-visible relative w-full">
                    <div className="absolute top-2 right-2 text-[#637588] hover:text-[#111418] cursor-pointer" onClick={handleExpandClick}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707z"/>
                      </svg>
                    </div>
                    <textarea
                      id="note-content"
                      name="note-content"
                      ref={textareaRef}
                      placeholder="Start writing"
                      className="w-full resize-none overflow-hidden text-[#111418] focus:outline-0 focus:ring-0 bg-white placeholder:text-[#bbc4ce] p-4 text-base font-normal leading-normal border-none rounded-r-xl"
                      value={noteContent}
                      onChange={handleTextareaChange}
                      style={{ minHeight: '150px' }}
                    ></textarea>
                    <div className="absolute bottom-2 right-2 flex items-center gap-2">
                      <div className="relative" ref={categoryDropdownRef}>
                                <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDropdownOpen(!isDropdownOpen);
                          }}
                          className={`rounded-xl px-4 py-2 text-sm font-medium ${
                            selectedCategory ? 'bg-[#ffc351] text-white' : 'bg-white text-[#111418] border border-[#dce0e5]'
                          }`}
                                >
                          {selectedCategory ? `#${selectedCategory}` : '#Category'}
                                </button>
                        {isDropdownOpen && (
                          <div className="absolute left-0 top-full mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[1000]">
                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                              {['Daily Journal', 'Mind Dump', 'Interview Notes', 'Meeting Notes', 'Others'].map((category) => (
                                <button
                                  key={category}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                  role="menuitem"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCategoryChange(category);
                                    setIsDropdownOpen(false);
                                  }}
                                >
                                  {category}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                            </div>
                      <button
                        onClick={() => captureNote(title, noteContent, selectedCategory, fetchNotes, setTitle, setNoteContent, setSelectedCategory)}
                        className="bg-[#1980e6] text-white rounded-xl px-4 py-2 text-sm font-medium"
                      >
                        Capture
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <h2 className="text-[#111418] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-3 pt-5">Categorize your note</h2>
              <div className="flex gap-3 p-3 flex-wrap pr-4">
                {['All Notes', 'Daily Journal', 'Mind Dump', 'Interview Notes', 'Meeting Notes', 'Others'].map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterCategoryChange(category)}
                    className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-xl pl-4 pr-4 ${
                      filterCategory === category ? 'bg-[#1980e6] text-white' : 'bg-[#f0f2f4] text-[#111418]'
                    }`}
                  >
                    <p className="text-sm font-medium leading-normal">{category}</p>
                  </button>
                ))}
              </div>
              <h2 className="text-[#111418] text-xl sm:text-[22px] font-bold leading-tight tracking-[-0.015em] px-2 sm:px-4 pb-3 pt-5">Your notes</h2>
              {notes.filter(note => filterCategory === 'All Notes' || note.category === filterCategory).map((note) => (
                <div key={note._id} className="flex items-center justify-between gap-4 bg-white px-2 sm:px-4 min-h-[72px] py-2 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/textedit?id=${note._id}`)}>
                  <div className="flex flex-col justify-center flex-grow">
                    <p className="text-[#111418] text-base font-medium leading-normal line-clamp-1">{note.title}</p>
                    <p className="text-[#637588] text-sm font-normal leading-normal line-clamp-2">
                      {note.content.split('\n').slice(0, 2).join('\n')}
                      {note.content.split('\n').length > 2 ? '...' : ''}
                    </p>
                    <p className="text-[#637588] text-xs font-normal leading-normal">
                      Last edited: {(() => {
                        if (note.updatedAt) {
                          return new Date(note.updatedAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          });
                        } else if (note.createdAt) {
                          return new Date(note.createdAt).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          });
                        } else if (note.timestamp) {
                          return new Date(note.timestamp).toLocaleString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          });
                        } else {
                          return 'Date not available';
                        }
                      })()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative" ref={dropdownRef}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryEdit(note._id);
                        }}
                        className="text-[#637588] hover:text-blue-500 p-2"
                        aria-label="Edit category"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                          <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/>
                        </svg>
                      </button>
                      {editingNoteId === note._id && (
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            {['Daily Journal', 'Mind Dump', 'Interview Notes', 'Meeting Notes', 'Others'].map((category) => (
                              <button
                                key={category}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateNoteCategory(note._id, category);
                                }}
                              >
                                {category}
                                {note.category === category && (
                                  <span className="ml-2 text-blue-500">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note._id);
                      }}
                      className="text-[#637588] hover:text-red-500 p-2"
                      aria-label="Delete note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
