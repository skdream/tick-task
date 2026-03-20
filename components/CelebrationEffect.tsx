
'use client';

import React, { useEffect, useState } from 'react';

interface CelebrationEffectProps {
  show: boolean;
  onComplete: () => void;
}

const CelebrationEffect: React.FC<CelebrationEffectProps> = ({ show, onComplete }) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; emoji: string }>>([]);

  useEffect(() => {
    if (show) {
      // 生成随机粒子（星星和礼花）
      const emojis = ['⭐', '🎉', '✨', '🎊', '💫', '🌟'];
      const newParticles = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: 20+Math.random() * 50,
        y: 20+Math.random() * 50,
        delay: Math.random() * 1,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      }));
      setParticles(newParticles);

      // 3秒后完成动画
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 恭喜文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-2xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 animate-bounce">
          🎉 恭喜完成所有任务！🎉
        </div>
      </div>

      {/* 粒子效果 */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute animate-particle-burst"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
          }}
        >
          <div className="text-2xl animate-particle-pulse">{particle.emoji}</div>
        </div>
      ))}

      <style>{`
        @keyframes particle-burst {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1.5) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes particle-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
        }
        .animate-particle-burst {
          animation: particle-burst 3s ease-out forwards;
        }
        .animate-particle-pulse {
          animation: particle-pulse 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CelebrationEffect;
