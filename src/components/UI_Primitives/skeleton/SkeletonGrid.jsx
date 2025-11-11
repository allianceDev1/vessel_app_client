import React, { useEffect, useState } from "react";
import "./skeletonGrid.scss";

const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: Infinity,
};

const SkeletonGrid = ({
  columns = 1,
  rows = 1,
  height = 100,
  responsive = {}, // sm:{columns,rows,height}, md:{}, ...
  gap = 16,
  width = "100%",
  maxWidth = "100%",
  style
}) => {
  const [colCount, setColCount] = useState(columns);
  const [rowCount, setRowCount] = useState(rows);
  const [boxHeight, setBoxHeight] = useState(height);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;

      let newCols = columns;
      let newRows = rows;
      let newHeight = height;

      if (w < breakpoints.sm && responsive.sm) {
        newCols = responsive.sm.columns ?? columns;
        newRows = responsive.sm.rows ?? rows;
        newHeight = responsive.sm.height ?? height;
      }
      else if (w < breakpoints.md && responsive.md) {
        newCols = responsive.md.columns ?? columns;
        newRows = responsive.md.rows ?? rows;
        newHeight = responsive.md.height ?? height;
      }
      else if (w < breakpoints.lg && responsive.lg) {
        newCols = responsive.lg.columns ?? columns;
        newRows = responsive.lg.rows ?? rows;
        newHeight = responsive.lg.height ?? height;
      }
      else if (responsive.xl) {
        newCols = responsive.xl.columns ?? columns;
        newRows = responsive.xl.rows ?? rows;
        newHeight = responsive.xl.height ?? height;
      }

      setColCount(newCols);
      setRowCount(newRows);
      setBoxHeight(newHeight);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [columns, rows, height, responsive]);

  const total = colCount * rowCount;
  const toUnit = (v) => (typeof v === "number" ? `${v}px` : v);

  return (
    <div
      className="ui-skeleton-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${colCount}, 1fr)`,
        gap: toUnit(gap),
        width: toUnit(width),
        maxWidth: toUnit(maxWidth),
        ...style
      }}
    >
      {Array.from({ length: total }).map((_, idx) => (
        <div
          key={idx}
          className="skeleton-box"
          style={{ height: toUnit(boxHeight) }}
        />
      ))}
    </div>
  );
};

export default SkeletonGrid;
