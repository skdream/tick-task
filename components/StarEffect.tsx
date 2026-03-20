
'use client';

import React, { useEffect, useState } from 'react';

interface StarEffectProps {
  show: boolean;
  onComplete: () => void;
  starsCount?: number;
}

const StarEffect: React.FC<StarEffectProps> = ({ show, onComplete, starsCount }) => {
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    console.log('StarEffect - show:', show, 'starsCount:', starsCount);
    if (show) {
      // 生成随机星星，限制在页面中间区域
      const newStars = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        // 限制星星在水平方向上显示在中间50%的区域
        x: 25 + Math.random() * 50,
        // 限制星星在垂直方向上显示在中间50%的区域
        y: 25 + Math.random() * 50,
        delay: Math.random() * 0.5,
      }));
      setStars(newStars);

      // 2秒后完成动画
      const timer = setTimeout(() => {
        onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete, starsCount]);

  if (!show) return null;

  console.log('StarEffect - 渲染中，show:', show, 'starsCount:', starsCount);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* 显示获得的星星数量 */}
      {console.log('StarEffect - starsCount:', starsCount, 'starsCount > 0:', starsCount > 0)}
      {starsCount !== undefined && starsCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl md:text-6xl font-bold text-yellow-500 animate-bounce">
            +{starsCount} ⭐
          </div>
        </div>
      )}
      {/* {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-star-burst"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
          }}
        >
          <div className="text-4xl animate-star-pulse">⭐</div>
        </div>
      ))} */}
      <style>{`
        @keyframes star-burst {
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
        @keyframes star-pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }
        .animate-star-burst {
          animation: star-burst 2s ease-out forwards;
        }
        .animate-star-pulse {
          animation: star-pulse 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default StarEffect;
