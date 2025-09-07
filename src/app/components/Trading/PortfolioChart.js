'use client';
import { useEffect, useRef } from 'react';

export default function PortfolioChart({ portfolio }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!portfolio || portfolio.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    
    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 30;

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Calculate total value
    const totalValue = portfolio.reduce((sum, stock) => {
      return sum + (stock.shares * stock.currentPrice);
    }, 0);

    if (totalValue === 0) return;

    // Generate consistent colors - SAME ORDER AS LEGEND
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#D2B4DE', '#AED6F1'
    ];

    let startAngle = -Math.PI / 2; // Start from top

    // Draw slices - SAME ORDER AS PORTFOLIO ARRAY
    portfolio.forEach((stock, index) => {
      const stockValue = stock.shares * stock.currentPrice;
      const percentage = stockValue / totalValue;
      const sliceAngle = percentage * 2 * Math.PI;

      // Use the EXACT same color as in legend
      const color = colors[index % colors.length];

      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      
      // Add border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw percentage label on slice if slice is large enough
      if (percentage > 0.08) { // Only show label if slice is larger than 8%
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Heebo';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${(percentage * 100).toFixed(1)}%`, labelX, labelY);
        
        // Add stock symbol if slice is big enough
        if (percentage > 0.15) {
          ctx.font = 'bold 10px Heebo';
          ctx.fillText(stock.symbol, labelX, labelY + 15);
        }
      }

      startAngle += sliceAngle;
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    
    // Add border to center circle
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw total value in center - NOW IN DOLLARS
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 16px Heebo';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$' + formatNumber(totalValue), centerX, centerY - 8);
    
    ctx.font = 'bold 12px Heebo';
    ctx.fillStyle = '#ecf0f1';
    ctx.fillText('שווי כולל', centerX, centerY + 12);

  }, [portfolio]);

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  return (
    <div className="portfolio-chart-section">
      <h3 className="chart-title">פילוח התיק</h3>
      
      <div className="chart-container-wrapper">
        <div className="chart-canvas-container">
          <canvas 
            ref={canvasRef}
            width={280}
            height={280}
            className="portfolio-canvas"
          />
        </div>
      </div>
    </div>
  );
}