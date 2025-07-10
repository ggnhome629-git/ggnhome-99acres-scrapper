import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, TrendingUp, Heart, Calculator, Star, ArrowRight, Users, Award, CheckCircle } from 'lucide-react';

const ShineOneEstateHome = () => {
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({ plots: 0, customers: 0, appreciation: 0 });
  const [floatingElements, setFloatingElements] = useState([]);

  // Animated statistics counter
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimatedStats(prev => ({
        plots: prev.plots < 150 ? prev.plots + 3 : 150,
        customers: prev.customers < 500 ? prev.customers + 8 : 500,
        appreciation: prev.appreciation < 25 ? prev.appreciation + 1 : 25
      }));
    }, 100);

    return () => clearInterval(timer);
  }, []);

  // Hero carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Floating elements animation
  useEffect(() => {
    const elements = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5
    }));
    setFloatingElements(elements);
  }, []);

  const heroSlides = [
    {
      title: "Prime Plots in Sector 92-95",
      subtitle: "Starting from ₹15 Lakh",
      image: "🏗️",
      highlight: "25% Appreciation Expected"
    },
    {
      title: "Sohna Road Premium Locations",
      subtitle: "Limited Time Offer",
      image: "🌆",
      highlight: "Ready to Move Plots"
    },
    {
      title: "Investment Opportunity",
      subtitle: "Book Now & Save Big",
      image: "💰",
      highlight: "Zero Brokerage"
    }
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.phone) {
      alert(`Thank you ${formData.name}! We'll contact you shortly.`);
      setShowLeadForm(false);
      setFormData({ name: '', phone: '' });
    }
  };
  

  const testimonials = [
    { name: "Rajesh Kumar", text: "Got my dream plot in Sector 93. Amazing service!", rating: 5 },
    { name: "Priya Sharma", text: "Best investment decision. 20% appreciation in 1 year!", rating: 5 },
    { name: "Amit Singh", text: "Transparent process and genuine plots. Highly recommended!", rating: 5 }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FAF3E0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Floating Background Elements */}
      {floatingElements.map(element => (
        <div
          key={element.id}
          style={{
            position: 'absolute',
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: '60px',
            height: '60px',
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            borderRadius: '50%',
            animation: `float ${3 + element.delay}s ease-in-out infinite`,
            zIndex: 1
          }}
        />
      ))}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(46, 125, 50, 0.3); }
          50% { box-shadow: 0 0 30px rgba(46, 125, 50, 0.6); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        .slide-in { animation: slideIn 0.6s ease-out; }
        .pulse { animation: pulse 2s infinite; }
        .glow { animation: glow 3s infinite; }
        .bounce { animation: bounce 2s infinite; }
        
        .gradient-text {
          background: linear-gradient(135deg, #2E7D32, #F4A261);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <header style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '1rem 2rem',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(46, 125, 50, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              backgroundColor: '#2E7D32', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>🌐</div>
            <span style={{ 
              fontSize: '1.8rem', 
              fontWeight: 'bold',
              color: '#2E7D32'
            }}>ShineOneEstate</span>
          </div>
          <Link to="/form">
            <button
              style={{
                backgroundColor: '#2E7D32',
                color: 'white',
                border: 'none',
                padding: '0.8rem 1.5rem',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              className="pulse"
              onMouseEnter={(e) => e.target.style.backgroundColor = '#F4A261'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#2E7D32'}
            >
              <Phone size={16} />
              Get Best Deals
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        marginTop: '80px',
        padding: '4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '3rem',
            marginBottom: '3rem',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(46, 125, 50, 0.1)'
          }} className="slide-in">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {heroSlides[currentSlide].image}
            </div>
            <h1 style={{ 
              fontSize: '3rem', 
              fontWeight: 'bold',
              color: '#2D2D2D',
              marginBottom: '1rem',
              lineHeight: '1.2'
            }} className="gradient-text">
              {heroSlides[currentSlide].title}
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              color: '#2E7D32',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              {heroSlides[currentSlide].subtitle}
            </p>
            <div style={{
              display: 'inline-block',
              backgroundColor: '#A3E635',
              color: '#2D2D2D',
              padding: '0.5rem 1rem',
              borderRadius: '15px',
              fontSize: '1rem',
              fontWeight: 'bold',
              marginBottom: '2rem'
            }} className="bounce">
              🔥 {heroSlides[currentSlide].highlight}
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowLeadForm(true)}
                style={{
                  backgroundColor: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                className="glow"
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F4A261'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2E7D32'}
              >
                <MapPin size={20} />
                View Properties
                <ArrowRight size={16} />
              </button>
              
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: '#2E7D32',
                  border: '2px solid #2E7D32',
                  padding: '1rem 2rem',
                  borderRadius: '30px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#2E7D32';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#2E7D32';
                }}
              >
                <Calculator size={20} />
                Calculate Returns
              </button>
            </div>
          </div>

          {/* Animated Statistics */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)'
            }} className="pulse">
              <div style={{ fontSize: '3rem', color: '#2E7D32', fontWeight: 'bold' }}>
                {animatedStats.plots}+
              </div>
              <div style={{ color: '#2D2D2D', fontSize: '1.1rem' }}>Premium Plots</div>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)'
            }} className="pulse">
              <div style={{ fontSize: '3rem', color: '#F4A261', fontWeight: 'bold' }}>
                {animatedStats.customers}+
              </div>
              <div style={{ color: '#2D2D2D', fontSize: '1.1rem' }}>Happy Customers</div>
            </div>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)'
            }} className="pulse">
              <div style={{ fontSize: '3rem', color: '#A3E635', fontWeight: 'bold' }}>
                {animatedStats.appreciation}%
              </div>
              <div style={{ color: '#2D2D2D', fontSize: '1.1rem' }}>Avg. Appreciation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '4rem 2rem',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#2D2D2D'
          }}>Why Choose ShineOneEstate?</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              transition: 'transform 0.3s ease'
            }} 
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-10px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <TrendingUp size={48} style={{ color: '#2E7D32', marginBottom: '1rem' }} />
              <h3 style={{ color: '#2D2D2D', marginBottom: '1rem' }}>High Appreciation</h3>
              <p style={{ color: '#666' }}>Prime locations with 25%+ annual appreciation potential</p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-10px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <CheckCircle size={48} style={{ color: '#A3E635', marginBottom: '1rem' }} />
              <h3 style={{ color: '#2D2D2D', marginBottom: '1rem' }}>Verified Plots</h3>
              <p style={{ color: '#666' }}>100% legal and RERA approved properties</p>
            </div>
            
            <div style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '15px',
              textAlign: 'center',
              border: '1px solid rgba(46, 125, 50, 0.1)',
              transition: 'transform 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-10px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <Award size={48} style={{ color: '#F4A261', marginBottom: '1rem' }} />
              <h3 style={{ color: '#2D2D2D', marginBottom: '1rem' }}>Expert Guidance</h3>
              <p style={{ color: '#666' }}>Professional support from booking to possession</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ 
        padding: '4rem 2rem',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '2.5rem', 
            textAlign: 'center',
            marginBottom: '3rem',
            color: '#2D2D2D'
          }}>What Our Customers Say</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {testimonials.map((testimonial, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '15px',
                textAlign: 'center',
                border: '1px solid rgba(46, 125, 50, 0.1)'
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={20} style={{ color: '#F4A261', fill: '#F4A261' }} />
                  ))}
                </div>
                <p style={{ color: '#2D2D2D', marginBottom: '1rem', fontStyle: 'italic' }}>
                  "{testimonial.text}"
                </p>
                <p style={{ color: '#2E7D32', fontWeight: 'bold' }}>- {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4rem 2rem',
        backgroundColor: '#2E7D32',
        color: 'white',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
            Ready to Invest in Your Future?
          </h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.9 }}>
            Join 500+ investors who trusted ShineOneEstate for their property investments
          </p>
         <Link to="/form">
  <button
    style={{
      backgroundColor: '#F4A261',
      color: '#2D2D2D',
      border: 'none',
      padding: '1.2rem 2.5rem',
      borderRadius: '30px',
      cursor: 'pointer',
      fontSize: '1.2rem',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
    className="bounce"
    onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
  >
    <Users size={20} />
    Get Best Deals
    <ArrowRight size={16} />
  </button>
</Link>
        </div>
      </section>

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: '#FAF3E0',
            padding: '3rem',
            borderRadius: '20px',
            width: '90%',
            maxWidth: '500px',
            position: 'relative',
            border: '2px solid #2E7D32'
          }} className="slide-in">
            <button
              onClick={() => setShowLeadForm(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#2D2D2D'
              }}
            >
              ×
            </button>
            
            <h2 style={{ 
              color: '#2D2D2D', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              🎯 Get Exclusive Property Deals
            </h2>
            <p style={{ 
              color: '#666', 
              marginBottom: '2rem',
              textAlign: 'center'
            }}>
              Enter your details to unlock premium plot listings
            </p>
            
            <form onSubmit={handleFormSubmit}>
              <input
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '1rem',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                required
              />
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '1rem',
                  marginBottom: '2rem',
                  border: '2px solid #ddd',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  backgroundColor: 'white'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  backgroundColor: '#2E7D32',
                  color: 'white',
                  border: 'none',
                  padding: '1rem',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#F4A261'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2E7D32'}
              >
                🚀 Show Me Properties
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShineOneEstateHome;