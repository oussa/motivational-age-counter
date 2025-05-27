import React, { useState, useEffect } from 'react';
import { Button } from "./ui/button";
import { Settings } from '../types';

interface Idea {
  id: string;
  text: string;
  timestamp: number;
}

interface IdeasManagerProps {
  settings: Settings;
  onMakeMainText: (text: string) => void;
  currentMainText?: string;
}

export const IdeasManager: React.FC<IdeasManagerProps> = ({ settings, onMakeMainText, currentMainText }) => {
  const [ideaText, setIdeaText] = useState('');
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [previewOrder, setPreviewOrder] = useState<Idea[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [originalEditText, setOriginalEditText] = useState('');
  const [isHoveringContainer, setIsHoveringContainer] = useState(false);
  const ideasListRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load ideas and visibility state from storage
    chrome.storage.local.get(['ideas', 'ideasVisible'], (result) => {
      if (result.ideas) {
        setAllIdeas(result.ideas);
      }
      if (result.ideasVisible !== undefined) {
        setIsVisible(result.ideasVisible);
      }
    });
  }, []);

  const saveIdea = () => {
    if (ideaText.trim()) {
      const newIdea: Idea = {
        id: Date.now().toString(),
        text: ideaText.trim(),
        timestamp: Date.now()
      };
      
      chrome.storage.local.get(['ideas'], (result) => {
        const existingIdeas = result.ideas || [];
        const updatedIdeas = [...existingIdeas, newIdea];
        
        chrome.storage.local.set({ ideas: updatedIdeas }, () => {
          setAllIdeas(updatedIdeas);
          setIdeaText('');
          setShowInput(false);
          
          // Auto-scroll to the bottom to show the new idea
          setTimeout(() => {
            if (ideasListRef.current) {
              ideasListRef.current.scrollTop = ideasListRef.current.scrollHeight;
            }
          }, 100);
        });
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
  };

  const deleteIdea = (id: string) => {
    const updatedIdeas = allIdeas.filter(idea => idea.id !== id);
    setAllIdeas(updatedIdeas);
    chrome.storage.local.set({ ideas: updatedIdeas });
    setDeletingId(null);
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const startEditing = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
    setOriginalEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      const updatedIdeas = allIdeas.map(idea => 
        idea.id === editingId ? { ...idea, text: editText.trim() } : idea
      );
      setAllIdeas(updatedIdeas);
      chrome.storage.local.set({ ideas: updatedIdeas });
      setEditingId(null);
      setEditText('');
      setOriginalEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setOriginalEditText('');
  };

  const handleEditBlur = () => {
    // Only cancel if no changes were made
    if (editText.trim() === originalEditText.trim()) {
      cancelEdit();
    }
  };

  const swapWithMainText = (ideaText: string, ideaId: string) => {
    if (!currentMainText || currentMainText.trim() === '') {
      // If there's no main text, just use the idea as main text and remove it from ideas
      onMakeMainText(ideaText);
      deleteIdea(ideaId);
      return;
    }

    // Create a new idea with the current main text
    const newIdea: Idea = {
      id: Date.now().toString(),
      text: currentMainText.trim(),
      timestamp: Date.now()
    };

    // Update the ideas list: remove the selected idea and add the current main text as a new idea
    const updatedIdeas = allIdeas.map(idea => 
      idea.id === ideaId ? newIdea : idea
    );

    // Update storage and state
    chrome.storage.local.set({ ideas: updatedIdeas }, () => {
      setAllIdeas(updatedIdeas);
      // Set the selected idea as the new main text
      onMakeMainText(ideaText);
    });
  };

  const moveIdea = (fromIndex: number, toIndex: number) => {
    const newIdeas = [...allIdeas];
    const [movedItem] = newIdeas.splice(fromIndex, 1);
    newIdeas.splice(toIndex, 0, movedItem);
    setAllIdeas(newIdeas);
    chrome.storage.local.set({ ideas: newIdeas });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    setPreviewOrder([...allIdeas]);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
      
      const newOrder = [...allIdeas];
      const [movedItem] = newOrder.splice(draggedIndex, 1);
      newOrder.splice(index, 0, movedItem);
      setPreviewOrder(newOrder);
    }
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
      setPreviewOrder([]);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveIdea(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
    setPreviewOrder([]);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setPreviewOrder([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveIdea();
    }
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const toggleVisibility = () => {
    const newVisibility = !isVisible;
    setIsVisible(newVisibility);
    chrome.storage.local.set({ ideasVisible: newVisibility });
  };

  return (
    <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 w-full max-w-xl px-4">
      {/* Toggle Button when ideas are hidden */}
      {!isVisible && (
        <div className="flex justify-center">
          <Button
            variant="link"
            onClick={toggleVisibility}
            className="text-xs"
            style={{ color: settings.mainTextColor }}
          >
            Ideas/Goals
          </Button>
        </div>
      )}

      {/* Ideas container */}
      {isVisible && (
        <div 
          className="pt-4 pb-6 rounded-lg relative"
          style={{
            backdropFilter: 'blur(8px)'
          }}
          onMouseEnter={() => setIsHoveringContainer(true)}
          onMouseLeave={() => setIsHoveringContainer(false)}
        >


          {/* Empty state */}
          {allIdeas.length === 0 && (
            <div className="min-h-16 flex items-center justify-center text-center">
              <p className="text-sm opacity-60" style={{ color: settings.mainTextColor }}>
                No ideas/goals yet. Click "add" below to add one!
              </p>
            </div>
          )}

          {/* Ideas List */}
          {allIdeas.length > 0 && (
            <div className="space-y-0.5 max-h-32 overflow-y-auto" ref={ideasListRef}>
              <div className="space-y-0.5">
                {(previewOrder.length > 0 ? previewOrder : allIdeas).map((idea, index) => {
                  const originalIndex = allIdeas.findIndex(originalIdea => originalIdea.id === idea.id);
                  const isDragging = draggedIndex === originalIndex;
                  const isDropTarget = dragOverIndex === index && draggedIndex !== null && draggedIndex !== index;
                  
                  return (
                  <div
                    key={idea.id}
                    onDragOver={allIdeas.length > 1 ? (e) => handleDragOver(e, index) : undefined}
                    onDragEnter={allIdeas.length > 1 ? (e) => handleDragEnter(e, index) : undefined}
                    onDragLeave={allIdeas.length > 1 ? handleDragLeave : undefined}
                    onDrop={allIdeas.length > 1 ? (e) => handleDrop(e, index) : undefined}
                    className={`group transition-all duration-200 rounded px-2 py-0.5 ${
                      allIdeas.length > 1 && isDragging ? 'opacity-30 scale-95' : ''
                    } ${allIdeas.length > 1 && isDropTarget ? 'border-2 border-dashed border-blue-400' : ''}`}
                  >
                    {editingId === idea.id ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 flex justify-center">
                          <span className="text-xs opacity-30 select-none">⋮⋮</span>
                        </div>
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyPress={handleEditKeyPress}
                          onBlur={handleEditBlur}
                          className="flex-1 text-sm bg-transparent border-none outline-none"
                          style={{ 
                            color: settings.mainTextColor,
                            height: '1.5rem'
                          }}
                          autoFocus
                        />
                        <Button
                          onClick={saveEdit}
                          variant="ghost"
                          className="p-1 h-6 w-6 text-xs"
                          style={{ color: settings.mainTextColor }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = settings.theme === 'dark' 
                              ? 'rgba(16, 185, 129, 0.2)' 
                              : 'rgba(5, 150, 105, 0.1)';
                            e.currentTarget.style.color = settings.theme === 'dark' ? '#10b981' : '#059669';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = settings.mainTextColor;
                          }}
                          title="Save"
                        >
                          ✓
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          variant="ghost"
                          className="p-1 h-6 w-6 text-xs"
                          style={{ color: settings.mainTextColor }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                            e.currentTarget.style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = settings.mainTextColor;
                          }}
                          title="Cancel"
                        >
                          ✕
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-6 flex justify-center transition-opacity ${
                            allIdeas.length > 1 ? 'cursor-move opacity-0 group-hover:opacity-100' : 'opacity-0'
                          }`}
                          draggable={allIdeas.length > 1}
                          onDragStart={allIdeas.length > 1 ? (e) => handleDragStart(e, originalIndex) : undefined}
                          onDragEnd={allIdeas.length > 1 ? handleDragEnd : undefined}
                        >
                          <span 
                            className="text-xs opacity-50 select-none"
                            style={{ color: settings.mainTextColor }}
                          >
                            ⋮⋮
                          </span>
                        </div>
                        
                        <p 
                          className="flex-1 text-sm m-0 leading-snug transition-all duration-200 cursor-text"
                          style={{ color: settings.mainTextColor }}
                          onDoubleClick={() => startEditing(idea.id, idea.text)}
                          title="Double-click to edit"
                        >
                          {idea.text}
                        </p>
                        
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => swapWithMainText(idea.text, idea.id)}
                            variant="ghost"
                            className="p-1 h-6 w-6 text-xs hover:bg-opacity-20"
                            style={{ 
                              color: settings.mainTextColor,
                              '--hover-bg': settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                            } as React.CSSProperties}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = settings.theme === 'dark' 
                                ? 'rgba(59, 130, 246, 0.2)' 
                                : 'rgba(59, 130, 246, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title={currentMainText ? "Swap with main text" : "Use as main text"}
                          >
                            ↗
                          </Button>
                          <Button
                            onClick={() => startEditing(idea.id, idea.text)}
                            variant="ghost"
                            className="p-1 h-6 w-6 text-xs"
                            style={{ color: settings.mainTextColor }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = settings.theme === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            title="Edit"
                          >
                            ✏️
                          </Button>
                          {deletingId === idea.id ? (
                            <div className="flex gap-1">
                              <Button
                                onClick={() => deleteIdea(idea.id)}
                                variant="ghost"
                                className="p-1 h-6 w-6 text-xs"
                                style={{ color: '#ef4444' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Confirm delete"
                              >
                                ✓
                              </Button>
                              <Button
                                onClick={cancelDelete}
                                variant="ghost"
                                className="p-1 h-6 w-6 text-xs"
                                style={{ color: settings.mainTextColor }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = settings.theme === 'dark' 
                                    ? 'rgba(255, 255, 255, 0.1)' 
                                    : 'rgba(0, 0, 0, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                title="Cancel delete"
                              >
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <Button
                              onClick={() => confirmDelete(idea.id)}
                              variant="ghost"
                              className="p-1 h-6 w-6 text-xs"
                              style={{ color: settings.mainTextColor }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = settings.mainTextColor;
                              }}
                              title="Delete"
                            >
                              🗑️
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Controls */}
          {!showInput && (
            <div className="flex justify-end items-center gap-3 mt-2 mb-1 px-2 transition-opacity duration-200" style={{ opacity: isHoveringContainer ? 1 : 0 }}>
              <div 
                onClick={() => setShowInput(true)}
                className="text-xs opacity-60 cursor-pointer hover:opacity-80 hover:underline transition-all"
                style={{ color: settings.mainTextColor }}
              >
                add
              </div>
              <div 
                onClick={toggleVisibility}
                className="text-xs opacity-60 cursor-pointer hover:opacity-80 hover:underline transition-all"
                style={{ color: settings.mainTextColor }}
              >
                hide
              </div>
            </div>
          )}

          {/* Input Field - Show/hide based on showInput state */}
          {showInput && (
            <div style={{ borderColor: settings.theme === 'dark' ? '#4a5568' : '#e2e8f0' }}>
              <style>
                {`
                  .idea-input::placeholder {
                    color: ${settings.mainTextColor}60;
                  }
                `}
              </style>
              <div className="group transition-all duration-200 rounded px-2 py-0.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 flex justify-center">
                    <span className="text-xs opacity-30 select-none">✏️</span>
                  </div>
                  
                  <input
                    type="text"
                    value={ideaText}
                    onChange={(e) => setIdeaText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="add an idea..."
                    className="idea-input flex-1 text-sm bg-transparent border-none outline-none"
                    style={{ 
                      color: settings.mainTextColor,
                      height: '1.5rem'
                    }}
                    autoFocus
                  />
                  
                  {ideaText.trim() && (
                    <Button
                      onClick={saveIdea}
                      variant="ghost"
                      className="p-1 h-6 w-6 text-xs"
                      style={{ 
                        backgroundColor: settings.mainTextColor,
                        color: settings.backgroundColor
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      title="Save idea"
                    >
                      ✓
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => setShowInput(false)}
                    variant="ghost"
                    className="p-1 h-6 w-6 text-xs"
                    style={{ color: settings.mainTextColor }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = settings.theme === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Cancel"
                  >
                    ✕
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
