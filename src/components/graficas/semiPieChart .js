import React from 'react';
import ReactECharts from 'echarts-for-react';

const SemiPieChart = ({ data, title }) => {
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'top',
      left: 'center',
      textStyle: {
        fontSize: 12
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
          formatter: '{b}: {d}%',
          fontSize: 12,
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
        },
        data: data,
      }
    ]
  };

  return <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />;
};

export default SemiPieChart;
