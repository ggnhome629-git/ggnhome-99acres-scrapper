import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [masteredCards, setMasteredCards] = useState(new Set());
  const [particles, setParticles] = useState([]);
  const [studyHistory, setStudyHistory] = useState([]);

  useEffect(() => {
    function onKey(e) {
      if (flashcards.length === 0 || currentPage !== "study") return;
      if (e.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, i - 1));
        setFlipped(false);
      } else if (e.key === "ArrowRight") {
        setIndex((i) => Math.min(flashcards.length - 1, i + 1));
        setFlipped(false);
      } else if (e.key === " ") {
        e.preventDefault();
        setFlipped(f => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flashcards, currentPage]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);
  }, []);

  const generate = async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }
    setError("");
    setFlashcards([]);
    setIndex(0);
    setLoading(true);
    setFlipped(false);
    setScore(0);
    setStreak(0);
    setMasteredCards(new Set());

    try {
      const res = await axios.post("/generate-flashcards", { topic });
      if (!Array.isArray(res.data)) throw new Error("Unexpected response from server");
      setFlashcards(res.data);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setCurrentPage("study");
      
      // Add to history
      setStudyHistory(prev => [{
        topic: topic,
        date: new Date().toLocaleDateString(),
        cardsCount: res.data.length,
        score: 0
      }, ...prev.slice(0, 9)]);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.error || err.message || "Failed to fetch flashcards");
    } finally {
      setLoading(false);
    }
  };

  const markAsKnown = () => {
    if (!current) return;
    setScore(s => s + 10);
    setStreak(s => s + 1);
    setMasteredCards(prev => new Set([...prev, index]));
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 1000);
    if (index < flashcards.length - 1) {
      setTimeout(() => {
        setIndex(i => i + 1);
        setFlipped(false);
      }, 500);
    }
  };

  const markAsUnknown = () => {
    setStreak(0);
    if (index < flashcards.length - 1) {
      setTimeout(() => {
        setIndex(i => i + 1);
        setFlipped(false);
      }, 500);
    }
  };

  const current = flashcards[index];
  const progress = flashcards.length > 0 ? ((index + 1) / flashcards.length) * 100 : 0;
  const masteryProgress = flashcards.length > 0 ? (masteredCards.size / flashcards.length) * 100 : 0;

  const BackgroundParticles = () => (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            animation: `float ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </>
  );

  const ConfettiEffect = () => (
    showConfetti && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: '-10px',
              width: '10px',
              height: '10px',
              background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347'][i % 4],
              animation: `fall ${Math.random() * 2 + 2}s linear forwards`,
              transform: `rotate(${Math.random() * 360}deg)`
            }}
          />
        ))}
      </div>
    )
  );

  const Navigation = () => (
    <nav style={{
      display: 'flex',
      gap: '10px',
      justifyContent: 'center',
      marginBottom: '30px',
      animation: 'slideDown 0.6s ease-out'
    }}>
      {[
        { id: 'home', label: '🏠 Home', icon: '🏠' },
        { id: 'create', label: '✨ Create', icon: '✨' },
        { id: 'history', label: '📚 History', icon: '📚' }
      ].map(page => (
        <button
          key={page.id}
          onClick={() => setCurrentPage(page.id)}
          style={{
            padding: '12px 24px',
            fontSize: '1rem',
            fontWeight: '700',
            border: 'none',
            borderRadius: '12px',
            background: currentPage === page.id 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(255, 255, 255, 0.2)',
            color: currentPage === page.id ? '#667eea' : 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)',
            border: currentPage === page.id ? '2px solid white' : '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            if (currentPage !== page.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.3)';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== page.id) {
              e.target.style.background = 'rgba(255, 255, 255, 0.2)';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {page.label}
        </button>
      ))}
    </nav>
  );

  const HomePage = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '50px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '4rem',
          fontWeight: '800',
          marginBottom: '20px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          animation: 'slideDown 0.6s ease-out'
        }}>
          🎓 StudyMaster Pro
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.5rem',
          fontWeight: '500',
          marginBottom: '10px'
        }}>
          Transform Your Learning Experience
        </p>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.1rem'
        }}>
          AI-Powered Flashcards • Smart Progress Tracking • Gamified Learning
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        marginBottom: '40px'
      }}>
        {[
          {
            icon: '🚀',
            title: 'Quick Start',
            desc: 'Generate flashcards on any topic in seconds',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          },
          {
            icon: '🎯',
            title: 'Track Progress',
            desc: 'Monitor your learning journey with detailed stats',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          },
          {
            icon: '🏆',
            title: 'Earn Rewards',
            desc: 'Build streaks and earn points as you learn',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          }
        ].map((feature, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '35px',
              borderRadius: '20px',
              textAlign: 'center',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s',
              cursor: 'pointer',
              animation: `slideUp 0.6s ease-out ${i * 0.1}s both`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-10px)';
              e.currentTarget.style.boxShadow = '0 15px 45px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            }}
          >
            <div style={{
              fontSize: '3.5rem',
              marginBottom: '15px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
            }}>
              {feature.icon}
            </div>
            <h3 style={{
              color: 'white',
              fontSize: '1.4rem',
              fontWeight: '700',
              marginBottom: '10px'
            }}>
              {feature.title}
            </h3>
            <p style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '1rem',
              lineHeight: '1.5'
            }}>
              {feature.desc}
            </p>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '25px',
        textAlign: 'center',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 15px 50px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: '700',
          marginBottom: '20px'
        }}>
          Ready to Start Learning?
        </h2>
        <button
          onClick={() => setCurrentPage('create')}
          style={{
            padding: '18px 50px',
            fontSize: '1.3rem',
            fontWeight: '700',
            border: 'none',
            borderRadius: '15px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: '0 8px 25px rgba(59, 130, 246, 0.5)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
          }}
        >
          Create Flashcards Now ✨
        </button>
      </div>

      <div style={{
        marginTop: '50px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '0.9rem'
      }}>
        <p>💡 Tip: Press Space to flip cards • Use Arrow Keys to navigate</p>
      </div>
    </div>
  );

  const CreatePage = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '10px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          ✨ Create Your Flashcards
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Enter any topic and let AI create personalized flashcards
        </p>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        padding: '40px',
        borderRadius: '20px',
        marginBottom: '25px',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <label style={{
          display: 'block',
          color: 'white',
          fontSize: '1.2rem',
          fontWeight: '700',
          marginBottom: '15px'
        }}>
          📝 What would you like to learn?
        </label>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') generate(); }}
            placeholder="e.g., Python Programming, World History, Biology..."
            style={{
              flex: 1,
              padding: '18px 24px',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              color: '#1e293b',
              outline: 'none',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
          <button
            onClick={generate}
            disabled={loading}
            style={{
              padding: '18px 40px',
              fontSize: '1.1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            {loading ? '⏳ Generating...' : '✨ Generate'}
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {['JavaScript', 'Machine Learning', 'Chemistry', 'Spanish Verbs', 'React Hooks'].map(suggestion => (
            <button
              key={suggestion}
              onClick={() => setTopic(suggestion)}
              style={{
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.25)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.35)';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            color: 'white',
            fontSize: '1.3rem',
            fontWeight: '600'
          }}>
            🧠 Creating your personalized flashcards...
          </p>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1rem',
            marginTop: '10px'
          }}>
            This may take a few seconds
          </p>
        </div>
      )}

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '20px 24px',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'shake 0.5s ease-in-out',
          boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
        }}>
          <span style={{ fontSize: '1.8rem' }}>⚠️</span>
          <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{error}</span>
        </div>
      )}
    </div>
  );

  const StudyPage = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '25px'
      }}>
        <h2 style={{
          color: 'white',
          fontSize: '2rem',
          fontWeight: '700'
        }}>
          📚 Studying: {topic}
        </h2>
        <button
          onClick={() => setCurrentPage('create')}
          style={{
            padding: '10px 20px',
            fontSize: '1rem',
            fontWeight: '600',
            border: 'none',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.3s',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        >
          ← New Topic
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '15px',
        marginBottom: '25px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>⭐</div>
          <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>{score}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Points</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>🔥</div>
          <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>{streak}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Streak</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '20px',
          borderRadius: '15px',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '5px' }}>✅</div>
          <div style={{ color: 'white', fontSize: '1.8rem', fontWeight: '700' }}>{masteredCards.size}/{flashcards.length}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem' }}>Mastered</div>
        </div>
      </div>

      <div style={{ marginBottom: '25px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          <span>📊 Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{
          height: '10px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            transition: 'width 0.5s ease-out',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)'
          }} />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}>
          <span>🎯 Mastery</span>
          <span>{Math.round(masteryProgress)}%</span>
        </div>
        <div style={{
          height: '10px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${masteryProgress}%`,
            background: 'linear-gradient(90deg, #f59e0b, #10b981)',
            transition: 'width 0.5s ease-out',
            boxShadow: '0 0 10px rgba(245, 158, 11, 0.6)'
          }} />
        </div>
      </div>

      {flashcards.length > 0 && current && (
        <>
          <div style={{
            perspective: '1000px',
            marginBottom: '25px'
          }}>
            <div
              onClick={() => setFlipped(!flipped)}
              style={{
                position: 'relative',
                width: '100%',
                minHeight: '400px',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.6s',
                transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                cursor: 'pointer'
              }}
            >
              <div style={{
                position: 'absolute',
                width: '100%',
                minHeight: '400px',
                backfaceVisibility: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  background: masteredCards.has(index) ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  marginBottom: '20px'
                }}>
                  {masteredCards.has(index) ? '✅ Mastered' : '❓ Question'}
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  color: '#1e293b',
                  fontWeight: '700',
                  textAlign: 'center',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  {current.question}
                </div>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: current.difficulty === 'Easy' ? '#dcfce7' : 
                             current.difficulty === 'Medium' ? '#fef3c7' : '#fee2e2',
                  color: current.difficulty === 'Easy' ? '#166534' : 
                         current.difficulty === 'Medium' ? '#92400e' : '#991b1b',
                  borderRadius: '12px',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {current.difficulty === 'Easy' && '🟢'}
                  {current.difficulty === 'Medium' && '🟡'}
                  {current.difficulty === 'Hard' && '🔴'}
                  {current.difficulty}
                </div>
                <div style={{
                  marginTop: '30px',
                  color: '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  animation: 'bounce 2s ease-in-out infinite'
                }}>
                  👆 Click or press Space to reveal answer
                </div>
              </div>

              <div style={{
                position: 'absolute',
                width: '100%',
                minHeight: '400px',
                backfaceVisibility: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '20px',
                padding: '40px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transform: 'rotateY(180deg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  marginBottom: '20px'
                }}>
                  💡 Answer
                </div>
                <div style={{
                  fontSize: '1.4rem',
                  color: '#1e293b',
                  fontWeight: '600',
                  textAlign: 'center',
                  lineHeight: '1.6'
                }}>
                  {current.answer}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              marginBottom: '20px'
            }}>
              <button
                onClick={markAsUnknown}
                style={{
                  padding: '16px 28px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ❌ Need Practice
              </button>
              <button
                onClick={markAsKnown}
                disabled={masteredCards.has(index)}
                style={{
                  padding: '16px 28px',
                  fontSize: '1.05rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '12px',
                  background: masteredCards.has(index) 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  cursor: masteredCards.has(index) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: masteredCards.has(index) 
                    ? 'none' 
                    : '0 4px 15px rgba(16, 185, 129, 0.4)'
                }}
                onMouseEnter={(e) => {
                  if (!masteredCards.has(index)) e.target.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                ✅ I Know This!
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '15px',
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              padding: '20px',
              borderRadius: '15px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <button
                onClick={() => {
                  setIndex(i => Math.max(0, i - 1));
                  setFlipped(false);
                }}
                disabled={index === 0}
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  background: index === 0 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                  color: index === 0 ? 'rgba(255, 255, 255, 0.6)' : '#1e293b',
                  cursor: index === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: index === 0 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (index !== 0) e.target.style.transform = 'translateX(-3px)';
                }}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
              >
                ← Prev
              </button>

              <div style={{
                color: 'white',
                fontSize: '1.1rem',
                fontWeight: '700',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.3rem', marginBottom: '5px' }}>
                  {index + 1} / {flashcards.length}
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontWeight: '600'
                }}>
                  ⌨️ Use Arrow Keys
                </div>
              </div>

              <button
                onClick={() => {
                  setIndex(i => Math.min(flashcards.length - 1, i + 1));
                  setFlipped(false);
                }}
                disabled={index === flashcards.length - 1}
                style={{
                  padding: '12px 24px',
                  fontSize: '1rem',
                  fontWeight: '700',
                  border: 'none',
                  borderRadius: '10px',
                  background: index === flashcards.length - 1 ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                  color: index === flashcards.length - 1 ? 'rgba(255, 255, 255, 0.6)' : '#1e293b',
                  cursor: index === flashcards.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: index === flashcards.length - 1 ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (index !== flashcards.length - 1) e.target.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => e.target.style.transform = 'translateX(0)'}
              >
                Next →
              </button>
            </div>
          </div>

          {index === flashcards.length - 1 && masteredCards.size === flashcards.length && (
            <div style={{
              marginTop: '25px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: 'white',
              padding: '30px',
              borderRadius: '20px',
              textAlign: 'center',
              animation: 'slideUp 0.5s ease-out',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.4)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎉</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '10px', fontWeight: '800' }}>
                Congratulations!
              </h2>
              <p style={{ fontSize: '1.2rem', opacity: 0.95 }}>
                You've mastered all {flashcards.length} flashcards!
              </p>
              <p style={{ fontSize: '1.5rem', marginTop: '15px', fontWeight: '700' }}>
                Final Score: {score} points 🏆
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );

  const HistoryPage = () => (
    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '3rem',
          fontWeight: '800',
          marginBottom: '10px',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          📚 Study History
        </h1>
        <p style={{
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: '1.1rem',
          fontWeight: '500'
        }}>
          Track your learning progress over time
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📖</div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>{studyHistory.length}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Study Sessions</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🎴</div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>
            {studyHistory.reduce((sum, item) => sum + item.cardsCount, 0)}
          </div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Total Cards</div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '25px',
          borderRadius: '20px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🏆</div>
          <div style={{ color: 'white', fontSize: '2rem', fontWeight: '700' }}>{score}</div>
          <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1rem' }}>Current Score</div>
        </div>
      </div>

      {studyHistory.length === 0 ? (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '60px 40px',
          borderRadius: '25px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>📚</div>
          <h3 style={{
            color: 'white',
            fontSize: '1.8rem',
            fontWeight: '700',
            marginBottom: '15px'
          }}>
            No Study History Yet
          </h3>
          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '1.1rem',
            marginBottom: '25px'
          }}>
            Start creating flashcards to track your learning journey!
          </p>
          <button
            onClick={() => setCurrentPage('create')}
            style={{
              padding: '16px 40px',
              fontSize: '1.1rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Create Your First Flashcards
          </button>
        </div>
      ) : (
        <div style={{
          background: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          padding: '30px',
          borderRadius: '20px',
          border: '2px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{
            color: 'white',
            fontSize: '1.5rem',
            fontWeight: '700',
            marginBottom: '20px'
          }}>
            Recent Study Sessions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {studyHistory.map((item, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  padding: '20px 25px',
                  borderRadius: '15px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div>
                  <div style={{
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: '700',
                    marginBottom: '5px'
                  }}>
                    {item.topic}
                  </div>
                  <div style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.9rem'
                  }}>
                    {item.date} • {item.cardsCount} cards
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  color: 'white',
                  fontWeight: '700',
                  fontSize: '1rem'
                }}>
                  {item.score} pts
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <BackgroundParticles />
      <ConfettiEffect />

      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        position: 'relative',
        zIndex: 1
      }}>
        <Navigation />
        
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'create' && <CreatePage />}
        {currentPage === 'study' && <StudyPage />}
        {currentPage === 'history' && <HistoryPage />}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export default App;