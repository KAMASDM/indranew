// Enhanced src/app/donate/page.js
'use client';
import { useState } from 'react';
import Image from '@/components/SafeImage';
import DonationPayment from '@/components/DonationPayment';
import { donationAmount } from '@/lib/data.mjs';
import ImpactStats from '../../components/ImpactStats';
import IndraQR from '../../../src/img/indra-qr.png';


const DonatePage = () => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [donationType, setDonationType] = useState('one-time');
  const [selectedCause, setSelectedCause] = useState('general');
  const [amountError, setAmountError] = useState('');
  const amount = donationAmount(customAmount !== '' ? customAmount : selectedAmount);
  const goToTab = tab => {
    if (tab !== 'amount' && !amount) { setAmountError('Enter an amount from ₹1 to ₹1,00,00,000 with up to two decimal places.'); setActiveTab('amount'); return; }
    setAmountError(''); setActiveTab(tab);
  };
  const [activeTab, setActiveTab] = useState('amount');

  const donationAmounts = [50, 100, 250, 500, 1000, 2500, 5000];
  
  const causes = [
    {
      id: 'general',
      name: 'General Fund',
      description: 'Support all our initiatives where the need is greatest',
      icon: '🏠',
      impact: 'Helps across all programs'
    },
    {
      id: 'food',
      name: 'Food Security',
      description: 'Feed families through our Rasodu program',
      icon: '🍽️',
      impact: '₹1 = 1 nutritious meal'
    },
    {
      id: 'education',
      name: 'Education Support',
      description: 'Provide school supplies and educational resources',
      icon: '📚',
      impact: '₹500 = Complete school kit'
    },
    {
      id: 'healthcare',
      name: 'Healthcare Access',
      description: 'Support medical camps and health programs',
      icon: '🏥',
      impact: '₹1000 = Basic health checkup'
    },
    {
      id: 'emergency',
      name: 'Emergency Relief',
      description: 'Rapid response to disasters and urgent needs',
      icon: '🆘',
      impact: '₹2000 = Emergency family kit'
    }
  ];

  const impactExamples = [
    { amount: 50, impact: '50 meals for hungry families' },
    { amount: 100, impact: '100 meals + basic necessities' },
    { amount: 250, impact: '250 meals + school supplies for 5 children' },
    { amount: 500, impact: '500 meals + complete school kit + blankets' },
    { amount: 1000, impact: '1000 meals + health checkup + winter clothing' },
    { amount: 2500, impact: '2500 meals + comprehensive family support package' }
  ];

  const donorBenefits = [
    {
      title: 'Tax Benefits',
      description: '80G tax exemption certificate provided',
      icon: '📄'
    },
    {
      title: 'Impact Reports',
      description: 'Regular updates on how your donation is used',
      icon: '📊'
    },
    {
      title: 'Recognition',
      description: 'Certificate of appreciation for your contribution',
      icon: '🏆'
    },
    {
      title: 'Transparency',
      description: 'Complete transparency in fund utilization',
      icon: '👁️'
    }
  ];

  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Regular Donor',
      quote: 'Seeing the direct impact of my donations through their transparent reporting gives me immense satisfaction.',
      amount: '₹2000/month'
    },
    {
      name: 'Priya Sharma',
      role: 'Corporate Partner',
      quote: 'Our company partners with Indraprasth Foundation for CSR activities. Their dedication is remarkable.',
      amount: '₹50,000/quarter'
    },
    {
      name: 'Amit Patel',
      role: 'One-time Donor',
      quote: 'I donated during their emergency relief campaign. The team\'s quick response was impressive.',
      amount: '₹5,000'
    }
  ];

  const getCurrentImpact = () => impactExamples.find(example => example.amount === amount) || { amount: amount || 0, impact: 'Support community programs' };

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20"></div>
          <div className="relative z-10 container mx-auto px-6 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  Your Contribution Can Change a Life Today
                </h1>
                <p className="text-xl lg:text-2xl mb-8 opacity-90 leading-relaxed">
                  Every donation, no matter how small, helps us provide essential services like meals, 
                  education, and shelter to those who need it most in Vadodara.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold mb-1">₹1 = 1 Meal</div>
                    <div className="text-sm opacity-90">Direct Impact</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold mb-1">100%</div>
                    <div className="text-sm opacity-90">Transparency</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold mb-1">80G</div>
                    <div className="text-sm opacity-90">Tax Benefits</div>
                  </div>
                </div>
                <button
                  onClick={() => document.getElementById('donation-form').scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-orange-600 px-8 py-4 rounded-full font-bold hover:bg-orange-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 shadow-lg inline-flex items-center"
                >
                  <span className="mr-2">💝</span>
                  Start Donating Now
                </button>
              </div>
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
                  <h3 className="text-2xl font-bold mb-6 text-center">Recent Impact</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className="text-2xl mr-3">🍽️</span>
                        <span>Meals Served This Month</span>
                      </span>
                      <span className="font-bold text-2xl">15,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className="text-2xl mr-3">👨‍👩‍👧‍👦</span>
                        <span>Families Helped</span>
                      </span>
                      <span className="font-bold text-2xl">423</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <span className="text-2xl mr-3">📚</span>
                        <span>Students Supported</span>
                      </span>
                      <span className="font-bold text-2xl">89</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Donation Form Section */}
        <section id="donation-form" className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">Make Your Donation</h2>
                <p className="text-lg text-gray-700 font-medium">Choose your donation type and cause to see the immediate impact</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-12">
                {/* Donation Form */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-orange-100">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 mb-8">
                      {[
                        { id: 'amount', label: 'Amount', icon: '💰' },
                        { id: 'cause', label: 'Cause', icon: '🎯' },
                        { id: 'payment', label: 'Payment', icon: '💳' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => goToTab(tab.id)}
                          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 font-medium border-b-2 transition-colors duration-200 ${
                            activeTab === tab.id
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          <span>{tab.icon}</span>
                          <span>{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Step 1: Amount Selection */}
                    {activeTab === 'amount' && (
                      <div className="space-y-8">
                        <fieldset><legend className="font-semibold text-gray-900 mb-3">Donation amount (INR)</legend>
                          <div className="flex flex-wrap gap-2 mb-4">{donationAmounts.map(preset => <button key={preset} type="button" aria-pressed={customAmount === '' && selectedAmount === preset} onClick={() => { setSelectedAmount(preset); setCustomAmount(''); setAmountError(''); }} className={`px-4 py-2 rounded-lg border ${customAmount === '' && selectedAmount === preset ? 'bg-orange-600 text-white' : 'text-gray-900 bg-white'}`}>₹{preset}</button>)}</div>
                          <label className="block text-gray-800">Custom amount<input type="number" min="1" max="10000000" step="0.01" value={customAmount} onChange={e => setCustomAmount(e.target.value)} className="block w-full border rounded p-3 bg-white text-gray-900" placeholder="Enter amount in rupees" /></label>
                          {amountError && <p role="alert" className="text-red-700 mt-2">{amountError}</p>}
                        </fieldset>
                        <div>
                          <h3 className="text-lg font-semibold text-orange-700 mb-4">Donation Type</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${donationType === 'one-time' ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg' : 'border-gray-300 hover:border-orange-300 hover:shadow-md'}`}> 
                              <input
                                type="radio"
                                value="one-time"
                                checked={donationType === 'one-time'}
                                onChange={(e) => setDonationType(e.target.value)}
                                className="sr-only"
                              />
                              <div className="text-center w-full">
                                <div className="text-2xl mb-2">💝</div>
                                <div className="font-semibold text-orange-700">One-time</div>
                                <div className="text-sm text-orange-600">Single donation</div>
                              </div>
                            </label>
                            <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${donationType === 'monthly' ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg' : 'border-gray-300 hover:border-orange-300 hover:shadow-md'}`}> 
                              <input
                                type="radio"
                                value="monthly"
                                checked={donationType === 'monthly'}
                                onChange={(e) => setDonationType(e.target.value)}
                                className="sr-only"
                              />
                              <div className="text-center w-full">
                                <div className="text-2xl mb-2">📅</div>
                                <div className="font-semibold text-orange-700">Monthly</div>
                                <div className="text-sm text-orange-600">Pay manually each month</div>
                              </div>
                            </label>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => goToTab('cause')}
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300"
                          >
                            Continue to Cause Selection
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Cause Selection */}
                    {activeTab === 'cause' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-orange-700 mb-4">Choose Your Cause</h3>
                        <div className="space-y-4">
                          {causes.map(cause => (
                            <label
                              key={cause.id}
                              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                                selectedCause === cause.id
                                  ? 'border-orange-500 bg-gradient-to-r from-orange-50 to-pink-50 shadow-lg'
                                  : 'border-gray-300 hover:border-orange-300 hover:shadow-md'
                              }`}
                            >
                              <input
                                type="radio"
                                value={cause.id}
                                checked={selectedCause === cause.id}
                                onChange={(e) => setSelectedCause(e.target.value)}
                                className="sr-only"
                              />
                              <div className="flex-1 flex items-center space-x-4">
                                <div className="text-3xl">{cause.icon}</div>
                                <div>
                                  <div className="font-semibold text-gray-800">{cause.name}</div>
                                  <div className="text-sm text-gray-600">{cause.description}</div>
                                  <div className="text-sm text-orange-600 font-medium mt-1">{cause.impact}</div>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                        <div className="flex justify-between">
                          <button
                            onClick={() => goToTab('amount')}
                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-300"
                          >
                            Back to Amount
                          </button>
                          <button
                            onClick={() => goToTab('payment')}
                            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors duration-300"
                          >
                            Continue to Payment
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Payment */}
                    {activeTab === 'payment' && (
                      <div className="space-y-8">
                        <div className="bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg p-6 border-2 border-orange-200 shadow-md">
                          <h3 className="text-lg font-semibold text-orange-800 mb-4">Donation Summary</h3>
                          <p className="text-gray-900 font-bold mb-3">Amount: ₹{amount}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-orange-800">Type:</span>
                              <span className="font-bold capitalize text-orange-900">{donationType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-orange-800">Cause:</span>
                              <span className="font-bold text-orange-900">{causes.find(c => c.id === selectedCause)?.name}</span>
                            </div>
                            <hr className="my-2 border-orange-300" />
                            <div className="flex justify-between text-lg font-bold text-orange-900">
                              <span>Impact:</span>
                              <span>{getCurrentImpact().impact}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-center">
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Methods</h3>
                          <p className="text-gray-600 mb-6">
                            Scan the QR code below with any UPI app to donate securely
                          </p>
                          
                          <div className="bg-white border-2 border-gray-200 rounded-lg p-6 inline-block">
                            <Image 
                              src={IndraQR}
                              alt="Donation QR Code" 
                              width={250} 
                              height={250} 
                              className="mx-auto rounded-lg shadow-lg"
                            />
                            <a href={IndraQR.src} download="indraprasth-donation-qr.png" className="block mt-4 text-teal-800 underline">Save QR code</a>
                           
                          </div>

                          <DonationPayment amount={amount} cause={selectedCause} frequency={donationType} />
                        </div>

                        <div className="flex justify-between">
                          <button
                            onClick={() => goToTab('cause')}
                            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-300"
                          >
                            Back to Cause
                          </button>

                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Impact Sidebar */}
                <div className="space-y-8">
                  {/* Current Impact */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-orange-700 mb-4">Your Impact</h3>
                    <div className="text-center bg-orange-50 rounded-lg p-6">
                      <div className="text-3xl font-bold text-orange-600 mb-2">
                        {getCurrentImpact().impact}
                      </div>
                      <div className="text-sm text-orange-600">
                        {donationType === 'monthly' && 'Every month'}
                      </div>
                    </div>
                  </div>

                  {/* Donor Benefits */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-orange-700 mb-4">Donor Benefits</h3>
                    <div className="space-y-4">
                      {donorBenefits.map((benefit, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="text-2xl">{benefit.icon}</div>
                          <div>
                            <div className="font-semibold text-orange-700">{benefit.title}</div>
                            <div className="text-sm text-orange-600">{benefit.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trust Indicators */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-indigo-700 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4">Why Trust Us?</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <span>🏛️</span>
                        <span className="text-sm">Registered NGO since 2020</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>📊</span>
                        <span className="text-sm">100% transparent operations</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>✅</span>
                        <span className="text-sm">Verified by regulatory authorities</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🏆</span>
                        <span className="text-sm">Community recognition awards</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-orange-700 mb-4">What Our Donors Say</h2>
              <p className="text-lg text-orange-600">Hear from our generous supporters</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                  <div key={index} className="bg-orange-50 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-orange-700">{testimonial.name}</h4>
                        <p className="text-sm text-orange-600">{testimonial.role}</p>
                        <p className="text-sm text-orange-700 font-medium">{testimonial.amount}</p>
                      </div>
                    </div>
                    <p className="text-orange-600 italic">&quot;{testimonial.quote}&quot;</p>
                  </div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Stats */}
        <ImpactStats variant="hero" />

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-orange-700 mb-4">Frequently Asked Questions</h2>
            </div>
            <div className="max-w-3xl mx-auto space-y-6">
              {[
                {
                  question: 'How do I get my 80G tax exemption certificate?',
                  answer: 'We provide 80G certificates for all donations. Contact the foundation after your payment is verified to request your certificate.'
                },
                {
                  question: 'How can I track the impact of my donation?',
                  answer: 'Contact the foundation with your payment reference to request an update on how your donation is used.'
                },
                {
                  question: 'Is my donation secure?',
                  answer: 'Payments are completed in your UPI app. Check the recipient shown in your app before paying, then submit your transaction reference here for manual verification.'
                },
                {
                  question: 'Can I donate in memory of someone?',
                  answer: 'Yes, you can make memorial donations. Please contact us at contact@indraprasth.org with details.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="font-semibold text-orange-700 mb-2">{faq.question}</h3>
                  <p className="text-orange-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DonatePage;