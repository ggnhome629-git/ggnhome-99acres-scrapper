import React, { useState, useEffect } from 'react';
import { User, Phone, Home, MapPin, TrendingUp, Sparkles, Heart, Star, Crown, Gift } from 'lucide-react';

export default function ShineOneEstateForm() {
  const [formData, setFormData] = useState({ name: '', contact: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [fadeIn, setFadeIn] = useState(false);
  const [glitter, setGlitter] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [personalizedGreeting, setPersonalizedGreeting] = useState('');

  useEffect(() => {
    setFadeIn(true);
    const hour = new Date().getHours();
    setPersonalizedGreeting(hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening');
    
    // Generate enhanced glitter particles
    const particles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 2 + Math.random() * 3,
      size: 12 + Math.random() * 8,
      color: ['#F4A261', '#2E7D32', '#FFD700', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)]
    }));
    setGlitter(particles);

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.contact) { 
      setMessage('🚨 Please share your details to unlock exclusive plots!'); 
      return; 
    }
    if (!/^\d{10}$/.test(formData.contact)) { 
      setMessage('📱 Please enter a valid 10-digit contact number'); 
      return; 
    }
    
    setLoading(true);
    try {
      const response = await fetch(process.env.REACT_APP_API_FORM_SUBMIT, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(formData) 
      });
       const result = await response.json(); // 👈 get the actual userId from response

        if (response.ok && result.userId) {
            localStorage.setItem("userId", result.userId);
        }
      if (response.ok) { 
        setMessage(`🎉 Welcome aboard, ${formData.name}! Your exclusive property tour starts now...`); 
        setTimeout(() => window.location.href = '/properties', 2500); 
      } else { 
        setMessage('💔 Something went wrong. Let\'s try again!'); 
      }
    } catch (error) { 
      setMessage('🌐 Connection issue. Please check your internet!'); 
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'name' && e.target.value.length > 0) {
      setMessage('');
    }
  };

  const benefits = [
    { icon: '🏡', title: 'Premium Locations', desc: 'Sector 92-95 & Sohna Road' },
    { icon: '📈', title: '300% Returns', desc: 'Guaranteed appreciation' },
    { icon: '⚡', title: 'Quick Approval', desc: 'Same-day site visit' },
    { icon: '🎁', title: 'Special Offers', desc: 'Limited time deals' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #FAF3E0 0%, #F5E6D3 50%, #E8D5B7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative', overflow: 'hidden' }}>
      
      {/* Enhanced Glitter Effect */}
      {glitter.map(particle => (
        <div key={particle.id} style={{ position: 'absolute', left: `${particle.left}%`, top: `${particle.top}%`, animation: `glitterFloat ${particle.duration}s infinite ${particle.delay}s ease-in-out`, zIndex: 1, fontSize: `${particle.size}px`, color: particle.color }}>
          {Math.random() > 0.5 ? <Sparkles /> : Math.random() > 0.5 ? <Star /> : <Heart />}
        </div>
      ))}

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <div key={`heart-${i}`} style={{ position: 'absolute', left: `${10 + i * 12}%`, animation: `floatHeart ${3 + i * 0.5}s infinite ease-in-out`, zIndex: 1, fontSize: '20px', color: '#FF6B6B', opacity: 0.6 }}>
          <Heart fill="currentColor" />
        </div>
      ))}

      <style>{`
        @keyframes glitterFloat {
          0%, 100% { opacity: 0.3; transform: scale(0.8) rotate(0deg) translateY(0px); }
          25% { opacity: 0.8; transform: scale(1.2) rotate(90deg) translateY(-20px); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg) translateY(-10px); }
          75% { opacity: 0.8; transform: scale(1.1) rotate(270deg) translateY(-30px); }
        }
        @keyframes floatHeart {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-40px) scale(1.2); }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -300px 0; }
          100% { background-position: 300px 0; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(46, 125, 50, 0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(5deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
          75% { transform: translateY(-5px) rotate(3deg); }
        }
        @keyframes rainbow {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes typewriter {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .gradient-text {
          background: linear-gradient(45deg, #2E7D32, #F4A261, #FF6B6B, #4ECDC4);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: rainbow 3s ease-in-out infinite;
        }
      `}</style>

      <div style={{ maxWidth: '520px', width: '100%', background: 'rgba(255, 255, 255, 0.98)', borderRadius: '32px', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1)', overflow: 'hidden', border: '2px solid rgba(244, 162, 97, 0.3)', opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)', transition: 'all 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)', zIndex: 2, position: 'relative' }}>
        
        {/* Personal Header */}
        <div style={{ background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 30%, #388E3C 70%, #4CAF50 100%)', padding: '2.5rem 2rem', textAlign: 'center', color: 'white', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', animation: 'pulse 3s infinite' }}></div>
          <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '80px', height: '80px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', animation: 'bounce 4s infinite' }}></div>
          <div style={{ position: 'absolute', top: '20px', left: '20px', animation: 'bounce 2s infinite' }}><Crown size={24} color="#FFD700" /></div>
          <div style={{ position: 'absolute', top: '20px', right: '20px', animation: 'heartbeat 2s infinite' }}><Gift size={24} color="#FF6B6B" /></div>
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%)', backgroundSize: '300px 100%', animation: 'shimmer 4s infinite' }}></div>
          
          <div style={{ animation: 'bounce 3s infinite' }}><Home size={56} style={{ marginBottom: '1rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} /></div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 0.5rem 0', textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)', animation: 'fadeInUp 1s ease-out 0.2s both' }}>ShineOneEstate</h1>
          <p style={{ fontSize: '1.1rem', opacity: '0.95', margin: '0 0 1rem 0', fontWeight: '400', animation: 'fadeInUp 1s ease-out 0.4s both' }}>Your Dream Home Awaits</p>
          <div style={{ fontSize: '0.9rem', opacity: '0.8', fontWeight: '300', animation: 'fadeInUp 1s ease-out 0.6s both' }}>
            {personalizedGreeting}! It's {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Perfect time to invest! 🌟
          </div>
        </div>

        {/* Personal Benefits Grid */}
        <div style={{ padding: '2rem', background: 'linear-gradient(135deg, #F8F9FA 0%, #FFFFFF 100%)', borderBottom: '1px solid rgba(244, 162, 97, 0.2)' }}>
          <h3 style={{ textAlign: 'center', margin: '0 0 1.5rem 0', color: '#2E7D32', fontSize: '1.2rem', fontWeight: '600', animation: 'fadeInUp 1s ease-out 0.8s both' }}>
            🎯 Why 50,000+ Families Chose Us
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
            {benefits.map((benefit, index) => (
              <div key={index} style={{ textAlign: 'center', padding: '1rem', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '16px', border: '1px solid rgba(244, 162, 97, 0.2)', transition: 'all 0.3s ease', animation: `fadeInUp 1s ease-out ${1 + index * 0.2}s both` }} onMouseEnter={(e) => { e.target.style.transform = 'translateY(-5px)'; e.target.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)'; }} onMouseLeave={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{benefit.icon}</div>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#2E7D32', marginBottom: '0.25rem' }}>{benefit.title}</div>
                <div style={{ fontSize: '0.65rem', color: '#666' }}>{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Personal Form */}
        <div style={{ padding: '2.5rem', background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)', animation: 'fadeInUp 1s ease-out 1.8s both' }}>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2E7D32', margin: '0 0 0.5rem 0', animation: 'fadeInUp 1s ease-out 2s both' }}>
              🚀 Start Your Journey Today
            </h2>
            <p style={{ fontSize: '1rem', color: '#666', margin: '0', lineHeight: '1.6', animation: 'fadeInUp 1s ease-out 2.2s both' }}>
              Join <span style={{ color: '#F4A261', fontWeight: '600' }}>12,847 smart investors</span> who secured their future with us! 
              <br />Get instant access to <span style={{ color: '#2E7D32', fontWeight: '600' }}>exclusive pre-launch offers</span> 🎁
            </p>
          </div>

          <div style={{ marginBottom: '1.5rem', position: 'relative', animation: 'fadeInUp 1s ease-out 2.4s both' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2E7D32', zIndex: '1', animation: 'pulse 2s infinite' }}>
              <User size={22} />
            </div>
            <input 
              type="text" 
              name="name" 
              placeholder="What should we call you? (e.g., Mr. Sharma)" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', border: '2px solid #E9ECEF', borderRadius: '16px', fontSize: '1rem', outline: 'none', transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', background: 'rgba(255, 255, 255, 0.9)', boxSizing: 'border-box', fontWeight: '500' }} 
              onFocus={(e) => { e.target.style.borderColor = '#2E7D32'; e.target.style.boxShadow = '0 0 0 4px rgba(46, 125, 50, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }} 
              onBlur={(e) => { e.target.style.borderColor = '#E9ECEF'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)'; }} 
            />
          </div>

          <div style={{ marginBottom: '2rem', position: 'relative', animation: 'fadeInUp 1s ease-out 2.6s both' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#2E7D32', zIndex: '1', animation: 'pulse 2s infinite' }}>
              <Phone size={22} />
            </div>
            <input 
              type="tel" 
              name="contact" 
              placeholder="Your WhatsApp number (for instant updates)" 
              value={formData.contact} 
              onChange={handleChange} 
              required 
              maxLength="10" 
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3.5rem', border: '2px solid #E9ECEF', borderRadius: '16px', fontSize: '1rem', outline: 'none', transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', background: 'rgba(255, 255, 255, 0.9)', boxSizing: 'border-box', fontWeight: '500' }} 
              onFocus={(e) => { e.target.style.borderColor = '#2E7D32'; e.target.style.boxShadow = '0 0 0 4px rgba(46, 125, 50, 0.1)'; e.target.style.transform = 'translateY(-2px)'; }} 
              onBlur={(e) => { e.target.style.borderColor = '#E9ECEF'; e.target.style.boxShadow = 'none'; e.target.style.transform = 'translateY(0)'; }} 
            />
          </div>

          <div style={{ position: 'relative', animation: 'fadeInUp 1s ease-out 2.8s both' }}>
            <button 
              type="submit" 
              disabled={loading} 
              onClick={handleSubmit} 
              style={{ width: '100%', padding: '1.3rem', background: loading ? 'linear-gradient(135deg, #A5D6A7 0%, #81C784 100%)' : 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 30%, #388E3C 70%, #4CAF50 100%)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.2rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', boxShadow: '0 6px 20px rgba(46, 125, 50, 0.3)', textTransform: 'uppercase', letterSpacing: '1px', position: 'relative', overflow: 'hidden' }} 
              onMouseEnter={(e) => { 
                if (!loading) { 
                  e.target.style.background = 'linear-gradient(135deg, #F4A261 0%, #E76F51 30%, #FF6B6B 70%, #FF8E53 100%)'; 
                  e.target.style.transform = 'translateY(-3px) scale(1.02)'; 
                  e.target.style.boxShadow = '0 8px 25px rgba(244, 162, 97, 0.4)'; 
                }
              }} 
              onMouseLeave={(e) => { 
                if (!loading) { 
                  e.target.style.background = 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 30%, #388E3C 70%, #4CAF50 100%)'; 
                  e.target.style.transform = 'translateY(0) scale(1)'; 
                  e.target.style.boxShadow = '0 6px 20px rgba(46, 125, 50, 0.3)'; 
                }
              }}
            >
              <span style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                {loading ? (
                  <>
                    <div style={{ width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Processing Your Request...
                  </>
                ) : (
                  <>
                    🚀 Unlock Premium Plots Now
                    <Heart size={20} style={{ animation: 'heartbeat 1s infinite' }} />
                  </>
                )}
              </span>
              <div style={{ position: 'absolute', top: 0, left: '-100%', width: '100%', height: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation: loading ? 'none' : 'shimmer 2.5s infinite' }}></div>
            </button>
          </div>

          {message && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '12px', textAlign: 'center', fontSize: '1rem', fontWeight: '500', background: message.includes('successful') || message.includes('Welcome') ? 'linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)' : 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)', color: message.includes('successful') || message.includes('Welcome') ? '#2E7D32' : '#C62828', border: `2px solid ${message.includes('successful') || message.includes('Welcome') ? '#4CAF50' : '#F44336'}`, animation: 'fadeInUp 0.5s ease-out, pulse 0.5s ease-out' }}>
              {message}
            </div>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center', animation: 'fadeInUp 1s ease-out 3s both' }}>
            <div style={{ fontSize: '0.9rem', color: '#666', lineHeight: '1.6', marginBottom: '1rem' }}>
              🔒 <span style={{ fontWeight: '600' }}>100% Secure & Private</span> - Your details are encrypted and never shared
              <br />
              💬 Get instant property updates on WhatsApp
              <br />
              🎁 <span style={{ color: '#F4A261', fontWeight: '600' }}>Limited Time:</span> Free site visit + Legal verification
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.8rem', color: '#999' }}>
              <span>⭐⭐⭐⭐⭐</span>
              <span>4.9/5 rating</span>
              <span>•</span>
              <span>10,000+ happy families</span>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div style={{ padding: '1.5rem 2rem', background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', textAlign: 'center', color: 'white', animation: 'fadeInUp 1s ease-out 3.2s both' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
            <span style={{ animation: 'bounce 2s infinite' }}>🏆</span>
            <span style={{ animation: 'bounce 2s infinite 0.2s' }}>🎯</span>
            <span style={{ animation: 'bounce 2s infinite 0.4s' }}>💎</span>
          </div>
          <p style={{ margin: '0', fontSize: '0.9rem', fontWeight: '500', opacity: '0.9' }}>
            ✨ <span style={{ color: '#FFD700' }}>Award-winning</span> real estate platform trusted across NCR
          </p>
        </div>
      </div>
    </div>
  );
}