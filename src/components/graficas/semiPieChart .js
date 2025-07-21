import React, { useEffect, useMemo, useState } from 'react';
import ReactECharts from 'echarts-for-react';

const SemiPieChart = ({ data, title }) => {
  const [textColor, setTextColor] = useState('');
  const [tooltipBackground, setTooltipBackground] = useState('');
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    const getVariable = (name) =>
      getComputedStyle(document.documentElement).getPropertyValue(name).trim();

    const updateColors = () => {
      setTextColor(getVariable('--text'));
      setTooltipBackground(getVariable('--background-menu-cuerpo-hover'));
      setThemeVersion(prev => prev + 1);
    };

    updateColors();

    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      textStyle: { color: textColor },
      backgroundColor: tooltipBackground
    },
    legend: {
      top: 'top',
      left: 'center',
      textStyle: {
        fontSize: 12,
        color: textColor
      }
    },
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['50%', '130%'],
        center: ['50%', '100%'],
        startAngle: 180,
        endAngle: 360,
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          fontSize: 12,
          color: textColor
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
        },
        data: data,
      }
    ]
  }), [textColor, data, title]);

  return (
    <ReactECharts
      key={themeVersion}
      option={option}
      notMerge={true}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default SemiPieChart;
