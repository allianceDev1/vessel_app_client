import React from 'react';
import './skeletonGrid.scss';

const SkeletonGrid = ({ columns = 1, rows = 1, gap = 16, width = 300, height = 200 }) => {
  const totalBlocks = columns * rows;
  const skeletonItems = Array.from({ length: totalBlocks });

  // Calculate total gaps
  const totalHorizontalGaps = gap * (columns - 1);
  const totalVerticalGaps = gap * (rows - 1);

  // Compute dynamic sizes
  const boxWidth = (width - totalHorizontalGaps) / columns;
  const boxHeight = (height - totalVerticalGaps) / rows;

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, ${boxWidth}px)`,
    gap: `${gap}px`,
    width: `${width}px`,
    height: `${height}px`,
  };

  return (
    <div className="ui-skeleton-grid" style={gridStyle}>
      {skeletonItems.map((_, index) => (
        <div
          key={index}
          className="skeleton-box"
          style={{ width: `${boxWidth}px`, height: `${boxHeight}px` }}
        />
      ))}
    </div>
  );
};

export default SkeletonGrid;