import { useReducedMotion, usePerformanceMode } from "@/hooks/use-performance";
import LiveWallpaper from "@/components/live-wallpaper";
import FloatingElements3D from "@/components/floating-elements-3d";

export default function AboutUs() {
  const reducedMotion = useReducedMotion();
  const performanceMode = usePerformanceMode();

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
            <i className="fas fa-users text-primary mr-4"></i>
            About Our Team
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Meet the passionate developers behind Wanderly, dedicated to creating unforgettable travel experiences
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Development Team
            </h2>
            <p className="text-lg text-muted-foreground">
              A talented group of developers working together to bring you the best travel platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Team Lead */}
            <div className="bg-card rounded-xl p-6 text-center border border-border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-crown text-3xl text-primary-foreground"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">SHEIK ZUHAIR AHAMMAD</h3>
              <p className="text-primary font-semibold mb-3">Team Lead & Full-Stack Developer</p>
              <p className="text-sm text-muted-foreground">
                Leading the development of Wanderly with expertise in modern web technologies and user experience design.
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <a href="mailto:zuhairsk2005@gmail.com" className="text-primary hover:text-primary/80 transition-colors">
                  <i className="fas fa-envelope text-lg"></i>
                </a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                  <i className="fab fa-linkedin text-lg"></i>
                </a>
                <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>

            {/* Team Member 1 */}
            <div className="bg-card rounded-xl p-6 text-center border border-border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-code text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">V. Dheeraj</h3>
              <p className="text-blue-600 font-semibold mb-3">Frontend Developer</p>
              <p className="text-sm text-muted-foreground">
                Specializing in React and modern frontend technologies to create beautiful and responsive user interfaces.
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                  <i className="fab fa-linkedin text-lg"></i>
                </a>
                <a href="#" className="text-blue-600 hover:text-blue-500 transition-colors">
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-card rounded-xl p-6 text-center border border-border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-server text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">B. Eswar</h3>
              <p className="text-green-600 font-semibold mb-3">Backend Developer</p>
              <p className="text-sm text-muted-foreground">
                Building robust server-side solutions and APIs to power Wanderly's core functionality and data management.
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <a href="#" className="text-green-600 hover:text-green-500 transition-colors">
                  <i className="fab fa-linkedin text-lg"></i>
                </a>
                <a href="#" className="text-green-600 hover:text-green-500 transition-colors">
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-card rounded-xl p-6 text-center border border-border shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-palette text-3xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">B. Ranjith</h3>
              <p className="text-purple-600 font-semibold mb-3">UI/UX Designer</p>
              <p className="text-sm text-muted-foreground">
                Creating intuitive and visually appealing designs that enhance user experience and engagement.
              </p>
              <div className="flex justify-center space-x-2 mt-4">
                <a href="#" className="text-purple-600 hover:text-purple-500 transition-colors">
                  <i className="fab fa-linkedin text-lg"></i>
                </a>
                <a href="#" className="text-purple-600 hover:text-purple-500 transition-colors">
                  <i className="fab fa-github text-lg"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                At Wanderly, we believe that every journey should be extraordinary. Our mission is to connect travelers with 
                hidden gems and unforgettable experiences in their local areas, making travel more accessible, personalized, 
                and memorable.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                We're passionate about showcasing the beauty of local destinations and helping people discover the treasures 
                right in their own backyard.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                  <div className="text-sm text-muted-foreground">Attractions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">10K+</div>
                  <div className="text-sm text-muted-foreground">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="text-center">
                  <i className="fas fa-compass text-6xl text-primary mb-4"></i>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Wanderly</h3>
                  <p className="text-muted-foreground">
                    "Discover local treasures and create unforgettable memories with Wanderly."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-heart text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Passion</h3>
              <p className="text-muted-foreground">
                We're passionate about travel and technology, combining both to create amazing experiences.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-lightbulb text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Innovation</h3>
              <p className="text-muted-foreground">
                We constantly innovate to bring you the latest features and the best user experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <i className="fas fa-handshake text-2xl text-primary"></i>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Community</h3>
              <p className="text-muted-foreground">
                We believe in building a community of travelers who share their experiences and discoveries.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
