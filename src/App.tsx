import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from "motion/react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, PerspectiveCamera, Stars, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { Github, Mail, Linkedin, ArrowRight, Code2, Rocket, Zap, Users, CheckCircle2, Globe, Laptop, Smartphone, Database, Terminal, Layers, Cpu, Layout, ExternalLink, Menu, X, Play, Clock, Sparkles, Command, MousePointer2, BrainCircuit } from "lucide-react";

// --- Types ---
interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  image: string;
  demo?: string;
  github?: string;
}

// --- 3D Background: Neural Particle Field ---

function ParticleField() {
  const points = useMemo(() => {
    const p = new Float32Array(3000 * 3);
    for (let i = 0; i < 3000; i++) {
      p[i * 3] = (Math.random() - 0.5) * 12;
      p[i * 3 + 1] = (Math.random() - 0.5) * 12;
      p[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return p;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.04;
      ref.current.rotation.x = state.clock.getElapsedTime() * 0.02;
    }
  });

  return (
    <Points ref={ref} positions={points} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#38bdf8"
        size={0.015}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#030303] overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ParticleField />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Sphere args={[1.2, 64, 64]} position={[4, -2, -3]}>
            <MeshDistortMaterial
              color="#0ea5e9"
              attach="material"
              distort={0.4}
              speed={2}
              roughness={0}
              metalness={1}
              opacity={0.1}
              transparent
            />
          </Sphere>
        </Float>
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#0ea5e9" />
        <pointLight position={[-10, -10, -10]} intensity={0.4} color="#6366f1" />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black" />
    </div>
  );
}

// --- Interactive Components ---

function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [cursorX, cursorY]);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 bg-white rounded-full mix-blend-difference pointer-events-none z-[9999]"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: "-50%", translateY: "-50%" }}
      />
      <motion.div
        className="fixed top-0 left-0 w-12 h-12 border border-white/20 rounded-full pointer-events-none z-[9998]"
        style={{ x: cursorXSpring, y: cursorYSpring, translateX: "-50%", translateY: "-50%" }}
        transition={{ type: "spring", damping: 20, stiffness: 150 }}
      />
    </>
  );
}

function Magnetic({ children, strength = 0.5 }: { children: React.ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { damping: 15, stiffness: 150 });
  const springY = useSpring(y, { damping: 15, stiffness: 150 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <div className={`overflow-hidden flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ y: "100%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.2em]"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

function BentoCard({ children, className = "", spotlight = true }: { children: React.ReactNode; className?: string; spotlight?: boolean }) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current || !spotlight) return;
    const { left, top } = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty("--mouse-x", `${e.clientX - left}px`);
    divRef.current.style.setProperty("--mouse-y", `${e.clientY - top}px`);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={`glass-card relative overflow-hidden group ${className}`}
    >
      {spotlight && <div className="spotlight" />}
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
}

function TiltBentoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`glass-card rounded-[3rem] border-white/5 overflow-hidden transition-all duration-300 hover:border-sky-500/30 group ${className}`}
    >
      <div 
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }} 
        className="h-full relative z-10"
      >
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

// --- Data ---

const PROJECTS: Project[] = [
  {
    id: "01",
    title: "BigFit Gym",
    category: "Health & Nutrition",
    description: "A comprehensive fitness and nutrition platform with personalized workout plans and dietary tracking.",
    tags: ["React", "Tailwind", "Firebase", "AI"],
    image: "/screenshots/bigfit.PNG",
    demo: "https://bigfitgymnutrition.netlify.app/",
    github: "https://github.com/aladinbk/BIGFIT-GYM-NUTRITION"
  },
  {
    id: "02",
    title: "Brew & Chill",
    category: "E-Commerce / Web App",
    description: "A modern coffee shop experience featuring a sleek UI, smooth animations, and a focus on user engagement.",
    tags: ["React", "Vite", "Tailwind"],
    image: "/screenshots/brew_chill.PNG",
    demo: "https://brew-chill-coffee.netlify.app/",
    github: "https://github.com/aladinbk/Brew-Chill-Coffee"
  },
  {
    id: "03",
    title: "AI Tools Directory",
    category: "Resource Directory",
    description: "A curated directory of the best AI tools to supercharge your workflow, featuring search and category filtering.",
    tags: ["HTML", "CSS"],
    image: "/screenshots/ai_tools.PNG",
    demo: "https://aladinbk.github.io/ai-tools-directory/",
    github: "https://github.com/aladinbk/ai-tools-directory"
  },
  {
    id: "04",
    title: "Omni-Commerce",
    category: "E-Commerce",
    description: "Global headless commerce platform processing millions of transactions with sub-second latency.",
    tags: ["Next.js", "Node.js", "Redis"],
    image: "https://picsum.photos/seed/omni/1200/800",
  }
];

// --- Main Application ---

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(clock);
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  return (
    <div className="relative min-h-screen selection:bg-sky-500/30 selection:text-sky-200 font-sans cursor-none">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black flex flex-col items-center justify-center gap-4"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              className="h-[1px] bg-sky-500"
            />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-mono tracking-[0.5em] text-sky-500 uppercase"
            >
              Initializing Vision...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="noise-bg" />
      <CustomCursor />
      <Scene3D />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-8 flex justify-between items-center mix-blend-difference">
        <Magnetic strength={0.2}>
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-display font-black text-black transition-transform group-hover:rotate-[360deg] duration-700">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-white">ALAEDDINE</span>
              <span className="text-[8px] font-black tracking-[0.4em] text-sky-500 uppercase">Freelance Dev</span>
            </div>
          </div>
        </Magnetic>
        
        <div className="hidden md:flex items-center gap-12 glass-card px-8 py-3 rounded-full border-white/5">
          {["Work", "Services", "About", "Contact"].map((item) => (
            <Magnetic key={item} strength={0.3}>
              <a 
                href={`#${item.toLowerCase()}`} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
              >
                {item}
              </a>
            </Magnetic>
          ))}
        </div>

        <Magnetic strength={0.2}>
          <a 
            href="#contact" 
            className="px-6 py-2.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all"
          >
            Hire Me
          </a>
        </Magnetic>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto text-center space-y-12 relative z-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-5 py-1.5 glass-card rounded-full text-[9px] font-black uppercase tracking-[0.4em] text-sky-400 border-sky-500/20"
          >
            <Sparkles className="w-3 h-3" />
            Available for Freelance 2026
          </motion.div>

          <div className="space-y-4">
            <h1 className="font-display text-7xl md:text-[14rem] font-black tracking-tighter leading-[0.75] uppercase">
              <TextReveal text="DIGITAL" className="justify-center text-gradient" />
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="text-sky-500 italic font-serif lowercase tracking-normal"
              >
                visionary
              </motion.div>
            </h1>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="max-w-2xl mx-auto text-slate-400 text-lg md:text-xl font-medium leading-relaxed"
          >
            Alaeddine Boubaker — Senior Engineer & Creative Technologist. <br />
            Architecting high-end digital experiences for the modern web.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-wrap justify-center gap-6 pt-8"
          >
            <Magnetic>
              <a href="#work" className="px-10 py-5 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all flex items-center gap-3">
                Explore Portfolio <ArrowRight className="w-4 h-4" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="px-10 py-5 glass-card font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 transition-all">
                Start a Project
              </a>
            </Magnetic>
          </motion.div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30"
        >
          <span className="text-[8px] font-black uppercase tracking-[0.5em] rotate-90 mb-8">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-sky-500 to-transparent" />
        </motion.div>
      </section>

      {/* Bento Section: About & Stats */}
      <section id="about" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bento-grid grid-cols-1 md:grid-cols-4 lg:grid-rows-2">
            {/* Main About Card */}
            <BentoCard className="md:col-span-2 lg:row-span-2 rounded-[3rem] p-8 md:p-12 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-sky-500/10 rounded-lg flex items-center justify-center text-sky-400">
                    <Command className="w-4 h-4" />
                  </div>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-sky-500">Web Developer • AI Solutions</h2>
                </div>
                <p className="font-display text-5xl font-black tracking-tight leading-none uppercase italic">
                  I BUILD <br /> <span className="text-slate-600">MODERN WEBSITES</span> <br /> THAT BRING YOU CLIENTS
                </p>
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  I'm a freelance web developer based in Tunisia.

                  I help small businesses and entrepreneurs build modern websites that attract more clients and increase their revenue.

                  I focus on performance, clean design, and user experience.

                  I also integrate AI-powered solutions like smart chat assistants to automate customer communication.

                  Let’s build something that grows your business.
                </p>
              </div>
              <div className="pt-12">
                <Magnetic strength={0.3}>
                  <a href="#contact" className="inline-flex items-center gap-4 text-white font-black uppercase tracking-widest text-[10px] group/btn">
                    My Technical Stack <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </a>
                </Magnetic>
              </div>
            </BentoCard>

            {/* Clock Card */}
            <BentoCard className="rounded-[3rem] p-8 md:p-10 flex flex-col justify-center items-center text-center space-y-4">
              <Clock className="w-6 h-6 text-sky-500 opacity-50" />
              <div className="space-y-1">
                <p className="font-display text-4xl font-black italic">
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Local Time</p>
              </div>
            </BentoCard>

            {/* Stats Card */}
            <BentoCard className="rounded-[3rem] p-8 md:p-10 flex flex-col justify-center items-center text-center space-y-2">
              <p className="font-display text-6xl font-black italic">5+</p>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Projects</p>
            </BentoCard>

            {/* Image Card */}
            <BentoCard className="md:col-span-2 rounded-[3rem] overflow-hidden group">
              <img 
                src="/screenshots/alaeddine.jfif" 
                alt="Alaeddine"
                className="w-full h-full object-cover grayscale brightness-50 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-8 left-8 px-4 py-2 glass-card rounded-full border-emerald-500/30 bg-emerald-500/10 backdrop-blur-md">
                <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  #1 DEVELOPER EN TUNISIE <span className="text-[7px] opacity-80">TN</span> 🇹🇳
                </span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-10 flex flex-col justify-end">
                <p className="font-display text-2xl font-black uppercase tracking-tight italic">Alaeddine Boubaker</p>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-500">Freelance Web Developer</p>
              </div>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Capabilities Section: 3D Tilt Cards */}
      <section className="py-10 md:py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TiltBentoCard className="p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight italic">Tech Stack</h3>
              </div>
              <ul className="space-y-4">
                {[
                  { name: "React", desc: "Modern UI Development" },
                  { name: "JavaScript", desc: "Dynamic Interactions" },
                  { name: "HTML5 / CSS3", desc: "Core Web Standards" },
                  { name: "Vite", desc: "Next-gen Build Tool" },
                  { name: "Git & GitHub", desc: "Version Control" }
                ].map((item, i) => (
                  <li key={i} className="flex flex-col">
                    <span className="text-white font-black text-xs uppercase tracking-widest">{item.name}</span>
                    <span className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </TiltBentoCard>

            <TiltBentoCard className="p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                  <Rocket className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight italic">What I Deliver</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Fast & Responsive Websites",
                  "Clean and Modern UI/UX",
                  "SEO Optimization",
                  "Website Deployment"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-slate-300 font-bold text-[11px] uppercase tracking-widest leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </TiltBentoCard>

            <TiltBentoCard className="p-8 md:p-10 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-400">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-black uppercase tracking-tight italic">Smart Solutions</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "AI Chat Integration",
                  "WhatsApp Automation",
                  "Lead Generation Systems"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                    <span className="text-slate-300 font-bold text-[11px] uppercase tracking-widest leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </TiltBentoCard>
          </div>
        </div>
      </section>
      

      {/* Work Section: Cinematic List */}
      <section id="work" className="py-40 px-6 bg-black/40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-12">
            <div className="space-y-6">
              <h2 className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em]">Portfolio</h2>
              <p className="font-display text-6xl md:text-9xl font-black tracking-tighter uppercase leading-none italic">
                Selected <br /> <span className="text-slate-800">Works</span>
              </p>
            </div>
          </div>

          <div className="space-y-40">
            {PROJECTS.map((project, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative grid grid-cols-1 lg:grid-cols-12 gap-16 items-center"
              >
                <div className="lg:col-span-7 relative aspect-[16/10] rounded-[3rem] overflow-hidden glass-card border-white/5 shadow-2xl">
                  <img 
                    src={project.image} 
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-700" />
                  <div className="absolute top-8 left-8 w-12 h-12 glass-card rounded-full flex items-center justify-center font-display font-black text-xs border-white/10">
                    {project.id}
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-10">
                  <div className="space-y-6">
                    <p className="text-sky-500 text-[10px] font-black uppercase tracking-[0.3em]">{project.category}</p>
                    <h3 className="font-display text-5xl md:text-8xl font-black tracking-tight uppercase italic leading-none">{project.title}</h3>
                    <p className="text-slate-400 text-lg font-medium leading-relaxed">{project.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-4 py-1.5 glass-card rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-8 flex flex-wrap items-center gap-6">
                    {project.demo && (
                      <Magnetic strength={0.4}>
                        <a 
                          href={project.demo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-2xl hover:scale-105 transition-all flex items-center gap-2"
                        >
                          Live Demo <ExternalLink className="w-3 h-3" />
                        </a>
                      </Magnetic>
                    )}
                    {project.github && (
                      <Magnetic strength={0.4}>
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-8 py-4 glass-card font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          GitHub <Github className="w-3 h-3" />
                        </a>
                      </Magnetic>
                    )}
                    {!project.demo && !project.github && (
                      <div className="flex items-center gap-8">
                        <Magnetic strength={0.4}>
                          <a href="#" className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 transition-transform shadow-xl">
                            <ArrowRight className="w-6 h-6 -rotate-45" />
                          </a>
                        </Magnetic>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">View Case Study</span>
                          <span className="text-[9px] font-medium text-slate-600 uppercase tracking-widest">Read full process</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section: Grid */}
      <section id="services" className="py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div className="space-y-12 sticky top-40 h-fit">
              <div className="space-y-6">
                <h2 className="text-sky-500 font-black text-[10px] uppercase tracking-[0.4em]">Expertise</h2>
                <p className="font-display text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none italic">
                  Digital <br /> <span className="text-slate-800">Solutions</span>
                </p>
              </div>
              <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-md">
                I provide end-to-end technical leadership and execution for brands that demand perfection.
              </p>
              <div className="pt-8">
                <Magnetic>
                  <a href="#contact" className="px-10 py-5 bg-sky-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-sky-500/20 hover:bg-sky-400 transition-all">
                    Start a Consultation
                  </a>
                </Magnetic>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { title: "Full-Stack Engineering", desc: "Robust architectures built for scale and speed.", icon: Terminal },
                { title: "Creative Technology", desc: "Immersive 3D web experiences and WebGL.", icon: Layers },
                { title: "AI Integration", desc: "Intelligent features powered by modern LLMs.", icon: Cpu },
                { title: "Product Strategy", desc: "Turning vision into market-ready digital products.", icon: Layout }
              ].map((s, i) => (
                <BentoCard key={i} className="rounded-[2.5rem] p-10 flex gap-8 items-start group hover:bg-white/5 transition-all border-white/5">
                  <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500 shrink-0">
                    <s.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-display text-2xl font-black uppercase tracking-tight italic">{s.title}</h3>
                    <p className="text-slate-400 font-medium leading-relaxed">{s.desc}</p>
                  </div>
                </BentoCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 px-6">
        <div className="max-w-5xl mx-auto glass-card rounded-[4rem] p-12 md:p-32 text-center space-y-16 relative overflow-hidden border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />
          
          <div className="space-y-8">
            <h2 className="font-display text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
              Let's <br /> <span className="text-sky-400">Connect</span>
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">
              Currently accepting high-impact freelance projects for 2026.
            </p>
          </div>

          <div className="flex flex-col items-center gap-12">
            <Magnetic strength={0.2}>
              <a href="mailto:alaeddineboubaker@gmail.com" className="group relative px-12 py-6 bg-white text-black font-black uppercase tracking-[0.2em] text-[11px] rounded-[2rem] transition-all hover:scale-105 shadow-2xl">
                alaeddineboubaker@gmail.com
              </a>
            </Magnetic>
            
            <div className="flex gap-10">
              {[
                { Icon: Linkedin, href: "https://linkedin.com/in/alaeddine-boubaker" },
                { Icon: Github, href: "https://github.com/aladinbk" },
                { Icon: Mail, href: "mailto:alaeddineboubaker@gmail.com" }
              ].map((item, i) => (
                <Magnetic key={i} strength={0.4}>
                  <a 
                    href={item.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-6 glass-card rounded-3xl hover:bg-white/5 hover:scale-110 transition-all text-slate-400 hover:text-white border-white/5"
                  >
                    <item.Icon className="w-6 h-6" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-display font-black text-black">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight">ALAEDDINE</span>
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Digital Artisan</span>
            </div>
          </div>

          <div className="flex gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
            <Magnetic><a href="https://linkedin.com/in/alaeddine-boubaker" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a></Magnetic>
            <Magnetic><a href="https://github.com/aladinbk" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a></Magnetic>
            <Magnetic><a href="mailto:alaeddineboubaker@gmail.com" className="hover:text-white transition-colors">Email</a></Magnetic>
          </div>

          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-700">© 2026 Alaeddine Boubaker. Crafted with Precision.</p>
        </div>
      </footer>
    </div>
  );
}
