import { useState } from "react";
import { useReducedMotion, usePerformanceMode } from "@/hooks/use-performance";
import LiveWallpaper from "@/components/live-wallpaper";
import FloatingElements3D from "@/components/floating-elements-3d";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const reducedMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with 3D Background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LiveWallpaper 
            variant="cosmic" 
            intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
            reducedMotion={reducedMotion}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/20"></div>
          <FloatingElements3D 
            variant="geometric" 
            intensity={performanceMode === 'low' ? 'medium' : 'intense'} 
            reducedMotion={reducedMotion}
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            <i className="fas fa-envelope text-primary mr-4"></i>
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Get in touch with our team. We'd love to hear from you and help with any questions or feedback.
          </p>
        </div>
      </section>

      {/* Contact Information & Form Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Get in Touch</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Have a question, suggestion, or need help? We're here to assist you. Reach out to us through any of the channels below.
                </p>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-user text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Team Lead</h3>
                    <p className="text-muted-foreground">SHEIK ZUHAIR AHAMMAD</p>
                    <p className="text-sm text-primary">zuhairsk2005@gmail.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-envelope text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">zuhairsk2005@gmail.com</p>
                    <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-clock text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Response Time</h3>
                    <p className="text-muted-foreground">Within 24 hours</p>
                    <p className="text-sm text-muted-foreground">Monday to Friday, 9 AM - 6 PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-headset text-primary text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Support</h3>
                    <p className="text-muted-foreground">Technical Support Available</p>
                    <p className="text-sm text-muted-foreground">For app-related issues and feature requests</p>
                  </div>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  <a href="#" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <i className="fab fa-twitter text-primary"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <i className="fab fa-instagram text-primary"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <i className="fab fa-youtube text-primary"></i>
                  </a>
                  <a href="#" className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <i className="fab fa-linkedin text-primary"></i>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-card rounded-xl p-8 border border-border shadow-lg">
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              
              {isSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <i className="fas fa-check text-2xl text-green-600"></i>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">Thank you for your message. We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="feature">Feature Request</option>
                      <option value="bug">Bug Report</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <i className="fas fa-spinner fa-spin mr-2"></i>
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <i className="fas fa-paper-plane mr-2"></i>
                        Send Message
                      </span>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">How do I report a bug?</h3>
                <p className="text-muted-foreground">Use the contact form above and select "Bug Report" as the subject. Please include steps to reproduce the issue.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">Can I suggest new features?</h3>
                <p className="text-muted-foreground">Absolutely! We love hearing from our users. Select "Feature Request" in the contact form and describe your idea.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">How quickly will you respond?</h3>
                <p className="text-muted-foreground">We typically respond to all inquiries within 24 hours during business days.</p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-lg font-semibold text-foreground mb-2">Is there a mobile app?</h3>
                <p className="text-muted-foreground">Wanderly is currently a web application that works great on mobile devices. A native mobile app is in development.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
