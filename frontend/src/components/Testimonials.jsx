import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Play, Star, Quote } from 'lucide-react';

export default function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials = [
    {
      name: 'Nathan Potter',
      role: 'CTO at Wander',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80',
      videoThumbnail: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&h=380&q=80',
      quote: 'Our data and engineering leads used to field countless subjective questions during review cycles. With EvidentIQ, capability trajectories are backed by deterministically calculated evidence. It has completely eliminated review cycle fatigue.'
    },
    {
      name: 'Jonathan Nahin',
      role: 'Founder of RevSend',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80',
      videoThumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&h=380&q=80',
      quote: 'We were constantly answering capability questions and pulling ad-hoc Jira/PR metrics manually. EvidentIQ centralized longitudinal insights, reducing interruptions and giving employees clarity on their exact growth trajectory.'
    },
    {
      name: 'Elena Rostova',
      role: 'VP of Talent at Synthetix',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&h=120&q=80',
      videoThumbnail: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&h=380&q=80',
      quote: 'The explicit insufficient-evidence handling is a game changer. The system knows when it doesn’t know rather than guessing. That built trust with both our executive committee and engineers immediately.'
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-white border-t border-neutral-200/60">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="text-[12px] font-semibold tracking-widest text-neutral-400 uppercase mb-3">
            Testimonials
          </div>
          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-neutral-950 leading-[1.12]">
            Users love us. <br />
            <span className="text-neutral-400 font-normal">But don't take it from us.</span>
          </h2>
        </div>

        {/* Testimonials Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-12">
          
          {/* Main Active Testimonial Card */}
          <div className="lg:col-span-8 rounded-3xl bg-neutral-50/80 border border-neutral-200/90 p-8 sm:p-10 shadow-sm flex flex-col md:flex-row gap-8 items-center">
            
            {/* Video Preview with Play Overlay */}
            <div className="relative w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden shadow-md group shrink-0">
              <img
                src={testimonials[activeIndex].videoThumbnail}
                alt="Testimonial Video"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-neutral-900 text-neutral-900 ml-0.5" />
                </div>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="flex flex-col justify-between h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={testimonials[activeIndex].avatar}
                    alt={testimonials[activeIndex].name}
                    className="w-11 h-11 rounded-full object-cover border border-neutral-200"
                  />
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-sm">{testimonials[activeIndex].name}</h4>
                    <p className="text-neutral-500 text-xs">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
                <p className="text-neutral-700 text-sm sm:text-base leading-relaxed italic">
                  "{testimonials[activeIndex].quote}"
                </p>
              </div>
            </div>

          </div>

          {/* Secondary Next Testimonial Preview Card */}
          <div 
            onClick={() => setActiveIndex((activeIndex + 1) % testimonials.length)}
            className="lg:col-span-4 rounded-3xl bg-white border border-neutral-200/90 p-8 shadow-sm flex flex-col justify-between cursor-pointer hover:border-neutral-300 hover:shadow-md transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={testimonials[(activeIndex + 1) % testimonials.length].avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-neutral-900 text-sm">
                    {testimonials[(activeIndex + 1) % testimonials.length].name}
                  </h4>
                  <p className="text-neutral-500 text-xs">
                    {testimonials[(activeIndex + 1) % testimonials.length].role}
                  </p>
                </div>
              </div>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed line-clamp-4 italic">
                "{testimonials[(activeIndex + 1) % testimonials.length].quote}"
              </p>
            </div>
            <div className="pt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
              <span>Read next review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

        </div>

        {/* Carousel Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : testimonials.length - 1))}
            className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Previous testimonial"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeIndex === i ? 'w-6 bg-neutral-900' : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setActiveIndex((prev) => (prev < testimonials.length - 1 ? prev + 1 : 0))}
            className="w-9 h-9 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Next testimonial"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
}
